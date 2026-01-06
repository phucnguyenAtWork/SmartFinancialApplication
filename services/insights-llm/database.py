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