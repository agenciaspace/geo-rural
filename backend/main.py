from fastapi import FastAPI, File, UploadFile, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
from starlette.middleware.base import BaseHTTPMiddleware
import georinex as gr
import numpy as np
import os
import tempfile
import zipfile
from datetime import datetime
from typing import Dict, Any, Optional
import logging
from budget_calculator import BudgetCalculator, BudgetRequest
from pdf_generator import PDFGenerator

# Configurar limite de upload para 100MB
app = FastAPI(
    title="GeoRural Pro API", 
    version="1.0.0"
)

# Aumentar limite de upload para 100MB
class UploadSizeMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, max_upload_size: int = 100 * 1024 * 1024):  # 100MB
        super().__init__(app)
        self.max_upload_size = max_upload_size
        
    async def dispatch(self, request: Request, call_next):
        if request.headers.get("content-length"):
            content_length = int(request.headers["content-length"])
            if content_length > self.max_upload_size:
                raise HTTPException(
                    status_code=413,
                    detail=f"Arquivo muito grande. Tamanho máximo: {self.max_upload_size // (1024*1024)}MB"
                )
        response = await call_next(request)
        return response

app.add_middleware(UploadSizeMiddleware)

# Configurar diretórios
STATIC_DIR = os.path.join(os.path.dirname(__file__), "..", "frontend", "build", "static")
BUILD_DIR = os.path.join(os.path.dirname(__file__), "..", "frontend", "build")

# Montar arquivos estáticos do React se existirem
if os.path.exists(BUILD_DIR):
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Inicializa calculadora e gerador de PDF
budget_calculator = BudgetCalculator()
pdf_generator = PDFGenerator()

# Modelos Pydantic para validação
class BudgetRequestModel(BaseModel):
    client_name: str
    client_email: str
    client_phone: str
    property_name: str
    state: str
    city: str
    vertices_count: int
    property_area: float
    client_type: str  # "pessoa_fisica" ou "pessoa_juridica"
    is_urgent: bool = False
    includes_topography: bool = False
    includes_environmental: bool = False
    additional_notes: str = ""

def analyze_rinex_simple(file_path: str) -> Dict[str, Any]:
    """Análise simplificada de arquivo RINEX quando georinex falha"""
    try:
        # Lê o arquivo e faz análise básica
        with open(file_path, 'r') as f:
            lines = f.readlines()
        
        # Procura por informações básicas no header
        satellites_found = set()
        obs_count = 0
        first_epoch = None
        last_epoch = None
        
        for line in lines:
            # Procura por épocas de observação (linhas que começam com ano)
            if line.strip() and len(line) > 30:
                try:
                    # Formato típico: " 23 11 20 12  0  0.0000000  0  4G12G15G17G24"
                    if line[1:3].isdigit() and line[4:6].isdigit():
                        obs_count += 1
                        # Extrai satélites da linha
                        sat_part = line[32:].strip()
                        for i in range(0, len(sat_part), 3):
                            sat = sat_part[i:i+3].strip()
                            if sat and sat[0] in ['G', 'R', 'E', 'C']:
                                satellites_found.add(sat)
                except:
                    pass
        
        # Estimativas
        num_satellites = len(satellites_found)
        duration_hours = 4.0  # Valor padrão estimado
        
        # Se encontrou observações, estima duração
        if obs_count > 0:
            # Assume intervalo de 30 segundos entre observações
            duration_hours = (obs_count * 30) / 3600.0
        
        # Análise de qualidade
        quality_issues = []
        
        if num_satellites < 4:
            quality_issues.append("Número insuficiente de satélites (< 4)")
        
        if duration_hours < 1:
            quality_issues.append("Tempo de observação muito curto (< 1 hora)")
        
        if duration_hours > 24:
            quality_issues.append("Tempo de observação muito longo (> 24 horas)")
        
        # Determina qualidade geral
        if len(quality_issues) == 0:
            quality_status = "EXCELENTE"
            quality_color = "green"
        elif len(quality_issues) <= 2:
            quality_status = "BOA"
            quality_color = "orange"
        else:
            quality_status = "RUIM"
            quality_color = "red"
        
        return {
            "success": True,
            "file_info": {
                "satellites_count": num_satellites,
                "satellites_list": list(satellites_found)[:10],
                "duration_hours": round(duration_hours, 2),
                "quality_status": quality_status,
                "quality_color": quality_color,
                "issues": quality_issues
            },
            "technical_report": generate_technical_report(
                num_satellites, duration_hours, quality_status, quality_issues
            )
        }
    except Exception as e:
        logger.error(f"Erro na análise simplificada: {str(e)}")
        return {
            "success": False,
            "error": f"Erro ao processar arquivo: {str(e)}"
        }

