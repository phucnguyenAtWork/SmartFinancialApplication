import logging
import requests
import json
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

class RAGPipeline:
    """Handles RAG processing for financial insights using Direct HTTP API"""
    
    def __init__(self, api_key: str):
        if not api_key:
            raise ValueError("Gemini API key is required")
        self.api_key = api_key
        self.api_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"
        logger.info("RAG Pipeline initialized")

    def build_context(self, transactions: List[Dict]) -> str:
        if not transactions:
            return "No transactions found."
        
        def safe_float(val):
            try: return float(val)
            except: return 0.0

        income = sum(safe_float(t.get('amount')) for t in transactions if t.get('type') == 'INCOME')
        expenses = sum(safe_float(t.get('amount')) for t in transactions if t.get('type') == 'EXPENSE')
        
        return f"""
        FINANCIAL SUMMARY:
        Total Income: ${income:,.2f}
        Total Expenses: ${expenses:,.2f}
        Net Savings: ${income - expenses:,.2f}
        Transaction Count: {len(transactions)}
        """

    def process_query(self, user_id: int, query: str, transactions: List[Dict]) -> Dict[str, Any]:
        try:
            context = self.build_context(transactions)
            
            # Construct the raw JSON payload
            payload = {
                "contents": [{
                    "parts": [{
                        "text": f"Context: {context}\nUser Question: {query}\nAnswer concisely."
                    }]
                }]
            }
            
            # Send Request
            response = requests.post(
                f"{self.api_url}?key={self.api_key}",
                headers={"Content-Type": "application/json"},
                json=payload
            )
            
            # Check for success
            if response.status_code != 200:
                logger.error(f"Gemini API Error {response.status_code}: {response.text}")
                return {
                    "answer": f"Error from Google: {response.status_code}",
                    "transactions_count": 0,
                    "context_used": False,
                    "context_preview": ""
                }
            
            # Parse Response
            data = response.json()
            try:
                answer = data['candidates'][0]['content']['parts'][0]['text']
            except (KeyError, IndexError):
                answer = "No text generated."

            return {
                'answer': answer,
                'transactions_count': len(transactions),
                'context_used': True,
                'context_preview': context[:200]
            }
            
        except Exception as e:
            logger.error(f"RAG Pipeline Critical Failure: {e}")
            return {
                'answer': "I'm having trouble connecting to the AI service.",
                'transactions_count': 0,
                'context_used': False,
                'context_preview': ''
            }