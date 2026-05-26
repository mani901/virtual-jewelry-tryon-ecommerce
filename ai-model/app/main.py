from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import cv2
import numpy as np
from pathlib import Path
import json
import sys

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).resolve().parent))

from model.face_analyzer import analyze_face
from model.jewelry_overlay import generate_try_on

BASE_DIR = Path(__file__).resolve().parent
UPLOADS_DIR = BASE_DIR / "uploads"
OUTPUTS_DIR = BASE_DIR / "outputs"

# Create directories if they don't exist
UPLOADS_DIR.mkdir(exist_ok=True)
OUTPUTS_DIR.mkdir(exist_ok=True)

app = FastAPI(title="Jewelry Try-On API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze-face")
async def analyze_face_endpoint(file: UploadFile = File(...)):
    """
    Analyze uploaded face image and return face shape + landmarks
    """
    try:
        # Save uploaded file
        file_path = UPLOADS_DIR / file.filename
        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)
        
        # Analyze face
        result = analyze_face(str(file_path))
        
        if result is None:
            raise HTTPException(status_code=400, detail="No face detected in image")
        
        return {
            "success": True,
            "face_shape": result["face_shape"],
            "features": result["features"],
            "points": result["points"]
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/try-on")
async def try_on_endpoint(
    file: UploadFile = File(...),
    jewelry_type: str = "earrings"
):
    """
    Analyze face and apply jewelry overlay
    jewelry_type: earrings, glasses, nose_ring, headpiece
    """
    try:
        valid_types = ["earrings", "glasses", "nose_ring", "headpiece"]
        if jewelry_type not in valid_types:
            raise HTTPException(status_code=400, detail=f"Invalid jewelry type. Choose from: {valid_types}")
        
        # Save uploaded file
        file_path = UPLOADS_DIR / file.filename
        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)
        
        # Analyze face
        result = analyze_face(str(file_path))
        
        if result is None:
            raise HTTPException(status_code=400, detail="No face detected in image")
        
        # Generate try-on image
        output_filename = f"tryon_{jewelry_type}_{file.filename}"
        output_path = OUTPUTS_DIR / output_filename
        
        generate_try_on(
            result["image_rgb"],
            result["face_shape"],
            result["points"],
            jewelry_type,
            output_path
        )
        
        return {
            "success": True,
            "face_shape": result["face_shape"],
            "jewelry_type": jewelry_type,
            "output_image": str(output_path),
            "download_url": f"/download/{output_filename}"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/download/{filename}")
async def download_image(filename: str):
    """
    Download generated try-on image
    """
    file_path = OUTPUTS_DIR / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Image not found")
    
    return FileResponse(file_path, media_type="image/jpeg")

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "ok", "service": "Jewelry Try-On API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
