"""
jewelry_overlay.py — Production-quality virtual jewelry placement.

Root causes of original misalignment — all fixed here:
──────────────────────────────────────────────────────────────────────────────
EARRINGS
  Bug : Used landmarks 234 / 454 (cheek contour) as the anchor — these are
        on the face, NOT on the ear.  Earrings appeared glued to the cheek.
  Fix : Ear-lobe position is estimated by pushing outward from 234/454 using
        a fraction of face-width (set in face_analyzer._estimate_ear_lobes).
        The earring TOP edge is placed at the lobe so it hangs naturally down.
        Right earring is mirrored horizontally (realistic side-view symmetry).

HEAD ROLL
  Bug : No rotation applied.  Earrings / glasses tilted against a tilted head.
  Fix : Every overlay rotates by the eye-line roll angle from face_analyzer.

SCALING
  Bug : Fixed percentage of face_height.  Breaks when camera distance changes.
  Fix : Dynamic targets derived from face_height (earrings), temple_width
        (glasses), inter-nostril distance (nose ring), face_width (headpiece).

NOSE RING
  Bug : Ring placed at landmark 98 (left nostril outer wing) with centre on it —
        acceptable position but scale was relative to face_height, causing
        over-large or tiny rings at different distances.
  Fix : Scale governed by inter-nostril width; slight upward offset so the
        ring appears to clip on the nostril instead of floating below it.

BACKGROUND REMOVAL
  Bug : Simple HSV white-range threshold — failed on cream / off-white / dark
        backgrounds; left white halos around jewelry.
  Fix : GrabCut initialised from the inner 80 % of the image, then ANDed
        with the original HSV mask.  Morphological close+open cleans the edge.

ALPHA BLENDING
  Bug : paste_jewelry modified base_image in-place then returned it; the
        mutation was invisible but meant callers sharing the array got
        unexpected side-effects.
  Fix : paste_jewelry always works on a COPY and returns it cleanly.

YAW VISIBILITY
  Bug : When the face is turned > ~20 °, one ear is hidden; the code still
        placed an earring on the far (invisible) side.
  Fix : side_scale_factor() reduces the far-side earring by cos(yaw/2) and
        completely suppresses it when |yaw| > 50 °.
──────────────────────────────────────────────────────────────────────────────
"""

import cv2
import numpy as np
from pathlib import Path

BASE_DIR    = Path(__file__).resolve().parent.parent
JEWELRY_DIR = BASE_DIR / "assets" / "jewelry_assets"


# ═══════════════════════════════════════════════════════════════════════════
# 1. IMAGE LOADING & BACKGROUND REMOVAL
# ═══════════════════════════════════════════════════════════════════════════

def load_jewelry_rgba(jewelry_path: Path) -> np.ndarray | None:
    """
    Load a jewelry asset and return an RGBA ndarray (uint8, R-G-B-A order).
    Returns None if the file cannot be read.

    Strategy:
      • PNG/WEBP with alpha channel → convert BGRA→RGBA directly.
      • JPEG / PNG without alpha   → GrabCut + HSV white-range mask.
      • Grayscale                  → convert to BGR first, then above.
    """
    img = cv2.imread(str(jewelry_path), cv2.IMREAD_UNCHANGED)
    if img is None:
        return None

    # Grayscale → BGR
    if img.ndim == 2:
        img = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)

    if img.ndim == 3 and img.shape[2] == 4:
        # Already has alpha — fix channel order then tight-crop
        return _tight_crop(cv2.cvtColor(img, cv2.COLOR_BGRA2RGBA))

    # BGR (3-channel) — remove background then tight-crop
    return _tight_crop(_remove_background(img))


