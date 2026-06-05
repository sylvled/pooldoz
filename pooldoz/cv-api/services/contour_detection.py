import cv2
import numpy as np
from typing import Any


def detect_contours(image_bytes: bytes) -> dict[str, Any]:
    """
    Detect pool contour in image.
    Returns normalized polygon [0..1] coordinates.
    """
    arr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Could not decode image")

    h, w = img.shape[:2]

    # Preprocess
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    edges = cv2.Canny(blurred, 50, 150)

    # Find contours
    contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    if not contours:
        raise ValueError("No contour detected")

    # Select largest contour by area
    largest = max(contours, key=cv2.contourArea)

    # Approximate polygon
    epsilon = 0.02 * cv2.arcLength(largest, True)
    approx = cv2.approxPolyDP(largest, epsilon, True)

    # Normalize to [0..1]
    polygon = [
        {"x": float(pt[0][0]) / w, "y": float(pt[0][1]) / h}
        for pt in approx
    ]

    area = cv2.contourArea(largest)
    confidence = min(area / (w * h), 1.0)

    return {
        "success": True,
        "polygon": polygon,
        "confidence": round(confidence, 3),
        "method": "opencv",
    }
