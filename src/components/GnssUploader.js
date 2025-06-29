import React, { useState } from 'react';
import axios from '../config/axios';
import API_ENDPOINTS from '../config/api';
import GnssChartsDisplay from './GnssChartsDisplay';

const GnssUploader = () => {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (selectedFile) => {
    const allowedTypes = ['.21o', '.rnx', '.zip', '.obs', '.nav'];
    const fileExtension = selectedFile.name.toLowerCase().slice(selectedFile.name.lastIndexOf('.'));
    const maxSizeBytes = 100 * 1024 * 1024; // 100MB limite
    
    console.log('Arquivo selecionado:', {
      nome: selectedFile.name,
      tamanho: selectedFile.size,
      tamanhoMB: (selectedFile.size / 1024 / 1024).toFixed(2),
      extensao: fileExtension,
      limite: maxSizeBytes,
      limiteMB: (maxSizeBytes / 1024 / 1024)
    });
    
    if (!allowedTypes.includes(fileExtension)) {
      setError('Tipo de arquivo não suportado. Use arquivos RINEX (.21O, .RNX, .OBS, .NAV) ou .ZIP');
      setFile(null);
      return;
    }
    
    if (selectedFile.size > maxSizeBytes) {
      setError(`Arquivo muito grande. Tamanho máximo: 100MB. Seu arquivo: ${(selectedFile.size / 1024 / 1024).toFixed(2)}MB`);
      setFile(null);
      return;
    }
    
    setFile(selectedFile);
    setError(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const analyzeFile = async () => {
    if (!file) {
      setError('Selecione um arquivo primeiro');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('Iniciando análise do arquivo:', file.name, (file.size / 1024 / 1024).toFixed(2) + 'MB');
      
      // Enviar para análise via API real
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(API_ENDPOINTS.uploadGnss, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000, // 2 minutos timeout para arquivos grandes
      });

      console.log('Resposta da API:', response.data);
      setResult(response.data);
      
    } catch (err) {
      console.error('Erro na análise:', err);
      let errorMessage = 'Erro ao processar arquivo GNSS';
      
      if (err.response?.status === 413) {
        errorMessage = `Arquivo muito grande para upload. Tamanho máximo: 100MB. Seu arquivo: ${(file.size / 1024 / 1024).toFixed(2)}MB`;
      } else if (err.response?.status === 422) {
        errorMessage = 'Formato de arquivo inválido. Verifique se é um arquivo RINEX válido.';
      } else if (err.response?.status === 500) {
        errorMessage = 'Erro interno do servidor. Tente novamente em alguns minutos.';
      } else if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = 'Timeout: O arquivo demorou muito para ser processado. Tente com um arquivo menor.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setResult(null);
    setError(null);
  };

  const downloadDocument = (docType) => {
    // Simular download de documentos (será implementado quando o backend gerar documentos reais)
    const documents = {
      memorial: 'Memorial_Descritivo_GNSS.pdf',
      tabela: 'Tabela_Coordenadas_GNSS.xlsx',
      sigef: 'Planilha_SIGEF_GNSS.xlsx',
      planta: 'Planta_Tecnica_GNSS.pdf',
      relatorio: 'Relatorio_Qualidade_GNSS.pdf'
    };
    
    alert(`Download iniciado: ${documents[docType]} (funcionalidade em desenvolvimento)`);
  };

  const generatePDF = async () => {
    if (!result || !result.success || !result.file_info) {
      alert('Nenhum resultado válido para gerar PDF');
      return;
    }

    try {
      setIsLoading(true);
      
      const response = await fetch('/api/generate-gnss-report-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(result.file_info)
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      // Baixa o PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `relatorio_gnss_${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      setError('Erro ao gerar PDF do relatório: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <h2 style={{ margin: 0 }}>🤖 Análise GNSS com IA</h2>
        <div style={{ 
          background: 'linear-gradient(135deg, #2c5aa0, #1e7e34)', 
          color: 'white', 
          padding: '0.25rem 0.75rem', 
          borderRadius: '12px', 
          fontSize: '0.8rem',
          fontWeight: 'bold'
        }}>
          REAL PROCESSING
        </div>
      </div>
      
      <p style={{ marginBottom: '2rem', color: '#666' }}>
        Upload de arquivos GNSS para análise automática real usando biblioteca GeorINEX
      </p>
      
      {!file && (
        <div 
          className={`upload-area ${dragOver ? 'dragover' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => document.getElementById('file-input').click()}
          style={{
            border: '3px dashed #ddd',
            borderRadius: '12px',
            padding: '3rem',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            background: dragOver ? '#f0f8ff' : '#fafafa'
          }}
        >
          <div>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📡</div>
            <h3 style={{ color: '#2c5aa0', marginBottom: '1rem' }}>
              Arraste arquivos GNSS ou clique para selecionar
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.5rem', marginBottom: '1rem' }}>
              <span style={{ background: '#e8f4fd', color: '#2c5aa0', padding: '0.5rem', borderRadius: '6px', fontSize: '0.9rem' }}>
                .21O
              </span>
              <span style={{ background: '#e8f4fd', color: '#2c5aa0', padding: '0.5rem', borderRadius: '6px', fontSize: '0.9rem' }}>
                .RNX
              </span>
              <span style={{ background: '#e8f4fd', color: '#2c5aa0', padding: '0.5rem', borderRadius: '6px', fontSize: '0.9rem' }}>
                .OBS
              </span>
              <span style={{ background: '#e8f4fd', color: '#2c5aa0', padding: '0.5rem', borderRadius: '6px', fontSize: '0.9rem' }}>
                .NAV
              </span>
              <span style={{ background: '#e8f4fd', color: '#2c5aa0', padding: '0.5rem', borderRadius: '6px', fontSize: '0.9rem' }}>
                .ZIP
              </span>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#666', margin: 0 }}>
              Tamanho máximo: 100MB • Formatos RINEX suportados
            </p>
          </div>
          <input
            id="file-input"
            type="file"
            style={{ display: 'none' }}
            accept=".21o,.rnx,.zip,.obs,.nav"
            onChange={handleFileChange}
          />
        </div>
      )}

      {file && !result && (
        <div>
          <div style={{ 
            background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)', 
            padding: '2rem', 
            borderRadius: '12px', 
            marginBottom: '2rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50' }}>{file.name}</h3>
            <p style={{ margin: 0, color: '#666' }}>
              Tamanho: {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button 
              style={{
                background: 'linear-gradient(135deg, #2c5aa0, #1e7e34)',
                color: 'white',
                border: 'none',
                padding: '1rem 2rem',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'transform 0.3s ease'
              }}
              onClick={analyzeFile}
              disabled={isLoading}
            >
              {isLoading ? '🔄 Processando...' : '🚀 Analisar com GeorINEX'}
            </button>
            <button 
              style={{
                background: '#f8f9fa',
                color: '#6c757d',
                border: '2px solid #dee2e6',
                padding: '1rem 2rem',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
              onClick={resetUpload}
              disabled={isLoading}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {isLoading && (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '2rem' }}>🔄</div>
          <h3 style={{ color: '#2c5aa0', marginBottom: '1rem' }}>
            Processando Arquivo RINEX...
          </h3>
          
          <div style={{ 
            background: '#f8f9fa', 
            padding: '1.5rem', 
            borderRadius: '8px',
            textAlign: 'left'
          }}>
            <h4 style={{ margin: '0 0 1rem 0', color: '#2c3e50' }}>
              🔍 Análise Real em Progresso:
            </h4>
            <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#666' }}>
              <li>Leitura do arquivo RINEX com GeorINEX</li>
              <li>Extração de dados de satélites e observações</li>
              <li>Cálculo de duração e qualidade dos dados</li>
              <li>Análise de precisão e recomendações técnicas</li>
              <li>Geração de relatório técnico detalhado</li>
            </ul>
          </div>
        </div>
      )}

      {error && (
        <div style={{ 
          background: '#f8d7da', 
          color: '#721c24', 
          padding: '1rem', 
          borderRadius: '8px',
          border: '1px solid #f5c6cb'
        }}>
          <strong>❌ Erro:</strong> {error}
        </div>
      )}

      {result && result.success && (
        <div>
          {/* Header do Resultado */}
          <div style={{ 
            background: 'linear-gradient(135deg, #d4edda, #c3e6cb)', 
            padding: '2rem', 
            borderRadius: '12px',
            textAlign: 'center',
            marginBottom: '2rem'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <h2 style={{ margin: '0 0 0.5rem 0', color: '#155724' }}>
              Análise RINEX Concluída!
            </h2>
            <p style={{ margin: 0, color: '#155724' }}>
              Arquivo processado com GeorINEX • Dados reais extraídos
            </p>
          </div>

          {/* Informações do Arquivo */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ 
              color: '#2c5aa0', 
              borderBottom: '2px solid #2c5aa0', 
              paddingBottom: '0.5rem',
              marginBottom: '1.5rem'
            }}>
              📊 Informações do Arquivo RINEX
            </h3>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '1rem'
            }}>
              <div style={{ 
                background: result.file_info.quality_color === 'green' ? '#d4edda' : 
                           result.file_info.quality_color === 'orange' ? '#fff3cd' : '#f8d7da', 
                padding: '1.5rem', 
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                  {result.file_info.quality_color === 'green' ? '✅' : 
                   result.file_info.quality_color === 'orange' ? '⚠️' : '❌'}
                </div>
                <div style={{ fontWeight: 'bold', color: '#2c3e50' }}>
                  Qualidade Geral
                </div>
                <div style={{ 
                  fontSize: '1.2rem', 
                  fontWeight: 'bold',
                  color: result.file_info.quality_color === 'green' ? '#155724' : 
                         result.file_info.quality_color === 'orange' ? '#856404' : '#721c24'
                }}>
                  {result.file_info.quality_status}
                </div>
              </div>
              
              <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2c5aa0' }}>
                  {result.file_info.satellites_count}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>Satélites Observados</div>
              </div>
              
              <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2c5aa0' }}>
                  {result.file_info.duration_hours}h
                </div>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>Duração da Observação</div>
              </div>
            </div>
          </div>

          {/* Lista de Satélites */}
          {result.file_info.satellites_list && result.file_info.satellites_list.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ color: '#2c5aa0', marginBottom: '1rem' }}>🛰️ Satélites Detectados:</h4>
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '0.5rem',
                background: '#f8f9fa',
                padding: '1rem',
                borderRadius: '8px'
              }}>
                {result.file_info.satellites_list.map((sat, index) => (
                  <span key={index} style={{
                    background: '#2c5aa0',
                    color: 'white',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.9rem',
                    fontWeight: 'bold'
                  }}>
                    {sat}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Questões Identificadas */}
          {result.file_info.issues && result.file_info.issues.length > 0 && (
            <div style={{ 
              background: '#fff3cd', 
              border: '1px solid #ffeaa7', 
              borderRadius: '8px', 
              padding: '1rem', 
              marginBottom: '2rem' 
            }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#856404' }}>⚠️ Questões Identificadas:</h4>
              <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                {result.file_info.issues.map((issue, index) => (
                  <li key={index} style={{ color: '#856404' }}>{issue}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Relatório Técnico */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ 
              color: '#2c5aa0', 
              borderBottom: '2px solid #2c5aa0', 
              paddingBottom: '0.5rem',
              marginBottom: '1.5rem'
            }}>
              📋 Relatório Técnico
            </h3>
            
            <div style={{ 
              background: 'white', 
              border: '2px solid #e9ecef', 
              borderRadius: '12px', 
              padding: '2rem',
              whiteSpace: 'pre-line',
              lineHeight: '1.6',
              fontFamily: 'monospace',
              fontSize: '0.9rem'
            }}>
              {result.technical_report}
            </div>
          </div>

          {/* Visualizações GNSS */}
          {result.visualizations && (
            <GnssChartsDisplay visualizations={result.visualizations} />
          )}

          {/* Botões de Ação */}
          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            justifyContent: 'center',
            marginTop: '3rem',
            flexWrap: 'wrap'
          }}>
            <button 
              onClick={resetUpload}
              style={{
                background: 'linear-gradient(135deg, #2c5aa0, #1e7e34)',
                color: 'white',
                border: 'none',
                padding: '1rem 2rem',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              🔄 Analisar Novo Arquivo
            </button>
            
            <button 
              onClick={generatePDF}
              disabled={isLoading}
              style={{
                background: isLoading ? '#6c757d' : 'linear-gradient(135deg, #dc3545, #c82333)',
                color: 'white',
                border: 'none',
                padding: '1rem 2rem',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1
              }}
            >
              {isLoading ? '⏳ Gerando...' : '📄 Gerar PDF'}
            </button>
            
            <button 
              onClick={() => downloadDocument('relatorio')}
              style={{
                background: '#f8f9fa',
                color: '#6c757d',
                border: '2px solid #dee2e6',
                padding: '1rem 2rem',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              📥 Download Relatório
            </button>
          </div>
        </div>
      )}

      {result && !result.success && (
        <div style={{ 
          background: '#f8d7da', 
          color: '#721c24', 
          padding: '1rem', 
          borderRadius: '8px',
          border: '1px solid #f5c6cb'
        }}>
          <strong>❌ Erro no processamento:</strong> {result.error}
        </div>
      )}
    </div>
  );
};

export default GnssUploader;