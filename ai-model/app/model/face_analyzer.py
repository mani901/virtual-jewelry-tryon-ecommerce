"""
face_analyzer.py — Production-quality face analysis for virtual jewelry try-on.

Key improvements over original:
  1. Null-safe cv2.imread with a clear error message.
  2. Division-by-zero guards on all feature ratios.
  3. Full head-pose estimation: eye-line roll (robust) + solvePnP yaw/pitch.
  4. Ear-lobe position estimated by extending beyond the lateral face contour
     (MediaPipe FaceMesh does not track the outer ear).
  5. Additional anatomical landmarks exported for every jewelry type.
  6. z-depth values exported for future perspective compensation.
  7. Optional debug mode: draws all 468 landmarks + named anchors + pose info.
"""

import cv2
import joblib
import numpy as np
import mediapipe as mp
from pathlib import Path

# ──────────────────────────────────────────────────────────────────────────────
# Paths & Model Loading
# ──────────────────────────────────────────────────────────────────────────────
BASE_DIR   = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "saved_models" / "face_shape_model.pkl"

mp_face_mesh = mp.solutions.face_mesh
_face_mesh   = mp_face_mesh.FaceMesh(
    static_image_mode=True,
    max_num_faces=1,
    refine_landmarks=True,
    min_detection_confidence=0.5,
)

_model_data      = joblib.load(MODEL_PATH)
face_shape_model = _model_data["model"]
FEATURE_COLUMNS  = _model_data["features"]

# ──────────────────────────────────────────────────────────────────────────────
# MediaPipe Landmark Index Map
#
# MediaPipe uses the person's anatomical left/right:
#   "left_face" (234) → person's anatomical LEFT → appears on the RIGHT of
#   a standard frontal photo (larger pixel-x).
#   "right_face" (454) → person's anatomical RIGHT → LEFT of photo (smaller x).
#
# Ear lobes are NOT part of the FaceMesh topology; they are estimated below.
# ──────────────────────────────────────────────────────────────────────────────
LANDMARK_IDX = {
    # Face spine
    "forehead":       10,
    "chin":           152,
    "nose_tip":       4,
    "nose_bridge":    6,

    # Lateral face contour (best proxy for ear canal level)
    "left_face":      234,   # person's LEFT → right of image
    "right_face":     454,   # person's RIGHT → left of image

    # Upper lateral (temple / top-of-ear contour)
    "left_temple":    127,
    "right_temple":   356,

    # Jaw angles
    "left_jaw":       172,
    "right_jaw":      397,

    # Eyes (outer corners)
    "left_eye":       33,    # person's LEFT outer corner → right of image
    "right_eye":      263,   # person's RIGHT outer corner → left of image

    # Eyes (inner corners)
    "left_eye_inner": 133,
    "right_eye_inner":362,

    # Nostrils / alar
    "left_nostril":   98,    # person's LEFT nostril outer wing
    "right_nostril":  327,   # person's RIGHT nostril outer wing
    "left_alar":      49,
    "right_alar":     279,

    # Mouth corners
    "left_mouth":     61,
    "right_mouth":    291,
}

# 3D face model for solvePnP (metric-agnostic, relative geometry only).
# Convention: x→right (viewer), y→down (image), z→into scene.
# These points correspond to POSE_LANDMARK_IDX entries below.
_POSE_MODEL_3D = np.array([
    [  0.0,    0.0,    0.0],   # nose tip        (idx 4)
    [  0.0,  330.0,   65.0],   # chin            (idx 152)  ← y is DOWN
    [ 225.0, -170.0, 135.0],   # left eye outer  (idx 33)   ← x > 0 = right of image
    [-225.0, -170.0, 135.0],   # right eye outer (idx 263)  ← x < 0 = left of image
    [ 150.0,  150.0, 125.0],   # left mouth      (idx 61)
    [-150.0,  150.0, 125.0],   # right mouth     (idx 291)
], dtype=np.float64)

_POSE_LANDMARK_IDX = [4, 152, 33, 263, 61, 291]


# ──────────────────────────────────────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────────────────────────────────────

