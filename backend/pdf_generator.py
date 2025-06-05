from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from datetime import datetime
import os
import tempfile
from typing import Dict, Any

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
    
    def generate_budget_pdf(self, budget_data: Dict[str, Any], filename: str = None) -> str:
        """Gera PDF da proposta de orçamento"""
        
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"proposta_georural_{timestamp}.pdf"
        
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
        story.append(Paragraph("GEORURAL PRO", self.styles['TitleStyle']))
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
        story.append(Paragraph("GeoRural Pro", self.styles['BodyStyle']))
        story.append(Paragraph("Engenharia e Georreferenciamento", self.styles['BodyStyle']))
        
        generation_date = datetime.now().strftime("%d/%m/%Y às %H:%M")
        story.append(Spacer(1, 10))
        story.append(Paragraph(f"Proposta gerada em {generation_date}", 
                              ParagraphStyle(name='Footer', parent=self.styles['Normal'], 
                                           fontSize=8, textColor=colors.grey, alignment=TA_CENTER)))
        
        # Gera o PDF
        doc.build(story)
        
        return pdf_path