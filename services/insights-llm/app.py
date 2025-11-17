import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

try:
    from openai import OpenAI
except Exception:  # pragma: no cover - library presence handled at runtime
    OpenAI = None

MODEL_DEFAULT = os.getenv("LLM_MODEL", "gpt-4o-mini")
API_KEY = os.getenv("OPENAI_API_KEY")

app = FastAPI(title="Insights LLM Service", version="1.0.0")

class Prompt(BaseModel):
    prompt: str = Field(..., min_length=1)
    model: str | None = None
    max_tokens: int | None = 200
    temperature: float | None = 0.7

@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "insights-llm",
        "llm_configured": bool(API_KEY),
        "model_default": MODEL_DEFAULT,
    }

@app.post("/generate")
def generate(p: Prompt):
    if not API_KEY or OpenAI is None:
        raise HTTPException(status_code=500, detail="LLM not configured")
    try:
        client = OpenAI(api_key=API_KEY)
        model = p.model or MODEL_DEFAULT
        # Chat Completions API
        resp = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": p.prompt}],
            max_tokens=p.max_tokens or 200,
            temperature=p.temperature if p.temperature is not None else 0.7,
        )
        content = resp.choices[0].message.content if resp.choices else ""
        return {"model": model, "reply": content}
    except Exception as e:  # surface upstream error cleanly
        raise HTTPException(status_code=502, detail=f"LLM error: {e}")
