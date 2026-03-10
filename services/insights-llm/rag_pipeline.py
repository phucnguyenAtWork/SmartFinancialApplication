# import logging
# import requests
# import json
# from typing import List, Dict, Any

# logger = logging.getLogger(__name__)

# class RAGPipeline:
#     """Handles RAG processing for financial insights using Direct HTTP API"""
    
    def __init__(self, api_key: str):
        if not api_key:
            raise ValueError("Gemini API key is required")
        self.api_key = api_key
        self.api_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent"
        logger.info("RAG Pipeline initialized")

#     def build_context(self, transactions: List[Dict]) -> str:
#         if not transactions:
#             return "No transactions found."
        
#         def safe_float(val):
#             try: return float(val)
#             except: return 0.0

#         income = sum(safe_float(t.get('amount')) for t in transactions if t.get('type') == 'INCOME')
#         expenses = sum(safe_float(t.get('amount')) for t in transactions if t.get('type') == 'EXPENSE')
        
#         return f"""
#         FINANCIAL SUMMARY:
#         Total Income: ${income:,.2f}
#         Total Expenses: ${expenses:,.2f}
#         Net Savings: ${income - expenses:,.2f}
#         Transaction Count: {len(transactions)}
#         """

#     def process_query(self, user_id: int, query: str, transactions: List[Dict], history: List[Dict] = []) -> Dict[str, Any]:
#         """
#         Modified to accept 'history'. 
#         history format expected from DB: [{'role': 'user', 'message': '...'}, {'role': 'model', 'message': '...'}]
#         """
#         try:
#             context = self.build_context(transactions)
            
#             contents_payload = []

#             for turn in history:
#                 role = "user" if turn['role'] == 'user' else "model"
#                 contents_payload.append({
#                     "role": role,
#                     "parts": [{"text": turn['message']}]
#                 })

#             current_prompt = f"Context: {context}\nUser Question: {query}\nAnswer concisely."
            
#             contents_payload.append({
#                 "role": "user",
#                 "parts": [{"text": current_prompt}]
#             })
            
<<<<<<< HEAD
#             payload = {
#                 "contents": contents_payload
#             }
=======
            payload = {
                "systemInstruction": {
                    "role": "user",
                    "parts": [
                        {
                            "text": (
                                "You are a helpful AI Financial Advisor. "
                                "CRITICAL RULES: "
                                "1. All transaction amounts in the context are ALREADY in Vietnamese Dong (VND). "
                                "2. DO NOT apply any currency exchange rates or multiply the numbers. If the data says 101000000, it means exactly 101,000,000 VND. "
                                "3. Never use the dollar sign ($). Format numbers with commas and add 'VND' or 'đ' (e.g., 101,000,000 VND). "
                                "4. Always reply in English."
                            )
                        }
                    ]
                },
                "contents": contents_payload
            }
>>>>>>> main
            
#             response = requests.post(
#                 f"{self.api_url}?key={self.api_key}",
#                 headers={"Content-Type": "application/json"},
#                 json=payload
#             )
            
#             # Check for success
#             if response.status_code != 200:
#                 logger.error(f"Gemini API Error {response.status_code}: {response.text}")
#                 return {
#                     "answer": f"Error from Google: {response.status_code}",
#                     "transactions_count": 0,
#                     "context_used": False,
#                     "context_preview": ""
#                 }
            
#             # Parse Response
#             data = response.json()
#             try:
#                 answer = data['candidates'][0]['content']['parts'][0]['text']
#             except (KeyError, IndexError):
#                 answer = "No text generated."

#             return {
#                 'answer': answer,
#                 'transactions_count': len(transactions),
#                 'context_used': True,
#                 'context_preview': context[:200]
#             }
            
#         except Exception as e:
#             logger.error(f"RAG Pipeline Critical Failure: {e}")
#             return {
#                 'answer': "I'm having trouble connecting to the AI service.",
#                 'transactions_count': 0,
#                 'context_used': False,
#                 'context_preview': ''
#             }
#     def generate_dashboard_insights(self, transactions: List[Dict]) -> Dict[str, Any]:
#         """
#         Generates structured JSON data for the dashboard cards and sidebar.
#         """
#         try:
#             context = self.build_context(transactions)
            
