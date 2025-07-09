from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from datetime import datetime as dt
import os
import tempfile
from typing import Dict, Any, Optional

class PDFGenerator:
    
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self.setup_custom_styles()
    
    def _evaluate_dop(self, dop_value: float, dop_type: str) -> str:
        """Avalia valores DOP para classificação"""
        if dop_value == 'N/A' or dop_value > 100:
            return 'Não calculado'
        
        thresholds = {
            'PDOP': [(1, 'Excelente'), (2, 'Bom'), (3, 'Moderado'), (6, 'Ruim')],
            'HDOP': [(1, 'Excelente'), (2, 'Bom'), (3, 'Moderado'), (5, 'Ruim')],
            'VDOP': [(1, 'Excelente'), (2, 'Bom'), (4, 'Moderado'), (8, 'Ruim')],
            'GDOP': [(1, 'Excelente'), (2, 'Bom'), (4, 'Moderado'), (8, 'Ruim')]
        }
        
        for threshold, rating in thresholds.get(dop_type, []):
            if dop_value <= threshold:
                return rating
        return 'Muito Ruim'

    def setup_custom_styles(self):
        """Define estilos customizados para o PDF"""
        
        # Título principal
        self.styles.add(ParagraphStyle(
            name='TitleStyle',
            parent=self.styles['Normal'],
            fontSize=18,
            textColor=colors.darkblue,
            spaceAfter=20,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        ))
        
        # Subtítulo
        self.styles.add(ParagraphStyle(
            name='SubtitleStyle',
            parent=self.styles['Normal'],
            fontSize=14,
            textColor=colors.darkgreen,
            spaceAfter=12,
            spaceBefore=12,
            fontName='Helvetica-Bold'
        ))
        
        # Texto normal
        self.styles.add(ParagraphStyle(
            name='BodyStyle',
            parent=self.styles['Normal'],
            fontSize=10,
            spaceAfter=6,
            textColor=colors.black
        ))

    def generate_gnss_report_pdf(self, gnss_data: Dict[str, Any], filename: Optional[str] = None) -> str:
        """Gera PDF completo do relatório técnico geodésico GNSS"""
        
        # Logging para debug
        print(f"🔍 PDF Generator - Dados recebidos: {type(gnss_data)}")
        print(f"🔍 PDF Generator - Keys disponíveis: {list(gnss_data.keys()) if isinstance(gnss_data, dict) else 'N/A'}")
        
        # Validação defensiva
        if not gnss_data or not isinstance(gnss_data, dict):
            raise ValueError(f"Dados inválidos para PDF: {type(gnss_data)}")
        
        if not filename:
            timestamp = dt.now().strftime("%Y%m%d_%H%M%S")
            filename = f"relatorio_geodesico_gnss_{timestamp}.pdf"
        
        # Cria arquivo temporário
        temp_dir = tempfile.gettempdir()
        pdf_path = os.path.join(temp_dir, filename)
        
        # Cria documento PDF
        doc = SimpleDocTemplate(
            pdf_path,
            pagesize=A4,
            rightMargin=2*cm,
            leftMargin=2*cm,
            topMargin=2*cm,
            bottomMargin=2*cm
        )
        
        # Constrói conteúdo do PDF
        story = []
        file_info = gnss_data.get('file_info', {})
        print(f"🔍 PDF Generator - file_info keys: {list(file_info.keys()) if isinstance(file_info, dict) else 'N/A'}")
        
        # Título principal
        story.append(Paragraph("RELATÓRIO TÉCNICO GEODÉSICO GNSS", self.styles['TitleStyle']))
        story.append(Paragraph("ANÁLISE PROFISSIONAL DE DADOS RINEX", self.styles['SubtitleStyle']))
        story.append(Spacer(1, 20))
        
        # Informações gerais com valores padrão seguros
        analysis_date = dt.now().strftime("%d/%m/%Y às %H:%M")
        quality_status = file_info.get('quality_status', 'SEM ANÁLISE')
        quality_score = file_info.get('quality_score', 0)
        incra_compliant = file_info.get('incra_compliant', False)
        
        story.append(Paragraph(f"<b>Data da Análise:</b> {analysis_date} (GMT-3)", self.styles['BodyStyle']))
        story.append(Paragraph(f"<b>Classificação Geral:</b> {quality_status}", self.styles['BodyStyle']))
        story.append(Paragraph(f"<b>Pontuação Técnica:</b> {quality_score}/100 pontos", self.styles['BodyStyle']))
        story.append(Paragraph(f"<b>Status INCRA:</b> {'✅ APROVADO' if incra_compliant else '❌ NECESSITA REVISÃO'}", self.styles['BodyStyle']))
        story.append(Spacer(1, 20))
        
        # Seção 1: Dados Gerais da Sessão com valores padrão seguros
        story.append(Paragraph("1. DADOS GERAIS DA SESSÃO", self.styles['SubtitleStyle']))
        
        # Extração segura de dados
        satellites_count = file_info.get('satellites_count', 0)
        duration_hours = file_info.get('duration_hours', 0)
        epochs_processed = file_info.get('epochs_processed', 0)
        satellite_systems = file_info.get('satellite_systems', {})
        technical_analysis = file_info.get('technical_analysis', {})
        
        session_data = [
            ['Parâmetro', 'Valor'],
            ['Satélites Observados', str(satellites_count)],
            ['Duração da Sessão', f"{duration_hours} horas"],
            ['Épocas Processadas', f"{epochs_processed:,}" if epochs_processed else "0"],
            ['Sistemas Ativos', str(len(satellite_systems)) if satellite_systems else "0"],
            ['Intervalo de Observação', f"{technical_analysis.get('observation_interval', 0)}s"],
            ['Continuidade dos Dados', technical_analysis.get('data_continuity', 'N/A')],
        ]
        
        session_table = Table(session_data, colWidths=[8*cm, 8*cm])
        session_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('ALIGN', (1, 0), (1, -1), 'CENTER'),
        ]))
        story.append(session_table)
        story.append(Spacer(1, 15))
        
        # Seção 2: Equipamentos Utilizados
        story.append(Paragraph("2. EQUIPAMENTOS UTILIZADOS", self.styles['SubtitleStyle']))
        equipment = file_info.get('equipment', {})
        if not equipment or not isinstance(equipment, dict):
            equipment = {}
            
        equipment_data = [
            ['Equipamento', 'Especificação'],
            ['Receptor GNSS', equipment.get('receiver', 'Não identificado')],
            ['Antena', equipment.get('antenna', 'Não identificado')],
            ['Versão RINEX', equipment.get('rinex_version', 'Não identificado')],
        ]
        
        equipment_table = Table(equipment_data, colWidths=[6*cm, 10*cm])
        equipment_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.darkgreen),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        story.append(equipment_table)
        story.append(Spacer(1, 15))
        
        # Seção 3: Análise DOP (Diluição de Precisão)
        story.append(Paragraph("3. ANÁLISE DOP (DILUIÇÃO DE PRECISÃO)", self.styles['SubtitleStyle']))
        dop_analysis = file_info.get('dop_analysis', {})
        if not dop_analysis or not isinstance(dop_analysis, dict):
            dop_analysis = {}
            
        pdop = dop_analysis.get('PDOP', 'N/A')
        hdop = dop_analysis.get('HDOP', 'N/A')
        vdop = dop_analysis.get('VDOP', 'N/A')
        gdop = dop_analysis.get('GDOP', 'N/A')
        
        dop_data = [
            ['Tipo DOP', 'Valor', 'Avaliação'],
            ['PDOP (Position)', str(pdop), self._evaluate_dop(pdop if isinstance(pdop, (int, float)) else 999, 'PDOP')],
            ['HDOP (Horizontal)', str(hdop), self._evaluate_dop(hdop if isinstance(hdop, (int, float)) else 999, 'HDOP')],
            ['VDOP (Vertical)', str(vdop), self._evaluate_dop(vdop if isinstance(vdop, (int, float)) else 999, 'VDOP')],
            ['GDOP (Geometric)', str(gdop), self._evaluate_dop(gdop if isinstance(gdop, (int, float)) else 999, 'GDOP')],
        ]
        
        dop_table = Table(dop_data, colWidths=[5*cm, 3*cm, 8*cm])
        dop_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.purple),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('ALIGN', (1, 0), (1, -1), 'CENTER'),
        ]))
        story.append(dop_table)
        story.append(Spacer(1, 15))
        
        # Seção 4: Estatísticas de Posicionamento
        story.append(Paragraph("4. ESTATÍSTICAS DE POSICIONAMENTO", self.styles['SubtitleStyle']))
        positioning_stats = file_info.get('positioning_statistics', {})
        if not positioning_stats or not isinstance(positioning_stats, dict):
            positioning_stats = {}
            
        horizontal_rms = positioning_stats.get('horizontal_rms', 'N/A')
        vertical_rms = positioning_stats.get('vertical_rms', 'N/A')
        position_rms = positioning_stats.get('position_rms', 'N/A')
        estimated_accuracy = positioning_stats.get('estimated_accuracy', 'N/A')
        
        # Validação para INCRA
        horizontal_status = '✅ APROVADO' if isinstance(horizontal_rms, (int, float)) and horizontal_rms < 0.5 else '❌ FORA DO LIMITE'
        
        positioning_data = [
            ['Parâmetro', 'Valor', 'Status INCRA'],
            ['Precisão Horizontal (RMS)', f"{horizontal_rms}m" if horizontal_rms != 'N/A' else horizontal_rms, horizontal_status],
            ['Precisão Vertical (RMS)', f"{vertical_rms}m" if vertical_rms != 'N/A' else vertical_rms, 'Referência'],
            ['Precisão Posicional (3D)', f"{position_rms}m" if position_rms != 'N/A' else position_rms, 'Referência'],
            ['Acurácia Estimada (95%)', str(estimated_accuracy), 'Intervalo de Confiança'],
        ]
        
        positioning_table = Table(positioning_data, colWidths=[6*cm, 4*cm, 6*cm])
        positioning_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.red),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('ALIGN', (1, 0), (1, -1), 'CENTER'),
        ]))
        story.append(positioning_table)
        story.append(Spacer(1, 15))
        
        # Seção 5: Condições Atmosféricas
        story.append(Paragraph("5. CONDIÇÕES ATMOSFÉRICAS", self.styles['SubtitleStyle']))
        atmospheric_conditions = file_info.get('atmospheric_conditions', {})
        if not atmospheric_conditions or not isinstance(atmospheric_conditions, dict):
            atmospheric_conditions = {}
            
        ionospheric_activity = atmospheric_conditions.get('ionospheric_activity', 'N/A')
        ionospheric_delay = atmospheric_conditions.get('ionospheric_delay_rms', 'N/A')
        tropospheric_delay = atmospheric_conditions.get('tropospheric_delay_rms', 'N/A')
        atmospheric_stability = atmospheric_conditions.get('atmospheric_stability', 'N/A')
        
        atmospheric_data = [
            ['Parâmetro', 'Valor', 'Avaliação'],
            ['Atividade Ionosférica', str(ionospheric_activity), 'Monitoramento'],
            ['Atraso Ionosférico (RMS)', f"{ionospheric_delay} TECU" if ionospheric_delay != 'N/A' else ionospheric_delay, 'Correção Aplicada'],
            ['Atraso Troposférico (RMS)', f"{tropospheric_delay}m" if tropospheric_delay != 'N/A' else tropospheric_delay, 'Correção Aplicada'],
            ['Estabilidade Atmosférica', str(atmospheric_stability), 'Condições Gerais'],
        ]
        
        atmospheric_table = Table(atmospheric_data, colWidths=[6*cm, 4*cm, 6*cm])
        atmospheric_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.orange),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('ALIGN', (1, 0), (1, -1), 'CENTER'),
        ]))
        story.append(atmospheric_table)
        story.append(Spacer(1, 15))
        
        # Seção 6: Análise de Multipath e Cycle Slips
        story.append(Paragraph("6. ANÁLISE DE QUALIDADE DO SINAL", self.styles['SubtitleStyle']))
        multipath_analysis = file_info.get('multipath_analysis', {})
        cycle_slip_analysis = file_info.get('cycle_slip_analysis', {})
        
        if not multipath_analysis or not isinstance(multipath_analysis, dict):
            multipath_analysis = {}
        if not cycle_slip_analysis or not isinstance(cycle_slip_analysis, dict):
            cycle_slip_analysis = {}
            
        multipath_avg = multipath_analysis.get('average_level', 'N/A')
        multipath_peak = multipath_analysis.get('peak_level', 'N/A')
        multipath_assessment = multipath_analysis.get('assessment', 'N/A')
        cycle_slips_total = cycle_slip_analysis.get('total_detected', 'N/A')
        cycle_slips_rate = cycle_slip_analysis.get('rate_percentage', 'N/A')
        cycle_slips_assessment = cycle_slip_analysis.get('assessment', 'N/A')
        
        signal_data = [
            ['Parâmetro', 'Valor', 'Status'],
            ['Multipath Médio', str(multipath_avg), str(multipath_assessment)],
            ['Pico de Multipath', str(multipath_peak), 'Máximo Detectado'],
            ['Cycle Slips Detectados', str(cycle_slips_total), str(cycle_slips_assessment)],
            ['Taxa de Cycle Slips', f"{cycle_slips_rate}%" if cycle_slips_rate != 'N/A' else cycle_slips_rate, 'Por Época'],
        ]
        
        signal_table = Table(signal_data, colWidths=[6*cm, 4*cm, 6*cm])
        signal_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.teal),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('ALIGN', (1, 0), (1, -1), 'CENTER'),
        ]))
        story.append(signal_table)
        story.append(Spacer(1, 15))
        
        # Seção 7: Validação Geodésica
        story.append(Paragraph("7. VALIDAÇÃO GEODÉSICA", self.styles['SubtitleStyle']))
        geodetic_validation = file_info.get('geodetic_validation', {})
        if not geodetic_validation or not isinstance(geodetic_validation, dict):
            geodetic_validation = {}
            
        geodetic_data = [
            ['Especificação', 'Valor'],
            ['Sistema de Coordenadas', str(geodetic_validation.get('coordinate_system', 'SIRGAS 2000'))],
            ['Datum', str(geodetic_validation.get('datum', 'SIRGAS 2000'))],
            ['Projeção', str(geodetic_validation.get('projection', 'UTM'))],
            ['Elipsoide de Referência', str(geodetic_validation.get('reference_ellipsoid', 'GRS 80'))],
            ['Modelo Geoidal', str(geodetic_validation.get('geoid_model', 'MAPGEO2015'))],
            ['Norma INCRA', str(geodetic_validation.get('incra_standard', 'NBR 14166:2022'))],
        ]
        
        geodetic_table = Table(geodetic_data, colWidths=[8*cm, 8*cm])
        geodetic_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.navy),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        story.append(geodetic_table)
        story.append(Spacer(1, 15))
        
        # Seção 8: Parecer Final
        story.append(Paragraph("8. PARECER TÉCNICO PARA GEORREFERENCIAMENTO", self.styles['SubtitleStyle']))
        
        # Verificação segura do status INCRA
        incra_status = file_info.get('incra_compliant', False)
        if isinstance(incra_status, bool) and incra_status:
            parecer_text = """
            ✅ <b>DADOS APROVADOS PARA CERTIFICAÇÃO INCRA/SIGEF</b><br/>
            ✅ Atende critérios técnicos da norma NBR 14166:2022<br/>
            ✅ Dados adequados para processamento PPP<br/>
            ✅ Qualidade suficiente para georreferenciamento rural<br/>
            ✅ Recomenda-se prosseguir com certificação
            """
        else:
            parecer_text = """
            ⚠️ <b>DADOS NECESSITAM REVISÃO ANTES DA CERTIFICAÇÃO</b><br/>
            ❌ Não atende todos os critérios técnicos exigidos<br/>
            🔄 Recomenda-se nova coleta ou processamento adicional<br/>
            📋 Verificar obstruções e tempo de observação
            """
        
        story.append(Paragraph(parecer_text, self.styles['BodyStyle']))
        story.append(Spacer(1, 15))
        
        # Problemas identificados (com validação)
        issues = file_info.get('issues', [])
        if issues and isinstance(issues, list) and len(issues) > 0:
            story.append(Paragraph("PROBLEMAS IDENTIFICADOS:", self.styles['SubtitleStyle']))
            for i, issue in enumerate(issues, 1):
                if issue and isinstance(issue, str):
                    story.append(Paragraph(f"{i}. {issue}", self.styles['BodyStyle']))
            story.append(Spacer(1, 10))
        
        # Recomendações técnicas (com validação)
        recommendations = file_info.get('recommendations', [])
        if recommendations and isinstance(recommendations, list) and len(recommendations) > 0:
            story.append(Paragraph("RECOMENDAÇÕES TÉCNICAS:", self.styles['SubtitleStyle']))
            for i, rec in enumerate(recommendations, 1):
                if rec and isinstance(rec, str):
                    story.append(Paragraph(f"{i}. {rec}", self.styles['BodyStyle']))
            story.append(Spacer(1, 15))
        
        # Rodapé técnico
        story.append(Spacer(1, 20))
        story.append(Paragraph("ESPECIFICAÇÕES TÉCNICAS:", self.styles['SubtitleStyle']))
        specs_text = """
        • Método de Posicionamento: GNSS Multi-Constelação<br/>
        • Processamento: Análise de Código e Fase<br/>
        • Precisão Esperada: &lt; 0.50m (horizontal) para certificação<br/>
        • Norma Aplicável: NBR 14166:2022 (Georreferenciamento)<br/>
        • Sistema homologado para georreferenciamento rural
        """
        story.append(Paragraph(specs_text, self.styles['BodyStyle']))
        
        # Assinatura
        story.append(Spacer(1, 30))
        story.append(Paragraph("___________________________________", self.styles['BodyStyle']))
        story.append(Paragraph("<b>PRECIZU</b>", self.styles['BodyStyle']))
        story.append(Paragraph("Sistema de Análise Geodésica Profissional", self.styles['BodyStyle']))
        story.append(Paragraph("Análise automatizada conforme padrões técnicos INCRA", 
                              ParagraphStyle('FooterStyle', parent=self.styles['BodyStyle'],
                                           fontSize=8, textColor=colors.grey, alignment=TA_CENTER)))
        
        # Gera o PDF
        doc.build(story)
        
        return pdf_path

    def generate_budget_pdf(self, budget_data: Dict[str, Any], filename: Optional[str] = None) -> str:
        """Gera PDF da proposta de orçamento"""
        
        if filename is None:
            timestamp = dt.now().strftime("%Y%m%d_%H%M%S")
            filename = f"proposta_precizu_{timestamp}.pdf"
        
        # Cria arquivo temporário
        temp_dir = tempfile.gettempdir()
        pdf_path = os.path.join(temp_dir, filename)
        
        # Cria documento PDF
        doc = SimpleDocTemplate(
            pdf_path,
            pagesize=A4,
            rightMargin=2*cm,
            leftMargin=2*cm,
            topMargin=2*cm,
            bottomMargin=2*cm
        )
        
        # Constrói conteúdo do PDF
        story = []
        
        # Cabeçalho
        story.append(Paragraph("PRECIZU", self.styles['TitleStyle']))
        story.append(Paragraph("Proposta de Serviços de Georreferenciamento", self.styles['SubtitleStyle']))
        story.append(Spacer(1, 20))
        
        # Informações do cliente
        request_data = budget_data['request_data']
        story.append(Paragraph("DADOS DO CLIENTE", self.styles['SubtitleStyle']))
        
        client_info = [
            ["Nome:", request_data['client_name']],
            ["E-mail:", request_data['client_email']],
            ["Telefone:", request_data['client_phone']],
            ["Tipo:", "Pessoa Física" if request_data['client_type'] == 'pessoa_fisica' else "Pessoa Jurídica"]
        ]
        
        client_table = Table(client_info, colWidths=[4*cm, 12*cm])
        client_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ]))
        story.append(client_table)
        story.append(Spacer(1, 20))
        
        # Informações do imóvel
        story.append(Paragraph("DADOS DO IMÓVEL", self.styles['SubtitleStyle']))
        
        property_info = [
            ["Nome do Imóvel:", request_data['property_name']],
            ["Localização:", f"{request_data['city']} - {request_data['state']}"],
            ["Área:", f"{request_data['property_area']} hectares"],
            ["Número de Vértices:", str(request_data['vertices_count'])]
        ]
        
        property_table = Table(property_info, colWidths=[4*cm, 12*cm])
        property_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ]))
        story.append(property_table)
        story.append(Spacer(1, 20))
        
        # Serviços inclusos
        story.append(Paragraph("SERVIÇOS INCLUSOS", self.styles['SubtitleStyle']))
        
        services = ["✓ Georreferenciamento conforme Lei 10.267/2001"]
        if request_data['includes_topography']:
            services.append("✓ Levantamento topográfico")
        if request_data['includes_environmental']:
            services.append("✓ Estudo ambiental básico")
        if request_data['is_urgent']:
            services.append("✓ Processamento em regime de urgência")
        
        for service in services:
            story.append(Paragraph(service, self.styles['BodyStyle']))
        
        story.append(Spacer(1, 20))
        
        # Detalhamento dos custos
        story.append(Paragraph("DETALHAMENTO DE CUSTOS", self.styles['SubtitleStyle']))
        
        # Prepara dados da tabela de custos
        cost_data = [["Item", "Valor (R$)"]]
        for item in budget_data['breakdown']:
            value_str = f"{item['value']:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')
            if item['value'] < 0:
                value_str = f"({value_str.replace('-', '')})"
            cost_data.append([item['item'], value_str])
        
        # Total
        total_str = f"{budget_data['total_price']:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')
        cost_data.append(["TOTAL", f"R$ {total_str}"])
        
        # Cria tabela de custos
        cost_table = Table(cost_data, colWidths=[12*cm, 4*cm])
        cost_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('BACKGROUND', (-1, -1), (-1, -1), colors.lightgrey),
            ('FONTNAME', (-1, -1), (-1, -1), 'Helvetica-Bold'),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ]))
        story.append(cost_table)
        story.append(Spacer(1, 20))
        
        # Prazo e condições
        story.append(Paragraph("PRAZO E CONDIÇÕES", self.styles['SubtitleStyle']))
        
        conditions = [
            f"• Prazo estimado: {budget_data['estimated_days']} dias úteis",
            "• Pagamento: 50% no início + 50% na entrega",
            "• Validade da proposta: 30 dias",
            "• Inclui ART/TRT do responsável técnico",
            "• Documentação entregue em formato digital e físico"
        ]
        
        for condition in conditions:
            story.append(Paragraph(condition, self.styles['BodyStyle']))
        
        if request_data['additional_notes']:
            story.append(Spacer(1, 10))
            story.append(Paragraph("OBSERVAÇÕES ADICIONAIS", self.styles['SubtitleStyle']))
            story.append(Paragraph(request_data['additional_notes'], self.styles['BodyStyle']))
        
        story.append(Spacer(1, 30))
        
        # Rodapé
        story.append(Paragraph("___________________________________", self.styles['BodyStyle']))
        story.append(Paragraph("OnGeo", self.styles['BodyStyle']))
        story.append(Paragraph("Engenharia e Georreferenciamento", self.styles['BodyStyle']))
        
        generation_date = dt.now().strftime("%d/%m/%Y às %H:%M")
        story.append(Spacer(1, 10))
        story.append(Paragraph(f"Proposta gerada em {generation_date}", 
                              ParagraphStyle(name='Footer', parent=self.styles['Normal'], 
                                           fontSize=8, textColor=colors.grey, alignment=TA_CENTER)))
        
        # Gera o PDF
        doc.build(story)
        
        return pdf_path