"""
Testes unitários para o processador GNSS
"""

import pytest
import tempfile
import os
from unittest.mock import Mock, patch, MagicMock
from gnss_processor import GNSSProcessor

class TestGNSSProcessor:
    
    def setup_method(self):
        """Setup para cada teste"""
        self.processor = GNSSProcessor()
    
    def test_init(self):
        """Testa inicialização do processador"""
        assert self.processor is not None
        assert hasattr(self.processor, 'logger')
    
    def test_is_rinex_file_valid_extensions(self):
        """Testa detecção de extensões RINEX válidas"""
        valid_files = [
            "test.23O", "test.22O", "test.21O",
            "test.23o", "test.rnx", "test.obs"
        ]
        
        for filename in valid_files:
            # Criando arquivo temporário
            with tempfile.NamedTemporaryFile(suffix=filename[-4:], delete=False) as f:
                f.write(b"RINEX VERSION / TYPE         3.03           OBSERVATION DATA    M")
                temp_path = f.name
            
            try:
                result = self.processor.is_rinex_file(temp_path)
                assert result == True, f"Arquivo {filename} deveria ser válido"
            finally:
                os.unlink(temp_path)
    
    def test_is_rinex_file_invalid_extensions(self):
        """Testa rejeição de extensões inválidas"""
        invalid_files = ["test.txt", "test.doc", "test.pdf"]
        
        for filename in invalid_files:
            with tempfile.NamedTemporaryFile(suffix=filename[-4:], delete=False) as f:
                f.write(b"not rinex")
                temp_path = f.name
            
            try:
                result = self.processor.is_rinex_file(temp_path)
                assert result == False, f"Arquivo {filename} deveria ser inválido"
            finally:
                os.unlink(temp_path)
    
    def test_analyze_rinex_file_not_found(self):
        """Testa comportamento com arquivo inexistente"""
        result = self.processor.analyze_rinex_file("/caminho/inexistente.23O")
        
        assert result['success'] == False
        assert 'error' in result
        assert 'não encontrado' in result['error']
    
    def test_create_analysis_result_basic(self):
        """Testa criação de resultado básico"""
        result = self.processor.create_analysis_result(
            satellites=["G01", "G02", "R01"],
            duration=2.5,
            epochs=150,
            issues=["Teste"]
        )
        
        assert result['satellites_count'] == 3
        assert result['duration_hours'] == 2.5
        assert result['epochs_analyzed'] == 150
        assert result['issues'] == ["Teste"]
        assert result['quality_status'] in ['EXCELENTE', 'BOA', 'RUIM']
    
    def test_quality_classification(self):
        """Testa classificação de qualidade"""
        # Teste qualidade excelente
        result = self.processor.create_analysis_result(
            satellites=["G%02d" % i for i in range(1, 13)],  # 12 satélites
            duration=4.0,  # 4 horas
            epochs=1440,  # Muitas épocas
            issues=[]
        )
        assert result['quality_status'] == 'EXCELENTE'
        assert result['quality_color'] == 'green'
        
        # Teste qualidade ruim
        result = self.processor.create_analysis_result(
            satellites=["G01", "G02"],  # Poucos satélites
            duration=0.5,  # Pouca duração
            epochs=30,  # Poucas épocas
            issues=["Muitos gaps", "Sinal fraco"]
        )
        assert result['quality_status'] == 'RUIM'
        assert result['quality_color'] == 'red'
    
    def test_geodetic_processing_coordinates(self):
        """Testa se o processamento geodésico retorna coordenadas"""
        mock_epochs = [
            {'timestamp': '2023-07-24 20:40:50', 'satellites': ['G01', 'G02', 'G03', 'G04']},
            {'timestamp': '2023-07-24 20:40:51', 'satellites': ['G01', 'G02', 'G03', 'G04']},
        ]
        
        with patch.object(self.processor, 'parse_rinex_epochs', return_value=mock_epochs):
            result = self.processor.process_geodetic_coordinates(mock_epochs)
            
            assert 'coordinates' in result
            assert 'latitude' in result['coordinates']
            assert 'longitude' in result['coordinates']
            assert 'altitude' in result['coordinates']
            assert 'precision' in result
            assert 'horizontal' in result['precision']
            assert 'vertical' in result['precision']
    
    def test_utm_conversion(self):
        """Testa conversão para UTM"""
        # Coordenadas de teste (São Paulo aproximadamente)
        lat, lon = -23.5505, -46.6333
        
        result = self.processor.convert_to_utm(lat, lon)
        
        assert 'zone' in result
        assert 'hemisphere' in result
        assert 'easting' in result
        assert 'northing' in result
        assert result['hemisphere'] == 'S'  # Hemisfério sul
        assert isinstance(result['zone'], int)
        assert result['zone'] > 0
    
    @patch('time.time')
    def test_ppp_processing_simulation(self, mock_time):
        """Testa simulação de processamento PPP"""
        # Mock do tempo para controlar duração
        mock_time.side_effect = [0, 1, 2, 3, 25]  # Simula 25 segundos
        
        mock_epochs = [{'satellites': ['G01', 'G02', 'G03', 'G04']} for _ in range(100)]
        
        result = self.processor.simulate_ppp_processing(mock_epochs)
        
        assert 'final_coordinates' in result
        assert 'precision_metrics' in result
        assert 'processing_time' in result
        assert result['processing_time'] >= 20  # Pelo menos 20 segundos
        assert result['precision_metrics']['horizontal'] <= 0.1  # Precisão centimétrica
    
    def test_error_handling_corrupted_file(self):
        """Testa tratamento de erro com arquivo corrompido"""
        with tempfile.NamedTemporaryFile(suffix='.23O', delete=False) as f:
            f.write(b"arquivo corrompido sem estrutura RINEX")
            temp_path = f.name
        
        try:
            result = self.processor.analyze_rinex_file(temp_path)
            
            # Deve retornar erro ou resultado com problemas identificados
            if not result['success']:
                assert 'error' in result
            else:
                # Se processou, deve ter identificado problemas
                assert len(result['file_info']['issues']) > 0
        finally:
            os.unlink(temp_path)
    
    def test_satellite_parsing(self):
        """Testa parsing de satélites"""
        # Testa diferentes formatos de satélites
        satellites_gps = self.processor.parse_satellites_from_line("G01G02G03G04G05")
        assert len(satellites_gps) == 5
        assert all(sat.startswith('G') for sat in satellites_gps)
        
        satellites_mixed = self.processor.parse_satellites_from_line("G01G02R01R02E01")
        assert len(satellites_mixed) == 5
        assert any(sat.startswith('G') for sat in satellites_mixed)
        assert any(sat.startswith('R') for sat in satellites_mixed)
        assert any(sat.startswith('E') for sat in satellites_mixed)
    
    def test_dop_calculation(self):
        """Testa cálculo de DOP (Dilution of Precision)"""
        # Geometria ideal (satélites bem distribuídos)
        good_geometry = [
            {'elevation': 90, 'azimuth': 0},    # Zenith
            {'elevation': 30, 'azimuth': 0},    # Norte
            {'elevation': 30, 'azimuth': 90},   # Leste
            {'elevation': 30, 'azimuth': 180},  # Sul
            {'elevation': 30, 'azimuth': 270},  # Oeste
        ]
        
        dop_good = self.processor.calculate_dop_synthetic(good_geometry)
        assert dop_good['pdop'] < 3.0  # DOP bom
        
        # Geometria ruim (satélites todos no mesmo quadrante)
        bad_geometry = [
            {'elevation': 20, 'azimuth': 0},
            {'elevation': 25, 'azimuth': 10},
            {'elevation': 30, 'azimuth': 20},
        ]
        
        dop_bad = self.processor.calculate_dop_synthetic(bad_geometry)
        assert dop_bad['pdop'] > 5.0  # DOP ruim
    
    def test_processing_time_realistic(self):
        """Testa se o tempo de processamento é realístico"""
        import time
        
        # Arquivo pequeno deve processar rápido
        small_epochs = [{'satellites': ['G01', 'G02']} for _ in range(10)]
        
        start = time.time()
        result = self.processor.simulate_ppp_processing(small_epochs)
        end = time.time()
        
        # Deve levar pelo menos alguns segundos (realístico)
        processing_time = end - start
        assert processing_time >= 1.0
        assert processing_time <= 30.0  # Mas não muito longo para teste
    
    def test_incra_compliance(self):
        """Testa verificação de conformidade INCRA"""
        # Precisão boa (< 0.5m)
        good_precision = {'horizontal': 0.03, 'vertical': 0.05}
        status = self.processor.check_incra_compliance(good_precision)
        assert status == 'APPROVED'
        
        # Precisão ruim (> 0.5m)
        bad_precision = {'horizontal': 0.8, 'vertical': 1.2}
        status = self.processor.check_incra_compliance(bad_precision)
        assert status == 'REPROCESSAR'
    
    def test_memory_usage(self):
        """Testa se o processamento não consome memória excessiva"""
        import psutil
        import os
        
        process = psutil.Process(os.getpid())
        memory_before = process.memory_info().rss / 1024 / 1024  # MB
        
        # Processar arquivo grande simulado
        large_epochs = [
            {'satellites': ['G%02d' % (i % 32 + 1) for i in range(10)]} 
            for _ in range(1000)
        ]
        
        result = self.processor.simulate_ppp_processing(large_epochs)
        
        memory_after = process.memory_info().rss / 1024 / 1024  # MB
        memory_increase = memory_after - memory_before
        
        # Não deve consumir mais que 100MB adicionais
        assert memory_increase < 100, f"Consumo de memória muito alto: {memory_increase:.1f}MB"
        
        # Deve ter processado com sucesso
        assert result is not None
        assert 'final_coordinates' in result


if __name__ == '__main__':
    # Executa os testes
    pytest.main([__file__, '-v']) 