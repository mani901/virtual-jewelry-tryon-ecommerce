import cv2
import numpy as np
from PIL import Image
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
JEWELRY_DIR = BASE_DIR / "assets" / "jewelry_assets"

def remove_white_background(image):
    """Remove white background from jewelry image and return with alpha channel"""
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    lower_white = np.array([0, 0, 200])
    upper_white = np.array([180, 30, 255])
    
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
    
    earring_rgb = cv2.cvtColor(earring, cv2.COLOR_BGR2RGB)
    h, w = image_rgb.shape[:2]
    e_h, e_w = earring_rgb.shape[:2]
    
    # Scale earring to 15% of face height
    face_height = abs(points['chin'][1] - points['forehead'][1])
    scale = (face_height * 0.15) / e_h
    earring_rgb = cv2.resize(earring_rgb, (int(e_w * scale), int(e_h * scale)))
    
    return paste_jewelry(image_rgb, earring_rgb, points['left_eye'][0] - int(e_w * scale // 2), points['left_eye'][1] - int(e_h * scale // 2))

def overlay_glasses(image_rgb, points, jewelry_path):
    """Overlay glasses based on eye position"""
    if not Path(jewelry_path).exists():
        return image_rgb
    
    glasses = cv2.imread(str(jewelry_path), cv2.IMREAD_UNCHANGED)
    if glasses is None:
        return image_rgb
    
    glasses_rgb = cv2.cvtColor(glasses, cv2.COLOR_BGR2RGB)
    h, w = image_rgb.shape[:2]
    g_h, g_w = glasses_rgb.shape[:2]
    
    # Scale glasses to fit between eyes
    eye_distance = abs(points['right_eye'][0] - points['left_eye'][0])
    scale = (eye_distance * 1.2) / g_w
    glasses_rgb = cv2.resize(glasses_rgb, (int(g_w * scale), int(g_h * scale)))
    
    y = points['left_eye'][1] - int(g_h * scale // 2)
    x = points['left_eye'][0] - int(g_w * scale // 4)
    
    return paste_jewelry(image_rgb, glasses_rgb, x, y)

def overlay_nose_ring(image_rgb, points, jewelry_path):
    """Overlay nose ring at nose position"""
    if not Path(jewelry_path).exists():
        return image_rgb
    
    nose_ring = cv2.imread(str(jewelry_path), cv2.IMREAD_UNCHANGED)
    if nose_ring is None:
        return image_rgb
    
    nose_rgb = cv2.cvtColor(nose_ring, cv2.COLOR_BGR2RGB)
    h, w = nose_rgb.shape[:2]
    
    # Scale nose ring to 5% of face height
    face_height = abs(points['chin'][1] - points['forehead'][1])
    scale = (face_height * 0.05) / h
    nose_rgb = cv2.resize(nose_rgb, (int(w * scale), int(h * scale)))
    
    left_nostril = points['left_nostril']
    center_x = (left_nostril[0] + points['right_nostril'][0]) // 2
    center_y = left_nostril[1]
    
    x = center_x - int(nose_rgb.shape[1] // 2)
    y = center_y - int(nose_rgb.shape[0] // 2)
    
    return paste_jewelry(image_rgb, nose_rgb, x, y)

def overlay_headpiece(image_rgb, points, jewelry_path):
    """Overlay headpiece at top of head"""
    if not Path(jewelry_path).exists():
        return image_rgb
    
    headpiece = cv2.imread(str(jewelry_path), cv2.IMREAD_UNCHANGED)
    if headpiece is None:
        return image_rgb
    
    headpiece_rgb = cv2.cvtColor(headpiece, cv2.COLOR_BGR2RGB)
    h, w = headpiece_rgb.shape[:2]
    
    # Scale headpiece to 30% of face height
    face_height = abs(points['chin'][1] - points['forehead'][1])
    scale = (face_height * 0.3) / h
    headpiece_rgb = cv2.resize(headpiece_rgb, (int(w * scale), int(h * scale)))
    
    forehead = points['forehead']
    x = forehead[0] - int(headpiece_rgb.shape[1] // 2)
    y = forehead[1] - int(headpiece_rgb.shape[0] * 0.8)
    
    return paste_jewelry(image_rgb, headpiece_rgb, x, y)

def paste_jewelry(base_image, jewelry, x, y):
    """Paste jewelry image on base image with alpha blending"""
    h, w = base_image.shape[:2]
    j_h, j_w = jewelry.shape[:2]
    
    # Clip coordinates
    x1 = max(0, x)
    y1 = max(0, y)
    x2 = min(w, x + j_w)
    y2 = min(h, y + j_h)
    
    if x2 <= x1 or y2 <= y1:
        return base_image
    
    # Adjust jewelry crop if out of bounds
    jx1 = x1 - x
    jy1 = y1 - y
    jx2 = jx1 + (x2 - x1)
    jy2 = jy1 + (y2 - y1)
    
    jewelry_crop = jewelry[jy1:jy2, jx1:jx2]
    
    if jewelry_crop.shape[2] == 4:  # Has alpha
        alpha = jewelry_crop[:, :, 3] / 255.0
        for c in range(3):
            base_image[y1:y2, x1:x2, c] = base_image[y1:y2, x1:x2, c] * (1 - alpha) + jewelry_crop[:, :, c] * alpha
    else:
        base_image[y1:y2, x1:x2] = jewelry_crop
    
    return base_image

def apply_jewelry(image_rgb, face_shape, points, jewelry_type):
    """Apply jewelry overlay based on type"""
    jewelry_map = {
        "earrings": (overlay_earrings, "earrings"),
        "glasses": (overlay_glasses, "glasses"),
        "nose_ring": (overlay_nose_ring, "nose_rings"),
        "headpiece": (overlay_headpiece, "headpieces"),
    }
    
    if jewelry_type not in jewelry_map:
        return image_rgb
    
    overlay_func, subfolder = jewelry_map[jewelry_type]
    jewelry_path = JEWELRY_DIR / subfolder / f"{face_shape}.png"
    
    return overlay_func(image_rgb, points, jewelry_path)

def generate_try_on(image_rgb, face_shape, points, jewelry_type, output_path):
    """Generate final try-on image and save"""
    result_image = apply_jewelry(image_rgb.copy(), face_shape, points, jewelry_type)
    
    # Convert RGB to BGR for cv2
    result_bgr = cv2.cvtColor(result_image, cv2.COLOR_RGB2BGR)
    
    # Save
    cv2.imwrite(str(output_path), result_bgr)
    return output_path