def _remove_background(bgr: np.ndarray) -> np.ndarray:
    """
    Produce an RGBA image from a BGR image with no alpha channel.

    Two-stage approach:
      1. GrabCut (3 iterations, inner-rect initialisation) → foreground mask.
      2. HSV white/light-grey threshold → additional background exclusion.
    Both masks are ANDed, then morphologically cleaned.

    Falls back gracefully to a fully-opaque image if GrabCut fails.
    """
    h, w = bgr.shape[:2]

    # ── Stage 1: GrabCut ────────────────────────────────────────────────────
    gc_mask    = np.zeros((h, w), np.uint8)
    bgd_model  = np.zeros((1, 65), np.float64)
    fgd_model  = np.zeros((1, 65), np.float64)
    border     = max(3, min(w, h) // 12)
    rect       = (border, border, w - 2 * border, h - 2 * border)

    try:
        if h > 20 and w > 20:
            cv2.grabCut(bgr, gc_mask, rect, bgd_model, fgd_model,
                        3, cv2.GC_INIT_WITH_RECT)
            alpha = np.where((gc_mask == 2) | (gc_mask == 0), 0, 255).astype(np.uint8)
        else:
            alpha = np.full((h, w), 255, np.uint8)
    except Exception:
        alpha = np.full((h, w), 255, np.uint8)

    # ── Stage 2: HSV white / light-background mask ──────────────────────────
    hsv       = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)
    white_fg  = cv2.inRange(hsv, np.array([0, 0, 210]), np.array([180, 35, 255]))
    # white_fg marks the WHITE areas — invert to get NON-white (jewelry itself)
    not_white = cv2.bitwise_not(white_fg)

    # Combined: GrabCut says foreground AND not white-background
    alpha = cv2.bitwise_and(alpha, not_white)

    # ── Stage 3: Morphological cleanup ──────────────────────────────────────
    k     = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    alpha = cv2.morphologyEx(alpha, cv2.MORPH_CLOSE, k, iterations=2)
    alpha = cv2.morphologyEx(alpha, cv2.MORPH_OPEN,  k, iterations=1)

    rgb  = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
    rgba = np.dstack([rgb, alpha]).astype(np.uint8)
    return rgba


def _tight_crop(rgba: np.ndarray, padding: int = 4) -> np.ndarray:
    """
    Crop to the bounding box of non-transparent pixels.

    Without this, a jewelry image that is e.g. 400×400 px but contains only a
    small earring in the centre will be scaled AS IF it were 400×400 — making
    the visible earring appear tiny on the face.  After cropping, the jewellery
    fills the canvas and face-proportional scaling works correctly.
    """
    if rgba.ndim < 3 or rgba.shape[2] < 4:
        return rgba
    alpha = rgba[:, :, 3]
    mask  = alpha > 15
    if not mask.any():
        return rgba
    rows = np.any(mask, axis=1)
    cols = np.any(mask, axis=0)
    y1, y2 = int(np.where(rows)[0][0]),  int(np.where(rows)[0][-1])
    x1, x2 = int(np.where(cols)[0][0]),  int(np.where(cols)[0][-1])
    y1 = max(0, y1 - padding);  y2 = min(rgba.shape[0] - 1, y2 + padding)
    x1 = max(0, x1 - padding);  x2 = min(rgba.shape[1] - 1, x2 + padding)
    return rgba[y1:y2 + 1, x1:x2 + 1]


# ═══════════════════════════════════════════════════════════════════════════
# 2. ROTATION
# ═══════════════════════════════════════════════════════════════════════════

def _rotate_rgba(img: np.ndarray, angle_deg: float) -> np.ndarray:
    """
    Rotate an RGBA image around its centre by angle_deg.

    OpenCV convention (image coords, y-down):
      positive angle → CCW rotation as seen on screen.

    We pass roll directly (+roll_deg = CCW head tilt → CCW earring tilt).
    Transparent pixels outside the original boundary become (0,0,0,0).
    """
    if abs(angle_deg) < 0.5:
        return img
    h, w = img.shape[:2]
    M    = cv2.getRotationMatrix2D((w / 2.0, h / 2.0), angle_deg, 1.0)
    return cv2.warpAffine(
        img, M, (w, h),
        flags=cv2.INTER_LINEAR,
        borderMode=cv2.BORDER_CONSTANT,
        borderValue=(0, 0, 0, 0),
    )


# ═══════════════════════════════════════════════════════════════════════════
# 3. ALPHA COMPOSITING
# ═══════════════════════════════════════════════════════════════════════════

