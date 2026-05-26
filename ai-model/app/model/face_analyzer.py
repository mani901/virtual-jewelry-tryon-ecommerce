import cv2
import joblib
import numpy as np
import mediapipe as mp
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "saved_models" / "face_shape_model.pkl"

mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(
    static_image_mode=True,
    max_num_faces=1,
    refine_landmarks=True,
    min_detection_confidence=0.5
)

model_data = joblib.load(MODEL_PATH)
face_shape_model = model_data["model"]
FEATURE_COLUMNS = model_data["features"]

def get_point(landmarks, index, width, height):
    return np.array([int(landmarks[index].x * width), int(landmarks[index].y * height)])

def distance(p1, p2):
    return np.linalg.norm(p1 - p2)

def analyze_face(image_path):
    image_bgr = cv2.imread(str(image_path))
    image_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
    h, w, _ = image_rgb.shape

    results = face_mesh.process(image_rgb)
    if not results.multi_face_landmarks:
        return None

    landmarks = results.multi_face_landmarks[0].landmark

    points = {
        "forehead": get_point(landmarks, 10, w, h),
        "chin": get_point(landmarks, 152, w, h),
        "left_face": get_point(landmarks, 234, w, h),
        "right_face": get_point(landmarks, 454, w, h),
        "left_jaw": get_point(landmarks, 172, w, h),
        "right_jaw": get_point(landmarks, 397, w, h),
        "left_eye": get_point(landmarks, 33, w, h),
        "right_eye": get_point(landmarks, 263, w, h),
        "left_nostril": get_point(landmarks, 98, w, h),
        "right_nostril": get_point(landmarks, 327, w, h),
    }

    face_height = distance(points["forehead"], points["chin"])
    cheek_width = distance(points["left_face"], points["right_face"])
    jaw_width = distance(points["left_jaw"], points["right_jaw"])

    features = {
        "face_ratio": face_height / cheek_width,
        "jaw_ratio": jaw_width / cheek_width,
        "cheek_jaw_ratio": cheek_width / jaw_width,
        "forehead_chin_ratio": points["forehead"][1] / points["chin"][1],
    }

    X = [[features[col] for col in FEATURE_COLUMNS]]
    face_shape = face_shape_model.predict(X)[0]

    return {
        "image_rgb": image_rgb,
        "face_shape": face_shape,
        "features": features,
        "points": {k: v.tolist() for k, v in points.items()}
    }
