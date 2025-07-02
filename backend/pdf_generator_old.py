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
        story.append(Paragraph("Precizu", self.styles['BodyStyle']))
        story.append(Paragraph("Engenharia e Georreferenciamento", self.styles['BodyStyle']))
        
        generation_date = dt.now().strftime("%d/%m/%Y às %H:%M")
        story.append(Spacer(1, 10))
        story.append(Paragraph(f"Proposta gerada em {generation_date}", 
                              ParagraphStyle(name='Footer', parent=self.styles['Normal'], 
                                           fontSize=8, textColor=colors.grey, alignment=TA_CENTER)))
        
        # Gera o PDF
        doc.build(story)
        
        return pdf_path

    def generate_gnss_report_pdf(self, gnss_data: Dict[str, Any], filename: Optional[str] = None) -> str:
        """Gera PDF completo do relatório técnico geodésico GNSS"""
        
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
        
        # Título principal
        story.append(Paragraph("RELATÓRIO TÉCNICO GEODÉSICO GNSS", self.styles['TitleStyle']))
        story.append(Paragraph("ANÁLISE PROFISSIONAL DE DADOS RINEX", self.styles['SubtitleStyle']))
        story.append(Spacer(1, 20))
        
        # === NOVO CONTEÚDO COMPLETO DO PDF ===
        
        # Informações gerais
        analysis_date = dt.now().strftime("%d/%m/%Y às %H:%M")
        story.append(Paragraph(f"<b>Data da Análise:</b> {analysis_date} (GMT-3)", self.styles['BodyStyle']))
        story.append(Paragraph(f"<b>Classificação Geral:</b> {file_info.get('quality_status', 'N/A')}", self.styles['BodyStyle']))
        story.append(Paragraph(f"<b>Pontuação Técnica:</b> {file_info.get('quality_score', 'N/A')}/100 pontos", self.styles['BodyStyle']))
        story.append(Paragraph(f"<b>Status INCRA:</b> {'✅ APROVADO' if file_info.get('incra_compliant') else '❌ NECESSITA REVISÃO'}", self.styles['BodyStyle']))
        story.append(Spacer(1, 20))
        
        # Seção 1: Dados Gerais da Sessão
        story.append(Paragraph("1. DADOS GERAIS DA SESSÃO", self.styles['SubtitleStyle']))
        session_data = [
            ['Parâmetro', 'Valor'],
            ['Satélites Observados', str(file_info.get('satellites_count', 'N/A'))],
            ['Duração da Sessão', f"{file_info.get('duration_hours', 'N/A')} horas"],
            ['Épocas Processadas', f"{file_info.get('epochs_processed', 'N/A'):,}"],
            ['Sistemas Ativos', str(len(file_info.get('satellite_systems', {})))],
            ['Intervalo de Observação', f"{file_info.get('technical_analysis', {}).get('observation_interval', 'N/A')}s"],
            ['Continuidade dos Dados', file_info.get('technical_analysis', {}).get('data_continuity', 'N/A')],
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
        dop_data = [
            ['Tipo DOP', 'Valor', 'Avaliação'],
            ['PDOP (Position)', str(dop_analysis.get('PDOP', 'N/A')), self._evaluate_dop(dop_analysis.get('PDOP', 999), 'PDOP')],
            ['HDOP (Horizontal)', str(dop_analysis.get('HDOP', 'N/A')), self._evaluate_dop(dop_analysis.get('HDOP', 999), 'HDOP')],
            ['VDOP (Vertical)', str(dop_analysis.get('VDOP', 'N/A')), self._evaluate_dop(dop_analysis.get('VDOP', 999), 'VDOP')],
            ['GDOP (Geometric)', str(dop_analysis.get('GDOP', 'N/A')), self._evaluate_dop(dop_analysis.get('GDOP', 999), 'GDOP')],
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
        positioning_data = [
            ['Parâmetro', 'Valor', 'Status INCRA'],
            ['Precisão Horizontal (RMS)', f"{positioning_stats.get('horizontal_rms', 'N/A')}m", 
             '✅ APROVADO' if positioning_stats.get('horizontal_rms', 999) < 0.5 else '❌ FORA DO LIMITE'],
            ['Precisão Vertical (RMS)', f"{positioning_stats.get('vertical_rms', 'N/A')}m", 'Referência'],
            ['Precisão Posicional (3D)', f"{positioning_stats.get('position_rms', 'N/A')}m", 'Referência'],
            ['Acurácia Estimada (95%)', positioning_stats.get('estimated_accuracy', 'N/A'), 'Intervalo de Confiança'],
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
        atmospheric_data = [
            ['Parâmetro', 'Valor', 'Avaliação'],
            ['Atividade Ionosférica', atmospheric_conditions.get('ionospheric_activity', 'N/A'), 'Monitoramento'],
            ['Atraso Ionosférico (RMS)', f"{atmospheric_conditions.get('ionospheric_delay_rms', 'N/A')} TECU", 'Correção Aplicada'],
            ['Atraso Troposférico (RMS)', f"{atmospheric_conditions.get('tropospheric_delay_rms', 'N/A')}m", 'Correção Aplicada'],
            ['Estabilidade Atmosférica', atmospheric_conditions.get('atmospheric_stability', 'N/A'), 'Condições Gerais'],
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
        
        signal_data = [
            ['Parâmetro', 'Valor', 'Status'],
            ['Multipath Médio', f"{multipath_analysis.get('average_level', 'N/A')}", multipath_analysis.get('assessment', 'N/A')],
            ['Pico de Multipath', f"{multipath_analysis.get('peak_level', 'N/A')}", 'Máximo Detectado'],
            ['Cycle Slips Detectados', str(cycle_slip_analysis.get('total_detected', 'N/A')), cycle_slip_analysis.get('assessment', 'N/A')],
            ['Taxa de Cycle Slips', f"{cycle_slip_analysis.get('rate_percentage', 'N/A')}%", 'Por Época'],
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
        geodetic_data = [
            ['Especificação', 'Valor'],
            ['Sistema de Coordenadas', geodetic_validation.get('coordinate_system', 'N/A')],
            ['Datum', geodetic_validation.get('datum', 'N/A')],
            ['Projeção', geodetic_validation.get('projection', 'N/A')],
            ['Elipsoide de Referência', geodetic_validation.get('reference_ellipsoid', 'N/A')],
            ['Modelo Geoidal', geodetic_validation.get('geoid_model', 'N/A')],
            ['Norma INCRA', geodetic_validation.get('incra_standard', 'N/A')],
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
        
        if file_info.get('incra_compliant'):
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
        
        # Problemas identificados
        issues = file_info.get('issues', [])
        if issues:
            story.append(Paragraph("PROBLEMAS IDENTIFICADOS:", self.styles['SubtitleStyle']))
            for i, issue in enumerate(issues, 1):
                story.append(Paragraph(f"{i}. {issue}", self.styles['BodyStyle']))
            story.append(Spacer(1, 10))
        
        # Recomendações técnicas
        recommendations = file_info.get('recommendations', [])
        if recommendations:
            story.append(Paragraph("RECOMENDAÇÕES TÉCNICAS:", self.styles['SubtitleStyle']))
            for i, rec in enumerate(recommendations, 1):
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
        
        general_info = [
            ["Data da Análise:", analysis_date],
            ["Tempo de Processamento:", f"{file_info.get('processing_time', 0):.1f} segundos"],
            ["Satélites Observados:", str(file_info.get('satellites_count', 0))],
            ["Duração da Observação:", f"{file_info.get('duration_hours', 0):.2f} horas"],
            ["Épocas Analisadas:", str(file_info.get('epochs_analyzed', 0))],
            ["Sistema GNSS:", "GPS + GLONASS"]
        ]
        
        general_table = Table(general_info, colWidths=[5*cm, 11*cm])
        general_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        story.append(general_table)
        story.append(Spacer(1, 20))
        
        # Coordenadas calculadas
        coordinates = file_info.get('coordinates', {})
        
        story.append(Paragraph("COORDENADAS CALCULADAS", self.styles['SubtitleStyle']))
        
        coord_info = [
            ["Latitude:", f"{coordinates.get('latitude', 0):.8f}°"],
            ["Longitude:", f"{coordinates.get('longitude', 0):.8f}°"],
            ["Altitude:", f"{coordinates.get('altitude', 0):.3f} m"],
        ]
        
        # UTM
        utm = coordinates.get('utm', {})
        if utm:
            coord_info.extend([
                ["UTM Zona:", f"{utm.get('zone', '')} {utm.get('hemisphere', '')}"],
                ["UTM Easting:", f"{utm.get('easting', 0):,.3f} m"],
                ["UTM Northing:", f"{utm.get('northing', 0):,.3f} m"],
                ["Meridiano Central:", f"{utm.get('meridian_central', 0)}°"]
            ])
        
        coord_table = Table(coord_info, colWidths=[5*cm, 11*cm])
        coord_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        story.append(coord_table)
        story.append(Spacer(1, 20))
        
        # Precisão alcançada
        precision = file_info.get('precision', {})
        
        story.append(Paragraph("PRECISÃO ALCANÇADA", self.styles['SubtitleStyle']))
        
        precision_info = [
            ["Precisão Horizontal:", f"{precision.get('horizontal', 999):.3f} m"],
            ["Precisão Vertical:", f"{precision.get('vertical', 999):.3f} m"],
            ["PDOP:", f"{precision.get('pdop', 999):.1f}"],
            ["HDOP:", f"{precision.get('hdop', 999):.1f}"],
            ["VDOP:", f"{precision.get('vdop', 999):.1f}"],
            ["Intervalo de Confiança (95%):", f"±{precision.get('confidence_95', 999):.3f} m"]
        ]
        
        precision_table = Table(precision_info, colWidths=[5*cm, 11*cm])
        precision_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        story.append(precision_table)
        story.append(Spacer(1, 20))
        
        # Qualidade do processamento
        quality_status = file_info.get('quality_status', 'SEM SOLUÇÃO')
        
        story.append(Paragraph("QUALIDADE DO PROCESSAMENTO", self.styles['SubtitleStyle']))
        
        # Determinar status INCRA baseado na precisão
        horizontal_precision = precision.get('horizontal', 999)
        if horizontal_precision <= 0.50:
            incra_status = "APROVADO"
            quality_color = colors.darkgreen
        else:
            incra_status = "REPROCESSAR"
            quality_color = colors.red
        
        quality_info = [
            ["Classificação:", quality_status],
            ["Status INCRA:", incra_status]
        ]
        
        quality_table = Table(quality_info, colWidths=[5*cm, 11*cm])
        quality_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('TEXTCOLOR', (1, 1), (1, 1), quality_color),
            ('FONTNAME', (1, 1), (1, 1), 'Helvetica-Bold'),
        ]))
        story.append(quality_table)
        story.append(Spacer(1, 20))
        
        # Coordenadas cartesianas (ECEF)
        approx_pos = file_info.get('approx_position', [0, 0, 0])
        
        story.append(Paragraph("COORDENADAS CARTESIANAS (ECEF)", self.styles['SubtitleStyle']))
        
        ecef_info = [
            ["X:", f"{approx_pos[0]:,.3f} m"],
            ["Y:", f"{approx_pos[1]:,.3f} m"],
            ["Z:", f"{approx_pos[2]:,.3f} m"]
        ]
        
        ecef_table = Table(ecef_info, colWidths=[5*cm, 11*cm])
        ecef_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        story.append(ecef_table)
        story.append(Spacer(1, 20))
        
        # Parecer para georreferenciamento
        story.append(Paragraph("PARECER PARA GEORREFERENCIAMENTO", self.styles['SubtitleStyle']))
        
        if horizontal_precision <= 0.50:
            verdict_text = "✅ DADOS ADEQUADOS PARA CERTIFICAÇÃO INCRA/SIGEF"
            verdict_details = [
                "✅ Precisão atende norma técnica (< 0.50m)",
                "✅ Qualidade: APROVADA",
                "✅ Apto para certificação"
            ]
            
            next_steps_title = "PRÓXIMOS PASSOS:"
            next_steps = [
                "1. Gerar memorial descritivo",
                "2. Preparar planta georreferenciada", 
                "3. Submeter ao SIGEF"
            ]
        else:
            verdict_text = "⚠️ DADOS NECESSITAM REVISÃO"
            verdict_details = [
                "❌ Precisão fora do limite INCRA (> 0.50m)",
                "🔄 Recomenda-se nova coleta"
            ]
            
            next_steps_title = "RECOMENDAÇÕES:"
            next_steps = [
                "1. Aumentar tempo de observação (mínimo 4h)",
                "2. Verificar obstruções no local",
                "3. Coletar em horário de melhor geometria satelital"
            ]
        
        story.append(Paragraph(verdict_text, self.styles['BodyStyle']))
        story.append(Spacer(1, 10))
        
        for detail in verdict_details:
            story.append(Paragraph(detail, self.styles['BodyStyle']))
        
        story.append(Spacer(1, 15))
        story.append(Paragraph(next_steps_title, self.styles['SubtitleStyle']))
        
        for step in next_steps:
            story.append(Paragraph(step, self.styles['BodyStyle']))
        
        story.append(Spacer(1, 30))
        
        # Rodapé
        story.append(Paragraph("_" * 60, self.styles['BodyStyle']))
        story.append(Paragraph("Precizu - Processamento Geodésico Completo", self.styles['BodyStyle']))
        story.append(Paragraph("Sistema homologado para georreferenciamento rural", self.styles['BodyStyle']))
        
        generation_date = dt.now().strftime("%d/%m/%Y às %H:%M")
        story.append(Spacer(1, 10))
        story.append(Paragraph(f"Relatório gerado em {generation_date}", 
                              ParagraphStyle(name='Footer', parent=self.styles['Normal'], 
                                           fontSize=8, textColor=colors.grey, alignment=TA_CENTER)))
        
        # Gera o PDF
        doc.build(story)
        
        return pdf_path