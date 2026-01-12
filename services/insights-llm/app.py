import os
import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import Optional, Dict
from datetime import datetime

# Import the NEW Gemini RAG Pipeline
from rag_pipeline import RAGPipeline
from database import DatabaseManager

# Setup
load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Insights LLM Service (Gemini)", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("CORS_ORIGIN", "http://localhost:5173")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize RAG Pipeline
try:
    # We now look for GEMINI_API_KEY
    api_key = os.getenv("GEMINI_API_KEY")
    rag_pipeline = RAGPipeline(api_key=api_key)
    db_manager = DatabaseManager()
    logger.info("✅ Services initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize services: {e}")
    rag_pipeline = None
    db_manager = None


class ChatRequest(BaseModel):
    user_id: int
    message: str


class ChatResponse(BaseModel):
    response: str
    context_used: int
    metadata: Optional[Dict] = None


@app.post("/chat", response_model=ChatResponse)
def chat_endpoint(request: ChatRequest):
    try:
        logger.info(f"Chat request from user {request.user_id}: {request.message}")

        if not rag_pipeline or not db_manager:
            raise HTTPException(
                status_code=503,
                detail="Service not initialized"
            )
        
        transactions = db_manager.fetch_transactions(request.user_id)

        chat_history = db_manager.fetch_chat_history(request.user_id, limit=6)

        result = rag_pipeline.process_query(
            user_id=request.user_id,
            query=request.message,
            transactions=transactions,
            history=chat_history
        )
        
        # 3. Save chat log
        try:
            db_manager.save_chat_log(
                user_id=request.user_id,
                query=request.message,
                response=result['answer'],
                context=result['context_preview']
            )
        except Exception as e:
            logger.warning(f"Failed to save chat log: {e}")

        return ChatResponse(
            response=result['answer'],
            context_used=result['transactions_count'],
            metadata={
                "timestamp": datetime.now().isoformat(),
                "model": "gemini-1.5-flash",
                "provider": "Google"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/history/{user_id}")
def get_chat_history_endpoint(user_id: int):
    """
    Endpoint for the Frontend to load past messages
    """
    try:
        if not db_manager:
            raise HTTPException(status_code=503, detail="Database not initialized")

        history = db_manager.fetch_chat_history(user_id, limit=50)
        
        return {"history": history}
        
    except Exception as e:
        logger.error(f"Error fetching history: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/dashboard/{user_id}")
def get_dashboard_data(user_id: int):
    """
    Generates the initial dashboard state using Gemini
    """
    try:
        if not rag_pipeline or not db_manager:
            raise HTTPException(status_code=503, detail="Service not initialized")

        transactions = db_manager.fetch_transactions(user_id, days=30)
        
        dashboard_data = rag_pipeline.generate_dashboard_insights(transactions)
        
        if not dashboard_data:
            return {
                "initial_message": "Welcome back! I'm ready to analyze your finances.",
                "summary_cards": [],
                "smart_insights": [],
                "prediction": None
            }
            
        return dashboard_data

    except Exception as e:
        logger.error(f"Dashboard Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))