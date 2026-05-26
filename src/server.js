const express = require('express');

const {
    buscarEmpresa,
    verEvolucion,
    compararEmpresas,
    rankear,
    filtrar
} = require('./services/empresaService');

const app = express();
const PORT = 3000;

app.get('/api/empresa/:nombre', (req, res) => {
    const nombre = req.params.nombre;
    const empresa = buscarEmpresa(nombre);

    if (!empresa) {
        return res.status(404).json({ error: 'Empresa no encontrada' });
    }

    res.json(empresa);
});

app.get('/api/evolucion/:nombre', (req, res) => {
    const nombre = req.params.nombre;
    const evolucion = verEvolucion(nombre);

    if (!evolucion) {
        return res.status(404).json({ error: 'Empresa no encontrada' });
    }

    res.json(evolucion);
});

app.get('/api/comparar', (req, res) => {
    const { empresa1, empresa2 } = req.query;

    if (!empresa1 || !empresa2) {
        return res.status(400).json({
            error: 'Debe enviar empresa1 y empresa2'
        });
    }

    const resultado = compararEmpresas(empresa1, empresa2);

    if (resultado.error) {
        return res.status(404).json(resultado);
    }

    res.json(resultado);
});

app.get('/api/ranking/:criterio', (req, res) => {
    const criterio = req.params.criterio;
    const ranking = rankear(criterio);

    if (ranking.error) {
        return res.status(400).json(ranking);
    }

    res.json(ranking);
});

app.get('/api/filtrar', (req, res) => {
    const { parametro, valor } = req.query;

    if (!parametro) {
        return res.status(400).json({
            error: 'Debe enviar el parametro'
        });
    }

    const resultado = filtrar(parametro, valor);

    if (resultado.error) {
        return res.status(400).json(resultado);
    }

    res.json(resultado);
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});