def analyze_rinex_file(file_path: str) -> Dict[str, Any]:
    """Analisa arquivo RINEX e retorna parecer técnico"""
    try:
        # Tenta usar georinex primeiro
        try:
            obs = gr.load(file_path)
            
            # Extrai informações básicas
            satellites = list(obs.sv.values) if hasattr(obs, 'sv') else []
            num_satellites = len(satellites)
            
            # Calcula duração da observação
            if hasattr(obs, 'time'):
                times = obs.time.values
                duration_hours = (times[-1] - times[0]) / 3600000000000  # nanoseconds to hours
            else:
                duration_hours = 0
        except Exception as e:
            logger.warning(f"Georinex falhou, usando análise simplificada: {str(e)}")
            return analyze_rinex_simple(file_path)
        
        # Análise de qualidade baseada em regras
        quality_issues = []
        
        if num_satellites < 4:
            quality_issues.append("Número insuficiente de satélites (< 4)")
        
        if duration_hours < 1:
            quality_issues.append("Tempo de observação muito curto (< 1 hora)")
        
        if duration_hours > 24:
            quality_issues.append("Tempo de observação muito longo (> 24 horas)")
        
        # Determina qualidade geral
        if len(quality_issues) == 0:
            quality_status = "EXCELENTE"
            quality_color = "green"
        elif len(quality_issues) <= 2:
            quality_status = "BOA"
            quality_color = "orange"
        else:
            quality_status = "RUIM"
            quality_color = "red"
        
        return {
            "success": True,
            "file_info": {
                "satellites_count": num_satellites,
                "satellites_list": satellites[:10],  # Primeiros 10
                "duration_hours": round(duration_hours, 2),
                "quality_status": quality_status,
                "quality_color": quality_color,
                "issues": quality_issues
            },
            "technical_report": generate_technical_report(
                num_satellites, duration_hours, quality_status, quality_issues
            )
        }
    
    except Exception as e:
        logger.error(f"Erro ao analisar arquivo RINEX: {str(e)}")
        return {
            "success": False,
            "error": f"Erro ao processar arquivo: {str(e)}"
        }

def generate_technical_report(satellites: int, duration: float, quality: str, issues: list) -> str:
    """Gera parecer técnico em texto"""
    report = f"""
PARECER TÉCNICO - ANÁLISE GNSS
========================================

Data da Análise: {datetime.now().strftime("%d/%m/%Y %H:%M")}

RESUMO DOS DADOS:
- Satélites observados: {satellites}
- Duração da observação: {duration:.2f} horas
- Status de qualidade: {quality}

ANÁLISE DETALHADA:
"""
    
    if quality == "EXCELENTE":
        report += """
✓ Arquivo apresenta excelente qualidade para processamento
✓ Número adequado de satélites observados
✓ Tempo de observação dentro dos padrões recomendados
✓ Dados adequados para georreferenciamento de precisão
"""
    elif quality == "BOA":
        report += """
⚠ Arquivo apresenta boa qualidade com algumas ressalvas:
"""
        for issue in issues:
            report += f"  - {issue}\n"
        
        report += """
→ Recomenda-se verificação adicional dos dados
→ Processamento possível com algumas limitações
"""
    else:
        report += """
❌ Arquivo apresenta problemas significativos:
"""
        for issue in issues:
            report += f"  - {issue}\n"
        
        report += """
→ Recomenda-se nova coleta de dados
→ Processamento pode resultar em baixa precisão
"""
    
    report += """

RECOMENDAÇÕES:
- Para georreferenciamento: mínimo 4 satélites por 2+ horas
- Para alta precisão: 6+ satélites por 4+ horas
- Evitar obstruções e interferências durante coleta

========================================
GeoRural Pro - Análise Automatizada
"""
    
    return report

@app.post("/api/upload-gnss")
async def upload_gnss_file(file: UploadFile = File(...)):
    """Endpoint para upload e análise de arquivos GNSS"""
    
    # Verificar tamanho do arquivo (100MB limite)
    MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB
    file_content = await file.read()
    file_size = len(file_content)
    
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"Arquivo muito grande. Tamanho máximo: {MAX_FILE_SIZE // (1024*1024)}MB. Seu arquivo: {file_size // (1024*1024)}MB"
        )
    
    # Reset file pointer
    await file.seek(0)
    
    # Verifica extensão do arquivo
    allowed_extensions = ['.21o', '.rnx', '.zip']
    file_extension = os.path.splitext(file.filename.lower())[1]
    
    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=400, 
            detail=f"Tipo de arquivo não suportado. Use: {', '.join(allowed_extensions)}"
        )
    
    try:
        # Cria arquivo temporário
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_extension) as tmp_file:
            content = await file.read()
            tmp_file.write(content)
            tmp_file_path = tmp_file.name
        
        # Se for ZIP, extrai o primeiro arquivo RINEX
        if file_extension == '.zip':
            with tempfile.TemporaryDirectory() as tmp_dir:
                with zipfile.ZipFile(tmp_file_path, 'r') as zip_ref:
                    zip_ref.extractall(tmp_dir)
                
                # Procura por arquivos RINEX no ZIP
                rinex_files = []
                for root, dirs, files in os.walk(tmp_dir):
                    for f in files:
                        if f.lower().endswith(('.21o', '.rnx')):
                            rinex_files.append(os.path.join(root, f))
                
                if not rinex_files:
                    raise HTTPException(
                        status_code=400, 
                        detail="Nenhum arquivo RINEX encontrado no ZIP"
                    )
                
                # Analisa o primeiro arquivo encontrado
                result = analyze_rinex_file(rinex_files[0])
        else:
            # Analisa arquivo RINEX diretamente
            result = analyze_rinex_file(tmp_file_path)
        
        # Remove arquivo temporário
        os.unlink(tmp_file_path)
        
        return result
    
    except Exception as e:
        logger.error(f"Erro no upload: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")

