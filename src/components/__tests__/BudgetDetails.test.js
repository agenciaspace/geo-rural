import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import BudgetDetails from '../BudgetDetails';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../config/supabase';

// Mock das dependências
jest.mock('../../hooks/useAuth');
jest.mock('../../config/supabase');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ budgetId: 'budget-123' }),
  useNavigate: () => jest.fn(),
}));

// Helper para renderizar componente com Router
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      {component}
    </BrowserRouter>
  );
};

// Mock dos dados de teste
const mockBudgetDetails = {
  id: 'budget-123',
  custom_link: 'orcamento-123',
  budget_request: {
    client_name: 'João Silva',
    client_email: 'joao@email.com',
    property_name: 'Fazenda São José',
    city: 'São Paulo',
    state: 'SP',
    vertices_count: 4,
    property_area: 10.5,
    client_type: 'pessoa_fisica',
    description: 'Levantamento topográfico para regularização'
  },
  budget_result: {
    total_price: 5000,
    breakdown: [
      { item: 'Levantamento topográfico', value: 3000, description: 'Serviço completo' },
      { item: 'Relatório técnico', value: 2000, description: 'Documentação' }
    ],
    execution_time: '15-20 dias úteis',
    validity: '30 dias',
    payment_terms: 'À vista com 10% desconto'
  },
  status: 'active',
  created_at: '2024-01-01T10:00:00Z',
  updated_at: '2024-01-01T10:00:00Z',
  timeline: [
    {
      id: '1',
      action: 'created',
      description: 'Orçamento criado',
      timestamp: '2024-01-01T10:00:00Z',
      user_name: 'Sistema'
    },
    {
      id: '2',
      action: 'sent',
      description: 'Orçamento enviado para cliente',
      timestamp: '2024-01-01T11:00:00Z',
      user_name: 'Admin'
    }
  ]
};

const mockEmptyBudget = {
  id: 'budget-456',
  custom_link: 'orcamento-456',
  budget_request: {
    client_name: 'Maria Santos',
    client_email: 'maria@email.com',
    property_name: 'Sítio Esperança',
    city: 'Rio de Janeiro',
    state: 'RJ',
    vertices_count: 6,
    property_area: 25.0,
    client_type: 'pessoa_juridica'
  },
  budget_result: null,
  status: 'draft',
  created_at: '2024-01-15T14:30:00Z',
  updated_at: '2024-01-15T14:30:00Z',
  timeline: []
};

