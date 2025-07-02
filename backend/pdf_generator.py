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
        """Gera PDF do relatório técnico GNSS"""
        
        if not filename:
            timestamp = dt.now().strftime("%Y%m%d_%H%M%S")
            filename = f"relatorio_gnss_{timestamp}.pdf"
        
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
        story.append(Paragraph("Relatório Técnico - Processamento Geodésico GNSS", self.styles['SubtitleStyle']))
        story.append(Spacer(1, 20))
        
        # Informações gerais
        file_info = gnss_data.get('file_info', {})
        
        story.append(Paragraph("INFORMAÇÕES GERAIS", self.styles['SubtitleStyle']))
        
        # Data da análise
        analysis_date = dt.now().strftime("%d/%m/%Y às %H:%M")
        
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