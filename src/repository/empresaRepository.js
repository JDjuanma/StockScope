const db = require('./database');

const findByName = (nombre) => {
    const stmt = db.prepare(`
        SELECT Empresa.*, Sector.nombre AS sector, Pais.nombre AS pais_origen
        FROM Empresa
        JOIN Sector ON Empresa.id_sector = Sector.id
        JOIN Pais ON Empresa.id_pais_origen = Pais.id
        WHERE Empresa.nombre LIKE @nombre
        ORDER BY Empresa.nombre ASC
    `);

    return stmt.get({ nombre: `%${nombre}%` });
};

const findAllBasic = () => {
    return db.prepare('SELECT id, nombre, simbolo FROM Empresa ORDER BY nombre ASC').all();
};

const findAllWithDetails = () => {
    return db.prepare(`
        SELECT Empresa.id, Empresa.nombre, Empresa.simbolo, Sector.nombre AS sector, Pais.nombre AS pais_origen
        FROM Empresa
        JOIN Sector ON Empresa.id_sector = Sector.id
        JOIN Pais ON Empresa.id_pais_origen = Pais.id
        ORDER BY Empresa.nombre ASC
    `).all();
};

const findBySector = (sector) => {
    return db.prepare(`
        SELECT Empresa.id, Empresa.nombre, Empresa.simbolo, Sector.nombre AS sector, Pais.nombre AS pais_origen
        FROM Empresa
        JOIN Sector ON Empresa.id_sector = Sector.id
        JOIN Pais ON Empresa.id_pais_origen = Pais.id
        WHERE Sector.nombre LIKE @sector
        ORDER BY Empresa.nombre ASC
    `).all({ sector: `%${sector}%` });
};

const findByOperatingCountry = (pais) => {
    return db.prepare(`
        SELECT DISTINCT Empresa.id, Empresa.nombre, Empresa.simbolo, Sector.nombre AS sector, Pais.nombre AS pais_origen, PaisOpera.nombre AS pais_operacion
        FROM Empresa
        JOIN Sector ON Empresa.id_sector = Sector.id
        JOIN Pais ON Empresa.id_pais_origen = Pais.id
        JOIN Empresa_Pais ON Empresa.id = Empresa_Pais.id_empresa
        JOIN Pais AS PaisOpera ON Empresa_Pais.id_pais = PaisOpera.id
        WHERE PaisOpera.nombre LIKE @pais
        ORDER BY Empresa.nombre ASC
    `).all({ pais: `%${pais}%` });
};

const findQuotesByCompanyId = (idEmpresa, columns = 'fecha, precio, volumen') => {
    return db.prepare(`
        SELECT ${columns}
        FROM Cotizacion
        WHERE id_empresa = @idEmpresa
        ORDER BY fecha ASC
    `).all({ idEmpresa });
};

module.exports = {
    findByName,
    findAllBasic,
    findAllWithDetails,
    findBySector,
    findByOperatingCountry,
    findQuotesByCompanyId,
};
