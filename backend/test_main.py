#!/usr/bin/env python3
"""
Versão ultra-simplificada do backend para teste
"""

from fastapi import FastAPI
from fastapi.responses import HTMLResponse

app = FastAPI(title="OnGeo Test API")

@app.get("/api/info")
async def api_info():
    """Health check endpoint"""
    return {
        "message": "OnGeo API Test",
        "status": "running",
        "version": "test-1.0.0"
    }

@app.get("/api/budgets/link/{custom_link}")
async def get_budget_by_link(custom_link: str):
    """Endpoint de teste para orçamento"""
    if custom_link == "orcamento-1752096006845":
        return {
            "success": True,
            "budget": {
                "id": "502d6aa4-5549-41ab-b6de-d4f4138b506b",
                "custom_link": custom_link,
                "status": "active",
                "budget_request": {
                    "client_name": "Cliente Teste",
                    "client_email": "teste@email.com",
                    "property_name": "Propriedade Teste"
                },
                "budget_result": {
                    "total_price": 5000.00
                },
                "created_at": "2025-07-09T21:20:07.418861+00:00"
            }
        }
    else:
        return {"success": False, "error": "Orçamento não encontrado"}

@app.get("/", response_class=HTMLResponse)
async def root():
    """Página inicial"""
    return """
    <html>
        <head><title>OnGeo Test</title></head>
        <body>
            <h1>🧪 OnGeo Test Backend</h1>
            <p>Backend de teste funcionando!</p>
            <ul>
                <li><a href="/api/info">Health Check</a></li>
                <li><a href="/api/budgets/link/orcamento-1752096006845">Orçamento Teste</a></li>
                <li><a href="/docs">Documentação</a></li>
            </ul>
        </body>
    </html>
    """

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)