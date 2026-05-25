const db = require('../repository/database');

const buscarEmpresa = (nombre) => {
    const stmt = db.prepare(`
    SELECT Empresa.*, Sector.nombre AS sector, Pais.nombre AS pais_origen
    FROM Empresa
    JOIN Sector ON Empresa.id_sector = Sector.id
    JOIN Pais ON Empresa.id_pais_origen = Pais.id
    WHERE Empresa.nombre LIKE @nombre
`);
    return stmt.get({ nombre: `%${nombre}%` });
};

module.exports = { buscarEmpresa };