import React, { useState } from 'react';

const DemoAccess = ({ onAccessDemo, onBackToLanding }) => {
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    institution: '',
    role: 'student'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simular envio de dados (aqui você integraria com seu backend)
    setTimeout(() => {
      console.log('Dados do usuário:', userInfo);
      setIsSubmitting(false);
      onAccessDemo();
    }, 2000);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '3rem',
        boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
        maxWidth: '500px',
        width: '100%',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '2rem' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🌱</span>
          <h1 style={{ color: '#2c5aa0', margin: '0 0 0.5rem 0' }}>OnGeo</h1>
          <p style={{ color: '#666', margin: 0 }}>Acesso Demo - Experimente Gratuitamente</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>
              Nome Completo *
            </label>
            <input
              type="text"
              value={userInfo.name}
              onChange={(e) => setUserInfo({...userInfo, name: e.target.value})}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e9ecef',
                borderRadius: '8px',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
              placeholder="Seu nome completo"
            />
          </div>

          <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>
              E-mail *
            </label>
            <input
              type="email"
              value={userInfo.email}
              onChange={(e) => setUserInfo({...userInfo, email: e.target.value})}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e9ecef',
                borderRadius: '8px',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
              placeholder="seu@email.com"
            />
          </div>

          <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>
              Instituição/Empresa
            </label>
            <input
              type="text"
              value={userInfo.institution}
              onChange={(e) => setUserInfo({...userInfo, institution: e.target.value})}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e9ecef',
                borderRadius: '8px',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
              placeholder="Ex: Universidade Federal, Empresa XYZ"
            />
          </div>

          <div style={{ marginBottom: '2rem', textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#333' }}>
              Você é:
            </label>
            <select
              value={userInfo.role}
              onChange={(e) => setUserInfo({...userInfo, role: e.target.value})}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e9ecef',
                borderRadius: '8px',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
            >
              <option value="student">Estudante/Aluno</option>
              <option value="professional">Profissional</option>
              <option value="instructor">Professor/Instrutor</option>
              <option value="other">Outro</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              background: isSubmitting ? '#ccc' : 'linear-gradient(135deg, #2c5aa0, #1e7e34)',
              color: 'white',
              border: 'none',
              padding: '1rem 2rem',
              borderRadius: '8px',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              marginBottom: '1rem'
            }}
          >
            {isSubmitting ? 'Configurando acesso...' : '🚀 Acessar Demo Gratuito'}
          </button>

          <button
            type="button"
            onClick={onBackToLanding}
            style={{
              background: 'transparent',
              color: '#666',
              border: 'none',
              padding: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.9rem',
              textDecoration: 'underline'
            }}
          >
            ← Voltar ao site
          </button>
        </form>

        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          background: '#f8f9fa',
          borderRadius: '8px',
          fontSize: '0.9rem',
          color: '#666'
        }}>
          <p style={{ margin: 0 }}>
            🔒 <strong>Seus dados estão seguros.</strong> Usamos apenas para personalizar sua experiência demo.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DemoAccess;