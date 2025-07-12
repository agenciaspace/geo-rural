#!/usr/bin/env python3
"""
Script para debugar o problema de cálculo do orçamento específico
ID: 7c3c891a-e491-4412-918a-bd5a0ac558ae
"""

import os
import sys
from supabase import create_client, Client
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv('.env.production')

def main():
    # Configuração do Supabase
    supabase_url = os.getenv('REACT_APP_SUPABASE_URL')
    supabase_key = os.getenv('REACT_APP_SUPABASE_ANON_KEY')
    
    if not supabase_url or not supabase_key:
        print("❌ Erro: Variáveis de ambiente do Supabase não encontradas")
        print(f"SUPABASE_URL: {supabase_url}")
        print(f"SUPABASE_KEY: {'***' if supabase_key else 'None'}")
        return
    
    try:
        # Criar cliente Supabase com configuração SSL
        import ssl
        import httpx

        # Criar um contexto SSL que não verifica certificados (apenas para debug)
        ssl_context = ssl.create_default_context()
        ssl_context.check_hostname = False
        ssl_context.verify_mode = ssl.CERT_NONE

        # Criar cliente HTTP personalizado
        http_client = httpx.Client(verify=False)

        # Criar cliente Supabase
        supabase: Client = create_client(
            supabase_url,
            supabase_key,
            options={
                'schema': 'public',
                'headers': {},
                'auto_refresh_token': True,
                'persist_session': True,
                'detect_session_in_url': True
            }
        )
        print("✅ Conectado ao Supabase com sucesso")
        
        budget_id = '7c3c891a-e491-4412-918a-bd5a0ac558ae'
        
        print(f"\n🔍 Debugando orçamento: {budget_id}")
        print("=" * 60)
        
        # 1. Verificar dados do orçamento específico
        print("\n1. DADOS DO ORÇAMENTO:")
        budget_result = supabase.table('budgets').select('*').eq('id', budget_id).execute()
        
        if budget_result.data:
            budget = budget_result.data[0]
            print(f"   ID: {budget.get('id')}")
            print(f"   Total (campo antigo): {budget.get('total')}")
            print(f"   Total Price (campo novo): {budget.get('total_price')}")
            print(f"   Status: {budget.get('status')}")
            print(f"   Created: {budget.get('created_at')}")
            print(f"   Updated: {budget.get('updated_at')}")
            
            # Verificar budget_result
            budget_result_data = budget.get('budget_result')
            if budget_result_data:
                print(f"   Budget Result Total Price: {budget_result_data.get('total_price')}")
            else:
                print("   Budget Result: NULL")
        else:
            print("   ❌ Orçamento não encontrado!")
            return
        
        # 2. Verificar itens do orçamento
        print("\n2. ITENS DO ORÇAMENTO:")
        items_result = supabase.table('budget_items').select('*').eq('budget_id', budget_id).execute()
        
        if items_result.data:
            total_items = 0
            for item in items_result.data:
                print(f"   - {item.get('description')}: {item.get('quantity')} x {item.get('unit_price')} = {item.get('total_price')}")
                total_items += float(item.get('total_price', 0))
            
            print(f"\n   Total calculado dos itens: {total_items}")
        else:
            print("   ❌ Nenhum item encontrado!")
        
        # 3. Comparar valores
        print("\n3. COMPARAÇÃO DE VALORES:")
        if budget_result.data and items_result.data:
            budget = budget_result.data[0]
            total_old = float(budget.get('total', 0))
            total_new = float(budget.get('total_price', 0))
            total_items = sum(float(item.get('total_price', 0)) for item in items_result.data)
            
            print(f"   Campo 'total' (antigo): R$ {total_old:.2f}")
            print(f"   Campo 'total_price' (novo): R$ {total_new:.2f}")
            print(f"   Soma dos itens: R$ {total_items:.2f}")
            print(f"   Diferença (total_price vs itens): R$ {total_new - total_items:.2f}")
            print(f"   Diferença (total vs itens): R$ {total_old - total_items:.2f}")
            
            # Verificar budget_result
            budget_result_data = budget.get('budget_result')
            if budget_result_data and 'total_price' in budget_result_data:
                budget_result_total = float(budget_result_data.get('total_price', 0))
                print(f"   Budget Result Total: R$ {budget_result_total:.2f}")
                print(f"   Diferença (budget_result vs itens): R$ {budget_result_total - total_items:.2f}")
        
        # 4. Forçar recálculo do total_price
        print("\n4. FORÇANDO RECÁLCULO:")
        if items_result.data:
            total_items = sum(float(item.get('total_price', 0)) for item in items_result.data)
            
            update_result = supabase.table('budgets').update({
                'total_price': total_items,
                'updated_at': 'now()'
            }).eq('id', budget_id).execute()
            
            if update_result.data:
                print(f"   ✅ Total_price atualizado para: R$ {total_items:.2f}")
            else:
                print(f"   ❌ Erro ao atualizar: {update_result}")
        
        # 5. Verificar resultado após recálculo
        print("\n5. RESULTADO APÓS RECÁLCULO:")
        budget_result_after = supabase.table('budgets').select('*').eq('id', budget_id).execute()
        
        if budget_result_after.data:
            budget_after = budget_result_after.data[0]
            print(f"   Total Price atualizado: {budget_after.get('total_price')}")
            print(f"   Última atualização: {budget_after.get('updated_at')}")
        
        print("\n" + "=" * 60)
        print("🔧 POSSÍVEIS PROBLEMAS IDENTIFICADOS:")
        print("- Inconsistência entre total, total_price e soma dos itens")
        print("- Frontend pode estar usando campo errado para exibição")
        print("- Campo budget_result pode estar desatualizado")
        print("- Triggers podem não estar funcionando corretamente")
        
    except Exception as e:
        print(f"❌ Erro ao conectar ou executar queries: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
