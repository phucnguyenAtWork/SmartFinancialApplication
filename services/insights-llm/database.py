import os
import json
import mysql.connector
from typing import List, Dict
import logging

logger = logging.getLogger(__name__)

class DatabaseManager:
    """Manages database connections and queries"""
    
    def __init__(self):
        """Initialize database manager"""
        # Connection for reading Financial Data
        self.finance_db_config = {
            'host': os.getenv('DB_HOST', 'mysql-finance'),
            'port': int(os.getenv('DB_PORT', 3306)),
            'user': os.getenv('DB_USER', 'root'),
            'password': os.getenv('DB_PASS', 'rootpass'),
            'database': os.getenv('DB_NAME', 'financedb')
        }
        
        # Connection for saving Chat Logs
        self.insights_db_config = {
            'host': os.getenv('INSIGHTS_DB_HOST', 'mysql-insights'),
            'port': int(os.getenv('INSIGHTS_DB_PORT', 3306)),
            'user': os.getenv('INSIGHTS_DB_USER', 'root'),
            'password': os.getenv('INSIGHTS_DB_PASS', 'rootpass'),
            'database': os.getenv('INSIGHTS_DB_NAME', 'insightsdb')
        }
        
        logger.info("Database manager initialized")
    
    def get_finance_connection(self):
        try:
            return mysql.connector.connect(**self.finance_db_config)
        except Exception as e:
            logger.error(f"Finance DB connection failed: {e}")
            raise
    
    def get_insights_connection(self):
        try:
            return mysql.connector.connect(**self.insights_db_config)
        except Exception as e:
            logger.warning(f"Insights DB connection failed: {e}")
            return None
    
    def fetch_transactions(self, user_id: int, days: int = 30) -> List[Dict]:
        """
        Fetch user transactions matching 'financedb' schema
        """
        conn = None
        cursor = None
        
        try:
            conn = self.get_finance_connection()
            cursor = conn.cursor(dictionary=True)
            
            # This query grabs transaction data to give context to the AI
            query = """
                SELECT 
                    t.occurred_at,
                    t.description,
                    t.amount,
                    t.type,
                    t.currency,
                    COALESCE(c.name, 'Uncategorized') as category_name,
                    COALESCE(m.name, 'Unknown Merchant') as merchant_name
                FROM transactions t
                LEFT JOIN categories c ON t.category_id = c.id
                LEFT JOIN merchants m ON t.merchant_id = m.id
                WHERE t.user_id = %s
                  AND t.occurred_at >= DATE_SUB(NOW(), INTERVAL %s DAY)
                ORDER BY t.occurred_at DESC
                LIMIT 50
            """
            
            cursor.execute(query, (user_id, days))
            transactions = cursor.fetchall()
            
            logger.info(f"Fetched {len(transactions)} transactions for user {user_id}")
            return transactions
            
        except Exception as e:
            logger.error(f"Error fetching transactions: {e}")
            return []
            
        finally:
            if cursor: cursor.close()
            if conn: conn.close()
    def fetch_chat_history(self, user_id: int, limit: int = 5) -> List[Dict]:
        """
        Fetch recent chat history for context from insightsdb.
        Returns a list of dicts: [{'role': 'user', 'message': '...'}, ...]
        """
        conn = None
        cursor = None
        
        try:
            conn = self.get_insights_connection()
            if not conn:
                return []
            
            cursor = conn.cursor(dictionary=True)
            
            query = """
                SELECT user_query, ai_response 
                FROM chat_logs 
                WHERE user_id = %s 
                ORDER BY id DESC 
                LIMIT %s
            """
            
            cursor.execute(query, (user_id, limit))
            rows = cursor.fetchall()
            
            history = []
            for row in reversed(rows):
                # 1. User turn
                if row['user_query']:
                    history.append({"role": "user", "message": row['user_query']})
                # 2. AI turn
                if row['ai_response']:
                    history.append({"role": "model", "message": row['ai_response']})
            
            logger.info(f"Fetched {len(history)} history turns for user {user_id}")
            return history
            
        except Exception as e:
            logger.error(f"Failed to fetch chat history: {e}")
            return []
            
        finally:
            if cursor: cursor.close()
            if conn: conn.close()
    
    def save_chat_log(self, user_id: int, query: str, response: str, context: str) -> bool:
        """
        Save chat log to 'insightsdb'
        """
        conn = None
        cursor = None
        
        try:
            conn = self.get_insights_connection()
            if not conn:
                return False
            
            cursor = conn.cursor()
            
    
            insert_query = """
                INSERT INTO chat_logs 
                (user_id, user_query, ai_response, context_snapshot)
                VALUES (%s, %s, %s, %s)
            """
            
            # Safely serialize the context to JSON
            context_json = json.dumps({
                "preview": context[:500] + "..." if len(context) > 500 else context
            })
            
            cursor.execute(insert_query, (user_id, query, response, context_json))
            conn.commit()
            
            logger.info(f"Saved chat log for user {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to save chat log: {e}")
            return False
            
        finally:
            if cursor: cursor.close()
            if conn: conn.close()
    def fetch_budgets_status(self, user_id: int):
        """
        Fetches active budgets and calculates spending progress based on start/end dates.
        """
        conn = None
        cursor = None
        
        try:
            conn = self.get_finance_connection()
            cursor = conn.cursor(dictionary=True)
            
            # Updated Query for your specific schema
            query = """
                SELECT 
                    b.id,
                    c.name as category_name,
                    b.amount_limit,
                    b.alert_threshold,
                    b.period,
                    b.start_date,
                    b.end_date,
                    COALESCE(SUM(t.amount), 0) as spent,
                    (b.amount_limit - COALESCE(SUM(t.amount), 0)) as remaining
                FROM budgets b
                JOIN categories c ON b.category_id = c.id
                LEFT JOIN transactions t ON 
                    b.category_id = t.category_id 
                    AND t.user_id = b.user_id
                    AND t.type = 'EXPENSE'
                    AND t.occurred_at BETWEEN b.start_date AND b.end_date
                WHERE b.user_id = %s
                  AND CURRENT_DATE BETWEEN b.start_date AND b.end_date -- Only fetch currently active budgets
                GROUP BY b.id, c.name, b.amount_limit, b.alert_threshold, b.period, b.start_date, b.end_date
            """
            
            cursor.execute(query, (user_id,))
            results = cursor.fetchall()
            
            # Process results for the frontend
            for row in results:
                row['spent'] = float(row['spent'])
                row['amount_limit'] = float(row['amount_limit'])
                row['alert_threshold'] = float(row['alert_threshold']) # e.g., 0.80
                
                # Calculate percentages
                if row['amount_limit'] > 0:
                    row['percent'] = (row['spent'] / row['amount_limit']) * 100
                else:
                    row['percent'] = 0
                
                # Logic: 
                # 1. Over Budget (> 100%) -> RED
                # 2. Near Limit (> 80%) -> YELLOW/ORANGE
                # 3. Safe -> BLUE
                row['is_over_budget'] = row['spent'] > row['amount_limit']
                row['is_warning'] = row['percent'] >= (row['alert_threshold'] * 100) and not row['is_over_budget']
                
            return results

        except Exception as e:
            logger.error(f"Error fetching budget status: {e}")
            return []
            
        finally:
            if cursor: cursor.close()
            if conn: conn.close()