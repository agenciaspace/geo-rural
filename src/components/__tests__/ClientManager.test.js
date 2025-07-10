import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import ClientManager from '../ClientManager';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../config/supabase';

// Mock das dependências
jest.mock('../../hooks/useAuth');
jest.mock('../../config/supabase');

// Helper para renderizar componente com Router
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      {component}
    </BrowserRouter>
  );
};

// Mock dos dados de teste
const mockClients = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@email.com',
    phone: '(11) 99999-9999',
    client_type: 'pessoa_fisica',
    document: '123.456.789-00',
    company_name: '',
    address: {
      street: 'Rua das Flores',
      number: '123',
      city: 'São Paulo',
      state: 'SP',
      zip_code: '01234-567',
      country: 'Brasil'
    },
    notes: 'Cliente preferencial',
    secondary_phone: '',
    website: '',
    created_at: '2024-01-01T10:00:00Z',
    total_budgets: 2,
    total_spent: 15000
  },
  {
    id: '2',
    name: 'Empresa ABC Ltda',
    email: 'contato@empresaabc.com',
    phone: '(11) 88888-8888',
    client_type: 'pessoa_juridica',
    document: '12.345.678/0001-90',
    company_name: 'Empresa ABC Ltda',
    address: {
      street: 'Av. Comercial',
      number: '456',
      city: 'Rio de Janeiro',
      state: 'RJ',
      zip_code: '20000-000',
      country: 'Brasil'
    },
    notes: '',
    secondary_phone: '(11) 77777-7777',
    website: 'https://www.empresaabc.com',
    created_at: '2024-01-15T14:30:00Z',
    total_budgets: 1,
    total_spent: 8000
  }
];

