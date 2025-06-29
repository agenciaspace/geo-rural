"""
Testes unitários para o calculador de orçamento
"""

import pytest
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from budget_calculator import BudgetCalculator, BudgetRequest

class TestBudgetCalculator:
    
    def setup_method(self):
        """Setup para cada teste"""
        self.calculator = BudgetCalculator()
    
    def test_init(self):
        """Testa inicialização do calculador"""
        assert self.calculator is not None
        assert hasattr(self.calculator, 'base_price')
        assert hasattr(self.calculator, 'price_per_vertex')
    
    def test_calculate_base_cost_small_property(self):
        """Testa cálculo de custo base para propriedade pequena"""
        request = BudgetRequest(
            client_name="Test Client",
            client_email="test@test.com",
            client_phone="11999999999",
            client_type="pessoa_fisica",
            property_name="Fazenda Teste",
            state="SP",
            city="São Paulo",
            property_area=10.5,  # 10.5 hectares
            vertices_count=50,
            is_urgent=False,
            includes_topography=False,
            includes_environmental=False,
            additional_notes=""
        )
        
        result = self.calculator.calculate_budget(request)
        
        assert result is not None
        assert result['total_price'] > 0
        assert 'breakdown' in result
        assert len(result['breakdown']) > 0
    
    def test_calculate_base_cost_large_property(self):
        """Testa cálculo de custo base para propriedade grande"""
        request = BudgetRequest(
            client_name="Test Client Large",
            client_email="test@test.com", 
            client_phone="11999999999",
            client_type="pessoa_juridica",
            property_name="Fazenda Grande",
            state="MT",
            city="Cuiabá",
            property_area=500.0,  # 500 hectares
            vertices_count=200,
            is_urgent=False,
            includes_topography=False,
            includes_environmental=False,
            additional_notes=""
        )
        
        result = self.calculator.calculate_budget(request)
        
        assert result is not None
        assert result['total_price'] > 0
        
        # Propriedade grande deve ter desconto
        breakdown = result['breakdown']
        discount_items = [item for item in breakdown if 'desconto' in item['item'].lower()]
        assert len(discount_items) > 0
    
    def test_urgency_fee(self):
        """Testa aplicação de taxa de urgência"""
        base_request = BudgetRequest(
            client_name="Test Client",
            client_email="test@test.com",
            client_phone="11999999999", 
            client_type="pessoa_fisica",
            property_name="Fazenda Teste",
            state="SP",
            city="São Paulo",
            property_area=50.0,
            vertices_count=100,
            is_urgent=False,
            includes_topography=False,
            includes_environmental=False,
            additional_notes=""
        )
        
        urgent_request = BudgetRequest(
            client_name="Test Client",
            client_email="test@test.com",
            client_phone="11999999999",
            client_type="pessoa_fisica", 
            property_name="Fazenda Teste",
            state="SP",
            city="São Paulo",
            property_area=50.0,
            vertices_count=100,
            is_urgent=True,  # Urgente
            includes_topography=False,
            includes_environmental=False,
            additional_notes=""
        )
        
        base_result = self.calculator.calculate_budget(base_request)
        urgent_result = self.calculator.calculate_budget(urgent_request)
        
        # Orçamento urgente deve ser mais caro
        assert urgent_result['total_price'] > base_result['total_price']
        
        # Deve existir item de taxa de urgência
        urgent_breakdown = urgent_result['breakdown']
        urgency_items = [item for item in urgent_breakdown if 'urgência' in item['item'].lower()]
        assert len(urgency_items) > 0
    
    def test_additional_services(self):
        """Testa serviços adicionais"""
        base_request = BudgetRequest(
            client_name="Test Client",
            client_email="test@test.com",
            client_phone="11999999999",
            client_type="pessoa_fisica",
            property_name="Fazenda Teste", 
            state="SP",
            city="São Paulo",
            property_area=30.0,
            vertices_count=80,
            is_urgent=False,
            includes_topography=False,
            includes_environmental=False,
            additional_notes=""
        )
        
        full_service_request = BudgetRequest(
            client_name="Test Client",
            client_email="test@test.com",
            client_phone="11999999999",
            client_type="pessoa_fisica",
            property_name="Fazenda Teste",
            state="SP", 
            city="São Paulo",
            property_area=30.0,
            vertices_count=80,
            is_urgent=False,
            includes_topography=True,  # Com topografia
            includes_environmental=True,  # Com estudo ambiental
            additional_notes=""
        )
        
        base_result = self.calculator.calculate_budget(base_request)
        full_result = self.calculator.calculate_budget(full_service_request)
        
        # Orçamento com serviços adicionais deve ser mais caro
        assert full_result['total_price'] > base_result['total_price']
        
        # Deve existir itens dos serviços adicionais
        full_breakdown = full_result['breakdown']
        topo_items = [item for item in full_breakdown if 'topografi' in item['item'].lower()]
        env_items = [item for item in full_breakdown if 'ambient' in item['item'].lower()]
        
        assert len(topo_items) > 0
        assert len(env_items) > 0
    
    def test_state_multiplier(self):
        """Testa multiplicador por estado"""
        sp_request = BudgetRequest(
            client_name="Test Client SP",
            client_email="test@test.com",
            client_phone="11999999999",
            client_type="pessoa_fisica",
            property_name="Fazenda SP",
            state="SP",  # São Paulo
            city="São Paulo",
            property_area=25.0,
            vertices_count=60,
            is_urgent=False,
            includes_topography=False,
            includes_environmental=False,
            additional_notes=""
        )
        
        mt_request = BudgetRequest(
            client_name="Test Client MT",
            client_email="test@test.com",
            client_phone="11999999999",
            client_type="pessoa_fisica",
            property_name="Fazenda MT",
            state="MT",  # Mato Grosso
            city="Cuiabá",
            property_area=25.0,
            vertices_count=60,
            is_urgent=False,
            includes_topography=False,
            includes_environmental=False,
            additional_notes=""
        )
        
        sp_result = self.calculator.calculate_budget(sp_request)
        mt_result = self.calculator.calculate_budget(mt_request)
        
        # Preços podem diferir entre estados
        assert sp_result['success'] == True
        assert mt_result['success'] == True
        assert sp_result['total_price'] > 0
        assert mt_result['total_price'] > 0
    
    def test_client_type_impact(self):
        """Testa impacto do tipo de cliente"""
        pf_request = BudgetRequest(
            client_name="João Silva",
            client_email="joao@test.com",
            client_phone="11999999999",
            client_type="pessoa_fisica",  # Pessoa Física
            property_name="Sítio do João",
            state="SP",
            city="Campinas",
            property_area=5.0,
            vertices_count=30,
            is_urgent=False,
            includes_topography=False,
            includes_environmental=False,
            additional_notes=""
        )
        
        pj_request = BudgetRequest(
            client_name="Empresa Rural Ltda",
            client_email="contato@empresa.com", 
            client_phone="11999999999",
            client_type="pessoa_juridica",  # Pessoa Jurídica
            property_name="Fazenda Empresarial",
            state="SP",
            city="Campinas",
            property_area=5.0,
            vertices_count=30,
            is_urgent=False,
            includes_topography=False,
            includes_environmental=False,
            additional_notes=""
        )
        
        pf_result = self.calculator.calculate_budget(pf_request)
        pj_result = self.calculator.calculate_budget(pj_request)
        
        # Ambos devem ter orçamentos válidos
        assert pf_result['success'] == True
        assert pj_result['success'] == True
        assert pf_result['total_price'] > 0
        assert pj_result['total_price'] > 0
    
    def test_minimum_budget(self):
        """Testa orçamento mínimo"""
        minimal_request = BudgetRequest(
            client_name="Cliente Mínimo",
            client_email="minimo@test.com",
            client_phone="11999999999",
            client_type="pessoa_fisica",
            property_name="Terreno Pequeno",
            state="SP",
            city="São Paulo",
            property_area=0.5,  # 0.5 hectare (muito pequeno)
            vertices_count=4,   # Mínimo de vértices
            is_urgent=False,
            includes_topography=False,
            includes_environmental=False,
            additional_notes=""
        )
        
        result = self.calculator.calculate_budget(minimal_request)
        
        assert result['success'] == True
        assert result['total_price'] >= 1000  # Valor mínimo razoável
        
        # Deve ter valor mínimo aplicado
        breakdown = result['breakdown']
        assert len(breakdown) > 0
    
    def test_maximum_budget(self):
        """Testa orçamento para propriedade muito grande"""
        large_request = BudgetRequest(
            client_name="Fazenda Gigante",
            client_email="gigante@test.com",
            client_phone="11999999999",
            client_type="pessoa_juridica",
            property_name="Mega Fazenda",
            state="MT",
            city="Sorriso",
            property_area=5000.0,  # 5000 hectares
            vertices_count=1000,   # Muitos vértices
            is_urgent=True,
            includes_topography=True,
            includes_environmental=True,
            additional_notes="Propriedade complexa com múltiplas áreas"
        )
        
        result = self.calculator.calculate_budget(large_request)
        
        assert result['success'] == True
        assert result['total_price'] > 50000  # Valor alto esperado
        
        # Deve ter desconto para propriedade grande
        breakdown = result['breakdown']
        discount_items = [item for item in breakdown if item['value'] < 0]
        assert len(discount_items) > 0
    
    def test_estimated_days(self):
        """Testa cálculo de prazo estimado"""
        small_request = BudgetRequest(
            client_name="Cliente",
            client_email="test@test.com",
            client_phone="11999999999",
            client_type="pessoa_fisica",
            property_name="Propriedade Pequena",
            state="SP",
            city="São Paulo",
            property_area=10.0,
            vertices_count=40,
            is_urgent=False,
            includes_topography=False,
            includes_environmental=False,
            additional_notes=""
        )
        
        large_request = BudgetRequest(
            client_name="Cliente",
            client_email="test@test.com",
            client_phone="11999999999",
            client_type="pessoa_juridica",
            property_name="Propriedade Grande",
            state="MT",
            city="Cuiabá",
            property_area=1000.0,
            vertices_count=500,
            is_urgent=False,
            includes_topography=True,
            includes_environmental=True,
            additional_notes=""
        )
        
        small_result = self.calculator.calculate_budget(small_request)
        large_result = self.calculator.calculate_budget(large_request)
        
        # Propriedade grande deve levar mais tempo
        assert large_result['estimated_days'] > small_result['estimated_days']
        assert small_result['estimated_days'] >= 5  # Mínimo razoável
        assert large_result['estimated_days'] <= 90  # Máximo razoável
    
    def test_breakdown_structure(self):
        """Testa estrutura do detalhamento de custos"""
        request = BudgetRequest(
            client_name="Test Breakdown",
            client_email="breakdown@test.com",
            client_phone="11999999999",
            client_type="pessoa_fisica",
            property_name="Fazenda Teste",
            state="SP",
            city="São Paulo",
            property_area=20.0,
            vertices_count=60,
            is_urgent=True,
            includes_topography=True,
            includes_environmental=False,
            additional_notes="Teste de breakdown"
        )
        
        result = self.calculator.calculate_budget(request)
        
        assert result['success'] == True
        assert 'breakdown' in result
        
        breakdown = result['breakdown']
        assert isinstance(breakdown, list)
        assert len(breakdown) > 0
        
        # Cada item deve ter estrutura correta
        for item in breakdown:
            assert 'item' in item
            assert 'value' in item
            assert isinstance(item['item'], str)
            assert isinstance(item['value'], (int, float))
        
        # Deve ter itens principais
        item_names = [item['item'].lower() for item in breakdown]
        assert any('georreferenciamento' in name for name in item_names)
        
        # Se urgente, deve ter taxa de urgência
        assert any('urgência' in name for name in item_names)
        
        # Se tem topografia, deve aparecer
        assert any('topografi' in name for name in item_names)


if __name__ == '__main__':
    # Executa os testes se pytest estiver disponível
    try:
        import pytest
        pytest.main([__file__, '-v'])
    except ImportError:
        print("pytest não instalado. Executando testes simples...")
        
        # Executa testes básicos sem pytest
        test_instance = TestBudgetCalculator()
        test_instance.setup_method()
        
        try:
            test_instance.test_init()
            print("✅ test_init passou")
        except Exception as e:
            print(f"❌ test_init falhou: {e}")
            
        try:
            test_instance.test_calculate_base_cost_small_property()
            print("✅ test_calculate_base_cost_small_property passou")
        except Exception as e:
            print(f"❌ test_calculate_base_cost_small_property falhou: {e}")
            
        print("Testes básicos concluídos!") 