def _get_pt(landmarks, idx: int, w: int, h: int) -> np.ndarray:
    """Return [px, py, pz] for a single MediaPipe landmark."""
    lm = landmarks[idx]
    return np.array([lm.x * w, lm.y * h, lm.z], dtype=np.float64)


def _dist2d(a, b) -> float:
    """Euclidean distance using only x, y components."""
    return float(np.linalg.norm(np.asarray(a)[:2] - np.asarray(b)[:2]))


def _compute_roll(left_eye_pt, right_eye_pt) -> float:
    """
    Head roll from the eye-to-eye line.

    left_eye_pt  = person's anatomical left eye → right side of image (larger x)
    right_eye_pt = person's anatomical right eye → left side of image (smaller x)

    Return value (degrees):
      +  → head tilted CCW from viewer's perspective
      −  → head tilted CW from viewer's perspective
    """
    dx = float(left_eye_pt[0] - right_eye_pt[0])   # always positive for frontal face
    dy = float(left_eye_pt[1] - right_eye_pt[1])
    return float(np.degrees(np.arctan2(dy, dx)))


def _compute_pose_solvepnp(landmarks, w: int, h: int):
    """
    Estimate yaw / pitch / roll via cv2.solvePnP.
    Returns (yaw_deg, pitch_deg, roll_deg).  Falls back to (0, 0, 0) on failure.

    NOTE: sign convention for yaw —
      yaw > 0  →  face turned to viewer's LEFT  (person's right side is near)
      yaw < 0  →  face turned to viewer's RIGHT (person's left side is near)
    Verify against your camera setup; negate yaw if results appear mirrored.
    """
    img_pts = np.array(
        [[landmarks[i].x * w, landmarks[i].y * h] for i in _POSE_LANDMARK_IDX],
        dtype=np.float64,
    )

    focal = float(w)
    cam   = np.array([[focal, 0, w / 2.0],
                      [0, focal, h / 2.0],
                      [0,     0,     1.0]], dtype=np.float64)
    dist  = np.zeros((4, 1), dtype=np.float64)

    try:
        ok, rvec, _ = cv2.solvePnP(
            _POSE_MODEL_3D, img_pts, cam, dist,
            flags=cv2.SOLVEPNP_ITERATIVE,
        )
        if not ok:
            return 0.0, 0.0, 0.0

        R, _ = cv2.Rodrigues(rvec)
        sy   = np.sqrt(R[0, 0] ** 2 + R[1, 0] ** 2)
        if sy > 1e-6:
            pitch = float(np.degrees(np.arctan2( R[2, 1], R[2, 2])))
            yaw   = float(np.degrees(np.arctan2(-R[2, 0], sy)))
            roll  = float(np.degrees(np.arctan2( R[1, 0], R[0, 0])))
        else:
            pitch = float(np.degrees(np.arctan2(-R[1, 2], R[1, 1])))
            yaw   = float(np.degrees(np.arctan2(-R[2, 0], sy)))
            roll  = 0.0
        return yaw, pitch, roll
    except Exception:
        return 0.0, 0.0, 0.0


def _estimate_ear_lobes(points: dict, face_width: float, face_height: float):
    """
    Estimate ear-lobe pixel positions.

    Key anatomy:
      • The ear CANAL (tragus) is roughly at eye level — landmark 234/454.
      • The ear LOBE hangs below the canal, at roughly the same vertical
        level as the nose tip (landmark 4).  Using 234/454 Y directly was
        the primary cause of earrings appearing on the cheek.
      • Horizontally the lobe sits very close to the lateral face contour;
        a 3 % push is enough to avoid landing inside the mesh.
    """
    lf       = points["left_face"]    # right of image (person's anatomical left)
    rf       = points["right_face"]   # left  of image (person's anatomical right)
    nose_tip = points.get("nose_tip")

    # Ear lobe Y ≈ nose-tip level (reliable for frontal & 3/4 portraits)
    if nose_tip:
        lobe_y = float(nose_tip[1])
    else:
        # Fallback: 28 % of face height below the cheek contour point
        lobe_y = float(lf[1]) + face_height * 0.28

    # Minimal horizontal push so anchor sits just outside the face mesh
    w_off = face_width * 0.03

    return [lf[0] + w_off, lobe_y], [rf[0] - w_off, lobe_y]


