import React, { useState } from 'react';
import axios from '../config/axios';
import API_ENDPOINTS from '../config/api';
import { storage, db } from '../config/supabase';

const GnssUploader = () => {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (selectedFile) => {
    const allowedTypes = ['.21o', '.rnx', '.zip'];
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
      setError('Tipo de arquivo não suportado. Use arquivos .21O, .RNX ou .ZIP');
      setFile(null);
      return;
    }
    
    if (selectedFile.size > maxSizeBytes) {
      setError(`[VALIDAÇÃO LOCAL] Arquivo muito grande. Tamanho máximo permitido: 100MB. Seu arquivo: ${(selectedFile.size / 1024 / 1024).toFixed(2)}MB`);
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

  const uploadFile = async () => {
    if (!file) {
      setError('Selecione um arquivo primeiro');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('Iniciando upload do arquivo:', file.name, (file.size / 1024 / 1024).toFixed(2) + 'MB');
      
      // Enviar diretamente para análise via API (sem Supabase Storage por ora)
      console.log('Enviando para análise via API...');
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(API_ENDPOINTS.uploadGnss, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Salvar resultado da análise no banco (opcional)
      if (response.data.success) {
        console.log('Análise concluída com sucesso');
        // TODO: Implementar salvamento no banco se necessário
        // Por ora, apenas mostramos o resultado na interface
      }

      setResult(response.data);
    } catch (err) {
      let errorMessage = 'Erro ao processar arquivo';
      
      if (err.response?.status === 413) {
        errorMessage = `[ERRO SERVIDOR] Arquivo muito grande para upload. Tamanho máximo permitido pelo servidor: 100MB. Seu arquivo: ${(file.size / 1024 / 1024).toFixed(2)}MB. Tente compactar o arquivo.`;
      } else if (err.response?.status === 422) {
        errorMessage = 'Formato de arquivo inválido. Verifique se é um arquivo RINEX válido.';
      } else if (err.response?.status === 500) {
        errorMessage = 'Erro interno do servidor. Tente novamente em alguns minutos.';
      } else if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
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

  return (
    <div className="card">
      <h2>📡 Análise de Arquivos GNSS</h2>
      <p>Faça upload de arquivos RINEX (.21O, .RNX) ou ZIP para análise automática</p>
      
      {!file && (
        <div 
          className={`upload-area ${dragOver ? 'dragover' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => document.getElementById('file-input').click()}
        >
          <div>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📁</div>
            <h3>Clique ou arraste um arquivo aqui</h3>
            <p>Arquivos suportados: .21O, .RNX, .ZIP</p>
            <p style={{ fontSize: '0.9rem', color: '#666' }}>
              Tamanho máximo: 100MB
            </p>
          </div>
          <input
            id="file-input"
            type="file"
            className="file-input"
            accept=".21o,.rnx,.zip"
            onChange={handleFileChange}
          />
        </div>
      )}

      {file && !result && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ padding: '2rem', background: '#f8f9fa', borderRadius: '8px', marginBottom: '1rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📄</div>
            <h4 style={{ margin: '0 0 0.5rem 0' }}>{file.name}</h4>
            <p style={{ margin: 0, color: '#666' }}>
              Tamanho: {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button 
              className="btn btn-primary" 
              onClick={uploadFile}
              disabled={isLoading}
            >
              {isLoading ? 'Processando...' : 'Analisar Arquivo'}
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={resetUpload}
              disabled={isLoading}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="loading">
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <h3>Processando arquivo GNSS...</h3>
          <p>Isso pode levar alguns segundos</p>
        </div>
      )}

      {error && (
        <div className="error">
          <strong>Erro:</strong> {error}
        </div>
      )}

      {result && result.success && (
        <div className="analysis-result">
          <h3>📈 Resultado da Análise</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2c5aa0' }}>
                {result.file_info.satellites_count}
              </div>
              <div>Satélites Observados</div>
            </div>
            
            <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2c5aa0' }}>
                {result.file_info.duration_hours}h
              </div>
              <div>Duração da Observação</div>
            </div>
            
            <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
              <div 
                style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 'bold',
                  color: result.file_info.quality_color === 'green' ? '#28a745' : 
                         result.file_info.quality_color === 'orange' ? '#fd7e14' : '#dc3545'
                }}
              >
                {result.file_info.quality_status}
              </div>
              <div>Qualidade dos Dados</div>
            </div>
          </div>

          {result.file_info.issues && result.file_info.issues.length > 0 && (
            <div style={{ background: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#856404' }}>⚠️ Questões Identificadas:</h4>
              <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                {result.file_info.issues.map((issue, index) => (
                  <li key={index} style={{ color: '#856404' }}>{issue}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="technical-report">
            {result.technical_report}
          </div>

          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button 
              className="btn btn-primary"
              onClick={resetUpload}
            >
              Analisar Novo Arquivo
            </button>
          </div>
        </div>
      )}

      {result && !result.success && (
        <div className="error">
          <strong>Erro no processamento:</strong> {result.error}
        </div>
      )}
    </div>
  );
};

export default GnssUploader;