describe('BudgetDetails', () => {
  beforeEach(() => {
    // Mock do useAuth
    useAuth.mockReturnValue({
      isAuthenticated: true,
      user: { id: 'user1', email: 'user@test.com' }
    });

    // Mock das funções do banco
    db.budgets = {
      getById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    };

    // Reseta os mocks
    jest.clearAllMocks();
  });

  describe('Renderização inicial', () => {
    test('deve renderizar detalhes do orçamento com dados completos', async () => {
      db.budgets.getById.mockResolvedValue({ data: mockBudgetDetails, error: null });

      await act(async () => {
        renderWithRouter(<BudgetDetails />);
      });

      await waitFor(() => {
        expect(screen.getByText('Detalhes do Orçamento')).toBeInTheDocument();
        expect(screen.getByText('João Silva')).toBeInTheDocument();
        expect(screen.getByText('Fazenda São José')).toBeInTheDocument();
        expect(screen.getByText('joao@email.com')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    test('deve chamar função para carregar orçamento na inicialização', async () => {
      db.budgets.getById.mockResolvedValue({ data: mockBudgetDetails, error: null });

      await act(async () => {
        renderWithRouter(<BudgetDetails />);
      });

      await waitFor(() => {
        expect(db.budgets.getById).toHaveBeenCalledWith('budget-123');
      }, { timeout: 3000 });
    });

    test('deve exibir estado de loading durante carregamento', async () => {
      db.budgets.getById.mockImplementation(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({ data: mockBudgetDetails, error: null }), 100)
        )
      );

      await act(async () => {
        renderWithRouter(<BudgetDetails />);
      });

      expect(screen.getByText('Carregando detalhes do orçamento...')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByText('Carregando detalhes do orçamento...')).not.toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Exibição de informações do cliente', () => {
    test('deve exibir informações básicas do cliente', async () => {
      db.budgets.getById.mockResolvedValue({ data: mockBudgetDetails, error: null });

      renderWithRouter(<BudgetDetails />);

      await waitFor(() => {
        expect(screen.getByText('👤 Informações do Cliente')).toBeInTheDocument();
        expect(screen.getByText('João Silva')).toBeInTheDocument();
        expect(screen.getByText('joao@email.com')).toBeInTheDocument();
        expect(screen.getByText('Pessoa Física')).toBeInTheDocument();
      });
    });

    test('deve exibir informações da propriedade', async () => {
      db.budgets.getById.mockResolvedValue({ data: mockBudgetDetails, error: null });

      renderWithRouter(<BudgetDetails />);

      await waitFor(() => {
        expect(screen.getByText('🏞️ Informações da Propriedade')).toBeInTheDocument();
        expect(screen.getByText('Fazenda São José')).toBeInTheDocument();
        expect(screen.getByText('São Paulo - SP')).toBeInTheDocument();
        expect(screen.getByText('4')).toBeInTheDocument(); // vertices
        expect(screen.getByText('10.5 ha')).toBeInTheDocument(); // area
      });
    });

    test('deve exibir descrição quando disponível', async () => {
      db.budgets.getById.mockResolvedValue({ data: mockBudgetDetails, error: null });

      renderWithRouter(<BudgetDetails />);

      await waitFor(() => {
        expect(screen.getByText('Levantamento topográfico para regularização')).toBeInTheDocument();
      });
    });
  });

  describe('Exibição do resultado do orçamento', () => {
    test('deve exibir resultado do orçamento quando disponível', async () => {
      db.budgets.getById.mockResolvedValue({ data: mockBudgetDetails, error: null });

      renderWithRouter(<BudgetDetails />);

      await waitFor(() => {
        expect(screen.getByText('💰 Resultado do Orçamento')).toBeInTheDocument();
        expect(screen.getByText('R$ 5.000,00')).toBeInTheDocument();
        expect(screen.getByText('Levantamento topográfico')).toBeInTheDocument();
        expect(screen.getByText('R$ 3.000,00')).toBeInTheDocument();
        expect(screen.getByText('Relatório técnico')).toBeInTheDocument();
        expect(screen.getByText('R$ 2.000,00')).toBeInTheDocument();
      });
    });

    test('deve exibir informações adicionais do orçamento', async () => {
      db.budgets.getById.mockResolvedValue({ data: mockBudgetDetails, error: null });

      renderWithRouter(<BudgetDetails />);

      await waitFor(() => {
        expect(screen.getByText('15-20 dias úteis')).toBeInTheDocument(); // execution_time
        expect(screen.getByText('30 dias')).toBeInTheDocument(); // validity
        expect(screen.getByText('À vista com 10% desconto')).toBeInTheDocument(); // payment_terms
      });
    });

    test('deve exibir mensagem quando orçamento não tem resultado', async () => {
      db.budgets.getById.mockResolvedValue({ data: mockEmptyBudget, error: null });

      renderWithRouter(<BudgetDetails />);

      await waitFor(() => {
        expect(screen.getByText('📝 Orçamento ainda não foi calculado')).toBeInTheDocument();
      });
    });
  });

  describe('Status e badges', () => {
    test('deve exibir badge de status corretamente', async () => {
      db.budgets.getById.mockResolvedValue({ data: mockBudgetDetails, error: null });

      renderWithRouter(<BudgetDetails />);

      await waitFor(() => {
        expect(screen.getByText('Ativo')).toBeInTheDocument();
      });
    });

    test('deve exibir diferentes status corretamente', async () => {
      const budgetApproved = { ...mockBudgetDetails, status: 'approved' };
      db.budgets.getById.mockResolvedValue({ data: budgetApproved, error: null });

      renderWithRouter(<BudgetDetails />);

      await waitFor(() => {
        expect(screen.getByText('Aprovado')).toBeInTheDocument();
      });
    });
  });

  describe('Timeline de atividades', () => {
    test('deve exibir timeline quando disponível', async () => {
      db.budgets.getById.mockResolvedValue({ data: mockBudgetDetails, error: null });

      renderWithRouter(<BudgetDetails />);

      await waitFor(() => {
        expect(screen.getByText('📅 Histórico de Atividades')).toBeInTheDocument();
        expect(screen.getByText('Orçamento criado')).toBeInTheDocument();
        expect(screen.getByText('Orçamento enviado para cliente')).toBeInTheDocument();
        expect(screen.getByText('Sistema')).toBeInTheDocument();
        expect(screen.getByText('Admin')).toBeInTheDocument();
      });
    });

    test('deve exibir mensagem quando não há atividades', async () => {
      db.budgets.getById.mockResolvedValue({ data: mockEmptyBudget, error: null });

      renderWithRouter(<BudgetDetails />);

      await waitFor(() => {
        expect(screen.getByText('📅 Histórico de Atividades')).toBeInTheDocument();
        expect(screen.getByText('📝 Nenhuma atividade registrada ainda')).toBeInTheDocument();
      });
    });

    test('deve formatar datas da timeline corretamente', async () => {
      db.budgets.getById.mockResolvedValue({ data: mockBudgetDetails, error: null });

      renderWithRouter(<BudgetDetails />);

      await waitFor(() => {
        // Verifica se as datas estão formatadas (formato brasileiro)
        expect(screen.getByText(/01\/01\/2024/)).toBeInTheDocument();
      });
    });
  });

  describe('Ações do orçamento', () => {
    test('deve exibir botões de ação', async () => {
      db.budgets.getById.mockResolvedValue({ data: mockBudgetDetails, error: null });

      renderWithRouter(<BudgetDetails />);

      await waitFor(() => {
        expect(screen.getByText('✏️ Editar Orçamento')).toBeInTheDocument();
        expect(screen.getByText('📧 Enviar por Email')).toBeInTheDocument();
        expect(screen.getByText('📄 Gerar PDF')).toBeInTheDocument();
        expect(screen.getByText('🗑️ Excluir')).toBeInTheDocument();
      });
    });

    test('deve confirmar antes de excluir orçamento', async () => {
      db.budgets.getById.mockResolvedValue({ data: mockBudgetDetails, error: null });
      window.confirm = jest.fn(() => false);

      renderWithRouter(<BudgetDetails />);

      await waitFor(() => {
        const deleteButton = screen.getByText('🗑️ Excluir');
        fireEvent.click(deleteButton);
      });

      expect(window.confirm).toHaveBeenCalledWith('Tem certeza que deseja excluir este orçamento?');
    });

    test('deve executar exclusão quando confirmada', async () => {
      db.budgets.getById.mockResolvedValue({ data: mockBudgetDetails, error: null });
      db.budgets.delete.mockResolvedValue({ data: true, error: null });
      window.confirm = jest.fn(() => true);

      const mockNavigate = jest.fn();
      require('react-router-dom').useNavigate.mockReturnValue(mockNavigate);

      renderWithRouter(<BudgetDetails />);

      await waitFor(() => {
        const deleteButton = screen.getByText('🗑️ Excluir');
        fireEvent.click(deleteButton);
      });

      await waitFor(() => {
        expect(db.budgets.delete).toHaveBeenCalledWith('budget-123');
      });
    });
  });

  describe('Tratamento de erros', () => {
    test('deve exibir mensagem de erro quando falha ao carregar orçamento', async () => {
      db.budgets.getById.mockResolvedValue({ 
        data: null, 
        error: { message: 'Orçamento não encontrado' } 
      });

      renderWithRouter(<BudgetDetails />);

      await waitFor(() => {
        expect(screen.getByText(/❌.*Erro ao carregar orçamento: Orçamento não encontrado/)).toBeInTheDocument();
      });
    });

    test('deve exibir botão para tentar novamente em caso de erro', async () => {
      db.budgets.getById.mockResolvedValue({ 
        data: null, 
        error: { message: 'Erro de conexão' } 
      });

      renderWithRouter(<BudgetDetails />);

      await waitFor(() => {
        expect(screen.getByText('🔄 Tentar Novamente')).toBeInTheDocument();
      });
    });

    test('deve recarregar dados ao clicar em "Tentar Novamente"', async () => {
      db.budgets.getById
        .mockResolvedValueOnce({ data: null, error: { message: 'Erro de conexão' } })
        .mockResolvedValueOnce({ data: mockBudgetDetails, error: null });

      renderWithRouter(<BudgetDetails />);

      await waitFor(() => {
        const retryButton = screen.getByText('🔄 Tentar Novamente');
        fireEvent.click(retryButton);
      });

      await waitFor(() => {
        expect(screen.getByText('João Silva')).toBeInTheDocument();
      });

      expect(db.budgets.getById).toHaveBeenCalledTimes(2);
    });

    test('deve exibir erro quando falha ao excluir orçamento', async () => {
      db.budgets.getById.mockResolvedValue({ data: mockBudgetDetails, error: null });
      db.budgets.delete.mockResolvedValue({ 
        data: null, 
        error: { message: 'Não foi possível excluir' } 
      });
      window.confirm = jest.fn(() => true);

      renderWithRouter(<BudgetDetails />);

      await waitFor(() => {
        const deleteButton = screen.getByText('🗑️ Excluir');
        fireEvent.click(deleteButton);
      });

      await waitFor(() => {
        expect(screen.getByText(/❌.*Erro ao excluir orçamento: Não foi possível excluir/)).toBeInTheDocument();
      });
    });
  });

  describe('Link público', () => {
    test('deve exibir link público do orçamento', async () => {
      db.budgets.getById.mockResolvedValue({ data: mockBudgetDetails, error: null });

      renderWithRouter(<BudgetDetails />);

      await waitFor(() => {
        expect(screen.getByText('🔗 Link Público')).toBeInTheDocument();
        expect(screen.getByText(/orcamento-123/)).toBeInTheDocument();
      });
    });

    test('deve ter botão para copiar link', async () => {
      db.budgets.getById.mockResolvedValue({ data: mockBudgetDetails, error: null });

      renderWithRouter(<BudgetDetails />);

      await waitFor(() => {
        expect(screen.getByText('📋 Copiar Link')).toBeInTheDocument();
      });
    });
  });

  describe('Formatação de dados', () => {
    test('deve formatar valores monetários corretamente', async () => {
      db.budgets.getById.mockResolvedValue({ data: mockBudgetDetails, error: null });

      renderWithRouter(<BudgetDetails />);

      await waitFor(() => {
        expect(screen.getByText('R$ 5.000,00')).toBeInTheDocument();
        expect(screen.getByText('R$ 3.000,00')).toBeInTheDocument();
        expect(screen.getByText('R$ 2.000,00')).toBeInTheDocument();
      });
    });

    test('deve formatar tipo de cliente corretamente', async () => {
      db.budgets.getById.mockResolvedValue({ data: mockBudgetDetails, error: null });

      renderWithRouter(<BudgetDetails />);

      await waitFor(() => {
        expect(screen.getByText('Pessoa Física')).toBeInTheDocument();
      });
    });

    test('deve formatar área da propriedade corretamente', async () => {
      db.budgets.getById.mockResolvedValue({ data: mockBudgetDetails, error: null });

      renderWithRouter(<BudgetDetails />);

      await waitFor(() => {
        expect(screen.getByText('10.5 ha')).toBeInTheDocument();
      });
    });
  });

  describe('Estados condicionais', () => {
    test('deve ocultar seção de resultado quando não disponível', async () => {
      db.budgets.getById.mockResolvedValue({ data: mockEmptyBudget, error: null });

      renderWithRouter(<BudgetDetails />);

      await waitFor(() => {
        expect(screen.queryByText('💰 Resultado do Orçamento')).not.toBeInTheDocument();
        expect(screen.getByText('📝 Orçamento ainda não foi calculado')).toBeInTheDocument();
      });
    });

    test('deve ocultar timeline quando vazia', async () => {
      db.budgets.getById.mockResolvedValue({ data: mockEmptyBudget, error: null });

      renderWithRouter(<BudgetDetails />);

      await waitFor(() => {
        expect(screen.getByText('📝 Nenhuma atividade registrada ainda')).toBeInTheDocument();
      });
    });

    test('deve exibir campos opcionais apenas quando preenchidos', async () => {
      const budgetWithoutOptionalFields = {
        ...mockBudgetDetails,
        budget_request: {
          ...mockBudgetDetails.budget_request,
          description: undefined
        }
      };
      
      db.budgets.getById.mockResolvedValue({ data: budgetWithoutOptionalFields, error: null });

      renderWithRouter(<BudgetDetails />);

      await waitFor(() => {
        expect(screen.queryByText('Levantamento topográfico para regularização')).not.toBeInTheDocument();
      });
    });
  });
});