import json
import os
from datetime import datetime
from supabase import create_client, Client
from http.server import BaseHTTPRequestHandler

# Configurar Supabase
SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.environ.get('SUPABASE_SERVICE_KEY')  # Use service key para operações públicas

def get_supabase_client() -> Client:
    """Cria um cliente Supabase com service key"""
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        raise Exception("Configuração do Supabase ausente")
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        try:
            # Ler dados da requisição
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            # Dados do formulário
            client_name = data.get('client_name')
            client_email = data.get('client_email')
            client_phone = data.get('client_phone')
            client_type = data.get('client_type', 'pessoa_fisica')
            property_name = data.get('property_name')
            state = data.get('state')
            city = data.get('city')
            vertices_count = int(data.get('vertices_count', 4))
            property_area = float(data.get('property_area', 0))
            is_urgent = data.get('is_urgent', False)
            includes_topography = data.get('includes_topography', False)
            includes_environmental = data.get('includes_environmental', False)
            additional_notes = data.get('additional_notes', '')
            budget_result = data.get('budget_result', {})
            total = float(data.get('total', 0))
            
            # IDs do link e usuário
            form_link_id = data.get('form_link_id')
            user_id = data.get('user_id')
            
            # Conectar ao Supabase
            supabase = get_supabase_client()
            
            # Se tem user_id, verificar se já existe cliente com esse email
            client_id = None
            if user_id:
                existing_client = supabase.table('clients').select('*').eq('email', client_email).eq('user_id', user_id).execute()
                
                if existing_client.data and len(existing_client.data) > 0:
                    # Cliente já existe, usar o ID existente
                    client_id = existing_client.data[0]['id']
                else:
                    # Criar novo cliente vinculado ao usuário
                    new_client = {
                        'user_id': user_id,
                        'name': client_name,
                        'email': client_email,
                        'phone': client_phone,
                        'client_type': client_type,
                        'is_active': True,
                        'notes': f'Cliente criado via formulário público em {datetime.now().strftime("%d/%m/%Y %H:%M")}'
                    }
                    
                    client_result = supabase.table('clients').insert(new_client).execute()
                    
                    if client_result.data:
                        client_id = client_result.data[0]['id']
            
            # Criar o orçamento
            budget_data = {
                'user_id': user_id,  # Vincular ao dono do link
                'client_id': client_id,
                'form_link_id': form_link_id,
                'client_name': client_name,
                'client_email': client_email,
                'client_phone': client_phone,
                'property_name': property_name,
                'state': state,
                'city': city,
                'vertices_count': vertices_count,
                'property_area': property_area,
                'client_type': client_type,
                'is_urgent': is_urgent,
                'includes_topography': includes_topography,
                'includes_environmental': includes_environmental,
                'additional_notes': additional_notes,
                'total': total,
                'budget_request': {
                    'client_name': client_name,
                    'client_email': client_email,
                    'client_phone': client_phone,
                    'property_name': property_name,
                    'state': state,
                    'city': city,
                    'vertices_count': vertices_count,
                    'property_area': property_area,
                    'client_type': client_type,
                    'is_urgent': is_urgent,
                    'includes_topography': includes_topography,
                    'includes_environmental': includes_environmental,
                    'additional_notes': additional_notes
                },
                'budget_result': budget_result,
                'custom_link': f'orcamento-{int(datetime.now().timestamp())}',
                'status': 'active',  # Já ativo pois tem dono
                'source': 'public_form',
                'created_at': datetime.now().isoformat()
            }
            
            # Inserir o orçamento
            budget_result = supabase.table('budgets').insert(budget_data).execute()
            
            if not budget_result.data:
                raise Exception("Erro ao criar orçamento")
            
            saved_budget = budget_result.data[0]
            
            # Atualizar estatísticas do link
            if form_link_id:
                link_data = supabase.table('budget_form_links').select('submissions_count').eq('id', form_link_id).single().execute()
                if link_data.data:
                    supabase.table('budget_form_links').update({
                        'submissions_count': link_data.data['submissions_count'] + 1
                    }).eq('id', form_link_id).execute()
            
            # Atualizar totais do cliente se foi criado/existe
            if client_id and user_id:
                current_client = supabase.table('clients').select('*').eq('id', client_id).single().execute()
                
                if current_client.data:
                    current_total = float(current_client.data.get('total_spent', 0))
                    current_budgets = int(current_client.data.get('total_budgets', 0))
                    
                    supabase.table('clients').update({
                        'total_spent': current_total + total,
                        'total_budgets': current_budgets + 1,
                        'last_budget_date': datetime.now().isoformat()
                    }).eq('id', client_id).execute()
            
            # Responder com sucesso
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            response = {
                'success': True,
                'message': 'Solicitação de orçamento criada com sucesso! Em breve entraremos em contato.',
                'data': {
                    'id': saved_budget['id'],
                    'custom_link': saved_budget['custom_link']
                }
            }
            
            self.wfile.write(json.dumps(response).encode())
            
        except Exception as e:
            # Responder com erro
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            response = {
                'success': False,
                'message': str(e)
            }
            
            self.wfile.write(json.dumps(response).encode())