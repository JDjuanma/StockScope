const { filtrar } = require('./src/services/empresaService');

console.log(JSON.stringify(filtrar("sector", "Tecnología"), null, 2));
console.log(JSON.stringify(filtrar("pais", "Argentina"), null, 2));
console.log(JSON.stringify(filtrar("precio_min", 200), null, 2));
console.log(JSON.stringify(filtrar("variacion_positiva"), null, 2));
console.log(JSON.stringify(filtrar("variacion_negativa"), null, 2));