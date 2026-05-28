const empresaRepository = require('../repository/empresaRepository');

const criteriosRanking = {
    variacion: (a, b) => b.variacion_porcentual - a.variacion_porcentual,
    precio_actual: (a, b) => b.precio_actual - a.precio_actual,
    volumen: (a, b) => b.volumen_promedio - a.volumen_promedio,
    volatilidad: (a, b) => b.volatilidad - a.volatilidad,
};

const parametrosFiltro = ['sector', 'pais', 'precio_min', 'precio_max', 'variacion_positiva', 'variacion_negativa'];

const redondear = (numero, decimales = 2) => parseFloat(numero.toFixed(decimales));

const buscarEmpresa = (nombre) => {
    if (!nombre || typeof nombre !== 'string') return null;
    return empresaRepository.findByName(nombre.trim());
};

const calcularResumenCotizaciones = (cotizaciones) => {
    if (cotizaciones.length === 0) return null;

    const precios = cotizaciones.map((cotizacion) => cotizacion.precio);
    const primera = cotizaciones[0];
    const ultima = cotizaciones[cotizaciones.length - 1];
    const variacion = ((ultima.precio - primera.precio) / primera.precio) * 100;

    return {
        precio_inicial: primera.precio,
        precio_actual: ultima.precio,
        variacion_porcentual: redondear(variacion),
        precio_minimo: Math.min(...precios),
        precio_maximo: Math.max(...precios),
        cantidad_registros: cotizaciones.length,
        fecha_inicio: primera.fecha,
        fecha_fin: ultima.fecha,
    };
};

const calcularMetricasEmpresa = (empresa, cotizaciones) => {
    if (cotizaciones.length === 0) return null;

    const precios = cotizaciones.map((cotizacion) => cotizacion.precio);
    const primera = precios[0];
    const ultima = precios[precios.length - 1];
    const variacion = ((ultima - primera) / primera) * 100;
    const volumenPromedio = cotizaciones.reduce((sum, cotizacion) => sum + cotizacion.volumen, 0) / cotizaciones.length;
    const media = precios.reduce((sum, precio) => sum + precio, 0) / precios.length;
    const volatilidad = Math.sqrt(precios.reduce((sum, precio) => sum + Math.pow(precio - media, 2), 0) / precios.length);

    return {
        ...empresa,
        precio_actual: ultima,
        variacion_porcentual: redondear(variacion),
        volumen_promedio: redondear(volumenPromedio, 0),
        volatilidad: redondear(volatilidad),
    };
};

const verEvolucion = (nombre) => {
    const empresa = buscarEmpresa(nombre);
    if (!empresa) return null;

    const cotizaciones = empresaRepository.findQuotesByCompanyId(empresa.id);
    return {
        empresa,
        cotizaciones,
        resumen: calcularResumenCotizaciones(cotizaciones),
    };
};

const compararEmpresas = (nombre1, nombre2) => {
    const evolucion1 = verEvolucion(nombre1);
    const evolucion2 = verEvolucion(nombre2);

    if (!evolucion1 || !evolucion2) {
        return {
            error: !evolucion1 && !evolucion2
                ? `No se encontraron "${nombre1}" ni "${nombre2}"`
                : `No se encontró "${!evolucion1 ? nombre1 : nombre2}"`,
        };
    }

    const var1 = evolucion1.resumen?.variacion_porcentual;
    const var2 = evolucion2.resumen?.variacion_porcentual;

    if (var1 === null || var1 === undefined || var2 === null || var2 === undefined) {
        return { empresa1: evolucion1, empresa2: evolucion2, ganadora: null };
    }

    let ganadora = 'empate';
    if (var1 > var2) ganadora = evolucion1.empresa.nombre;
    if (var2 > var1) ganadora = evolucion2.empresa.nombre;

    return { empresa1: evolucion1, empresa2: evolucion2, ganadora };
};

const rankear = (criterio) => {
    if (!Object.hasOwn(criteriosRanking, criterio)) {
        return { error: `Criterio inválido. Opciones: ${Object.keys(criteriosRanking).join(', ')}` };
    }

    return empresaRepository
        .findAllWithQuotes()
        .map(({ cotizaciones, ...empresa }) => calcularMetricasEmpresa(empresa, cotizaciones))
        .filter(Boolean)
        .sort(criteriosRanking[criterio]);
};

const filtrar = (parametro, valor) => {
    if (!parametrosFiltro.includes(parametro)) {
        return { error: `Parámetro inválido. Opciones: ${parametrosFiltro.join(', ')}` };
    }

    if (parametro === 'sector') return empresaRepository.findBySector(valor ?? '');
    if (parametro === 'pais') return empresaRepository.findByOperatingCountry(valor ?? '');

    const empresasConMetricas = empresaRepository
        .findAllWithQuotes()
        .map(({ cotizaciones, ...empresa }) => calcularMetricasEmpresa(empresa, cotizaciones))
        .filter(Boolean);

    if (parametro === 'precio_min' || parametro === 'precio_max') {
        const precio = parseFloat(valor);
        if (isNaN(precio)) return { error: 'El valor debe ser un número' };
        if (parametro === 'precio_min') return empresasConMetricas.filter((empresa) => empresa.precio_actual >= precio);
        if (parametro === 'precio_max') return empresasConMetricas.filter((empresa) => empresa.precio_actual <= precio);
    }
    if (parametro === 'variacion_positiva') return empresasConMetricas.filter((empresa) => empresa.variacion_porcentual > 0);
    if (parametro === 'variacion_negativa') return empresasConMetricas.filter((empresa) => empresa.variacion_porcentual < 0);
};

module.exports = { buscarEmpresa, verEvolucion, compararEmpresas, rankear, filtrar };