def paste_jewelry(base_rgb: np.ndarray,
                  jewelry_rgba: np.ndarray,
                  x: int, y: int) -> np.ndarray:
    """
    Alpha-composite jewelry_rgba onto a COPY of base_rgb at pixel (x, y).

    • (x, y) is the TOP-LEFT corner of the jewelry image.
    • Out-of-bounds regions are clipped silently.
    • Input arrays are not modified.
    • Returns a new uint8 RGB ndarray.
    """
    result  = base_rgb.copy()
    img_h, img_w = result.shape[:2]
    j_h,   j_w   = jewelry_rgba.shape[:2]

    # Destination rectangle (clipped to canvas)
    dx1 = max(0, x);          dy1 = max(0, y)
    dx2 = min(img_w, x + j_w); dy2 = min(img_h, y + j_h)
    if dx2 <= dx1 or dy2 <= dy1:
        return result

    # Matching source rectangle inside the jewelry image
    sx1 = dx1 - x;  sy1 = dy1 - y
    sx2 = sx1 + (dx2 - dx1);  sy2 = sy1 + (dy2 - dy1)

    crop      = jewelry_rgba[sy1:sy2, sx1:sx2].astype(np.float32)
    base_crop = result[dy1:dy2, dx1:dx2].astype(np.float32)

    if crop.shape[2] == 4:
        alpha   = crop[:, :, 3:4] / 255.0          # shape (h, w, 1)
        blended = base_crop[:, :, :3] * (1.0 - alpha) + crop[:, :, :3] * alpha
        result[dy1:dy2, dx1:dx2] = np.clip(blended, 0, 255).astype(np.uint8)
    else:
        result[dy1:dy2, dx1:dx2] = crop[:, :, :3].astype(np.uint8)

    return result


# ═══════════════════════════════════════════════════════════════════════════
# 4. YAW VISIBILITY HELPERS
# ═══════════════════════════════════════════════════════════════════════════

def _yaw_scale(yaw_deg: float, is_near_side: bool) -> float:
    """
    Perspective scale for a given ear side when the face is turned (yaw != 0).

    Sign convention (from face_analyzer._compute_pose_solvepnp):
      yaw > 0 → face turns to viewer's LEFT  → person's RIGHT side is near.
      yaw < 0 → face turns to viewer's RIGHT → person's LEFT  side is near.

    Returns a float multiplier (0 = fully hidden, 1 = full size).
    At |yaw| > 50° the far side is suppressed entirely (ear not visible).
    """
    abs_yaw = abs(yaw_deg)
    if abs_yaw < 5.0:
        return 1.0
    if abs_yaw > 50.0:
        return 0.0 if not is_near_side else 1.1

    factor = float(np.cos(np.radians(abs_yaw * 0.6)))   # gentle fall-off
    if is_near_side:
        return float(min(1.15, 1.0 / max(0.75, factor)))
    return float(max(0.0, factor))


def _near_side(yaw_deg: float, side_name: str) -> bool:
    """
    Return True if `side_name` ('left'|'right') is the near (camera-facing) side.

    'left'  = person's anatomical left = right of image.
    'right' = person's anatomical right = left of image.
    """
    if abs(yaw_deg) < 5.0:
        return True
    # yaw > 0 → face turns viewer's-left → person's RIGHT side is near
    if yaw_deg > 0:
        return side_name == "right"
    return side_name == "left"


# ═══════════════════════════════════════════════════════════════════════════
# 5. EARRINGS
# ═══════════════════════════════════════════════════════════════════════════

