"""
Rename existing jewelry images (WhatsApp filenames) to face-shape PNGs.
- Reads face shape folder names from `app/assets/face_shape_dataset` to determine target names.
- Processes each subfolder under `app/assets/jewelry_assets` (earrings, glasses, nose_rings, headpieces).
- Converts images to PNG and names them `<shape>.png`, cycling shapes if fewer source images.
"""
from pathlib import Path
from PIL import Image

BASE = Path(__file__).resolve().parent.parent
FACE_SHAPES_DIR = BASE / "app" / "assets" / "face_shape_dataset"
JEWELRY_DIR = BASE / "app" / "assets" / "jewelry_assets"

if not FACE_SHAPES_DIR.exists():
    raise SystemExit(f"Face shapes directory not found: {FACE_SHAPES_DIR}")

face_shapes = sorted([p.name for p in FACE_SHAPES_DIR.iterdir() if p.is_dir()])
if not face_shapes:
    raise SystemExit("No face shape folders found in face_shape_dataset")

print("Face shapes:", face_shapes)

for sub in JEWELRY_DIR.iterdir():
    if not sub.is_dir():
        continue
    print('\nProcessing', sub)
    files = [p for p in sub.iterdir() if p.is_file() and p.name != '.DS_Store']
    if not files:
        print('  No files found, skipping')
        continue

    files.sort()  # deterministic order
    for i, src in enumerate(files):
        target_name = f"{face_shapes[i % len(face_shapes)]}.png"
        target_path = sub / target_name
        try:
            with Image.open(src) as im:
                # Convert to RGBA to preserve transparency if any
                im = im.convert('RGBA')
                im.save(target_path, format='PNG')
            print(f"  Saved {target_path}")
        except Exception as e:
            print(f"  Failed to convert {src}: {e}")

    # Optionally remove original WhatsApp files (commented out by default)
    # for src in files:
    #     try:
    #         src.unlink()
    #     except Exception as e:
    #         print(f"  Failed to remove {src}: {e}")

print('\nDone')
