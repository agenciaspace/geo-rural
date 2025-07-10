import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import BudgetHub from '../BudgetHub';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../config/supabase';

// Mock das dependências
jest.mock('../../hooks/useAuth');
jest.mock('../../config/supabase');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
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
const mockBudgets = [
  {
    id: '1',
    budget_request: {
      client_name: 'João Silva',
      client_email: 'joao@email.com',
      property_name: 'Fazenda São José',
      city: 'São Paulo',
      state: 'SP',
      vertices_count: 4,
      property_area: 10.5,
      client_type: 'pessoa_fisica'
    },
    budget_result: {
      total_price: 5000,
      breakdown: [
        { item: 'Levantamento', value: 3000 },
        { item: 'Relatório', value: 2000 }
      ]
    },
    status: 'active',
    custom_link: 'orcamento-123',
    created_at: '2024-01-01T10:00:00Z'
  },
  {
    id: '2',
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
    budget_result: {
      total_price: 8000,
      breakdown: [
        { item: 'Levantamento', value: 5000 },
        { item: 'Relatório', value: 3000 }
      ]
    },
    status: 'approved',
    custom_link: 'orcamento-456',
    created_at: '2024-01-02T10:00:00Z'
  }
];

const mockClients = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@email.com',
    phone: '(11) 99999-9999',
    client_type: 'pessoa_fisica'
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria@email.com',
    phone: '(21) 88888-8888',
    client_type: 'pessoa_juridica'
  }
];

