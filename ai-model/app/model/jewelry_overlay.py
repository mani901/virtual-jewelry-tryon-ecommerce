import cv2
import numpy as np
from PIL import Image
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
JEWELRY_DIR = BASE_DIR / "assets" / "jewelry_assets"

def remove_white_background(image):
    """Remove white background from jewelry image and return with alpha channel"""
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    lower_white = np.array([0, 0, 220])
    upper_white = np.array([180, 20, 255])

    mask = cv2.inRange(hsv, lower_white, upper_white)
    mask = cv2.bitwise_not(mask)

    image_pil = Image.fromarray(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
    image_pil.putalpha(255)
    image_array = np.array(image_pil)
    image_array[:, :, 3] = mask

    return image_array

def overlay_earrings(image_rgb, points, jewelry_path):
    """Overlay earrings based on ear position"""
    if not Path(jewelry_path).exists():
        return image_rgb

    earring = cv2.imread(str(jewelry_path), cv2.IMREAD_UNCHANGED)
    if earring is None:
        return image_rgb

    if earring.ndim == 3 and earring.shape[2] == 4:
        earring_rgba = cv2.cvtColor(earring, cv2.COLOR_BGRA2RGBA)
    elif earring.ndim == 3 and earring.shape[2] == 3:
        earring_rgba = remove_white_background(earring)
    elif earring.ndim == 2:
        earring_bgr = cv2.cvtColor(earring, cv2.COLOR_GRAY2BGR)
        earring_rgba = remove_white_background(earring_bgr)
    else:
        try:
            earring_rgba = remove_white_background(earring)
        except Exception:
            return image_rgb

    h, w = image_rgb.shape[:2]
    e_h, e_w = earring_rgba.shape[:2]

    # Scale earring to 15% of face height
    face_height = abs(points['chin'][1] - points['forehead'][1])
    scale = (face_height * 0.15) / e_h
    new_w = max(1, int(e_w * scale))
    new_h = max(1, int(e_h * scale))
    earring_resized = cv2.resize(earring_rgba, (new_w, new_h))

    left_pt  = points.get('left_face')  or points.get('left_jaw')  or points.get('left_eye')
    right_pt = points.get('right_face') or points.get('right_jaw') or points.get('right_eye')

    if left_pt is None or right_pt is None:
        return paste_jewelry(image_rgb, earring_resized,
                             points['left_eye'][0] - new_w // 2,
                             points['left_eye'][1])

    # Hang earring BELOW the face/jaw point, not centered on it
    img = paste_jewelry(image_rgb, earring_resized,
                        int(left_pt[0]) - new_w // 2,
                        int(left_pt[1]))

    img = paste_jewelry(img, earring_resized,
                        int(right_pt[0]) - new_w // 2,
                        int(right_pt[1]))
    return img

def overlay_glasses(image_rgb, points, jewelry_path):
    """Overlay glasses based on eye position"""
    if not Path(jewelry_path).exists():
        return image_rgb

    glasses = cv2.imread(str(jewelry_path), cv2.IMREAD_UNCHANGED)
    if glasses is None:
        return image_rgb

    if glasses.ndim == 3 and glasses.shape[2] == 4:
        glasses_rgba = cv2.cvtColor(glasses, cv2.COLOR_BGRA2RGBA)
    elif glasses.ndim == 3 and glasses.shape[2] == 3:
        glasses_rgba = remove_white_background(glasses)
    elif glasses.ndim == 2:
        glasses_bgr = cv2.cvtColor(glasses, cv2.COLOR_GRAY2BGR)
        glasses_rgba = remove_white_background(glasses_bgr)
    else:
        try:
            glasses_rgba = remove_white_background(glasses)
        except Exception:
            return image_rgb

    h, w = image_rgb.shape[:2]
    g_h, g_w = glasses_rgba.shape[:2]

    # Use temple-to-temple width for proper glasses sizing
    left_temple  = points['left_face']   # landmark 234
    right_temple = points['right_face']  # landmark 454
    face_width = abs(right_temple[0] - left_temple[0])

    # Scale glasses to full face width with slight padding
    scale = (face_width * 1.05) / g_w
    new_w = max(1, int(g_w * scale))
    new_h = max(1, int(g_h * scale))
    glasses_resized = cv2.resize(glasses_rgba, (new_w, new_h))

    # Center horizontally between eyes, anchor vertically on eye level
    left_eye  = points['left_eye']
    right_eye = points['right_eye']
    center_x  = int((left_eye[0] + right_eye[0]) / 2)
    center_y  = int((left_eye[1] + right_eye[1]) / 2)

    x = center_x - new_w // 2
    y = center_y - int(new_h * 0.45)

    return paste_jewelry(image_rgb, glasses_resized, x, y)

def overlay_nose_ring(image_rgb, points, jewelry_path):
    """Overlay nose ring at nose position"""
    if not Path(jewelry_path).exists():
        return image_rgb

    nose_ring = cv2.imread(str(jewelry_path), cv2.IMREAD_UNCHANGED)
    if nose_ring is None:
        return image_rgb

    if nose_ring.ndim == 3 and nose_ring.shape[2] == 4:
        nose_rgba = cv2.cvtColor(nose_ring, cv2.COLOR_BGRA2RGBA)
    elif nose_ring.ndim == 3 and nose_ring.shape[2] == 3:
        nose_rgba = remove_white_background(nose_ring)
    elif nose_ring.ndim == 2:
        nose_bgr = cv2.cvtColor(nose_ring, cv2.COLOR_GRAY2BGR)
        nose_rgba = remove_white_background(nose_bgr)
    else:
        try:
            nose_rgba = remove_white_background(nose_ring)
        except Exception:
            return image_rgb

    h, w = nose_rgba.shape[:2]

    # Scale nose ring to 7% of face height (increased from 5% for better visibility)
    face_height = abs(points['chin'][1] - points['forehead'][1])
    scale = (face_height * 0.07) / h
    nose_resized = cv2.resize(nose_rgba, (max(1, int(w * scale)), max(1, int(h * scale))))

    left_nostril = points['left_nostril']
    center_x = left_nostril[0]
    center_y = left_nostril[1]

    x = center_x - int(nose_resized.shape[1] // 2)
    y = center_y - int(nose_resized.shape[0] // 2)

    return paste_jewelry(image_rgb, nose_resized, x, y)

def overlay_headpiece(image_rgb, points, jewelry_path):
    """Overlay headpiece at top of head"""
    if not Path(jewelry_path).exists():
        return image_rgb

    headpiece = cv2.imread(str(jewelry_path), cv2.IMREAD_UNCHANGED)
    if headpiece is None:
        return image_rgb

    if headpiece.ndim == 3 and headpiece.shape[2] == 4:
        headpiece_rgba = cv2.cvtColor(headpiece, cv2.COLOR_BGRA2RGBA)
    elif headpiece.ndim == 3 and headpiece.shape[2] == 3:
        headpiece_rgba = remove_white_background(headpiece)
    elif headpiece.ndim == 2:
        headpiece_bgr = cv2.cvtColor(headpiece, cv2.COLOR_GRAY2BGR)
        headpiece_rgba = remove_white_background(headpiece_bgr)
    else:
        try:
            headpiece_rgba = remove_white_background(headpiece)
        except Exception:
            return image_rgb

    h, w = headpiece_rgba.shape[:2]

    # Scale headpiece to 30% of face height
    face_height = abs(points['chin'][1] - points['forehead'][1])
    scale = (face_height * 0.3) / h
    headpiece_resized = cv2.resize(headpiece_rgba, (max(1, int(w * scale)), max(1, int(h * scale))))

    forehead = points['forehead']
    x = forehead[0] - int(headpiece_resized.shape[1] // 2)
    y = forehead[1] - int(headpiece_resized.shape[0] * 0.8)

    return paste_jewelry(image_rgb, headpiece_resized, x, y)

def paste_jewelry(base_image, jewelry, x, y):
    """Paste jewelry image on base image with alpha blending"""
    h, w = base_image.shape[:2]
    j_h, j_w = jewelry.shape[:2]

    x1 = max(0, x)
    y1 = max(0, y)
    x2 = min(w, x + j_w)
    y2 = min(h, y + j_h)

    if x2 <= x1 or y2 <= y1:
        return base_image

    jx1 = x1 - x
    jy1 = y1 - y
    jx2 = jx1 + (x2 - x1)
    jy2 = jy1 + (y2 - y1)

    jewelry_crop = jewelry[jy1:jy2, jx1:jx2]

    if jewelry_crop.shape[2] == 4:
        alpha = jewelry_crop[:, :, 3] / 255.0
        for c in range(3):
            base_image[y1:y2, x1:x2, c] = (
                base_image[y1:y2, x1:x2, c] * (1 - alpha) +
                jewelry_crop[:, :, c] * alpha
            )
    else:
        base_image[y1:y2, x1:x2] = jewelry_crop

    return base_image

def apply_jewelry(image_rgb, points, jewelry_type, jewelry_filename):
    """Apply jewelry overlay based on type and selected filename"""
    jewelry_map = {
        "earrings":  (overlay_earrings,  "earrings"),
        "glasses":   (overlay_glasses,   "glasses"),
        "nose_ring": (overlay_nose_ring, "nose_rings"),
        "headpiece": (overlay_headpiece, "headpieces"),
    }

    if jewelry_type not in jewelry_map:
        return image_rgb

    overlay_func, subfolder = jewelry_map[jewelry_type]

    safe_name = Path(jewelry_filename).name
    jewelry_path = JEWELRY_DIR / subfolder / safe_name

    if not jewelry_path.exists() or not jewelry_path.is_file():
        return image_rgb

    return overlay_func(image_rgb, points, jewelry_path)

def generate_try_on(image_rgb, points, jewelry_type, jewelry_filename, output_path):
    """Generate final try-on image using selected jewelry filename and save"""
    result_image = apply_jewelry(image_rgb.copy(), points, jewelry_type, jewelry_filename)

    result_bgr = cv2.cvtColor(result_image, cv2.COLOR_RGB2BGR)

    cv2.imwrite(str(output_path), result_bgr)
    return output_path
