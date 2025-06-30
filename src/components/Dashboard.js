import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { useAuth } from '../hooks/useAuth';
import { db } from '../config/supabase';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Carregar orçamentos
      const { data: budgetsData, error: budgetsError } = await db.budgets.list();
      if (!budgetsError) {
        setBudgets(budgetsData || []);
      }
      
      // Carregar análises GNSS
      const { data: analysesData, error: analysesError } = await db.gnssAnalyses.list();
      if (!analysesError) {
        setAnalyses(analysesData || []);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const getQualityBadgeVariant = (color) => {
    switch (color) {
      case 'green': return 'default';
      case 'orange': return 'secondary';
      case 'red': return 'destructive';
      default: return 'outline';
    }
  };

  const filterData = (data, type) => {
    const filtered = data.filter(item => {
      const matchesSearch = type === 'budget' 
        ? item.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.property_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.city?.toLowerCase().includes(searchTerm.toLowerCase())
        : item.file_name?.toLowerCase().includes(searchTerm.toLowerCase());

      if (dateFilter === 'all') return matchesSearch;
      
      const itemDate = new Date(item.created_at);
      const now = new Date();
      
      switch (dateFilter) {
        case 'today':
          return matchesSearch && itemDate.toDateString() === now.toDateString();
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return matchesSearch && itemDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return matchesSearch && itemDate >= monthAgo;
        default:
          return matchesSearch;
      }
    });
    
    return filtered;
  };

  const getAnalyticsData = () => {
    const totalRevenue = budgets.reduce((sum, budget) => sum + (budget.total || 0), 0);
    const avgBudgetValue = budgets.length > 0 ? totalRevenue / budgets.length : 0;
    const excellentAnalyses = analyses.filter(a => a.quality_status === 'EXCELENTE').length;
    const goodAnalyses = analyses.filter(a => a.quality_status === 'BOA').length;
    const poorAnalyses = analyses.filter(a => a.quality_status === 'RUIM').length;
    
    return {
      totalRevenue,
      avgBudgetValue,
      excellentAnalyses,
      goodAnalyses,
      poorAnalyses,
      qualityRate: analyses.length > 0 ? ((excellentAnalyses + goodAnalyses) / analyses.length * 100).toFixed(1) : 0
    };
  };

  const analytics = getAnalyticsData();

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard PRECIZU</h1>
          <p className="text-muted-foreground">
            Bem-vindo, {user?.email}
          </p>
        </div>
        <Button variant="outline" onClick={handleSignOut}>
          Sair
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar por cliente, propriedade, arquivo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <div className="flex gap-2">
          <select 
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 border rounded-md bg-background"
          >
            <option value="all">Todos os períodos</option>
            <option value="today">Hoje</option>
            <option value="week">Última semana</option>
            <option value="month">Último mês</option>
          </select>
        </div>
      </div>

      {/* Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Receita Total</CardDescription>
            <CardTitle className="text-2xl text-green-600">
              R$ {analytics.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </CardTitle>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Orçamentos</CardDescription>
            <CardTitle className="text-2xl">{budgets.length}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Média: R$ {analytics.avgBudgetValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Análises GNSS</CardDescription>
            <CardTitle className="text-2xl">{analyses.length}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Taxa de qualidade: {analytics.qualityRate}%
            </p>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Qualidade Excelente</CardDescription>
            <CardTitle className="text-2xl text-green-600">
              {analytics.excellentAnalyses}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {analytics.goodAnalyses} boas, {analytics.poorAnalyses} ruins
            </p>
          </CardHeader>
        </Card>
      </div>

      {/* Tabs para diferentes visualizações */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="budgets">Orçamentos</TabsTrigger>
          <TabsTrigger value="analyses">Análises GNSS</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de Status dos Orçamentos */}
            <Card>
              <CardHeader>
                <CardTitle>Status dos Orçamentos</CardTitle>
                <CardDescription>Distribuição por status atual</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['draft', 'sent', 'approved', 'rejected'].map(status => {
                    const count = budgets.filter(b => b.status === status).length;
                    const percentage = budgets.length > 0 ? (count / budgets.length * 100).toFixed(1) : 0;
                    return (
                      <div key={status} className="flex items-center justify-between">
                        <span className="capitalize">{status === 'draft' ? 'Rascunho' : status === 'sent' ? 'Enviado' : status === 'approved' ? 'Aprovado' : 'Rejeitado'}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                status === 'approved' ? 'bg-green-600' : 
                                status === 'sent' ? 'bg-blue-600' : 
                                status === 'rejected' ? 'bg-red-600' : 'bg-gray-600'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-8">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Qualidade das Análises GNSS */}
            <Card>
              <CardHeader>
                <CardTitle>Qualidade das Análises</CardTitle>
                <CardDescription>Distribuição por nível de qualidade</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { status: 'EXCELENTE', color: 'bg-green-600', count: analytics.excellentAnalyses },
                    { status: 'BOA', color: 'bg-yellow-600', count: analytics.goodAnalyses },
                    { status: 'RUIM', color: 'bg-red-600', count: analytics.poorAnalyses }
                  ].map(({ status, color, count }) => {
                    const percentage = analyses.length > 0 ? (count / analyses.length * 100).toFixed(1) : 0;
                    return (
                      <div key={status} className="flex items-center justify-between">
                        <span>{status}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${color}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-8">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="budgets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Orçamentos ({filterData(budgets, 'budget').length})</CardTitle>
              <CardDescription>Todos os orçamentos criados</CardDescription>
            </CardHeader>
            <CardContent>
              {filterData(budgets, 'budget').length > 0 ? (
                <div className="space-y-4">
                  {filterData(budgets, 'budget').map((budget) => (
                    <div key={budget.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{budget.client_name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {budget.property_name} - {budget.city}, {budget.state}
                          </p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Vértices:</span> {budget.vertices_count}
                            </div>
                            <div>
                              <span className="font-medium">Área:</span> {budget.property_area} ha
                            </div>
                            <div>
                              <span className="font-medium">Tipo:</span> {budget.client_type}
                            </div>
                            <div>
                              <span className="font-medium">Data:</span> {new Date(budget.created_at).toLocaleDateString('pt-BR')}
                            </div>
                          </div>
                          {budget.additional_notes && (
                            <p className="text-sm text-muted-foreground mt-2">
                              <span className="font-medium">Observações:</span> {budget.additional_notes}
                            </p>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-xl font-bold text-green-600 mb-1">
                            R$ {budget.total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                          <Badge variant={
                            budget.status === 'approved' ? 'default' :
                            budget.status === 'sent' ? 'secondary' :
                            budget.status === 'rejected' ? 'destructive' : 'outline'
                          }>
                            {budget.status === 'draft' ? 'Rascunho' : 
                             budget.status === 'sent' ? 'Enviado' : 
                             budget.status === 'approved' ? 'Aprovado' : 'Rejeitado'}
                          </Badge>
                          {budget.is_urgent && (
                            <Badge variant="destructive" className="ml-1">Urgente</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    {searchTerm || dateFilter !== 'all' 
                      ? 'Nenhum orçamento encontrado com os filtros aplicados.' 
                      : 'Nenhum orçamento criado ainda.'
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analyses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análises GNSS ({filterData(analyses, 'analysis').length})</CardTitle>
              <CardDescription>Todas as análises de arquivos GNSS realizadas</CardDescription>
            </CardHeader>
            <CardContent>
              {filterData(analyses, 'analysis').length > 0 ? (
                <div className="space-y-4">
                  {filterData(analyses, 'analysis').map((analysis) => (
                    <div key={analysis.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{analysis.file_name}</h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mt-2">
                            <div>
                              <span className="font-medium">Satélites:</span> {analysis.satellites_count}
                            </div>
                            <div>
                              <span className="font-medium">Duração:</span> {analysis.duration_hours}h
                            </div>
                            <div>
                              <span className="font-medium">Data:</span> {new Date(analysis.created_at).toLocaleDateString('pt-BR')}
                            </div>
                          </div>
                          {analysis.satellites_list && analysis.satellites_list.length > 0 && (
                            <div className="mt-2">
                              <span className="text-sm font-medium">Constelações: </span>
                              <span className="text-sm text-muted-foreground">
                                {analysis.satellites_list.join(', ')}
                              </span>
                            </div>
                          )}
                          {analysis.processing_time_ms && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Processado em {analysis.processing_time_ms}ms
                            </p>
                          )}
                        </div>
                        <div className="text-right ml-4 space-y-2">
                          <Badge variant={getQualityBadgeVariant(analysis.quality_color)} className="text-sm">
                            {analysis.quality_status}
                          </Badge>
                          {analysis.issues && analysis.issues.length > 0 && (
                            <div className="text-xs text-muted-foreground">
                              <p>{analysis.issues.length} questão(ões):</p>
                              <ul className="list-disc list-inside mt-1 text-left">
                                {analysis.issues.slice(0, 3).map((issue, idx) => (
                                  <li key={idx} className="truncate max-w-48">{issue}</li>
                                ))}
                                {analysis.issues.length > 3 && (
                                  <li>+{analysis.issues.length - 3} mais...</li>
                                )}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                      {analysis.technical_report && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-sm">
                            <span className="font-medium">Relatório:</span>
                            <span className="text-muted-foreground ml-1">
                              {analysis.technical_report.length > 200 
                                ? `${analysis.technical_report.substring(0, 200)}...` 
                                : analysis.technical_report
                              }
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    {searchTerm || dateFilter !== 'all' 
                      ? 'Nenhuma análise encontrada com os filtros aplicados.' 
                      : 'Nenhuma análise GNSS realizada ainda.'
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;