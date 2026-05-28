# StockScope

StockScope es un proyecto académico para analizar empresas, cotizaciones simuladas y filtros básicos de mercado usando Node.js, Express, SQLite y Bootstrap.

## Stack

- Node.js
- Express
- SQLite
- better-sqlite3
- Bootstrap
- node:test

## Estructura

- `src/repository/`: conexión a la base y consultas SQL.
- `src/services/`: reglas de negocio, cálculos y filtros.
- `src/server.js`: API Express y servidor de archivos estáticos.
- `public/`: interfaz web con HTML, CSS, Bootstrap y JavaScript.
- `tests/`: pruebas automatizadas del servicio y datos semilla.
- `data/stockscope.db`: base SQLite usada por el proyecto.

## Comandos

```bash
npm install
npm test
npm start
node src/repository/seed.js
node check.js
```

## Interfaz web

Para abrir la aplicación:

```bash
npm start
```

Luego entrar a:

```text
http://localhost:3000
```

La interfaz tiene una página principal con selector de funciones y permite:

- Buscar empresa por nombre.
- Ver evolución histórica de cotizaciones.
- Comparar dos empresas por variación porcentual.
- Rankear por variación, precio actual, volumen promedio o volatilidad.
- Filtrar por sector, país, precio mínimo, precio máximo y variación.

## API disponible

- `GET /api/empresa/:nombre`
- `GET /api/evolucion/:nombre`
- `GET /api/comparar?empresa1=...&empresa2=...`
- `GET /api/ranking/:criterio`
- `GET /api/filtrar?parametro=...&valor=...`

