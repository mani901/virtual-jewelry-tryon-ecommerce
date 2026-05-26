import os
import cv2
import joblib
import numpy as np
import pandas as pd
import mediapipe as mp

from pathlib import Path
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report


BASE_DIR = Path(__file__).resolve().parent.parent

DATASET_DIR = BASE_DIR / "assets" / "face_shape_dataset"
MODEL_DIR = BASE_DIR / "saved_models"
MODEL_PATH = MODEL_DIR / "face_shape_model.pkl"

LABELS = ["oval", "round", "square", "heart", "diamond", "oblong"]

FEATURE_COLUMNS = [
    "face_ratio",
    "jaw_ratio",
    "cheek_jaw_ratio",
    "forehead_chin_ratio",
]

mp_face_mesh = mp.solutions.face_mesh

face_mesh = mp_face_mesh.FaceMesh(
    static_image_mode=True,
    max_num_faces=1,
    refine_landmarks=True,
    min_detection_confidence=0.5
)


def distance(p1, p2):
    return np.linalg.norm(np.array(p1) - np.array(p2))


def get_point(landmarks, index, width, height):
    return np.array([
        int(landmarks[index].x * width),
        int(landmarks[index].y * height)
    ])


def extract_features(image_rgb):
    height, width, _ = image_rgb.shape
    results = face_mesh.process(image_rgb)

    if not results.multi_face_landmarks:
        return None

    landmarks = results.multi_face_landmarks[0].landmark

    forehead = get_point(landmarks, 10, width, height)
    chin = get_point(landmarks, 152, width, height)

    left_cheek = get_point(landmarks, 234, width, height)
    right_cheek = get_point(landmarks, 454, width, height)

    left_jaw = get_point(landmarks, 172, width, height)
    right_jaw = get_point(landmarks, 397, width, height)

    face_height = distance(forehead, chin)
    cheekbone_width = distance(left_cheek, right_cheek)
    jaw_width = distance(left_jaw, right_jaw)

    if cheekbone_width == 0 or face_height == 0:
        return None

    features = {
        "face_ratio": face_height / cheekbone_width,
        "jaw_ratio": jaw_width / cheekbone_width,
        "cheek_jaw_ratio": cheekbone_width / jaw_width if jaw_width != 0 else 0,
        "forehead_chin_ratio": forehead[1] / chin[1] if chin[1] != 0 else 0,
    }

    return features


def build_dataset():
    rows = []

    for label in LABELS:
        folder = DATASET_DIR / label

        if not folder.exists():
            print(f"Folder missing: {folder}")
            continue

        for file in folder.iterdir():
            if file.suffix.lower() not in [".jpg", ".jpeg", ".png", ".webp"]:
                continue

            image_bgr = cv2.imread(str(file))

            if image_bgr is None:
                print(f"Could not read: {file}")
                continue

            image_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
            features = extract_features(image_rgb)

            if features is None:
                print(f"No face detected: {file}")
                continue

            features["label"] = label
            features["filename"] = file.name
            rows.append(features)

    return pd.DataFrame(rows)


def train_model():
    print("Building dataset...")
    df = build_dataset()

    print("Training rows found:", len(df))

    if len(df) == 0:
        print("No training data found.")
        return

    print(df["label"].value_counts())

    if df["label"].nunique() < 2:
        print("Need at least 2 face-shape classes to train.")
        return

    X = df[FEATURE_COLUMNS]
    y = df["label"]

    stratify = y if y.value_counts().min() >= 2 else None

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.25,
        random_state=42,
        stratify=stratify
    )

    model = RandomForestClassifier(
        n_estimators=200,
        random_state=42,
        class_weight="balanced"
    )

    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)

    print("Model trained successfully.")
    print("Accuracy:", accuracy_score(y_test, y_pred))
    print(classification_report(y_test, y_pred))

    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(
        {
            "model": model,
            "features": FEATURE_COLUMNS,
            "labels": LABELS
        },
        MODEL_PATH
    )

    print("Model saved at:", MODEL_PATH)


if __name__ == "__main__":
    train_model()
