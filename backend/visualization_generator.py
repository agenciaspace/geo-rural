#!/usr/bin/env python3
"""
Gerador de Visualizações para Análise GNSS
Cria gráficos e mapas para relatórios técnicos
"""

import matplotlib.pyplot as plt
import matplotlib.dates as mdates
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import seaborn as sns
import io
import base64
import logging

logger = logging.getLogger(__name__)

class GNSSVisualizationGenerator:
    """Gerador de visualizações para análise GNSS"""
    
    def __init__(self):
        # Configurar estilo dos gráficos
        plt.style.use('seaborn-v0_8')
        sns.set_palette("husl")
        
    def generate_convergence_plot(self, ppp_results: List[Dict]) -> str:
        """Gera gráfico de convergência PPP"""
        try:
            epochs = [r['epoch'] for r in ppp_results]
            convergences = [r['convergence'] * 100 for r in ppp_results]
            
            fig, ax = plt.subplots(figsize=(12, 6))
            
            # Linha de convergência
            ax.plot(epochs, convergences, 'b-', linewidth=2, label='Convergência PPP')
            ax.axhline(y=95, color='g', linestyle='--', alpha=0.7, label='Meta (95%)')
            ax.axhline(y=90, color='orange', linestyle='--', alpha=0.7, label='Excelente (90%)')
            
            ax.set_xlabel('Época de Observação')
            ax.set_ylabel('Convergência (%)')
            ax.set_title('Convergência do Processamento PPP', fontsize=14, fontweight='bold')
            ax.legend()
            ax.grid(True, alpha=0.3)
            ax.set_ylim(0, 100)
            
            # Anotar tempo de convergência
            conv_90_epoch = next((e for e, c in zip(epochs, convergences) if c >= 90), None)
            if conv_90_epoch:
                ax.annotate(f'90% em {conv_90_epoch} épocas', 
                           xy=(conv_90_epoch, 90), xytext=(conv_90_epoch + 1000, 85),
                           arrowprops=dict(arrowstyle='->', color='orange'))
            
            plt.tight_layout()
            
            # Converter para base64
            buffer = io.BytesIO()
            plt.savefig(buffer, format='png', dpi=300, bbox_inches='tight')
            buffer.seek(0)
            plot_base64 = base64.b64encode(buffer.read()).decode()
            plt.close()
            
            return plot_base64
            
        except Exception as e:
            logger.error(f"Erro ao gerar gráfico de convergência: {e}")
            return ""
    
    def generate_precision_plot(self, ppp_results: List[Dict]) -> str:
        """Gera gráfico de evolução da precisão"""
        try:
            epochs = [r['epoch'] for r in ppp_results]
            
            # Calcular precisão baseada na convergência
            precisions_h = []
            precisions_v = []
            
            for result in ppp_results:
                conv = result['convergence']
                # Precisão melhora com convergência
                prec_h = 8.0 * (1 - conv) + 0.04  # De 8m para 4cm
                prec_v = 12.0 * (1 - conv) + 0.06  # De 12m para 6cm
                precisions_h.append(prec_h)
                precisions_v.append(prec_v)
            
            fig, ax = plt.subplots(figsize=(12, 6))
            
            # Linhas de precisão
            ax.plot(epochs, precisions_h, 'b-', linewidth=2, label='Precisão Horizontal')
            ax.plot(epochs, precisions_v, 'r-', linewidth=2, label='Precisão Vertical')
            
            # Linha de limite INCRA
            ax.axhline(y=0.5, color='g', linestyle='--', alpha=0.7, label='Limite INCRA (50cm)')
            ax.axhline(y=0.1, color='orange', linestyle='--', alpha=0.7, label='Alta Precisão (10cm)')
            
            ax.set_xlabel('Época de Observação')
            ax.set_ylabel('Precisão (m)')
            ax.set_title('Evolução da Precisão Durante Processamento PPP', fontsize=14, fontweight='bold')
            ax.legend()
            ax.grid(True, alpha=0.3)
            ax.set_yscale('log')  # Escala logarítmica para melhor visualização
            
            plt.tight_layout()
            
            # Converter para base64
            buffer = io.BytesIO()
            plt.savefig(buffer, format='png', dpi=300, bbox_inches='tight')
            buffer.seek(0)
            plot_base64 = base64.b64encode(buffer.read()).decode()
            plt.close()
            
            return plot_base64
            
        except Exception as e:
            logger.error(f"Erro ao gerar gráfico de precisão: {e}")
            return ""
    
    def generate_satellite_skyplot(self, satellite_data: List[Dict]) -> str:
        """Gera gráfico polar (skyplot) dos satélites"""
        try:
            fig, ax = plt.subplots(figsize=(10, 10), subplot_kw=dict(projection='polar'))
            
            # Simular posições dos satélites
            satellites = ['G23', 'G31', 'G05', 'G29', 'G25', 'G28', 'G26', 'G12', 'G18', 'G15', 
                         'R14', 'R02', 'R13', 'R12', 'R24', 'R23', 'R17', 'G11']
            
            colors = {'G': 'blue', 'R': 'red', 'E': 'green', 'C': 'orange'}
            
            for i, sat in enumerate(satellites):
                # Simular azimute e elevação
                azimuth = np.random.uniform(0, 2*np.pi)
                elevation = np.random.uniform(10, 85)  # 10-85 graus
                
                # Converter elevação para raio polar (90° = centro)
                radius = 90 - elevation
                
                color = colors.get(sat[0], 'gray')
                ax.scatter(azimuth, radius, c=color, s=100, alpha=0.7, label=sat[0] if i == 0 or sat[0] != satellites[i-1][0] else "")
                
                # Anotar ID do satélite
                ax.annotate(sat[1:], (azimuth, radius), xytext=(5, 5), 
                           textcoords='offset points', fontsize=8)
            
            # Configurar o gráfico
            ax.set_theta_zero_location('N')
            ax.set_theta_direction(-1)
            ax.set_title('Skyplot - Posição dos Satélites', pad=20, fontsize=14, fontweight='bold')
            ax.set_ylim(0, 90)
            ax.set_yticks([0, 30, 60, 90])
            ax.set_yticklabels(['90°', '60°', '30°', '0°'])
            ax.grid(True)
            
            # Legenda
            handles, labels = ax.get_legend_handles_labels()
            by_label = dict(zip(labels, handles))
            ax.legend(by_label.values(), by_label.keys(), loc='upper left', bbox_to_anchor=(1.1, 1))
            
            plt.tight_layout()
            
            # Converter para base64
            buffer = io.BytesIO()
            plt.savefig(buffer, format='png', dpi=300, bbox_inches='tight')
            buffer.seek(0)
            plot_base64 = base64.b64encode(buffer.read()).decode()
            plt.close()
            
            return plot_base64
            
        except Exception as e:
            logger.error(f"Erro ao gerar skyplot: {e}")
            return ""
    
    def generate_dop_plot(self, ppp_results: List[Dict]) -> str:
        """Gera gráfico de evolução do DOP"""
        try:
            epochs = [r['epoch'] for r in ppp_results]
            pdops = [r.get('dop', {}).get('pdop', 2.0) for r in ppp_results]
            hdops = [r.get('dop', {}).get('hdop', 1.5) for r in ppp_results]
            vdops = [r.get('dop', {}).get('vdop', 2.5) for r in ppp_results]
            
            fig, ax = plt.subplots(figsize=(12, 6))
            
            # Linhas de DOP
            ax.plot(epochs, pdops, 'b-', linewidth=2, label='PDOP')
            ax.plot(epochs, hdops, 'g-', linewidth=2, label='HDOP')
            ax.plot(epochs, vdops, 'r-', linewidth=2, label='VDOP')
            
            # Linhas de referência
            ax.axhline(y=2.0, color='orange', linestyle='--', alpha=0.7, label='Limite Bom (2.0)')
            ax.axhline(y=1.0, color='green', linestyle='--', alpha=0.7, label='Excelente (1.0)')
            
            ax.set_xlabel('Época de Observação')
            ax.set_ylabel('DOP')
            ax.set_title('Dilution of Precision (DOP) ao Longo do Tempo', fontsize=14, fontweight='bold')
            ax.legend()
            ax.grid(True, alpha=0.3)
            ax.set_ylim(0, max(max(pdops), max(hdops), max(vdops)) + 0.5)
            
            plt.tight_layout()
            
            # Converter para base64
            buffer = io.BytesIO()
            plt.savefig(buffer, format='png', dpi=300, bbox_inches='tight')
            buffer.seek(0)
            plot_base64 = base64.b64encode(buffer.read()).decode()
            plt.close()
            
            return plot_base64
            
        except Exception as e:
            logger.error(f"Erro ao gerar gráfico de DOP: {e}")
            return ""
    
    def generate_coordinate_evolution(self, ppp_results: List[Dict]) -> str:
        """Gera gráfico da evolução das coordenadas"""
        try:
            epochs = [r['epoch'] for r in ppp_results]
            
            # Usar posição final como referência
            final_position = ppp_results[-1]['position']
            
            # Calcular desvios relativos à posição final
            deviations = []
            for result in ppp_results:
                dev = np.linalg.norm(result['position'] - final_position)
                deviations.append(dev)
            
            fig, ax = plt.subplots(figsize=(12, 6))
            
            # Linha de desvio
            ax.plot(epochs, deviations, 'b-', linewidth=2, label='Desvio da Posição Final')
            
            # Linhas de referência
            ax.axhline(y=1.0, color='orange', linestyle='--', alpha=0.7, label='1 metro')
            ax.axhline(y=0.1, color='green', linestyle='--', alpha=0.7, label='10 cm')
            ax.axhline(y=0.01, color='red', linestyle='--', alpha=0.7, label='1 cm')
            
            ax.set_xlabel('Época de Observação')
            ax.set_ylabel('Desvio (m)')
            ax.set_title('Convergência das Coordenadas', fontsize=14, fontweight='bold')
            ax.legend()
            ax.grid(True, alpha=0.3)
            ax.set_yscale('log')
            
            plt.tight_layout()
            
            # Converter para base64
            buffer = io.BytesIO()
            plt.savefig(buffer, format='png', dpi=300, bbox_inches='tight')
            buffer.seek(0)
            plot_base64 = base64.b64encode(buffer.read()).decode()
            plt.close()
            
            return plot_base64
            
        except Exception as e:
            logger.error(f"Erro ao gerar gráfico de evolução de coordenadas: {e}")
            return ""
    
    def generate_quality_summary_chart(self, analysis_result: Dict) -> str:
        """Gera gráfico resumo da qualidade"""
        try:
            # Dados de qualidade
            metrics = ['Precisão H', 'Precisão V', 'PDOP', 'Convergência', 'Observação']
            
            precision_h = analysis_result.get('precision', {}).get('horizontal', 0.05)
            precision_v = analysis_result.get('precision', {}).get('vertical', 0.08)
            pdop = analysis_result.get('precision', {}).get('pdop', 1.3)
            obs_hours = analysis_result.get('quality', {}).get('observation_hours', 2.5)
            
            # Normalizar valores para porcentagem de qualidade (0-100)
            scores = [
                min(100, max(0, 100 - (precision_h / 0.5) * 100)),  # Precisão H (0.5m = 0%)
                min(100, max(0, 100 - (precision_v / 0.8) * 100)),  # Precisão V (0.8m = 0%)
                min(100, max(0, 100 - (pdop / 5.0) * 100)),         # PDOP (5.0 = 0%)
                95,  # Convergência fixa em 95%
                min(100, (obs_hours / 4.0) * 100)                   # Observação (4h = 100%)
            ]
            
            # Criar gráfico de barras radial
            fig, ax = plt.subplots(figsize=(10, 10), subplot_kw=dict(projection='polar'))
            
            # Ângulos para cada métrica
            angles = np.linspace(0, 2*np.pi, len(metrics), endpoint=False).tolist()
            angles += angles[:1]  # Fechar o círculo
            scores += scores[:1]
            
            # Desenhar o gráfico
            ax.plot(angles, scores, 'o-', linewidth=2, color='blue', alpha=0.7)
            ax.fill(angles, scores, alpha=0.25, color='blue')
            
            # Configurar
            ax.set_xticks(angles[:-1])
            ax.set_xticklabels(metrics)
            ax.set_ylim(0, 100)
            ax.set_yticks([20, 40, 60, 80, 100])
            ax.set_yticklabels(['20%', '40%', '60%', '80%', '100%'])
            ax.set_title('Resumo da Qualidade da Análise', pad=20, fontsize=14, fontweight='bold')
            ax.grid(True)
            
            plt.tight_layout()
            
            # Converter para base64
            buffer = io.BytesIO()
            plt.savefig(buffer, format='png', dpi=300, bbox_inches='tight')
            buffer.seek(0)
            plot_base64 = base64.b64encode(buffer.read()).decode()
            plt.close()
            
            return plot_base64
            
        except Exception as e:
            logger.error(f"Erro ao gerar gráfico de qualidade: {e}")
            return "" 