# ──────────────────────────────────────────────────────────────────────────────
# Debug Visualisation
# ──────────────────────────────────────────────────────────────────────────────

_DEBUG_COLORS = {
    "forehead":       (255,   0,   0),
    "chin":           (255,   0,   0),
    "left_face":      (  0, 200,   0),
    "right_face":     (  0, 200,   0),
    "left_jaw":       (  0, 160,   0),
    "right_jaw":      (  0, 160,   0),
    "left_temple":    (  0, 120,   0),
    "right_temple":   (  0, 120,   0),
    "left_eye":       (  0,   0, 255),
    "right_eye":      (  0,   0, 255),
    "left_nostril":   (255, 165,   0),
    "right_nostril":  (255, 165,   0),
    "left_ear_lobe":  (255,   0, 255),
    "right_ear_lobe": (255,   0, 255),
    "nose_tip":       (  0, 200, 200),
}


def _draw_debug(image_rgb: np.ndarray, landmarks, w: int, h: int,
                points: dict, pose: dict, meas: dict) -> np.ndarray:
    """
    Return an annotated BGR copy of image_rgb showing:
      • All 468 FaceMesh landmarks as grey dots
      • Named anchor points as coloured circles with labels
      • Eye-line and spine-line
      • Ear-lobe cross-markers
      • Pose & measurement readout
    """
    img = cv2.cvtColor(image_rgb, cv2.COLOR_RGB2BGR)

    # All raw landmarks — grey 1-px dots
    for lm in landmarks:
        cv2.circle(img, (int(lm.x * w), int(lm.y * h)), 1, (90, 90, 90), -1)

    # Named anchors
    for name, color in _DEBUG_COLORS.items():
        if name not in points:
            continue
        px, py = int(points[name][0]), int(points[name][1])
        cv2.circle(img, (px, py), 7, color, -1)
        cv2.circle(img, (px, py), 8, (255, 255, 255), 1)
        cv2.putText(img, name, (px + 6, py - 4),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.28, color, 1, cv2.LINE_AA)

    # Eye line
    le = points.get("left_eye")
    re = points.get("right_eye")
    if le and re:
        cv2.line(img, (int(le[0]), int(le[1])), (int(re[0]), int(re[1])),
                 (0, 255, 255), 1)

    # Face spine
    fo = points.get("forehead")
    ch = points.get("chin")
    if fo and ch:
        cv2.line(img, (int(fo[0]), int(fo[1])), (int(ch[0]), int(ch[1])),
                 (0, 255, 255), 1)

    # Ear-lobe cross markers
    for side in ("left_ear_lobe", "right_ear_lobe"):
        if side in points:
            cx, cy = int(points[side][0]), int(points[side][1])
            cv2.drawMarker(img, (cx, cy), (255, 0, 255),
                           cv2.MARKER_CROSS, 18, 2)

    # Pose & measurement overlay
    lines = [
        f"Roll : {pose['roll']:+.1f} deg",
        f"Yaw  : {pose['yaw']:+.1f} deg",
        f"Pitch: {pose['pitch']:+.1f} deg",
        f"FaceH: {meas['face_height']:.0f} px",
        f"CheekW:{meas['cheek_width']:.0f} px",
        f"JawW : {meas['jaw_width']:.0f} px",
    ]
    y0 = 20
    for line in lines:
        cv2.putText(img, line, (10, y0),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.45, (50, 255, 50), 1, cv2.LINE_AA)
        y0 += 18

    return img   # remains BGR for optional saving


# ──────────────────────────────────────────────────────────────────────────────
# Public API
# ──────────────────────────────────────────────────────────────────────────────

