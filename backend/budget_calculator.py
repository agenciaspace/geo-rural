from datetime import datetime as dt
from typing import Dict, Any
from dataclasses import dataclass

@dataclass
class BudgetRequest:
    client_name: str
    client_email: str
    client_phone: str
    property_name: str
    state: str
    city: str
    vertices_count: int
    property_area: float  # em hectares
    client_type: str  # "pessoa_fisica" ou "pessoa_juridica"
    is_urgent: bool
    includes_topography: bool
    includes_environmental: bool
    additional_notes: str = ""

class BudgetCalculator:
    
    # Preços base por estado (alguns exemplos)
    STATE_MULTIPLIERS = {
        "SP": 1.2,
        "RJ": 1.15,
        "MG": 1.0,
        "RS": 0.95,
        "SC": 0.95,
        "PR": 1.0,
        "GO": 0.9,
        "MT": 0.85,
        "MS": 0.9,
        "BA": 0.95,
        "CE": 0.9,
        "PE": 0.95,
        "default": 1.0
    }
    
    def __init__(self):
        self.base_price = 500.0  # Preço fixo base
        self.price_per_vertex = 50.0  # Preço por vértice
        self.urgency_fee = 300.0  # Taxa de urgência
        self.topography_fee = 800.0  # Taxa para topografia
        self.environmental_fee = 600.0  # Taxa para estudo ambiental
        
    def calculate_budget(self, request: BudgetRequest) -> Dict[str, Any]:
        """Calcula orçamento com base nas regras definidas"""
        
        # Preço base
        total = self.base_price
        breakdown = [{"item": "Taxa base do serviço", "value": self.base_price}]
        
        # Preço por vértices
        vertices_cost = request.vertices_count * self.price_per_vertex
        total += vertices_cost
        breakdown.append({
            "item": f"Vértices ({request.vertices_count} × R${self.price_per_vertex})",
            "value": vertices_cost
        })
        
        # Multiplicador por estado
        state_multiplier = self.STATE_MULTIPLIERS.get(request.state, self.STATE_MULTIPLIERS["default"])
        if state_multiplier != 1.0:
            state_adjustment = total * (state_multiplier - 1.0)
            total += state_adjustment
            breakdown.append({
                "item": f"Ajuste regional - {request.state} ({(state_multiplier-1)*100:+.0f}%)",
                "value": state_adjustment
            })
        
        # Taxa de urgência
        if request.is_urgent:
            total += self.urgency_fee
            breakdown.append({
                "item": "Taxa de urgência",
                "value": self.urgency_fee
            })
        
        # Serviços adicionais
        if request.includes_topography:
            total += self.topography_fee
            breakdown.append({
                "item": "Levantamento topográfico",
                "value": self.topography_fee
            })
        
        if request.includes_environmental:
            total += self.environmental_fee
            breakdown.append({
                "item": "Estudo ambiental básico",
                "value": self.environmental_fee
            })
        
        # Desconto para projetos grandes (mais de 100 vértices)
        discount = 0
        if request.vertices_count > 100:
            discount = total * 0.10  # 10% de desconto
            total -= discount
            breakdown.append({
                "item": "Desconto projeto grande (10%)",
                "value": -discount
            })
        
        # Desconto para pessoa jurídica em projetos grandes
        if request.client_type == "pessoa_juridica" and request.vertices_count > 50:
            pj_discount = total * 0.05  # 5% adicional para PJ
            total -= pj_discount
            breakdown.append({
                "item": "Desconto pessoa jurídica (5%)",
                "value": -pj_discount
            })
        
        # Calcula prazo estimado
        base_days = 15
        if request.vertices_count > 50:
            base_days += (request.vertices_count - 50) // 10 * 2
        if request.includes_topography:
            base_days += 10
        if request.includes_environmental:
            base_days += 7
        if request.is_urgent:
            base_days = max(5, base_days // 2)
        
        return {
            "total_price": round(total, 2),
            "breakdown": breakdown,
            "estimated_days": base_days,
            "generated_at": dt.now().isoformat(),
            "request_data": request.__dict__
        }