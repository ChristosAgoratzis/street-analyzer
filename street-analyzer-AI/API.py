import io
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
from io import BytesIO
from PIL import Image
import cv2
import numpy as np
import torch

# FastAPI App Setup
app = FastAPI()
url = "http://localhost:8080/images"

# CORS Settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow requests from any origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data Model
class PictureRequest(BaseModel):
    id: str
    source: str  

# Object Detection Setup (YOLOv5)
device = "cuda" if torch.cuda.is_available() else "cpu"
model = torch.hub.load("ultralytics/yolov5", "yolov5l", pretrained=True).to(device)
# yolov5s yolov5m yolov5l yolov5x
model.eval()

def detect_objects(image: np.ndarray):
    """Run object detection and return the counts for specific objects."""
    try:
        # Perform object detection
        results = model(image)

        # List of classes to count
        classes_to_count = {"cars": [2, 7], "stop_signs": [11], "humans": [0]}

        # Initialize counts
        counts = {"cars": 0, "stop_signs": 0, "humans": 0}

        # Process detections
        for obj in results.pred[0].cpu().numpy():  # Each detection
            class_id = int(obj[5])  # Class index
            for class_name, target_ids in classes_to_count.items():
                if class_id in target_ids:
                    counts[class_name] += 1


            # Display results
        print("Counts:")
        for obj_name, count in counts.items():
            print(f"{obj_name}: {count}")
            
            

        
        return counts
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Object detection failed: {e}")

@app.post("/process-picture/")
async def process_picture(request: PictureRequest):
    image_name = request.source
    response = requests.get(f"http://localhost:8080/images/{image_name}")
    image = response.content
    image_stream = io.BytesIO(image)
    img = Image.open(image_stream)
     # Check if image is valid
    if img is None:
            raise HTTPException(status_code=400, detail="Invalid image format")
    img_np = np.array(img)
    detection_counts = detect_objects(img_np)
    return detection_counts
        


    

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
