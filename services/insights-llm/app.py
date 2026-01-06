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
                detail="Service not initialized (Check GEMINI_API_KEY)"
            )
        
        # 1. Fetch transactions
        transactions = db_manager.fetch_transactions(request.user_id)
        
        # 2. Process with RAG pipeline (Gemini)
        result = rag_pipeline.process_query(
            user_id=request.user_id,
            query=request.message,
            transactions=transactions
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