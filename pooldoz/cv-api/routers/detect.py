from fastapi import APIRouter, UploadFile, File, HTTPException
from services.contour_detection import detect_contours

router = APIRouter()


@router.post("/detect-contours")
async def detect_contours_endpoint(file: UploadFile = File(...)):
    if file.content_type not in ("image/jpeg", "image/png"):
        raise HTTPException(status_code=415, detail="JPEG or PNG required")

    image_bytes = await file.read()
    try:
        result = detect_contours(image_bytes)
        return result
    except Exception as e:
        raise HTTPException(status_code=422, detail=str(e))