<<<<<<< HEAD
#             # Strict Prompt to force JSON structure matching your Frontend
#             prompt = f"""
#             Analyze the following financial summary and return a JSON object for a dashboard.
=======
            prompt = f"""
            Analyze the following financial summary and return a JSON object for a dashboard.
>>>>>>> main
            
#             DATA:
#             {context}

<<<<<<< HEAD
#             REQUIREMENTS:
#             Return ONLY raw JSON. No markdown formatting. The JSON must match this structure:
#             {{
#                 "initial_message": "A short, friendly greeting summarizing the financial status.",
#                 "summary_cards": [
#                     {{ "id": 1, "type": "danger|success|warning|info", "title": "Short Title", "subtitle": "Short Stat", "badge": "TAG" }},
#                     {{ "id": 2, "type": "...", "title": "...", "subtitle": "...", "badge": "..." }},
#                     {{ "id": 3, "type": "...", "title": "...", "subtitle": "...", "badge": "..." }},
#                     {{ "id": 4, "type": "...", "title": "...", "subtitle": "...", "badge": "..." }}
#                 ],
#                 "smart_insights": [
#                     {{ "id": 1, "type": "warning|success|info", "title": "Insight Title", "desc": "One sentence description." }},
#                     {{ "id": 2, "type": "...", "title": "...", "desc": "..." }},
#                     {{ "id": 3, "type": "...", "title": "...", "desc": "..." }}
#                 ],
#                 "prediction": {{
#                     "amount": 1234,
#                     "confidence": 85,
#                     "label": "Expected spending next week"
#                 }}
#             }}
#             """
            
#             payload = {
#                 "contents": [{"parts": [{"text": prompt}]}],
#                 "generationConfig": {"response_mime_type": "application/json"} 
#             }
=======
            REQUIREMENTS:
            Return ONLY raw JSON. No markdown formatting. The JSON must match this structure exactly:
            {{
                "initial_message": "A short, friendly greeting summarizing the financial status. Use VND formatting (e.g., 5.000.000 đ).",
                "summary_cards": [
                    {{ "id": 1, "type": "danger|success|warning|info", "title": "Short Title", "subtitle": "Format money as VND (e.g., 100.000 đ)", "badge": "TAG" }},
                    {{ "id": 2, "type": "...", "title": "...", "subtitle": "...", "badge": "..." }}
                ],
                "smart_insights": [
                    {{ "id": 1, "type": "warning|success|info", "title": "Insight Title", "desc": "One sentence description. Format money as VND." }}
                ],
                "prediction": {{
                    "amount": 1234000, // CRITICAL: This MUST be a raw integer. No commas, no text, no currency symbols.
                    "confidence": 85,
                    "label": "Expected spending next week"
                }}
            }}
            """
            
            payload = {
                "systemInstruction": {
                "role": "user",
                "parts": [
                 {
                    "text": "You are a helpful AI Financial Advisor. CRITICAL RULES: 1. Write all text and insights in English ONLY. 2. The numbers in the data are ALREADY in VND. DO NOT convert or multiply them by any exchange rate. Just format the raw numbers with commas and add 'VND' or 'đ' (e.g., 101000000 becomes 101,000,000 VND). 3. Never use $."
                 }
                ]
            },
                "contents": [
                {
                    "role": "user",
                    "parts": [{"text": prompt}]
                }
                ],
                "generationConfig": {
                    "responseMimeType": "application/json"
                } 
            }
>>>>>>> main
            
#             response = requests.post(
#                 f"{self.api_url}?key={self.api_key}",
#                 headers={"Content-Type": "application/json"},
#                 json=payload
#             )
            
<<<<<<< HEAD
#             if response.status_code == 200:
#                 data = response.json()
#                 text_content = data['candidates'][0]['content']['parts'][0]['text']
#                 # Clean up any potential markdown formatting just in case
#                 clean_json = text_content.replace('```json', '').replace('```', '').strip()
#                 return json.loads(clean_json)
=======
            if response.status_code == 200:
                data = response.json()
                text_content = data['candidates'][0]['content']['parts'][0]['text']
                
                # Clean up any potential markdown formatting just in case
                clean_json = text_content.replace('```json', '').replace('```', '').strip()
                return json.loads(clean_json)
>>>>>>> main
            
#             else:
#                 logger.error(f"Dashboard Gen Error: {response.text}")
#                 return None

#         except Exception as e:
#             logger.error(f"Dashboard Generation Failed: {e}")
#             return None