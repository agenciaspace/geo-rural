import axios from 'axios';

// Configurar a URL base do axios
// Como o frontend é servido pelo FastAPI, não precisamos de uma URL completa
axios.defaults.baseURL = '';

export default axios;