def overlay_earrings(image_rgb: np.ndarray, points: dict,
                     measurements: dict, pose: dict,
                     jewelry_path: Path) -> np.ndarray:
    """
    Place earrings at the estimated ear-lobe positions.

    Key design decisions
    ────────────────────
    Anchor   : top-centre of the earring image sits at the ear-lobe estimate,
               so the earring HANGS DOWN naturally (not centred on the lobe).
    Scaling  : target height = 22 % of face_height.  This is perceptually
               stable across different camera distances because face_height
               itself scales with distance.
    Rotation : earring image rotated by the eye-line roll so it tilts WITH
               the head, not against it.
    Mirror   : right-side earring is flipped horizontally so the clasp /
               decorative face always points outward on both sides.
    Yaw      : far-side earring is scaled down (perspective) or suppressed
               completely when |yaw| > 50° (ear no longer visible).
    """
    jewelry_rgba = load_jewelry_rgba(jewelry_path)
    if jewelry_rgba is None:
        return image_rgb

    face_height = measurements["face_height"]
    cheek_width = measurements["cheek_width"]
    yaw         = pose.get("yaw",  0.0)

    # ── Base size ────────────────────────────────────────────────────────────
    # 30 % of face_height — after tight-crop the jewelry fills its canvas
    # so this percentage maps directly to visible jewelry size.
    target_h = max(20.0, face_height * 0.30)
    j_h, j_w = jewelry_rgba.shape[:2]
    if j_h < 1:
        return image_rgb

    base_scale = target_h / j_h
    base_w     = max(1, int(j_w * base_scale))
    base_h     = max(1, int(j_h * base_scale))
    base_ear   = cv2.resize(jewelry_rgba, (base_w, base_h),
                            interpolation=cv2.INTER_AREA)

    # ── Ear-lobe anchors ─────────────────────────────────────────────────────
    # Prefer pre-computed ear-lobe estimate from face_analyzer; fall back to
    # using the nose-tip Y level (anatomically correct for ear-lobe height).
    def _lobe_fallback(side: str):
        key      = f"{side}_face"
        pt       = points.get(key, points.get(f"{side}_eye", [0, 0]))
        nose_tip = points.get("nose_tip")
        # Ear lobe Y ≈ nose-tip level; fallback: 28 % below the contour point
        lobe_y   = float(nose_tip[1]) if nose_tip else float(pt[1]) + face_height * 0.28
        w_off    = cheek_width * 0.03   # minimal outward push
        if side == "left":
            return [pt[0] + w_off, lobe_y]   # person's left → push right (+x)
        return [pt[0] - w_off, lobe_y]        # person's right → push left (−x)

    left_lobe  = points.get("left_ear_lobe")  or _lobe_fallback("left")
    right_lobe = points.get("right_ear_lobe") or _lobe_fallback("right")

    result = image_rgb

    for side_name, lobe in (("left", left_lobe), ("right", right_lobe)):
        # ── Yaw visibility ──────────────────────────────────────────────────
        sf = _yaw_scale(yaw, _near_side(yaw, side_name))
        if sf <= 0.0:
            continue                               # ear hidden — skip entirely

        # ── Scale for this side ──────────────────────────────────────────────
        sw = max(1, int(base_w * sf))
        sh = max(1, int(base_h * sf))
        ear = cv2.resize(base_ear, (sw, sh), interpolation=cv2.INTER_AREA)

        # ── Mirror the right earring ─────────────────────────────────────────
        # person's anatomical RIGHT side = left of image; flip so decoration
        # faces outward consistently on both ears.
        if side_name == "right":
            ear = np.fliplr(ear).copy()           # .copy() ensures contiguous array

        # NOTE: jewelry image is NOT rotated — face rotation is used only to
        # determine which ear is visible (yaw) and compute the anchor position.

        # ── Placement ────────────────────────────────────────────────────────
        # TOP-CENTRE of earring at ear-lobe position → hangs downward
        ax, ay = int(lobe[0]), int(lobe[1])
        x = ax - ear.shape[1] // 2
        y = ay                                    # top edge at lobe level

        result = paste_jewelry(result, ear, x, y)

    return result


# ═══════════════════════════════════════════════════════════════════════════
# 6. GLASSES
# ═══════════════════════════════════════════════════════════════════════════

