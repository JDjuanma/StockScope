const test = require('node:test');
const assert = require('node:assert/strict');
const db = require('../src/repository/database');
const { buscarEmpresa, verEvolucion, compararEmpresas, rankear, filtrar } = require('../src/services/empresaService');

test('database has the expected seeded records', () => {
    assert.equal(db.prepare('SELECT COUNT(*) AS total FROM Pais').get().total, 7);
    assert.equal(db.prepare('SELECT COUNT(*) AS total FROM Sector').get().total, 3);
    assert.equal(db.prepare('SELECT COUNT(*) AS total FROM Empresa').get().total, 10);
    assert.equal(db.prepare('SELECT COUNT(*) AS total FROM Empresa_Pais').get().total, 30);
    assert.equal(db.prepare('SELECT COUNT(*) AS total FROM Cotizacion').get().total, 1300);
});

test('quotes are unique per company and date', () => {
    const duplicated = db.prepare(`
        SELECT COUNT(*) AS total
        FROM (
            SELECT id_empresa, fecha
            FROM Cotizacion
            GROUP BY id_empresa, fecha
            HAVING COUNT(*) > 1
        )
    `).get();

    assert.equal(duplicated.total, 0);
});

test('buscarEmpresa finds a company with sector and origin country', () => {
    const empresa = buscarEmpresa('Apple');

    assert.equal(empresa.nombre, 'Apple');
    assert.equal(empresa.simbolo, 'AAPL');
    assert.equal(empresa.sector, 'Tecnología');
    assert.equal(empresa.pais_origen, 'USA');
});

test('verEvolucion returns quotes and a coherent summary', () => {
    const evolucion = verEvolucion('Microsoft');

    assert.equal(evolucion.empresa.nombre, 'Microsoft');
    assert.ok(evolucion.cotizaciones.length > 0);
    assert.equal(evolucion.resumen.cantidad_registros, evolucion.cotizaciones.length);
    assert.equal(evolucion.resumen.precio_inicial, evolucion.cotizaciones[0].precio);
    assert.equal(evolucion.resumen.precio_actual, evolucion.cotizaciones.at(-1).precio);
});

test('compararEmpresas returns both evolutions and a winner or tie', () => {
    const comparacion = compararEmpresas('Apple', 'Microsoft');

    assert.equal(comparacion.empresa1.empresa.nombre, 'Apple');
    assert.equal(comparacion.empresa2.empresa.nombre, 'Microsoft');
    assert.ok(['Apple', 'Microsoft', 'empate'].includes(comparacion.ganadora));
});

test('rankear orders by selected criterion', () => {
    const ranking = rankear('precio_actual');

    assert.equal(ranking.length, 10);
    for (let index = 1; index < ranking.length; index++) {
        assert.ok(ranking[index - 1].precio_actual >= ranking[index].precio_actual);
    }
});

test('filtrar supports sector, country, price and variation filters', () => {
    assert.ok(filtrar('sector', 'Tecnología').every((empresa) => empresa.sector === 'Tecnología'));
    assert.ok(filtrar('pais', 'Argentina').some((empresa) => empresa.nombre === 'Mercado Libre'));
    assert.ok(filtrar('pais', 'USA').every((empresa) => empresa.pais_operacion === 'USA'));
    assert.ok(filtrar('precio_min', 200).every((empresa) => empresa.precio_actual >= 200));
    assert.ok(filtrar('variacion_positiva').every((empresa) => empresa.variacion_porcentual > 0));
});

test('invalid service inputs return controlled responses', () => {
    assert.equal(buscarEmpresa('No Existe'), undefined);
    assert.match(rankear('riesgo').error, /Criterio inválido/);
    assert.match(filtrar('desconocido').error, /Parámetro inválido/);
});
