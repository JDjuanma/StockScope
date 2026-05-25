const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '../../data/stockscope.db'));

db.exec(`
    CREATE TABLE IF NOT EXISTS Pais (
        id INTEGER PRIMARY KEY,
        nombre VARCHAR NOT NULL
    );

    CREATE TABLE IF NOT EXISTS Sector (
        id INTEGER PRIMARY KEY,
        nombre VARCHAR NOT NULL
    );

    CREATE TABLE IF NOT EXISTS Empresa (
        id INTEGER PRIMARY KEY,
        nombre VARCHAR NOT NULL,
        simbolo VARCHAR NOT NULL,
        id_sector INTEGER NOT NULL,
        id_pais_origen INTEGER NOT NULL,
        FOREIGN KEY (id_sector) REFERENCES Sector(id),
        FOREIGN KEY (id_pais_origen) REFERENCES Pais(id)
    );

    CREATE TABLE IF NOT EXISTS Empresa_Pais (
        id_empresa INTEGER NOT NULL,
        id_pais INTEGER NOT NULL,
        PRIMARY KEY (id_empresa, id_pais),
        FOREIGN KEY (id_empresa) REFERENCES Empresa(id),
        FOREIGN KEY (id_pais) REFERENCES Pais(id)
    );

    CREATE TABLE IF NOT EXISTS Cotizacion (
        id INTEGER PRIMARY KEY,
        id_empresa INTEGER NOT NULL,
        fecha DATE NOT NULL,
        precio REAL NOT NULL,
        volumen REAL NOT NULL,
        FOREIGN KEY (id_empresa) REFERENCES Empresa(id)
    );
`);

module.exports = db;