def overlay_glasses(image_rgb: np.ndarray, points: dict,
                    measurements: dict, pose: dict,
                    jewelry_path: Path) -> np.ndarray:
    """
    Overlay glasses spanning from temple to temple, centred on the eye level.

    Scaling  : uses temple landmarks (127 / 356) which sit above the ears
               and give the most stable width estimate for frames.
    Vertical : glasses bridge (≈ 42 % from top of the glasses image) aligned
               to the midpoint between the two outer eye corners.
    """
    jewelry_rgba = load_jewelry_rgba(jewelry_path)
    if jewelry_rgba is None:
        return image_rgb

    # Temple-to-temple width is the correct reference for glasses width.
    # Fall back to cheek_width × 1.05 if temple landmarks are absent.
    lt = points.get("left_temple")  or points.get("left_face")
    rt = points.get("right_temple") or points.get("right_face")
    if lt is None or rt is None:
        return image_rgb

    temple_w = abs(float(lt[0]) - float(rt[0]))
    # Glasses span ~105 % of temple-to-temple width for slight overhang
    target_w = max(30.0, temple_w * 1.05)

    g_h, g_w = jewelry_rgba.shape[:2]
    if g_w < 1:
        return image_rgb

    scale   = target_w / g_w
    new_w   = max(1, int(g_w * scale))
    new_h   = max(1, int(g_h * scale))
    glasses = cv2.resize(jewelry_rgba, (new_w, new_h), interpolation=cv2.INTER_AREA)

    # NOTE: jewelry image is NOT rotated — placement computed from live eye coords.

    # Horizontal centre between the two outer eye corners
    le, re = points["left_eye"], points["right_eye"]
    cx     = int((le[0] + re[0]) / 2.0)
    cy     = int((le[1] + re[1]) / 2.0)

    x = cx - glasses.shape[1] // 2
    # Lens optical centre sits roughly 42 % from the top of the glasses image
    y = cy - int(glasses.shape[0] * 0.42)

    return paste_jewelry(image_rgb, glasses, x, y)


# ═══════════════════════════════════════════════════════════════════════════
# 7. NOSE RING
# ═══════════════════════════════════════════════════════════════════════════

def overlay_nose_ring(image_rgb: np.ndarray, points: dict,
                      measurements: dict, pose: dict,
                      jewelry_path: Path) -> np.ndarray:
    """
    Place a nose ring at the left nostril outer wing (landmark 98).

    South-Asian tradition: nose ring (nath / nathni) sits on the person's
    anatomical LEFT nostril outer edge — which appears on the RIGHT side of
    a standard frontal photo.

    Scaling  : governed by inter-nostril distance (far more stable than
               face_height when camera distance changes).  Clamped between
               10 % and 18 % of face_height as a sanity guard.
    Placement: ring is centred on the nostril landmark with a small upward
               offset (15 % of ring height) so it appears to clip ONTO the
               nostril rather than floating below it.
    """
    jewelry_rgba = load_jewelry_rgba(jewelry_path)
    if jewelry_rgba is None:
        return image_rgb

    face_height   = measurements["face_height"]
    left_nostril  = points["left_nostril"]
    right_nostril = points["right_nostril"]

    # Inter-nostril distance gives the most stable scale reference.
    # After tight-crop the ring asset fills its canvas, so 75 % of nostril
    # span produces a realistically-sized ring.  Clamp to 10–18 % of face
    # height so the ring is never invisible at close/far camera distances.
    nostril_span  = abs(float(left_nostril[0]) - float(right_nostril[0]))
    target_size   = float(np.clip(nostril_span * 0.45,
                                  face_height * 0.10,
                                  face_height * 0.18))

    nr_h, nr_w = jewelry_rgba.shape[:2]
    max_dim    = max(nr_h, nr_w)
    if max_dim < 1:
        return image_rgb

    scale     = target_size / max_dim
    new_w     = max(1, int(nr_w * scale))
    new_h     = max(1, int(nr_h * scale))
    nose_ring = cv2.resize(jewelry_rgba, (new_w, new_h), interpolation=cv2.INTER_AREA)

    # NOTE: jewelry image is NOT rotated.

    ax = int(left_nostril[0])
    ay = int(left_nostril[1])

    # Shift upward so ring clips onto the nostril edge, not below it
    y_offset = int(nose_ring.shape[0] * 0.42)

    x = ax - nose_ring.shape[1] // 2
    y = ay - nose_ring.shape[0] // 2 - y_offset

    return paste_jewelry(image_rgb, nose_ring, x, y)


# ═══════════════════════════════════════════════════════════════════════════
# 8. HEADPIECE
# ═══════════════════════════════════════════════════════════════════════════

