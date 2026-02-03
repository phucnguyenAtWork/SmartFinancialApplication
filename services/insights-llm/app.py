def format_transactions_to_text(transactions: List[dict]) -> str:
    """Converts raw DB rows into a text summary the AI can read."""
    if not transactions:
        return "No recent transactions found."
    
    recent = transactions[:10]
    text_list = []
    for tx in recent:
        date = tx.get('occurred_at', 'Unknown Date')
        desc = tx.get('description', 'Unknown Item')
        amount = tx.get('amount', 0)
        
        currency = tx.get('currency', 'USD') 
        
        text_list.append(f"- {date}: {desc} ({amount} {currency})")
    
    return "\n".join(text_list)