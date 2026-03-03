import os
import logging
import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict
from datetime import datetime

FINA_BRAIN_URL = "http://localhost:8105"  

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("FINA_GATEWAY")

app = FastAPI(title="FINA Gateway Service", version="2.0.0")

# CORS (Allows Frontend to connect)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    user_id: int
    message: str
    role: str = "Student"      # Default role
    mode: str = "Standard"     # Default mode

class ChatResponse(BaseModel):
    response: str
    timestamp: str


@app.get("/")
def health_check():
    """Checks if the Gateway and the Brain are connected."""
    try:
        # Ping the Brain to see if it's alive (Optional, assuming Brain has a root or we just check connection)
        requests.get(f"{FINA_BRAIN_URL}/docs", timeout=2) 
        return {"status": "online", "brain_status": "connected"}
    except:
        return {"status": "online", "brain_status": "disconnected (check api.py)"}

@app.post("/chat", response_model=ChatResponse)
def chat_proxy(request: ChatRequest):
    """
    Receives Chat from Frontend -> Sends to FINA Brain (api.py) -> Returns Answer
    """
    logger.info(f"📍 Chat Request: {request.message} (User: {request.user_id})")
    
    try:
        # 1. Forward to api.py
        payload = {
            "user_id": request.user_id,
            "role": request.role,
            "mode": request.mode,
            "message": request.message
        }
        
        response = requests.post(f"{FINA_BRAIN_URL}/chat", json=payload)
        
        if response.status_code != 200:
            logger.error(f"Brain Error: {response.text}")
            raise HTTPException(status_code=500, detail="FINA Brain is struggling.")

        data = response.json()
        
        # 2. Return to Frontend
        return ChatResponse(
            response=data.get("response", "Error: No response from Brain"),
            timestamp=datetime.now().isoformat()
        )

    except requests.exceptions.ConnectionError:
        logger.error("Could not connect to api.py. Is it running?")
        raise HTTPException(status_code=503, detail="FINA Brain is offline.")
    except Exception as e:
        logger.error(f"Unexpected Gateway Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/dashboard/{user_id}")
def dashboard_proxy(user_id: int):
    """
    Fetches Dashboard stats from FINA Brain
    """
    logger.info(f" Dashboard Request for User {user_id}")
    try:
        response = requests.get(f"{FINA_BRAIN_URL}/dashboard/{user_id}")
        return response.json()
    except Exception as e:
        logger.error(f"Dashboard Proxy Error: {e}")
        # Return a fallback structure so Frontend doesn't crash
        return {
            "user_id": user_id,
            "total_income": 0,
            "total_spent": 0,
            "spending_breakdown": [],
            "message": "Brain disconnected."
        }

@app.get("/history/{user_id}")
def history_proxy(user_id: int):
    """
    Fetches Transaction History from FINA Brain
    """
    logger.info(f"History Request for User {user_id}")
    try:
        response = requests.get(f"{FINA_BRAIN_URL}/history/{user_id}")
        return response.json()
    except Exception as e:
        logger.error(f"History Proxy Error: {e}")
        return {"history": []}

if __name__ == "__main__":
    import uvicorn
    # Runs on Port 8000 (Standard for your Frontend)
    uvicorn.run(app, host="0.0.0.0", port=8000)