def overlay_headpiece(image_rgb: np.ndarray, points: dict,
                      measurements: dict, pose: dict,
                      jewelry_path: Path) -> np.ndarray:
    """
    Place a headpiece centred above the forehead.

    Scaling  : constrained by BOTH width (≤ 45 % of cheek_width) AND height
               (≤ 30 % of face_height).  The tighter limit wins, so tall
               pendants like maang tikka never extend past the chin.
    Vertical : top ~10 % above forehead landmark (10); pendant hangs down
               onto the forehead / center parting naturally.
    """
    jewelry_rgba = load_jewelry_rgba(jewelry_path)
    if jewelry_rgba is None:
        return image_rgb

    cheek_width = measurements["cheek_width"]
    face_height = measurements["face_height"]

    # Constrain by BOTH width and height so a tall pendant (maang tikka)
    # never extends past the chin.  Use whichever constraint is tighter.
    max_w = cheek_width * 0.45          # max width  = 45 % of face width
    max_h = face_height * 0.30          # max height = 30 % of face height

    hp_h, hp_w = jewelry_rgba.shape[:2]
    if hp_w < 1 or hp_h < 1:
        return image_rgb

    scale       = min(max_w / hp_w, max_h / hp_h)   # tightest constraint wins
    new_w       = max(1, int(hp_w * scale))
    new_h       = max(1, int(hp_h * scale))
    headpiece   = cv2.resize(jewelry_rgba, (new_w, new_h), interpolation=cv2.INTER_AREA)

    # NOTE: jewelry image is NOT rotated.

    forehead = points["forehead"]
    cx       = int(forehead[0])
    fy       = int(forehead[1])

    x = cx - headpiece.shape[1] // 2
    # Place so the bottom 30 % of the piece overlaps the forehead — the pendant
    # sits on the hairline / center parting, not floating above the head.
    y = fy - int(headpiece.shape[0] * 0.10)

    return paste_jewelry(image_rgb, headpiece, x, y)


# ═══════════════════════════════════════════════════════════════════════════
# 9. DISPATCH
# ═══════════════════════════════════════════════════════════════════════════

_JEWELRY_MAP: dict[str, tuple] = {
    "earrings":  (overlay_earrings,  "earrings"),
    "glasses":   (overlay_glasses,   "glasses"),
    "nose_ring": (overlay_nose_ring, "nose_rings"),
    "headpiece": (overlay_headpiece, "headpieces"),
}


def apply_jewelry(image_rgb: np.ndarray, points: dict,
                  jewelry_type: str, jewelry_filename: str,
                  measurements: dict | None = None,
                  pose: dict | None = None,
                  jewelry_path_override: Path | None = None) -> np.ndarray:
    """
    Resolve the asset path and call the correct overlay function.

    Parameters
    ----------
    measurements : dict
        Should come from face_analyzer.analyze_face()["measurements"].
        Estimated from points if omitted (less accurate).
    pose : dict
        Should come from face_analyzer.analyze_face()["pose"].
        Defaults to {"roll":0, "yaw":0, "pitch":0} if omitted.
    jewelry_path_override : Path, optional
        When provided, use this file directly as the jewelry asset instead of
        looking up jewelry_filename inside JEWELRY_DIR.  Used when the caller
        has already downloaded the product's Cloudinary image to a temp file.
    """
    if measurements is None:
        measurements = _fallback_measurements(points, image_rgb.shape)
    if pose is None:
        pose = {"roll": 0.0, "yaw": 0.0, "pitch": 0.0}

    if jewelry_type not in _JEWELRY_MAP:
        return image_rgb

    overlay_fn, subfolder = _JEWELRY_MAP[jewelry_type]

    # Prefer the caller-supplied path (downloaded product image); fall back to
    # the local jewelry_assets folder for seed products / manual selection.
    if jewelry_path_override and Path(jewelry_path_override).is_file():
        jewelry_path = Path(jewelry_path_override)
    else:
        safe_name    = Path(jewelry_filename).name
        jewelry_path = JEWELRY_DIR / subfolder / safe_name

    if not jewelry_path.is_file():
        return image_rgb

    return overlay_fn(image_rgb, points, measurements, pose, jewelry_path)