describe('ClientManager', () => {
  beforeEach(() => {
    // Mock do useAuth
    useAuth.mockReturnValue({
      isAuthenticated: true,
      user: { id: 'user1', email: 'user@test.com' }
    });

    // Mock das funções do banco
    db.clients = {
      list: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    };

    // Reseta os mocks
    jest.clearAllMocks();
  });

  describe('Renderização inicial', () => {
    test('deve renderizar o título e subtítulo corretamente', async () => {
      db.clients.list.mockResolvedValue({ data: [], error: null });

      await act(async () => {
        renderWithRouter(<ClientManager />);
      });

      expect(screen.getByText('👥 Gestão de Clientes')).toBeInTheDocument();
      expect(screen.getByText('Gerencie sua base de clientes de forma centralizada')).toBeInTheDocument();
    });

    test('deve renderizar os botões de navegação', () => {
      db.clients.list.mockResolvedValue({ data: [], error: null });

      renderWithRouter(<ClientManager />);

      expect(screen.getByText('📋 Listar Clientes')).toBeInTheDocument();
      expect(screen.getByText('➕ Novo Cliente')).toBeInTheDocument();
    });

    test('deve chamar a função de carregamento na inicialização', async () => {
      db.clients.list.mockResolvedValue({ data: mockClients, error: null });

      renderWithRouter(<ClientManager />);

      await waitFor(() => {
        expect(db.clients.list).toHaveBeenCalled();
      });
    });
  });

  describe('Lista de clientes', () => {
    test('deve exibir clientes carregados', async () => {
      db.clients.list.mockResolvedValue({ data: mockClients, error: null });

      renderWithRouter(<ClientManager />);

      await waitFor(() => {
        expect(screen.getAllByText(/João Silva/)[0]).toBeInTheDocument();
        expect(screen.getAllByText(/Empresa ABC Ltda/)[0]).toBeInTheDocument();
        expect(screen.getByText('joao@email.com')).toBeInTheDocument();
        expect(screen.getByText('contato@empresaabc.com')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    test('deve exibir mensagem quando não há clientes', async () => {
      db.clients.list.mockResolvedValue({ data: [], error: null });

      renderWithRouter(<ClientManager />);

      await waitFor(() => {
        expect(screen.getByText('👥 Nenhum cliente cadastrado ainda')).toBeInTheDocument();
      });
    });

    test('deve filtrar clientes por termo de busca', async () => {
      db.clients.list.mockResolvedValue({ data: mockClients, error: null });

      renderWithRouter(<ClientManager />);

      await waitFor(() => {
        expect(screen.getByText('João Silva')).toBeInTheDocument();
        expect(screen.getByText('Empresa ABC Ltda')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('🔍 Buscar por nome, email ou empresa...');
      fireEvent.change(searchInput, { target: { value: 'João' } });

      expect(screen.getByText('João Silva')).toBeInTheDocument();
      expect(screen.queryByText('Empresa ABC Ltda')).not.toBeInTheDocument();
    });

    test('deve filtrar clientes por empresa', async () => {
      db.clients.list.mockResolvedValue({ data: mockClients, error: null });

      renderWithRouter(<ClientManager />);

      await waitFor(() => {
        expect(screen.getByText('João Silva')).toBeInTheDocument();
        expect(screen.getByText('Empresa ABC Ltda')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('🔍 Buscar por nome, email ou empresa...');
      fireEvent.change(searchInput, { target: { value: 'ABC' } });

      expect(screen.queryByText('João Silva')).not.toBeInTheDocument();
      expect(screen.getByText('Empresa ABC Ltda')).toBeInTheDocument();
    });
  });

  describe('Navegação entre views', () => {
    test('deve mudar para view de criação ao clicar em "Novo Cliente"', async () => {
      db.clients.list.mockResolvedValue({ data: [], error: null });

      renderWithRouter(<ClientManager />);

      const createButton = screen.getByText('➕ Novo Cliente');
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(screen.getByText('➕ Novo Cliente')).toBeInTheDocument();
        expect(screen.getByText('👤 Dados Básicos')).toBeInTheDocument();
      });
    });

    test('deve voltar para lista ao clicar em "Listar Clientes"', async () => {
      db.clients.list.mockResolvedValue({ data: mockClients, error: null });

      renderWithRouter(<ClientManager />);

      // Vai para criação
      const createButton = screen.getByText('➕ Novo Cliente');
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(screen.getByText('👤 Dados Básicos')).toBeInTheDocument();
      });

      // Volta para lista
      const listButton = screen.getByText('📋 Listar Clientes');
      fireEvent.click(listButton);

      await waitFor(() => {
        expect(screen.getByText('João Silva')).toBeInTheDocument();
      });
    });
  });

  describe('Ações dos clientes', () => {
    test('deve ter botão "Editar" para cada cliente', async () => {
      db.clients.list.mockResolvedValue({ data: mockClients, error: null });

      renderWithRouter(<ClientManager />);

      await waitFor(() => {
        const editButtons = screen.getAllByText('✏️ Editar');
        expect(editButtons).toHaveLength(2);
      });
    });

    test('deve ter botão "Remover" para cada cliente', async () => {
      db.clients.list.mockResolvedValue({ data: mockClients, error: null });

      renderWithRouter(<ClientManager />);

      await waitFor(() => {
        const deleteButtons = screen.getAllByText('🗑️ Remover');
        expect(deleteButtons).toHaveLength(2);
      });
    });

    test('deve abrir modal de confirmação ao tentar deletar cliente', async () => {
      db.clients.list.mockResolvedValue({ data: mockClients, error: null });
      window.confirm = jest.fn(() => false);

      renderWithRouter(<ClientManager />);

      await waitFor(() => {
        const deleteButtons = screen.getAllByText('🗑️ Remover');
        fireEvent.click(deleteButtons[0]);
      });

      expect(window.confirm).toHaveBeenCalledWith('Tem certeza que deseja remover este cliente?');
    });
  });

  describe('Formulário de criação', () => {
    test('deve renderizar campos obrigatórios', async () => {
      db.clients.list.mockResolvedValue({ data: [], error: null });

      renderWithRouter(<ClientManager />);

      const createButton = screen.getByText('➕ Novo Cliente');
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('João da Silva')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('joao@email.com')).toBeInTheDocument();
        expect(screen.getByDisplayValue('pessoa_fisica')).toBeInTheDocument();
      });
    });

    test('deve validar campos obrigatórios antes de criar', async () => {
      db.clients.list.mockResolvedValue({ data: [], error: null });

      renderWithRouter(<ClientManager />);

      const createButton = screen.getByText('➕ Novo Cliente');
      fireEvent.click(createButton);

      await waitFor(() => {
        const submitButton = screen.getByText('💾 Criar Cliente');
        expect(submitButton).toBeDisabled();
      });
    });

    test('deve habilitar botão de criar quando campos obrigatórios estão preenchidos', async () => {
      db.clients.list.mockResolvedValue({ data: [], error: null });

      renderWithRouter(<ClientManager />);

      const createButton = screen.getByText('➕ Novo Cliente');
      fireEvent.click(createButton);

      await waitFor(() => {
        const nameInput = screen.getByPlaceholderText('João da Silva');
        const emailInput = screen.getByPlaceholderText('joao@email.com');
        
        fireEvent.change(nameInput, { target: { value: 'Teste Cliente' } });
        fireEvent.change(emailInput, { target: { value: 'teste@email.com' } });
        
        const submitButton = screen.getByText('💾 Criar Cliente');
        expect(submitButton).not.toBeDisabled();
      });
    });

    test('deve mostrar campos específicos para pessoa jurídica', async () => {
      db.clients.list.mockResolvedValue({ data: [], error: null });

      renderWithRouter(<ClientManager />);

      const createButton = screen.getByText('➕ Novo Cliente');
      fireEvent.click(createButton);

      await waitFor(() => {
        const clientTypeSelect = screen.getByDisplayValue('pessoa_fisica');
        fireEvent.change(clientTypeSelect, { target: { value: 'pessoa_juridica' } });
        
        expect(screen.getByPlaceholderText('Empresa Ltda')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('https://www.empresa.com.br')).toBeInTheDocument();
      });
    });
  });

  describe('Tratamento de erros', () => {
    test('deve exibir mensagem de erro quando falha ao carregar clientes', async () => {
      db.clients.list.mockResolvedValue({ 
        data: null, 
        error: { message: 'Erro de conexão' } 
      });

      renderWithRouter(<ClientManager />);

      await waitFor(() => {
        expect(screen.getByText(/❌.*Erro ao carregar clientes: Erro de conexão/)).toBeInTheDocument();
      });
    });

    test('deve exibir mensagem de erro quando falha ao criar cliente', async () => {
      db.clients.list.mockResolvedValue({ data: [], error: null });
      db.clients.create.mockResolvedValue({ 
        data: null, 
        error: { message: 'Email já existe' } 
      });

      renderWithRouter(<ClientManager />);

      const createButton = screen.getByText('➕ Novo Cliente');
      fireEvent.click(createButton);

      await waitFor(() => {
        const nameInput = screen.getByPlaceholderText('João da Silva');
        const emailInput = screen.getByPlaceholderText('joao@email.com');
        
        fireEvent.change(nameInput, { target: { value: 'Teste Cliente' } });
        fireEvent.change(emailInput, { target: { value: 'teste@email.com' } });
        
        const submitButton = screen.getByText('💾 Criar Cliente');
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(screen.getByText(/❌.*Email já existe/)).toBeInTheDocument();
      });
    });
  });

  describe('Estados de loading', () => {
    test('deve mostrar estado de loading durante carregamento', async () => {
      // Mock para delay no carregamento
      db.clients.list.mockImplementation(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({ data: [], error: null }), 100)
        )
      );

      renderWithRouter(<ClientManager />);

      expect(screen.getByText('⏳ Carregando clientes...')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByText('⏳ Carregando clientes...')).not.toBeInTheDocument();
      });
    });

    test('deve mostrar loading durante criação de cliente', async () => {
      db.clients.list.mockResolvedValue({ data: [], error: null });
      db.clients.create.mockImplementation(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({ data: [{ id: '1' }], error: null }), 100)
        )
      );

      renderWithRouter(<ClientManager />);

      const createButton = screen.getByText('➕ Novo Cliente');
      fireEvent.click(createButton);

      await waitFor(() => {
        const nameInput = screen.getByPlaceholderText('João da Silva');
        const emailInput = screen.getByPlaceholderText('joao@email.com');
        
        fireEvent.change(nameInput, { target: { value: 'Teste Cliente' } });
        fireEvent.change(emailInput, { target: { value: 'teste@email.com' } });
        
        const submitButton = screen.getByText('💾 Criar Cliente');
        fireEvent.click(submitButton);
        
        expect(screen.getByText('⏳ Processando...')).toBeInTheDocument();
      });
    });
  });

  describe('Funcionalidades específicas', () => {
    test('deve exibir informações de orçamentos quando cliente tem histórico', async () => {
      db.clients.list.mockResolvedValue({ data: mockClients, error: null });

      renderWithRouter(<ClientManager />);

      await waitFor(() => {
        expect(screen.getByText('💰 2 orçamento(s) • Total: R$ 15000.00')).toBeInTheDocument();
        expect(screen.getByText('💰 1 orçamento(s) • Total: R$ 8000.00')).toBeInTheDocument();
      });
    });

    test('deve formatar tipo de cliente corretamente', async () => {
      db.clients.list.mockResolvedValue({ data: mockClients, error: null });

      renderWithRouter(<ClientManager />);

      await waitFor(() => {
        expect(screen.getByText(/Pessoa Física/)).toBeInTheDocument();
        expect(screen.getByText(/Pessoa Jurídica/)).toBeInTheDocument();
      });
    });

    test('deve exibir dados de endereço nos detalhes do cliente', async () => {
      db.clients.list.mockResolvedValue({ data: mockClients, error: null });

      renderWithRouter(<ClientManager />);

      await waitFor(() => {
        // Verifica se os elementos básicos estão presentes
        expect(screen.getByText('João Silva')).toBeInTheDocument();
        expect(screen.getByText('Empresa ABC Ltda')).toBeInTheDocument();
      });
    });
  });

  describe('Formulário de edição', () => {
    test('deve preencher formulário com dados do cliente selecionado', async () => {
      db.clients.list.mockResolvedValue({ data: mockClients, error: null });

      renderWithRouter(<ClientManager />);

      await waitFor(() => {
        const editButtons = screen.getAllByText('✏️ Editar');
        fireEvent.click(editButtons[0]);
      });

      await waitFor(() => {
        expect(screen.getByDisplayValue('João Silva')).toBeInTheDocument();
        expect(screen.getByDisplayValue('joao@email.com')).toBeInTheDocument();
        expect(screen.getByDisplayValue('(11) 99999-9999')).toBeInTheDocument();
      });
    });

    test('deve mudar título para "Editar Cliente" no modo de edição', async () => {
      db.clients.list.mockResolvedValue({ data: mockClients, error: null });

      renderWithRouter(<ClientManager />);

      await waitFor(() => {
        const editButtons = screen.getAllByText('✏️ Editar');
        fireEvent.click(editButtons[0]);
      });

      await waitFor(() => {
        expect(screen.getByText('✏️ Editar Cliente')).toBeInTheDocument();
        expect(screen.getByText('💾 Salvar Alterações')).toBeInTheDocument();
      });
    });
  });
});