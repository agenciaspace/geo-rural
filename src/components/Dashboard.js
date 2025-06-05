import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useAuth } from '../hooks/useAuth';
import { db } from '../config/supabase';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);

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
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Bem-vindo, {user?.email}
          </p>
        </div>
        <Button variant="outline" onClick={handleSignOut}>
          Sair
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{budgets.length}</CardTitle>
            <CardDescription>Orçamentos Criados</CardDescription>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{analyses.length}</CardTitle>
            <CardDescription>Análises GNSS</CardDescription>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              {analyses.filter(a => a.quality_status === 'EXCELENTE').length}
            </CardTitle>
            <CardDescription>Análises Excelentes</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Orçamentos Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Orçamentos Recentes</CardTitle>
          <CardDescription>Seus últimos orçamentos criados</CardDescription>
        </CardHeader>
        <CardContent>
          {budgets.length > 0 ? (
            <div className="space-y-4">
              {budgets.slice(0, 5).map((budget) => (
                <div key={budget.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{budget.client_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {budget.property_name} - {budget.city}, {budget.state}
                      </p>
                      <p className="text-sm">
                        {budget.vertices_count} vértices • {budget.property_area} hectares
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">
                        R$ {budget.total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <Badge variant="outline">{budget.status}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Nenhum orçamento criado ainda.</p>
          )}
        </CardContent>
      </Card>

      {/* Análises GNSS Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Análises GNSS Recentes</CardTitle>
          <CardDescription>Seus últimos arquivos analisados</CardDescription>
        </CardHeader>
        <CardContent>
          {analyses.length > 0 ? (
            <div className="space-y-4">
              {analyses.slice(0, 5).map((analysis) => (
                <div key={analysis.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{analysis.file_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {analysis.satellites_count} satélites • {analysis.duration_hours}h de observação
                      </p>
                      <p className="text-sm">
                        {new Date(analysis.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="text-right space-y-2">
                      <Badge variant={getQualityBadgeVariant(analysis.quality_color)}>
                        {analysis.quality_status}
                      </Badge>
                      {analysis.issues && analysis.issues.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {analysis.issues.length} questão(ões) identificada(s)
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Nenhuma análise GNSS realizada ainda.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;