describe('BudgetHub', () => {
  beforeEach(() => {
    // Mock do useAuth
    useAuth.mockReturnValue({
      isAuthenticated: true,
      user: { id: 'user1', email: 'user@test.com' }
    });

    // Mock das funções do banco
    db.budgets = {
      list: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    };

    db.clients = {
      list: jest.fn(),
      create: jest.fn()
    };

    // Reseta os mocks
    jest.clearAllMocks();
  });

  describe('Renderização inicial', () => {
    test('deve renderizar o título e subtítulo corretamente', async () => {
      db.budgets.list.mockResolvedValue({ data: [], error: null });
      db.clients.list.mockResolvedValue({ data: [], error: null });

      await act(async () => {
        renderWithRouter(<BudgetHub />);
      });

      expect(screen.getByText('🏢 Central de Orçamentos')).toBeInTheDocument();
      expect(screen.getByText('Crie, edite e gerencie todos os seus orçamentos em um só lugar')).toBeInTheDocument();
    });

    test('deve renderizar os botões de navegação', async () => {
      db.budgets.list.mockResolvedValue({ data: [], error: null });
      db.clients.list.mockResolvedValue({ data: [], error: null });

      await act(async () => {
        renderWithRouter(<BudgetHub />);
      });

      expect(screen.getByText('📋 Listar Orçamentos')).toBeInTheDocument();
      expect(screen.getByText('➕ Criar Orçamento')).toBeInTheDocument();
    });

    test('deve chamar as funções de carregamento na inicialização', async () => {
      db.budgets.list.mockResolvedValue({ data: mockBudgets, error: null });
      db.clients.list.mockResolvedValue({ data: mockClients, error: null });

      await act(async () => {
        renderWithRouter(<BudgetHub />);
      });

      await waitFor(() => {
        expect(db.budgets.list).toHaveBeenCalled();
        expect(db.clients.list).toHaveBeenCalled();
      }, { timeout: 3000 });
    });
  });

  describe('Lista de orçamentos', () => {
    test('deve exibir orçamentos carregados', async () => {
      db.budgets.list.mockResolvedValue({ data: mockBudgets, error: null });
      db.clients.list.mockResolvedValue({ data: mockClients, error: null });

      await act(async () => {
        renderWithRouter(<BudgetHub />);
      });

      await waitFor(() => {
        expect(screen.getByText('João Silva')).toBeInTheDocument();
        expect(screen.getByText('Maria Santos')).toBeInTheDocument();
        expect(screen.getByText('Fazenda São José')).toBeInTheDocument();
        expect(screen.getByText('Sítio Esperança')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    test('deve exibir mensagem quando não há orçamentos', async () => {
      db.budgets.list.mockResolvedValue({ data: [], error: null });
      db.clients.list.mockResolvedValue({ data: [], error: null });

      await act(async () => {
        renderWithRouter(<BudgetHub />);
      });

      await waitFor(() => {
        expect(screen.getByText('📝 Nenhum orçamento criado ainda')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    test('deve filtrar orçamentos por termo de busca', async () => {
      db.budgets.list.mockResolvedValue({ data: mockBudgets, error: null });
      db.clients.list.mockResolvedValue({ data: mockClients, error: null });

      await act(async () => {
        renderWithRouter(<BudgetHub />);
      });

      await waitFor(() => {
        expect(screen.getByText('João Silva')).toBeInTheDocument();
        expect(screen.getByText('Maria Santos')).toBeInTheDocument();
      }, { timeout: 3000 });

      const searchInput = screen.getByPlaceholderText('🔍 Buscar por cliente ou propriedade...');
      
      await act(async () => {
        fireEvent.change(searchInput, { target: { value: 'João' } });
      });

      expect(screen.getByText('João Silva')).toBeInTheDocument();
      expect(screen.queryByText('Maria Santos')).not.toBeInTheDocument();
    });
  });

  describe('Ações dos orçamentos', () => {
    test('deve ter botão "Ver Detalhes" para cada orçamento', async () => {
      db.budgets.list.mockResolvedValue({ data: mockBudgets, error: null });
      db.clients.list.mockResolvedValue({ data: mockClients, error: null });

      await act(async () => {
        renderWithRouter(<BudgetHub />);
      });

      await waitFor(() => {
        const detailsButtons = screen.getAllByText('📄 Ver Detalhes');
        expect(detailsButtons).toHaveLength(2);
      }, { timeout: 3000 });
    });

    test('deve ter botão "Editar" para cada orçamento', async () => {
      db.budgets.list.mockResolvedValue({ data: mockBudgets, error: null });
      db.clients.list.mockResolvedValue({ data: mockClients, error: null });

      await act(async () => {
        renderWithRouter(<BudgetHub />);
      });

      await waitFor(() => {
        const editButtons = screen.getAllByText('✏️ Editar');
        expect(editButtons).toHaveLength(2);
      }, { timeout: 3000 });
    });

    test('deve ter botão "Excluir" para cada orçamento', async () => {
      db.budgets.list.mockResolvedValue({ data: mockBudgets, error: null });
      db.clients.list.mockResolvedValue({ data: mockClients, error: null });

      await act(async () => {
        renderWithRouter(<BudgetHub />);
      });

      await waitFor(() => {
        const deleteButtons = screen.getAllByText('🗑️ Excluir');
        expect(deleteButtons).toHaveLength(2);
      }, { timeout: 3000 });
    });
  });

  describe('Navegação entre views', () => {
    test('deve mudar para view de criação ao clicar em "Criar Orçamento"', async () => {
      db.budgets.list.mockResolvedValue({ data: [], error: null });
      db.clients.list.mockResolvedValue({ data: mockClients, error: null });

      renderWithRouter(<BudgetHub />);

      const createButton = screen.getByText('➕ Criar Orçamento');
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(screen.getByText('➕ Criar Novo Orçamento')).toBeInTheDocument();
      });
    });

    test('deve voltar para lista ao clicar em "Listar Orçamentos"', async () => {
      db.budgets.list.mockResolvedValue({ data: mockBudgets, error: null });
      db.clients.list.mockResolvedValue({ data: mockClients, error: null });

      renderWithRouter(<BudgetHub />);

      // Vai para criação
      const createButton = screen.getByText('➕ Criar Orçamento');
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(screen.getByText('➕ Criar Novo Orçamento')).toBeInTheDocument();
      });

      // Volta para lista
      const listButton = screen.getByText('📋 Listar Orçamentos');
      fireEvent.click(listButton);

      await waitFor(() => {
        expect(screen.getByText('João Silva')).toBeInTheDocument();
      });
    });
  });

  describe('Tratamento de erros', () => {
    test('deve exibir mensagem de erro quando falha ao carregar orçamentos', async () => {
      db.budgets.list.mockResolvedValue({ 
        data: null, 
        error: { message: 'Erro de conexão' } 
      });
      db.clients.list.mockResolvedValue({ data: [], error: null });

      renderWithRouter(<BudgetHub />);

      await waitFor(() => {
        expect(screen.getByText(/❌.*Erro de conexão/)).toBeInTheDocument();
      });
    });

    test('deve exibir mensagem de erro quando falha ao carregar clientes', async () => {
      db.budgets.list.mockResolvedValue({ data: [], error: null });
      db.clients.list.mockResolvedValue({ 
        data: null, 
        error: { message: 'Erro ao carregar clientes' } 
      });

      renderWithRouter(<BudgetHub />);

      await waitFor(() => {
        expect(screen.getByText(/❌.*Erro ao carregar clientes/)).toBeInTheDocument();
      });
    });
  });

  describe('Estados de loading', () => {
    test('deve mostrar estado de loading durante carregamento', async () => {
      // Mock para delay no carregamento
      db.budgets.list.mockImplementation(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({ data: [], error: null }), 100)
        )
      );
      db.clients.list.mockResolvedValue({ data: [], error: null });

      renderWithRouter(<BudgetHub />);

      expect(screen.getByText('⏳ Carregando orçamentos...')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByText('⏳ Carregando orçamentos...')).not.toBeInTheDocument();
      });
    });
  });

  describe('Validação de formulário', () => {
    test('deve desabilitar botão de criar quando formulário está inválido', async () => {
      db.budgets.list.mockResolvedValue({ data: [], error: null });
      db.clients.list.mockResolvedValue({ data: mockClients, error: null });

      renderWithRouter(<BudgetHub />);

      const createButton = screen.getByText('➕ Criar Orçamento');
      fireEvent.click(createButton);

      await waitFor(() => {
        const submitButton = screen.getByText('💾 Criar Orçamento');
        expect(submitButton).toBeDisabled();
      });
    });
  });
});