import React from 'react';

const GnssChartsDisplay = ({ visualizations }) => {
  if (!visualizations || Object.keys(visualizations).length === 0) {
    return null;
  }

  const chartTitles = {
    convergence_plot: 'Convergência PPP',
    precision_plot: 'Evolução da Precisão',
    skyplot: 'Posição dos Satélites',
    dop_plot: 'Dilution of Precision (DOP)',
    quality_summary: 'Resumo da Qualidade'
  };

  return (
    <div className="charts-section">
      <h3 className="charts-title">📊 Visualizações da Análise GNSS</h3>
      
      <div className="charts-grid">
        {Object.entries(visualizations).map(([key, base64Data]) => {
          if (!base64Data) return null;
          
          return (
            <div key={key} className="chart-container">
              <h4 className="chart-title">{chartTitles[key] || key}</h4>
              <div className="chart-wrapper">
                <img
                  src={`data:image/png;base64,${base64Data}`}
                  alt={`Gráfico ${chartTitles[key] || key}`}
                  className="chart-image"
                />
              </div>
            </div>
          );
        })}
      </div>
      
      <style jsx>{`
        .charts-section {
          margin-top: 30px;
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 15px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        
        .charts-title {
          color: white;
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 25px;
          text-align: center;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        .charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 20px;
        }
        
        .chart-container {
          background: white;
          border-radius: 12px;
          padding: 15px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
          transition: transform 0.3s ease;
        }
        
        .chart-container:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }
        
        .chart-title {
          color: #2d3748;
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 2px solid #e2e8f0;
        }
        
        .chart-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 200px;
        }
        
        .chart-image {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        @media (max-width: 768px) {
          .charts-grid {
            grid-template-columns: 1fr;
          }
          
          .chart-container {
            min-height: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default GnssChartsDisplay; 