@app.post("/api/calculate-budget")
async def calculate_budget(request: BudgetRequestModel):
    """Endpoint para calcular orçamento"""
    try:
        # Converte para dataclass
        budget_request = BudgetRequest(
            client_name=request.client_name,
            client_email=request.client_email,
            client_phone=request.client_phone,
            property_name=request.property_name,
            state=request.state,
            city=request.city,
            vertices_count=request.vertices_count,
            property_area=request.property_area,
            client_type=request.client_type,
            is_urgent=request.is_urgent,
            includes_topography=request.includes_topography,
            includes_environmental=request.includes_environmental,
            additional_notes=request.additional_notes
        )
        
        # Calcula orçamento
        result = budget_calculator.calculate_budget(budget_request)
        
        return result
    
    except Exception as e:
        logger.error(f"Erro no cálculo de orçamento: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")

@app.post("/api/generate-proposal-pdf")
async def generate_proposal_pdf(request: BudgetRequestModel):
    """Endpoint para gerar PDF da proposta"""
    try:
        # Converte para dataclass
        budget_request = BudgetRequest(
            client_name=request.client_name,
            client_email=request.client_email,
            client_phone=request.client_phone,
            property_name=request.property_name,
            state=request.state,
            city=request.city,
            vertices_count=request.vertices_count,
            property_area=request.property_area,
            client_type=request.client_type,
            is_urgent=request.is_urgent,
            includes_topography=request.includes_topography,
            includes_environmental=request.includes_environmental,
            additional_notes=request.additional_notes
        )
        
        # Calcula orçamento
        budget_data = budget_calculator.calculate_budget(budget_request)
        
        # Gera PDF
        pdf_path = pdf_generator.generate_budget_pdf(budget_data)
        
        # Retorna o arquivo PDF
        return FileResponse(
            path=pdf_path,
            filename=f"proposta_{request.client_name.replace(' ', '_')}.pdf",
            media_type="application/pdf"
        )
    
    except Exception as e:
        logger.error(f"Erro na geração de PDF: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")

@app.get("/api/info")
async def api_info():
    """Endpoint com informações da API"""
    return {
        "message": "GeoRural Pro API",
        "version": "1.0.0",
        "endpoints": [
            "/api/upload-gnss - Upload e análise de arquivos GNSS",
            "/api/calculate-budget - Calcular orçamento",
            "/api/generate-proposal-pdf - Gerar PDF da proposta"
        ]
    }

@app.get("/", response_class=HTMLResponse)
async def serve_react_app():
    """Serve a aplicação React"""
    index_path = os.path.join(BUILD_DIR, "index.html")
    
    if os.path.exists(index_path):
        with open(index_path, "r", encoding="utf-8") as f:
            return HTMLResponse(f.read())
    else:
        return HTMLResponse("""
        <html>
            <head><title>GeoRural Pro</title></head>
            <body>
                <h1>🌱 GeoRural Pro</h1>
                <p>Frontend React não encontrado. Execute o build primeiro:</p>
                <code>cd frontend && npm run build</code>
                <br><br>
                <p>Ou acesse a API em: <a href="/docs">/docs</a></p>
            </body>
        </html>
        """)

# Catch-all route para Single Page Application (SPA)
@app.get("/{path:path}", response_class=HTMLResponse)
async def serve_spa(path: str):
    """Serve o React App para todas as rotas não-API"""
    # Se é uma rota da API, não interceptar
    if path.startswith("api/") or path.startswith("docs") or path.startswith("openapi.json"):
        raise HTTPException(status_code=404, detail="Not found")
    
    # Serve index.html para todas as outras rotas (SPA routing)
    index_path = os.path.join(BUILD_DIR, "index.html")
    
    if os.path.exists(index_path):
        with open(index_path, "r", encoding="utf-8") as f:
            return HTMLResponse(f.read())
    else:
        raise HTTPException(status_code=404, detail="Frontend not built")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)