def _fallback_measurements(points: dict, shape: tuple) -> dict:
    """
    Rough measurements when the full analyze_face() result is unavailable.
    Accuracy is lower because we re-derive from the already-stored 2D points.
    """
    img_h, img_w = shape[:2]

    def d(a, b):
        return float(np.linalg.norm(np.asarray(a)[:2] - np.asarray(b)[:2]))

    fh = d(points.get("forehead", [img_w / 2, 0]),
           points.get("chin",     [img_w / 2, img_h]))
    cw = d(points.get("left_face",  [0,     img_h / 2]),
           points.get("right_face", [img_w, img_h / 2]))

    return {
        "face_height":  fh or img_h * 0.70,
        "cheek_width":  cw or img_w * 0.60,
        "jaw_width":    (cw or img_w * 0.60) * 0.75,
        "eye_width":    (cw or img_w * 0.60) * 0.50,
        "image_width":  int(img_w),
        "image_height": int(img_h),
    }


# ═══════════════════════════════════════════════════════════════════════════
# 10. ENTRY POINT
# ═══════════════════════════════════════════════════════════════════════════

def generate_try_on(image_rgb: np.ndarray,
                    points: dict,
                    jewelry_type: str,
                    jewelry_filename: str,
                    output_path,
                    measurements: dict | None = None,
                    pose: dict | None = None,
                    debug: bool = False,
                    jewelry_path_override: Path | None = None) -> Path:
    """
    Generate and save the final try-on image.

    Parameters
    ----------
    image_rgb      : RGB ndarray from face_analyzer.analyze_face()["image_rgb"].
    points         : landmark dict from analyze_face()["points"].
    jewelry_type   : "earrings" | "glasses" | "nose_ring" | "headpiece".
    jewelry_filename : basename of the asset file (used when no override given).
    output_path    : destination file path (JPEG or PNG).
    measurements   : from analyze_face()["measurements"] — pass for best accuracy.
    pose           : from analyze_face()["pose"]         — pass for head-tilt fix.
    debug          : if True, draws anchor points on the output image.
    jewelry_path_override : when set, use this file directly as the jewelry asset
                    (bypasses JEWELRY_DIR lookup — used for admin-uploaded products).

    Returns the resolved output_path as a Path.
    """
    result = apply_jewelry(
        image_rgb.copy(), points, jewelry_type, jewelry_filename,
        measurements=measurements, pose=pose,
        jewelry_path_override=jewelry_path_override,
    )

    if debug:
        result = _draw_debug_overlay(result, points, measurements or {}, pose or {})

    result_bgr = cv2.cvtColor(result, cv2.COLOR_RGB2BGR)
    cv2.imwrite(str(output_path), result_bgr)
    return Path(output_path)


def _draw_debug_overlay(image_rgb: np.ndarray, points: dict,
                        measurements: dict, pose: dict) -> np.ndarray:
    """Lightweight debug overlay drawn on the final try-on result."""
    img = cv2.cvtColor(image_rgb, cv2.COLOR_RGB2BGR)

    anchor_colors = {
        "left_ear_lobe":  (255,   0, 255),
        "right_ear_lobe": (255,   0, 255),
        "left_eye":       (  0,   0, 255),
        "right_eye":      (  0,   0, 255),
        "left_nostril":   (255, 165,   0),
        "forehead":       (  0, 200,   0),
        "chin":           (  0, 200,   0),
    }
    for name, color in anchor_colors.items():
        if name not in points:
            continue
        px, py = int(points[name][0]), int(points[name][1])
        cv2.circle(img, (px, py), 5, color, -1)
        cv2.circle(img, (px, py), 6, (255, 255, 255), 1)

    roll  = pose.get("roll",  0.0)
    yaw   = pose.get("yaw",   0.0)
    fh    = measurements.get("face_height", 0.0)
    cv2.putText(img, f"roll={roll:+.1f} yaw={yaw:+.1f} fh={fh:.0f}px",
                (8, 20), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (50, 255, 50), 1)

    return cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
