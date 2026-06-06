from fastapi import FastAPI, File, UploadFile, HTTPException, Form, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from uuid import uuid4
import shutil

from .model.face_analyzer import analyze_face
from .model.jewelry_overlay import generate_try_on

BASE_DIR = Path(__file__).resolve().parent
UPLOADS_DIR = BASE_DIR / "uploads"
OUTPUTS_DIR = BASE_DIR / "outputs"
JEWELRY_DIR = BASE_DIR / "assets" / "jewelry_assets"

UPLOADS_DIR.mkdir(exist_ok=True)
OUTPUTS_DIR.mkdir(exist_ok=True)

app = FastAPI(title="Jewelry Try-On API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve jewelry assets so frontend can preview them
app.mount("/assets/jewelry", StaticFiles(directory=str(JEWELRY_DIR)), name="jewelry_assets")


@app.get("/health")
async def health():
    return {"status": "ok", "service": "Jewelry Try-On API"}


@app.post("/analyze-face")
async def analyze_face_endpoint(file: UploadFile = File(...)):
    try:
        ext = Path(file.filename).suffix or ".jpg"
        # normalize extension to include leading dot and lowercase
        ext = ext if ext.startswith('.') else f'.{ext}'
        ext = ext.lower()
        safe_filename = f"{uuid4().hex}{ext}"
        file_path = UPLOADS_DIR / safe_filename

        contents = await file.read()
        with open(file_path, "wb") as buffer:
            buffer.write(contents)

        result = analyze_face(str(file_path))

        if result is None:
            raise HTTPException(status_code=400, detail="No face detected in image")

        return {
            "success": True,
            "face_shape": str(result["face_shape"]),
            "features": result["features"],
            "points": result["points"]
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/jewelry")
async def list_jewelry(request: Request):
    """List available jewelry files with preview URLs"""
    types = {
        "earrings": "earrings",
        "glasses": "glasses",
        "nose_ring": "nose_rings",
        "headpiece": "headpieces",
    }

    response = {}
    # Only list common image formats and ignore hidden files
    allowed_ext = {".jpg", ".jpeg", ".png", ".webp"}
    for key, sub in types.items():
        folder = JEWELRY_DIR / sub
        items = []
        if folder.exists():
            for p in sorted(folder.iterdir()):
                if not p.is_file():
                    continue
                if p.name.startswith('.'):
                    continue
                if p.suffix.lower() not in allowed_ext:
                    continue
                items.append({
                    "filename": p.name,
                    "preview_url": f"/assets/jewelry/{sub}/{p.name}"
                })
        response[key] = items

    return JSONResponse(response)


@app.post("/try-on")
async def try_on_endpoint(
    file: UploadFile = File(...),
    jewelry_type: str = Form("earrings"),
    jewelry_filename: str = Form(None),
):
    try:
        valid_types = ["earrings", "glasses", "nose_ring", "headpiece"]

        if jewelry_type not in valid_types:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid jewelry type. Choose from: {valid_types}"
            )

        # Auto-select first available file when none provided
        if not jewelry_filename:
            sub_map = {
                "earrings": "earrings",
                "glasses": "glasses",
                "nose_ring": "nose_rings",
                "headpiece": "headpieces",
            }
            sub = sub_map[jewelry_type]
            allowed_ext = {".jpg", ".jpeg", ".png", ".webp"}
            candidates = sorted(
                p.name for p in (JEWELRY_DIR / sub).iterdir()
                if p.is_file() and p.suffix.lower() in allowed_ext
            )
            if not candidates:
                raise HTTPException(
                    status_code=404,
                    detail=f"No jewelry assets found for type: {jewelry_type}"
                )
            jewelry_filename = candidates[0]

        ext = Path(file.filename).suffix or ".jpg"
        safe_filename = f"{uuid4().hex}{ext}"
        file_path = UPLOADS_DIR / safe_filename

        contents = await file.read()
        with open(file_path, "wb") as buffer:
            buffer.write(contents)

        result = analyze_face(str(file_path))

        if result is None:
            raise HTTPException(status_code=400, detail="No face detected in image")

        output_filename = f"tryon_{jewelry_type}_{safe_filename}"
        output_path = OUTPUTS_DIR / output_filename

        # Call generate_try_on with selected filename
        generate_try_on(
            result["image_rgb"],
            result["points"],
            jewelry_type,
            jewelry_filename,
            output_path
        )

        return {
            "success": True,
            "face_shape": str(result["face_shape"]),
            "jewelry_type": jewelry_type,
            "jewelry_filename": jewelry_filename,
            "download_url": f"/download/{output_filename}"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/download/{filename}")
async def download_image(filename: str):
    file_path = OUTPUTS_DIR / filename

    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Image not found")

    return FileResponse(file_path)


@app.post("/recommend-jewelry")
async def recommend_jewelry(face_shape: str = Form(...), jewelry_type: str = Form("earrings")):
    """Return simple recommendations based on face shape and available files"""
    mapping = {
        "earrings": "earrings",
        "glasses": "glasses",
        "nose_ring": "nose_rings",
        "headpiece": "headpieces",
    }

    if jewelry_type not in mapping:
        raise HTTPException(status_code=400, detail=f"Invalid jewelry type. Choose from: {list(mapping.keys())}")

    folder = JEWELRY_DIR / mapping[jewelry_type]
    if not folder.exists():
        return {"recommendations": []}

    files = [p.name for p in sorted(folder.iterdir()) if p.is_file()]

    # Simple heuristic: choose first 3 items and add reason based on face_shape
    reasons = {
        "round": "Adds length to round faces",
        "oval": "Balances oval faces",
        "square": "Softens strong jawlines",
        "heart": "Complements narrow chin",
        "diamond": "Highlights cheekbones",
        "oblong": "Adds width to long faces",
    }

    recs = []
    for fname in files[:3]:
        reason = reasons.get(face_shape.lower(), "Popular item")
        recs.append({"filename": fname, "reason": reason, "preview_url": f"/assets/jewelry/{mapping[jewelry_type]}/{fname}"})

    return {"recommendations": recs}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
