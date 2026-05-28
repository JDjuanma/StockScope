# StockScope

StockScope es un proyecto académico para analizar empresas, cotizaciones simuladas y filtros básicos de mercado usando Node.js y SQLite.

## Stack

- Node.js
- SQLite
- better-sqlite3
- node:test

## Estructura

- `src/repository/`: conexión a la base y consultas SQL.
- `src/services/`: reglas de negocio, cálculos y filtros.
- `tests/`: pruebas automatizadas del servicio y datos semilla.
- `data/stockscope.db`: base SQLite usada por el proyecto.

## Comandos

```bash
npm install
npm test
node src/repository/seed.js
node check.js
```

## Funciones disponibles

- Buscar empresa por nombre.
- Ver evolución histórica de cotizaciones.
- Comparar dos empresas por variación porcentual.
- Rankear por variación, precio actual, volumen promedio o volatilidad.
- Filtrar por sector, país, precio mínimo, precio máximo y variación.
