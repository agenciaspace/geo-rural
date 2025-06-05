from http.server import BaseHTTPRequestHandler
import json
from datetime import datetime

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            # Cálculo simplificado do orçamento
            base_price = 500.0
            price_per_vertex = 50.0
            
            # Multiplicadores regionais
            regional_multipliers = {
                "AC": 1.4, "AL": 1.2, "AP": 1.4, "AM": 1.5, "BA": 1.1,
                "CE": 1.2, "DF": 1.0, "ES": 1.0, "GO": 1.0, "MA": 1.3,
                "MT": 1.1, "MS": 1.1, "MG": 1.0, "PA": 1.3, "PB": 1.2,
                "PR": 0.9, "PE": 1.2, "PI": 1.3, "RJ": 1.0, "RN": 1.2,
                "RS": 0.9, "RO": 1.4, "RR": 1.5, "SC": 0.9, "SP": 0.9,
                "SE": 1.2, "TO": 1.3
            }
            
            state = data.get('state', 'SP')
            vertices_count = data.get('vertices_count', 4)
            property_area = data.get('property_area', 10)
            is_urgent = data.get('is_urgent', False)
            
            # Cálculo base
            subtotal = base_price + (vertices_count * price_per_vertex)
            
            # Aplica multiplicador regional
            regional_multiplier = regional_multipliers.get(state, 1.0)
            subtotal *= regional_multiplier
            
            # Desconto por área
            area_discount = 0
            if property_area > 100:
                area_discount = 0.1
            elif property_area > 50:
                area_discount = 0.05
            
            # Taxa de urgência
            urgency_fee = 0.3 if is_urgent else 0
            
            # Cálculo final
            discount_amount = subtotal * area_discount
            urgency_amount = subtotal * urgency_fee
            total = subtotal - discount_amount + urgency_amount
            
            result = {
                "success": True,
                "budget": {
                    "subtotal": round(subtotal, 2),
                    "discount_percentage": area_discount * 100,
                    "discount_amount": round(discount_amount, 2),
                    "urgency_fee": round(urgency_amount, 2),
                    "total": round(total, 2),
                    "details": {
                        "base_price": base_price,
                        "price_per_vertex": price_per_vertex,
                        "vertices_count": vertices_count,
                        "regional_multiplier": regional_multiplier,
                        "state": state
                    }
                }
            }
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(result).encode())
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            error_response = {"error": str(e)}
            self.wfile.write(json.dumps(error_response).encode())
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()