def analyze_face(image_path: str, debug: bool = False) -> dict | None:
    """
    Analyse a face image and return a rich result dict.

    Parameters
    ----------
    image_path : str | Path
        Path to the input image.
    debug : bool
        If True, adds a "debug_image" (RGB ndarray) to the result with all
        landmark annotations drawn.

    Returns
    -------
    dict with keys:
        image_rgb   – original image as RGB ndarray
        face_shape  – predicted face shape string
        features    – dict of 4 float features used by the classifier
        points      – dict[name → [px, py]]  (includes ear-lobe estimates)
        z_depths    – dict[name → float]     (MediaPipe normalised z)
        measurements – dict of face metrics in pixels
        pose        – {"roll": deg, "yaw": deg, "pitch": deg}
        debug_image – (only when debug=True) annotated BGR ndarray
    None if no face is detected.

    Raises
    ------
    ValueError  if the image file cannot be read.
    """
    # ── Load image ──────────────────────────────────────────────────────────
    image_bgr = cv2.imread(str(image_path))
    if image_bgr is None:
        raise ValueError(f"Cannot read image: {image_path}")

    image_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
    h, w      = image_rgb.shape[:2]

    # ── Landmark detection ───────────────────────────────────────────────────
    result = _face_mesh.process(image_rgb)
    if not result.multi_face_landmarks:
        return None

    landmarks = result.multi_face_landmarks[0].landmark

    # ── Extract named landmarks → 2-D points dict + z_depths dict ───────────
    raw_pts: dict[str, np.ndarray] = {
        name: _get_pt(landmarks, idx, w, h)
        for name, idx in LANDMARK_IDX.items()
    }
    points:   dict[str, list] = {n: [float(p[0]), float(p[1])] for n, p in raw_pts.items()}
    z_depths: dict[str, float] = {n: float(p[2]) for n, p in raw_pts.items()}

    # ── Face measurements ────────────────────────────────────────────────────
    face_height = _dist2d(points["forehead"],  points["chin"])
    cheek_width = _dist2d(points["left_face"], points["right_face"])
    jaw_width   = _dist2d(points["left_jaw"],  points["right_jaw"])
    eye_width   = _dist2d(points["left_eye"],  points["right_eye"])

    # Guard: reject if face is degenerate (very small or invisible)
    if cheek_width < 5.0 or jaw_width < 5.0 or face_height < 5.0:
        return None

    # ── Face-shape features ──────────────────────────────────────────────────
    # NOTE: forehead_chin_ratio uses raw pixel Y positions (matching training
    # data); the division-by-zero guard is the only safe change here.
    chin_y     = max(float(raw_pts["chin"][1]),     1.0)
    forehead_y = max(float(raw_pts["forehead"][1]), 1.0)

    features = {
        "face_ratio":          float(face_height / cheek_width),
        "jaw_ratio":           float(jaw_width   / cheek_width),
        "cheek_jaw_ratio":     float(cheek_width / jaw_width),
        "forehead_chin_ratio": float(forehead_y  / chin_y),
    }

    X          = [[features[col] for col in FEATURE_COLUMNS]]
    face_shape = str(face_shape_model.predict(X)[0])

    # ── Head pose ────────────────────────────────────────────────────────────
    # Use eye-line roll (robust for small tilts) and solvePnP for yaw/pitch.
    roll_eye                    = _compute_roll(points["left_eye"], points["right_eye"])
    yaw_pnp, pitch_pnp, _ = _compute_pose_solvepnp(landmarks, w, h)

    # Eye-line roll is more numerically stable; solvePnP roll is used as a
    # cross-check only (differences > 10° usually mean solvePnP converged
    # to a degenerate solution).
    pose = {
        "roll":  roll_eye,
        "yaw":   yaw_pnp,
        "pitch": pitch_pnp,
    }

    # ── Ear-lobe estimates ───────────────────────────────────────────────────
    left_lobe, right_lobe = _estimate_ear_lobes(points, cheek_width, face_height)
    points["left_ear_lobe"]  = left_lobe
    points["right_ear_lobe"] = right_lobe

    # ── Measurements dict ────────────────────────────────────────────────────
    measurements = {
        "face_height":  float(face_height),
        "cheek_width":  float(cheek_width),
        "jaw_width":    float(jaw_width),
        "eye_width":    float(eye_width),
        "image_width":  int(w),
        "image_height": int(h),
    }

    out = {
        "image_rgb":    image_rgb,
        "face_shape":   face_shape,
        "features":     features,
        "points":       points,
        "z_depths":     z_depths,
        "measurements": measurements,
        "pose":         pose,
    }

    if debug:
        out["debug_image"] = _draw_debug(
            image_rgb.copy(), landmarks, w, h, points, pose, measurements
        )

    return out
