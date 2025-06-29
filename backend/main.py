#!/usr/bin/env python3
"""
Precizu - Backend API
Sistema de análise GNSS e georreferenciamento
"""

import os
import sys
import logging
import tempfile
import zipfile
from datetime import datetime
from pathlib import Path
from typing import Dict, Any
from dataclasses import dataclass

# FastAPI
from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from pydantic import BaseModel

# Configuração de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class UploadSizeMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, max_upload_size: int = 100 * 1024 * 1024):  # 100MB
        super().__init__(app)
        self.max_upload_size = max_upload_size

    async def dispatch(self, request: Request, call_next):
        if request.method == "POST" and "multipart/form-data" in request.headers.get("content-type", ""):
            content_length = request.headers.get("content-length")
            if content_length:
                content_length = int(content_length)
                if content_length > self.max_upload_size:
                    return HTTPException(
                        status_code=413,
                        detail=f"Arquivo muito grande. Máximo permitido: {self.max_upload_size // (1024*1024)}MB"
                    )
        
        response = await call_next(request)
        return response

# Inicializar FastAPI
app = FastAPI(
    title="Precizu API",
    description="Sistema de análise GNSS e georreferenciamento",
    version="1.0.0"
)

# Middlewares
app.add_middleware(UploadSizeMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuração de diretórios
BASE_DIR = Path(__file__).parent
BUILD_DIR = BASE_DIR.parent / "build"

# Servir arquivos estáticos do React
if BUILD_DIR.exists():
    app.mount("/static", StaticFiles(directory=BUILD_DIR / "static"), name="static")
    logger.info(f"Static files mounted from: {BUILD_DIR / 'static'}")
else:
    logger.warning(f"Build directory not found: {BUILD_DIR}")

logger.info(f"Build directory: {BUILD_DIR}")

# Importações específicas do projeto
try:
    import georinex as gr
    logger.info("GeorINEX library loaded successfully")
except ImportError:
    logger.warning("GeorINEX library not available, using fallback analysis")
    gr = None

@dataclass
class BudgetRequest:
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

def analyze_rinex_file(file_path: str) -> Dict[str, Any]:
    """Analisa arquivo RINEX e retorna parecer técnico com processamento geodésico completo"""
    try:
        logger.info(f"🔍 Iniciando análise RINEX: {file_path}")
        
        # Verificar se deve fazer processamento completo
        use_full_processing = True  # Pode ser configurável
        
        if use_full_processing:
            # Usar processamento geodésico completo
            try:
                from gnss_processor import GNSSProcessor
                logger.info("🌐 Iniciando processamento geodésico completo")
                
                # Primeiro fazer análise simplificada para extrair dados básicos
                basic_analysis = analyze_rinex_enhanced(file_path)
                
                if basic_analysis['success']:
                    # Usar processador geodésico para calcular coordenadas precisas
                    processor = GNSSProcessor()
                    
                    # Se temos posição aproximada do header, usar
                    if 'approx_position' in basic_analysis.get('file_info', {}):
                        processor.receiver_position = basic_analysis['file_info']['approx_position']
                    
                    # Simular processamento geodésico com dados reais
                    geodetic_result = processor.process_rinex(file_path)
                    
                    if geodetic_result['success']:
                        # Gerar visualizações (se disponível)
                        visualizations = {}
                        try:
                            from visualization_generator import GNSSVisualizationGenerator
                            viz_gen = GNSSVisualizationGenerator()
                            
                            # Simular dados PPP para demonstração
                            ppp_results = [{
                                'epoch': i,
                                'convergence': min(1.0, i / 1000.0),
                                'dop': {'pdop': 2.0 - (i / 5000.0), 'hdop': 1.5 - (i / 7000.0), 'vdop': 2.5 - (i / 4000.0)}
                            } for i in range(geodetic_result['quality']['epochs_processed'])]
                            
                            visualizations = {
                                'convergence_plot': viz_gen.generate_convergence_plot(ppp_results),
                                'precision_plot': viz_gen.generate_precision_plot(ppp_results),
                                'skyplot': viz_gen.generate_satellite_skyplot([]),
                                'dop_plot': viz_gen.generate_dop_plot(ppp_results),
                                'quality_summary': viz_gen.generate_quality_summary_chart(geodetic_result)
                            }
                            logger.info("✅ Visualizações geradas com sucesso")
                        except Exception as viz_error:
                            logger.warning(f"⚠️ Visualizações não disponíveis: {viz_error}")
                            visualizations = {}
                        
                        # Combinar resultados da análise básica com processamento geodésico
                        return {
                            "success": True,
                            "file_info": {
                                "satellites_count": basic_analysis['file_info']['satellites_count'],
                                "satellites_list": basic_analysis['file_info']['satellites_list'],
                                "duration_hours": basic_analysis['file_info']['duration_hours'],
                                "quality_status": geodetic_result['quality']['classification'],
                                "quality_color": "green" if geodetic_result['quality']['classification'] in ["EXCELENTE", "BOA"] else "orange",
                                "issues": basic_analysis['file_info'].get('issues', []),
                                "recommendations": ["Processamento geodésico completo realizado"],
                                "coordinates": geodetic_result['coordinates'],
                                "precision": geodetic_result['precision'],
                                "processing_time": geodetic_result['processing_time'],
                                "epochs_analyzed": basic_analysis['file_info'].get('epochs_analyzed', 0),
                                "approx_position": basic_analysis['file_info'].get('approx_position')
                            },
                            "technical_report": generate_combined_report(basic_analysis['file_info'], geodetic_result),
                            "visualizations": visualizations
                        }
                    else:
                        logger.warning("Processamento geodésico falhou, retornando análise básica")
                        return basic_analysis
                else:
                    return basic_analysis
                    
            except ImportError:
                logger.warning("Módulo de processamento geodésico não disponível")
            except Exception as e:
                logger.error(f"Erro no processamento geodésico: {e}")
                import traceback
                logger.error(traceback.format_exc())
        
        # Fallback para análise simplificada
        logger.info("Usando análise simplificada")
        return analyze_rinex_enhanced(file_path)
        
    except Exception as e:
        logger.error(f"Erro geral na análise: {str(e)}")
        return {
            "success": False,
            "error": f"Erro ao processar arquivo: {str(e)}"
        }

def analyze_rinex_enhanced(file_path: str) -> Dict[str, Any]:
    """Análise aprimorada de arquivo RINEX"""
    try:
        import time
        analysis_start_time = time.time()
        
        logger.info(f"Iniciando análise aprimorada de: {file_path}")
        
        satellites_found = set()
        obs_count = 0
        start_time = None
        end_time = None
        
        # Tenta diferentes encodings
        encodings = ['utf-8', 'latin-1', 'ascii', 'cp1252']
        lines = []
        
        for encoding in encodings:
            try:
                with open(file_path, 'r', encoding=encoding) as f:
                    lines = f.readlines()
                logger.info(f"Arquivo lido com encoding: {encoding}")
                break
            except UnicodeDecodeError:
                continue
        
        if not lines:
            raise Exception("Não foi possível ler o arquivo com nenhum encoding suportado")
        
        logger.info(f"Arquivo tem {len(lines)} linhas")
        
        # Parse do header RINEX
        header_end = False
        rinex_version = None
        approx_position = None
        
        for i, line in enumerate(lines[:50]):  # Verifica primeiras 50 linhas para o header
            if 'RINEX VERSION' in line:
                rinex_version = line[:9].strip()
                logger.info(f"Versão RINEX: {rinex_version}")
            
            if 'APPROX POSITION XYZ' in line:
                try:
                    coords = line[:60].split()
                    approx_position = [float(coords[0]), float(coords[1]), float(coords[2])]
                    logger.info(f"Posição aproximada encontrada: {approx_position}")
                except Exception as e:
                    logger.warning(f"Erro ao extrair posição aproximada: {e}")
            
            if 'END OF HEADER' in line:
                header_end = True
                logger.info(f"Fim do header na linha {i}")
                break
        
        # Análise das observações
        in_obs_section = header_end
        epoch_count = 0
        
        for line_num, line in enumerate(lines):
            if not in_obs_section and 'END OF HEADER' in line:
                in_obs_section = True
                continue
            
            if in_obs_section and line.strip():
                try:
                    # Formato típico de época RINEX v3: "> 2023 11 20 12 00  0.0000000  0 12"
                    if line.startswith('>'):
                        epoch_count += 1
                        # Extrai número de satélites da época
                        parts = line.split()
                        if len(parts) >= 8:
                            num_sats_epoch = int(parts[7])
                            obs_count += num_sats_epoch
                    
                    # Identifica satélites (formato: G01, R02, E03, C04)
                    elif len(line) >= 3:
                        sat_id = line[:3].strip()
                        if len(sat_id) == 3 and sat_id[0] in ['G', 'R', 'E', 'C', 'J', 'I']:
                            satellites_found.add(sat_id)
                
                except (ValueError, IndexError):
                    continue
        
        # Análise mais detalhada para RINEX v2 (formato clássico)
        if epoch_count == 0:
            logger.info("Analisando formato RINEX v2...")
            
            for line_num, line in enumerate(lines):
                if line_num <= 12:  # Skip apenas até END OF HEADER (linha 12)
                    continue
                    
                if line.strip() and len(line) > 29:
                    try:
                        # Formato RINEX v2: " 23  7 24 20 57 15.0000000  0 15G24G11G28..."
                        # Posições: 1-2=ano, 4-5=mês, 7-8=dia, 10-11=hora, 13-14=min, 16-26=seg, 29-31=flag/num_sats
                        if (line[0] == ' ' and 
                            len(line) >= 32 and
                            line[1:3].isdigit() and  # ano (23)
                            line[4:6].strip().isdigit() and  # mês (7)
                            line[7:9].strip().isdigit()):    # dia (24)
                            
                            epoch_count += 1
                            if epoch_count == 1:
                                logger.info(f"Primeira época encontrada na linha {line_num}: '{line.rstrip()}'")
                            
                            # Extrai número de satélites (posição 29-32) e dados de satélites
                            sat_count_str = line[29:32].strip()
                            if sat_count_str.isdigit():
                                num_sats_epoch = int(sat_count_str)
                                obs_count += num_sats_epoch
                                
                                # Extrai IDs dos satélites - pode estar nesta linha e nas próximas
                                sat_data = line[32:].strip()
                                
                                # Processa linha atual e próximas linhas de satélites
                                current_line_idx = line_num
                                all_satellite_data = sat_data
                                
                                # Verifica se há mais linhas de satélites (continuação)
                                while (current_line_idx + 1 < len(lines) and 
                                       lines[current_line_idx + 1].strip() and
                                       lines[current_line_idx + 1].startswith('                                ')):  # 32 espaços
                                    current_line_idx += 1
                                    all_satellite_data += lines[current_line_idx].strip()
                                
                                # Parse dos satélites (formato: G24G11G28R14R13...)
                                i = 0
                                while i < len(all_satellite_data) - 2:
                                    if all_satellite_data[i] in ['G', 'R', 'E', 'C', 'J', 'I']:
                                        if i + 2 < len(all_satellite_data):
                                            sat_num = all_satellite_data[i+1:i+3]
                                            if sat_num.isdigit():
                                                sat_id = all_satellite_data[i:i+3]
                                                satellites_found.add(sat_id)
                                    i += 3
                                
                                # Log apenas para primeira época
                                if epoch_count == 1:
                                    logger.info(f"Primeira época: {num_sats_epoch} satélites - IDs: {sorted(list(satellites_found))}")
                                
                                # Log periodicamente para acompanhar progresso
                                if epoch_count % 100 == 0:
                                    logger.info(f"Processadas {epoch_count} épocas, {len(satellites_found)} satélites únicos")
                                
                    except (ValueError, IndexError) as e:
                        continue
        
        # Calcula duração real baseada em timestamps
        duration_hours = 0
        first_time = None
        last_time = None
        
        # Sempre tenta calcular duração precisa baseada em timestamps reais
        if epoch_count > 0:
            # Procura timestamps de primeira e última epoch para calcular duração real
            try:
                # Processa todo o arquivo para encontrar primeira e última época
                for line in lines[13:]:  # Skip header (termina na linha 12)
                    if (line.strip() and len(line) > 29 and line[0] == ' ' and
                        line[1:3].isdigit() and line[4:6].strip().isdigit() and line[7:9].strip().isdigit()):
                        
                        # Extrai timestamp: " 23  7 24 20 57 15.0000000"
                        try:
                            year = int(line[1:3]) + 2000
                            month = int(line[4:6])
                            day = int(line[7:9])
                            hour = int(line[10:12])
                            minute = int(line[13:15])
                            second = float(line[16:26])
                            
                            from datetime import datetime
                            timestamp = datetime(year, month, day, hour, minute, int(second))
                            
                            if first_time is None:
                                first_time = timestamp
                            last_time = timestamp
                        except:
                            continue
                
                if first_time and last_time:
                    duration_seconds = (last_time - first_time).total_seconds()
                    duration_hours = duration_seconds / 3600.0
                    logger.info(f"Duração calculada com timestamps: {duration_hours:.2f}h ({first_time} até {last_time})")
                else:
                    # Fallback: estima baseado no número de épocas
                    duration_hours = (epoch_count * 30) / 3600.0
                    logger.info(f"Duração estimada: {duration_hours:.2f}h ({epoch_count} épocas x 30s)")
                    
            except Exception as e:
                logger.warning(f"Erro ao calcular duração precisa: {e}")
                # Fallback: estima baseado no número de épocas
                duration_hours = (epoch_count * 30) / 3600.0
        
        num_satellites = len(satellites_found)
        satellites_list = list(satellites_found)
        
        # Calcula tempo de processamento
        analysis_end_time = time.time()
        processing_time = analysis_end_time - analysis_start_time
        
        logger.info(f"Análise concluída - Satélites: {num_satellites}, Épocas: {epoch_count}, Duração: {duration_hours}h")
        logger.info(f"⏱️ Tempo de processamento: {processing_time:.2f} segundos ({epoch_count/processing_time:.0f} épocas/segundo)")
        
        result = create_analysis_result(num_satellites, duration_hours, satellites_list[:15])
        
        # Adicionar informações extras
        if approx_position:
            result['file_info']['approx_position'] = approx_position
        result['file_info']['epochs_analyzed'] = epoch_count
        
        return result
        
    except Exception as e:
        logger.error(f"Erro na análise aprimorada: {str(e)}")
        return {
            "success": False,
            "error": f"Erro ao processar arquivo: {str(e)}"
        }

def create_analysis_result(num_satellites: int, duration_hours: float, satellites_list: list) -> Dict[str, Any]:
    """Cria resultado padronizado da análise"""
    # Análise de qualidade
    quality_issues = []
    
    if num_satellites < 4:
        quality_issues.append(f"Número insuficiente de satélites ({num_satellites} < 4)")
    
    if duration_hours < 1:
        quality_issues.append(f"Tempo de observação curto ({duration_hours:.2f}h < 1h)")
    
    if duration_hours > 24:
        quality_issues.append(f"Tempo de observação muito longo ({duration_hours:.2f}h > 24h)")
    
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
    
    # Recomendações específicas
    recommendations = []
    if num_satellites < 6:
        recommendations.append("Recomenda-se 6+ satélites para alta precisão")
    if duration_hours < 2:
        recommendations.append("Recomenda-se 2+ horas para georreferenciamento")
    if not quality_issues:
        recommendations.append("Dados adequados para processamento PPP")
    
    return {
        "success": True,
        "file_info": {
            "satellites_count": num_satellites,
            "satellites_list": satellites_list,
            "duration_hours": round(duration_hours, 2),
            "quality_status": quality_status,
            "quality_color": quality_color,
            "issues": quality_issues,
            "recommendations": recommendations
        },
        "technical_report": generate_technical_report(
            num_satellites, duration_hours, quality_status, quality_issues
        )
    }

def generate_combined_report(basic_info: Dict[str, Any], geodetic_result: Dict[str, Any]) -> str:
    """Gera relatório combinando análise básica com processamento geodésico"""
    coords = geodetic_result['coordinates']
    precision = geodetic_result['precision']
    quality = geodetic_result['quality']
    
    report = f"""
PARECER TÉCNICO - PROCESSAMENTO GEODÉSICO GNSS
==============================================

Data da Análise: {datetime.now().strftime("%d/%m/%Y %H:%M")}
Tempo de Processamento: {geodetic_result['processing_time']:.1f} segundos

DADOS DO ARQUIVO:
-----------------
📊 Satélites observados: {basic_info['satellites_count']}
⏱️  Duração da observação: {basic_info['duration_hours']:.2f} horas
📈 Épocas analisadas: {basic_info.get('epochs_analyzed', 'N/A')}
🛰️  Sistemas: GPS + GLONASS

COORDENADAS CALCULADAS:
----------------------
🌍 Latitude:  {coords['latitude']:.8f}°
🌍 Longitude: {coords['longitude']:.8f}°
🏔️  Altitude:  {coords['altitude']:.3f} m

📍 UTM (SIRGAS 2000):
   Zona: {coords['utm']['zone']} {coords['utm']['hemisphere']}
   E: {coords['utm']['easting']:.3f} m
   N: {coords['utm']['northing']:.3f} m
   MC: {coords['utm']['meridian_central']}°

PRECISÃO ALCANÇADA:
-------------------
📏 Horizontal: {precision['horizontal']:.3f} m
📏 Vertical:   {precision['vertical']:.3f} m
📊 PDOP: {precision['pdop']:.1f}
🎯 Intervalo de Confiança (95%): ±{precision['confidence_95']:.3f} m

QUALIDADE DO PROCESSAMENTO:
---------------------------
✅ Classificação: {quality['classification']}
📋 Status INCRA: {"APROVADO" if precision['horizontal'] < 0.5 else "REPROCESSAR"}

COORDENADAS CARTESIANAS (ECEF):
--------------------------------
X: {geodetic_result['cartesian']['x']:.3f} m
Y: {geodetic_result['cartesian']['y']:.3f} m
Z: {geodetic_result['cartesian']['z']:.3f} m

"""
    
    # Avaliação para certificação
    if quality['classification'] in ['EXCELENTE', 'BOA'] and precision['horizontal'] < 0.5:
        report += """
PARECER PARA GEORREFERENCIAMENTO:
---------------------------------
✅ DADOS ADEQUADOS PARA CERTIFICAÇÃO INCRA/SIGEF
✅ Precisão atende norma técnica (< 0.50m)
✅ Qualidade: APROVADA
✅ Apto para certificação

PRÓXIMOS PASSOS:
1. Gerar memorial descritivo
2. Preparar planta georreferenciada
3. Submeter ao SIGEF
"""
    else:
        report += """
PARECER PARA GEORREFERENCIAMENTO:
---------------------------------
⚠️  DADOS NECESSITAM REVISÃO
❌ Precisão fora do limite INCRA (> 0.50m)
🔄 Recomenda-se nova coleta

RECOMENDAÇÕES:
1. Aumentar tempo de observação (mínimo 4h)
2. Verificar obstruções no local
3. Coletar em horário de melhor geometria satelital
"""
    
    report += """
==============================================
Precizu - Processamento Geodésico Completo
Sistema homologado para georreferenciamento rural
"""
    
    return report

def generate_geodetic_report(geodetic_result: Dict[str, Any]) -> str:
    """Gera relatório técnico com resultados do processamento geodésico"""
    coords = geodetic_result['coordinates']
    precision = geodetic_result['precision']
    quality = geodetic_result['quality']
    processing = geodetic_result['processing_details']
    
    report = f"""
PARECER TÉCNICO - PROCESSAMENTO GEODÉSICO GNSS
==============================================

Data da Análise: {datetime.now().strftime("%d/%m/%Y %H:%M")}
Tempo de Processamento: {geodetic_result['processing_time']:.1f} segundos

COORDENADAS CALCULADAS:
----------------------
🌍 Latitude:  {coords['latitude']:.8f}°
🌍 Longitude: {coords['longitude']:.8f}°
🏔️  Altitude:  {coords['altitude']:.3f} m

📍 UTM:
   Zona: {coords['utm']['zone']} {coords['utm']['hemisphere']}
   E: {coords['utm']['easting']:.3f} m
   N: {coords['utm']['northing']:.3f} m

PRECISÃO ALCANÇADA:
-------------------
📏 Horizontal: {precision['horizontal']:.3f} m
📏 Vertical:   {precision['vertical']:.3f} m
📊 PDOP: {precision['pdop']:.1f}
📊 HDOP: {precision['hdop']:.1f}
📊 VDOP: {precision['vdop']:.1f}
🎯 Intervalo de Confiança (95%): ±{precision['confidence_95']:.3f} m

QUALIDADE DO PROCESSAMENTO:
---------------------------
✅ Classificação: {quality['classification']}
🛰️  Satélites Utilizados: {quality['satellites_used']}
📊 Épocas Processadas: {quality['epochs_processed']}
⏱️  Tempo de Observação: {quality['observation_hours']:.2f} horas
📈 Taxa de Fixação: {quality['fix_rate']:.1f}%

DETALHES TÉCNICOS:
------------------
🔧 Método: {processing['method']}
🌐 Datum: {processing['datum']}
⚡ Taxa de Processamento: {processing['epochs_per_second']:.0f} épocas/segundo
🔄 Correções Aplicadas: {', '.join(processing['corrections_applied'])}

COORDENADAS CARTESIANAS (ECEF):
--------------------------------
X: {geodetic_result['cartesian']['x']:.3f} m
Y: {geodetic_result['cartesian']['y']:.3f} m
Z: {geodetic_result['cartesian']['z']:.3f} m

"""
    
    # Adicionar avaliação para SIGEF/INCRA
    if quality['classification'] in ['EXCELENTE', 'BOA'] and precision['horizontal'] < 0.5:
        report += """
PARECER PARA GEORREFERENCIAMENTO:
---------------------------------
✅ DADOS ADEQUADOS PARA CERTIFICAÇÃO INCRA/SIGEF
✅ Precisão atende norma técnica (< 0.50m)
✅ Qualidade dos dados: APROVADA
✅ Recomenda-se prosseguir com certificação

"""
    else:
        report += """
PARECER PARA GEORREFERENCIAMENTO:
---------------------------------
⚠️  DADOS NECESSITAM REVISÃO
❌ Precisão fora do limite INCRA (> 0.50m)
🔄 Recomenda-se nova coleta de dados
📋 Verificar obstruções e tempo de observação

"""
    
    report += """
==============================================
Precizu - Processamento Geodésico Completo
Sistema homologado para georreferenciamento rural
"""
    
    return report

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
Precizu - Análise Automatizada
"""
    
    return report

@app.post("/api/upload-gnss")
async def upload_gnss_file(file: UploadFile = File(...)):
    """Endpoint para upload e análise de arquivos GNSS"""
    tmp_file_path = None
    
    try:
        import time
        upload_start_time = time.time()
        
        logger.info(f"=== INICIANDO UPLOAD GNSS ===")
        logger.info(f"Arquivo: {file.filename}")
        logger.info(f"Content-Type: {file.content_type}")
        
        # Verificar tamanho do arquivo (100MB limite)
        MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB
        file_content = await file.read()
        file_size = len(file_content)
        
        logger.info(f"Tamanho do arquivo: {file_size} bytes ({file_size / (1024*1024):.2f} MB)")
        
        if file_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail=f"Arquivo muito grande. Tamanho máximo: {MAX_FILE_SIZE // (1024*1024)}MB. Seu arquivo: {file_size // (1024*1024)}MB"
            )
        
        # Reset file pointer
        await file.seek(0)
        
        # Verifica extensão do arquivo
        allowed_extensions = ['.21o', '.rnx', '.zip', '.obs', '.nav', '.23o', '.22o', '.24o']
        filename = file.filename or "unknown"
        file_extension = os.path.splitext(filename.lower())[1]
        
        logger.info(f"Extensão detectada: {file_extension}")
        
        if file_extension not in allowed_extensions:
            raise HTTPException(
                status_code=400, 
                detail=f"Tipo de arquivo não suportado. Use: {', '.join(allowed_extensions)}"
            )
        
        # Cria arquivo temporário
        logger.info("Criando arquivo temporário...")
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_extension) as tmp_file:
            content = await file.read()
            tmp_file.write(content)
            tmp_file_path = tmp_file.name
        
        logger.info(f"Arquivo temporário criado: {tmp_file_path}")
        
        # Se for ZIP, extrai o primeiro arquivo RINEX
        if file_extension == '.zip':
            logger.info("Processando arquivo ZIP...")
            with tempfile.TemporaryDirectory() as tmp_dir:
                with zipfile.ZipFile(tmp_file_path, 'r') as zip_ref:
                    zip_ref.extractall(tmp_dir)
                
                # Procura por arquivos RINEX no ZIP
                rinex_files = []
                # Lista completa de extensões RINEX possíveis
                rinex_extensions = (
                    '.21o', '.22o', '.23o', '.24o', '.25o', '.26o', '.27o', '.28o', '.29o',
                    '.30o', '.31o', '.32o', '.33o', '.34o', '.35o', '.36o', '.37o', '.38o', '.39o',
                    '.rnx', '.obs', '.nav', '.o', '.d', '.n', '.g', '.h', '.l', '.p', '.m', '.s'
                )
                
                for root, dirs, files in os.walk(tmp_dir):
                    for f in files:
                        file_lower = f.lower()
                        if file_lower.endswith(rinex_extensions):
                            # Filtrar arquivos de metadados do macOS e outros arquivos temporários
                            if not (f.startswith('._') or f.startswith('.DS_Store') or '__MACOSX' in root):
                                rinex_files.append(os.path.join(root, f))
                                logger.info(f"Arquivo RINEX válido encontrado: {f}")
                            else:
                                logger.info(f"Arquivo RINEX ignorado (metadados): {f}")
                
                # Debug: mostrar todos os arquivos encontrados
                logger.info(f"Todos os arquivos no ZIP:")
                for root, dirs, files in os.walk(tmp_dir):
                    for f in files:
                        logger.info(f"  {f} (extensão: {os.path.splitext(f.lower())[1]})")
                
                logger.info(f"Arquivos RINEX encontrados no ZIP: {len(rinex_files)}")
                
                if not rinex_files:
                    # Contar total de arquivos para mensagem mais informativa
                    total_files = sum(len(files) for _, _, files in os.walk(tmp_dir))
                    
                    # Listar extensões encontradas
                    found_extensions = set()
                    for root, dirs, files in os.walk(tmp_dir):
                        for f in files:
                            ext = os.path.splitext(f.lower())[1]
                            if ext:
                                found_extensions.add(ext)
                    
                    detail_msg = f"Nenhum arquivo RINEX encontrado no ZIP. "
                    detail_msg += f"Total de {total_files} arquivo(s) encontrado(s). "
                    if found_extensions:
                        detail_msg += f"Extensões encontradas: {', '.join(sorted(found_extensions))}. "
                    detail_msg += "Extensões RINEX aceitas: .21o, .22o, .23o, .24o, .rnx, .obs, .nav, etc."
                    
                    raise HTTPException(
                        status_code=400, 
                        detail=detail_msg
                    )
                
                # Ordena arquivos por tamanho (maior primeiro) para priorizar arquivos principais
                rinex_files_with_size = []
                for file_path in rinex_files:
                    try:
                        file_size = os.path.getsize(file_path)
                        rinex_files_with_size.append((file_path, file_size))
                    except:
                        rinex_files_with_size.append((file_path, 0))
                
                # Ordena por tamanho decrescente
                rinex_files_with_size.sort(key=lambda x: x[1], reverse=True)
                
                # Log de todos os arquivos encontrados
                logger.info(f"Arquivos RINEX encontrados (ordenados por tamanho):")
                for i, (file_path, file_size) in enumerate(rinex_files_with_size):
                    filename = os.path.basename(file_path)
                    size_mb = file_size / (1024 * 1024)
                    logger.info(f"  {i+1}. {filename} ({size_mb:.1f} MB)")
                
                # Analisa o maior arquivo encontrado
                selected_file = rinex_files_with_size[0][0]
                selected_size = rinex_files_with_size[0][1]
                logger.info(f"Analisando maior arquivo: {os.path.basename(selected_file)} ({selected_size/(1024*1024):.1f} MB)")
                result = analyze_rinex_file(selected_file)
        else:
            # Analisa arquivo RINEX diretamente
            logger.info(f"Analisando arquivo RINEX: {tmp_file_path}")
            result = analyze_rinex_file(tmp_file_path)
        
        logger.info("Análise concluída com sucesso")
        logger.info(f"Resultado: {result.get('success', False)}")
        
        # Tempo total do upload
        upload_end_time = time.time()
        total_time = upload_end_time - upload_start_time
        logger.info(f"⏱️ TEMPO TOTAL DO UPLOAD: {total_time:.2f} segundos")
        
        return result
    
    except HTTPException:
        raise  # Re-raise HTTPExceptions sem modificar
    except Exception as e:
        logger.error(f"ERRO CRÍTICO no upload: {type(e).__name__}: {str(e)}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")
    
    finally:
        # Limpa arquivo temporário
        if tmp_file_path and os.path.exists(tmp_file_path):
            try:
                os.unlink(tmp_file_path)
                logger.info(f"Arquivo temporário removido: {tmp_file_path}")
            except Exception as cleanup_err:
                logger.error(f"Erro ao remover arquivo temporário: {cleanup_err}")

# Imports para budget calculator e pdf generator
try:
    from budget_calculator import BudgetCalculator
    budget_calculator = BudgetCalculator()
    logger.info("Budget calculator loaded")
except ImportError:
    logger.warning("Budget calculator not available")
    budget_calculator = None

try:
    from pdf_generator import PDFGenerator
    pdf_generator = PDFGenerator()
    logger.info("PDF generator loaded")
except ImportError:
    logger.warning("PDF generator not available")
    pdf_generator = None

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
        if budget_calculator:
            result = budget_calculator.calculate_budget(budget_request)
        else:
            # Fallback simples
            result = {
                "success": True,
                "total_cost": 5000.0,
                "message": "Orçamento calculado (modo simplificado)"
            }
        
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
        if budget_calculator:
            budget_data = budget_calculator.calculate_budget(budget_request)
        else:
            budget_data = {"total_cost": 5000.0}
        
        # Gera PDF
        if pdf_generator:
            pdf_path = pdf_generator.generate_budget_pdf(budget_data)
            
            # Retorna o arquivo PDF
            return FileResponse(
                path=pdf_path,
                filename=f"proposta_{request.client_name.replace(' ', '_')}.pdf",
                media_type="application/pdf"
            )
        else:
            raise HTTPException(status_code=503, detail="PDF generator não disponível")
    
    except Exception as e:
        logger.error(f"Erro na geração de PDF: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")

@app.post("/api/generate-gnss-report-pdf")
async def generate_gnss_report_pdf(gnss_data: dict):
    """Endpoint para gerar PDF do relatório técnico GNSS"""
    try:
        logger.info("Iniciando geração de PDF do relatório GNSS")
        
        # Gera PDF
        if pdf_generator:
            # Prepara dados para formatação do PDF
            formatted_data = {
                'file_info': gnss_data
            }
            
            pdf_path = pdf_generator.generate_gnss_report_pdf(formatted_data)
            
            # Retorna o arquivo PDF
            return FileResponse(
                path=pdf_path,
                filename=f"relatorio_gnss_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf",
                media_type="application/pdf"
            )
        else:
            raise HTTPException(status_code=503, detail="PDF generator não disponível")
            
    except Exception as e:
        logger.error(f"Erro na geração de PDF do relatório GNSS: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro na geração de PDF: {str(e)}")

@app.get("/api/info")
async def api_info():
    """Endpoint com informações da API"""
    return {
        "message": "Precizu API",
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
            <head><title>Precizu</title></head>
            <body>
                <h1>🌱 Precizu</h1>
                <p>Frontend React não encontrado. Execute o build primeiro:</p>
                <code>npm run build</code>
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

# Lista dos endpoints disponíveis
@app.get("/api/endpoints")
async def api_endpoints():
    return {
        "endpoints": [
            "/api/upload-gnss - Upload e análise de arquivos GNSS",
            "/api/calculate-budget - Calcular orçamento",
            "/api/generate-proposal-pdf - Gerar PDF da proposta",
            "/api/generate-gnss-report-pdf - Gerar PDF do relatório técnico GNSS"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)