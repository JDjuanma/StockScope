const db = require('./database');

const seed = () => {
    // Países
    const paises = [
        { id: 1, nombre: 'USA' },
        { id: 2, nombre: 'Corea del Sur' },
        { id: 3, nombre: 'Países Bajos' },
        { id: 4, nombre: 'Argentina' },
        { id: 5, nombre: 'España' },
        { id: 6, nombre: 'Brasil' },
        { id: 7, nombre: 'Reino Unido' },
    ];

    // Sectores
    const sectores = [
        { id: 1, nombre: 'Tecnología' },
        { id: 2, nombre: 'Finanzas' },
        { id: 3, nombre: 'Energía' },
    ];

    // Empresas
    const empresas = [
        { id: 1,  nombre: 'Apple',         simbolo: 'AAPL',   id_sector: 1, id_pais_origen: 1 },
        { id: 2,  nombre: 'Microsoft',     simbolo: 'MSFT',   id_sector: 1, id_pais_origen: 1 },
        { id: 3,  nombre: 'Samsung',       simbolo: '005930', id_sector: 1, id_pais_origen: 2 },
        { id: 4,  nombre: 'ASML',          simbolo: 'ASML',   id_sector: 1, id_pais_origen: 3 },
        { id: 5,  nombre: 'Mercado Libre', simbolo: 'MELI',   id_sector: 1, id_pais_origen: 4 },
        { id: 6,  nombre: 'JPMorgan',      simbolo: 'JPM',    id_sector: 2, id_pais_origen: 1 },
        { id: 7,  nombre: 'BBVA',          simbolo: 'BBVA',   id_sector: 2, id_pais_origen: 5 },
        { id: 8,  nombre: 'Nubank',        simbolo: 'NU',     id_sector: 2, id_pais_origen: 6 },
        { id: 9,  nombre: 'Tesla',         simbolo: 'TSLA',   id_sector: 3, id_pais_origen: 1 },
        { id: 10, nombre: 'Shell',         simbolo: 'SHEL',   id_sector: 3, id_pais_origen: 7 },
    ];

    // Empresas y los países donde operan
    const empresa_pais = [
        { id_empresa: 1, id_pais: 1 }, { id_empresa: 1, id_pais: 3 }, { id_empresa: 1, id_pais: 2 },
        { id_empresa: 2, id_pais: 1 }, { id_empresa: 2, id_pais: 5 }, { id_empresa: 2, id_pais: 3 },
        { id_empresa: 3, id_pais: 2 }, { id_empresa: 3, id_pais: 1 }, { id_empresa: 3, id_pais: 5 },
        { id_empresa: 4, id_pais: 3 }, { id_empresa: 4, id_pais: 1 }, { id_empresa: 4, id_pais: 5 },
        { id_empresa: 5, id_pais: 4 }, { id_empresa: 5, id_pais: 1 }, { id_empresa: 5, id_pais: 6 },
        { id_empresa: 6, id_pais: 1 }, { id_empresa: 6, id_pais: 5 }, { id_empresa: 6, id_pais: 7 },
        { id_empresa: 7, id_pais: 5 }, { id_empresa: 7, id_pais: 1 }, { id_empresa: 7, id_pais: 6 },
        { id_empresa: 8, id_pais: 6 }, { id_empresa: 8, id_pais: 1 }, { id_empresa: 8, id_pais: 4 },
        { id_empresa: 9, id_pais: 1 }, { id_empresa: 9, id_pais: 3 }, { id_empresa: 9, id_pais: 2 },
        { id_empresa: 10, id_pais: 7 }, { id_empresa: 10, id_pais: 1 }, { id_empresa: 10, id_pais: 5 },
    ];

    // Cotizaciones: 6 meses para cada empresa
    const hoy = new Date('2026-05-24');
    const cotizaciones = [];

    const precios_base = {
        1: 195, 2: 415, 3: 68,  4: 720, 5: 2100,
        6: 240, 7: 9,   8: 13,  9: 175, 10: 32
    };

    for (const empresa of empresas) {
        let precio = precios_base[empresa.id];
        for (let i = 180; i >= 0; i--) {
            const fecha = new Date(hoy);
            fecha.setDate(hoy.getDate() - i);
            const diaSemana = fecha.getDay();
            if (diaSemana === 0 || diaSemana === 6) continue; // sin fines de semana

            const variacion = (Math.random() - 0.48) * 0.02;
            precio = parseFloat((precio * (1 + variacion)).toFixed(2));
            const volumen = parseFloat((Math.random() * 50000000 + 1000000).toFixed(0));

            cotizaciones.push({
                id_empresa: empresa.id,
                fecha: fecha.toISOString().split('T')[0],
                precio,
                volumen
            });
        }
    }

    // Insertar todo en la base
    const insertPais = db.prepare('INSERT OR IGNORE INTO Pais (id, nombre) VALUES (@id, @nombre)');
    const insertSector = db.prepare('INSERT OR IGNORE INTO Sector (id, nombre) VALUES (@id, @nombre)');
    const insertEmpresa = db.prepare('INSERT OR IGNORE INTO Empresa (id, nombre, simbolo, id_sector, id_pais_origen) VALUES (@id, @nombre, @simbolo, @id_sector, @id_pais_origen)');
    const insertEmpresaPais = db.prepare('INSERT OR IGNORE INTO Empresa_Pais (id_empresa, id_pais) VALUES (@id_empresa, @id_pais)');
    const insertCotizacion = db.prepare('INSERT OR IGNORE INTO Cotizacion (id_empresa, fecha, precio, volumen) VALUES (@id_empresa, @fecha, @precio, @volumen)');

    const insertarTodo = db.transaction(() => {
        for (const p of paises)       insertPais.run(p);
        for (const s of sectores)     insertSector.run(s);
        for (const e of empresas)     insertEmpresa.run(e);
        for (const ep of empresa_pais) insertEmpresaPais.run(ep);
        for (const c of cotizaciones) insertCotizacion.run(c);
    });

    insertarTodo();
    console.log(`Seed completado: ${cotizaciones.length} cotizaciones insertadas.`);
};

seed();