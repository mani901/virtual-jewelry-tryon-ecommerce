from fastapi import FastAPI, File, UploadFile, HTTPException, Form, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from uuid import uuid4
import shutil
import urllib.request

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
    file_path = None
    try:
        ext           = (Path(file.filename).suffix or ".jpg").lower()
        ext           = ext if ext.startswith('.') else f'.{ext}'
        safe_filename = f"{uuid4().hex}{ext}"
        file_path     = UPLOADS_DIR / safe_filename

        contents = await file.read()
        with open(file_path, "wb") as buffer:
            buffer.write(contents)

        result = analyze_face(str(file_path))

        if result is None:
            raise HTTPException(status_code=400, detail="No face detected in image")

        return {
            "success":      True,
            "face_shape":   str(result["face_shape"]),
            "features":     result["features"],
            "points":       result["points"],
            "measurements": result.get("measurements", {}),
            "pose":         result.get("pose", {}),
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Clean up temp upload to prevent unbounded disk growth
        if file_path and file_path.exists():
            try:
                file_path.unlink()
            except OSError:
                pass


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
    jewelry_image_url: str = Form(None),
):
    """
    jewelry_image_url (optional): direct URL to the product's own image
    (e.g. a Cloudinary URL from the admin-uploaded product).  When supplied,
    the AI model downloads and uses that image as the jewelry overlay so the
    try-on always reflects the exact product — regardless of whether assets
    exist in the local jewelry_assets folder.

    Falls back to jewelry_filename / local assets when the URL is absent.
    """
    file_path         = None
    jewelry_temp_path = None
    try:
        valid_types = ["earrings", "glasses", "nose_ring", "headpiece"]

        if jewelry_type not in valid_types:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid jewelry type. Choose from: {valid_types}"
            )

        # ── Save the user's face photo ───────────────────────────────────────
        ext           = (Path(file.filename).suffix or ".jpg").lower()
        safe_filename = f"{uuid4().hex}{ext}"
        file_path     = UPLOADS_DIR / safe_filename

        contents = await file.read()
        with open(file_path, "wb") as buffer:
            buffer.write(contents)

        # ── Resolve jewelry asset ────────────────────────────────────────────
        # Priority 1: caller passed a URL (admin-uploaded product image)
        if jewelry_image_url:
            try:
                img_ext           = Path(jewelry_image_url.split("?")[0]).suffix or ".jpg"
                jewelry_temp_path = UPLOADS_DIR / f"jewelry_{uuid4().hex}{img_ext}"
                urllib.request.urlretrieve(jewelry_image_url, str(jewelry_temp_path))
            except Exception:
                # Download failed — fall through to local asset selection below
                jewelry_temp_path = None

        # Priority 2: filename from local assets folder (seed products / manual selection)
        if jewelry_temp_path is None and not jewelry_filename:
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

        # ── Face analysis ────────────────────────────────────────────────────
        result = analyze_face(str(file_path))

        if result is None:
            raise HTTPException(status_code=400, detail="No face detected in image")

        output_filename = f"tryon_{jewelry_type}_{safe_filename}"
        output_path     = OUTPUTS_DIR / output_filename

        generate_try_on(
            result["image_rgb"],
            result["points"],
            jewelry_type,
            jewelry_filename or "product.jpg",
            output_path,
            measurements=result.get("measurements"),
            pose=result.get("pose"),
            jewelry_path_override=jewelry_temp_path,
        )

        return {
            "success":          True,
            "face_shape":       str(result["face_shape"]),
            "jewelry_type":     jewelry_type,
            "jewelry_filename": jewelry_filename or "",
            "download_url":     f"/download/{output_filename}",
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        for p in (file_path, jewelry_temp_path):
            if p and Path(p).exists():
                try:
                    Path(p).unlink()
                except OSError:
                    pass


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
