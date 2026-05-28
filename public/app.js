const alertBox = document.querySelector('#alert');
const featureMenu = document.querySelector('#feature-menu');
const activeFeature = document.querySelector('#active-feature');
const homeButton = document.querySelector('#home-button');
const featurePanels = document.querySelectorAll('.feature-panel');

const formatNumber = (value) => new Intl.NumberFormat('es-UY', {
  maximumFractionDigits: 2,
}).format(value);

const showAlert = (message, type = 'danger') => {
  alertBox.className = `alert alert-${type}`;
  alertBox.textContent = message;
};

const clearAlert = () => {
  alertBox.className = 'alert d-none';
  alertBox.textContent = '';
};

const showFeature = (featureId) => {
  clearAlert();
  featureMenu.classList.add('d-none');
  activeFeature.classList.remove('d-none');
  homeButton.classList.remove('d-none');

  featurePanels.forEach((panel) => {
    panel.classList.toggle('d-none', panel.id !== featureId);
  });

  document.querySelectorAll('[data-feature]').forEach((button) => {
    button.setAttribute('aria-expanded', String(button.dataset.feature === featureId));
  });

  document.querySelector(`#${featureId}`).focus();
};

const showMenu = () => {
  clearAlert();
  featureMenu.classList.remove('d-none');
  activeFeature.classList.add('d-none');
  homeButton.classList.add('d-none');

  featurePanels.forEach((panel) => panel.classList.add('d-none'));
  document.querySelectorAll('[data-feature]').forEach((button) => {
    button.setAttribute('aria-expanded', 'false');
  });
  document.querySelector('[data-feature]').focus();
};

const requestJson = async (url) => {
  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'No se pudo completar la consulta');
  }

  return data;
};

const metric = (label, value) => `
  <div class="col-sm-6 col-xl-3">
    <div class="metric">
      <div class="label">${label}</div>
      <div class="value">${value}</div>
    </div>
  </div>
`;

const renderCompany = (empresa) => `
  <div class="result-card">
    <h3 class="h5 mb-3">${empresa.nombre} <span class="badge text-bg-secondary">${empresa.simbolo}</span></h3>
    <div class="row g-2">
      ${metric('Sector', empresa.sector)}
      ${metric('País origen', empresa.pais_origen)}
      ${metric('ID', empresa.id)}
    </div>
  </div>
`;

const renderEvolution = (evolucion) => {
  const { empresa, resumen } = evolucion;

  if (!resumen) {
    return '<div class="alert alert-warning mb-0">La empresa no tiene cotizaciones cargadas.</div>';
  }

  return `
    <div class="result-card">
      <h3 class="h5 mb-3">${empresa.nombre}</h3>
      <div class="row g-2">
        ${metric('Precio inicial', `$${formatNumber(resumen.precio_inicial)}`)}
        ${metric('Precio actual', `$${formatNumber(resumen.precio_actual)}`)}
        ${metric('Variación', `${formatNumber(resumen.variacion_porcentual)}%`)}
        ${metric('Registros', resumen.cantidad_registros)}
      </div>
      <p class="text-muted small mt-3 mb-0">Período: ${resumen.fecha_inicio} a ${resumen.fecha_fin}</p>
    </div>
  `;
};

const renderCompare = (resultado) => `
  <div class="result-card">
    <h3 class="h5 mb-3">Ganadora: <span class="text-primary">${resultado.ganadora}</span></h3>
    <div class="row g-2">
      ${metric(resultado.empresa1.empresa.nombre, `${formatNumber(resultado.empresa1.resumen.variacion_porcentual)}%`)}
      ${metric(resultado.empresa2.empresa.nombre, `${formatNumber(resultado.empresa2.resumen.variacion_porcentual)}%`)}
    </div>
  </div>
`;

const renderTable = (items) => {
  if (!items.length) {
    return '<div class="alert alert-warning mb-0">No hay resultados para mostrar.</div>';
  }

  const rows = items.map((empresa) => `
    <tr>
      <td>${empresa.nombre}</td>
      <td>${empresa.simbolo || '-'}</td>
      <td>${empresa.sector || '-'}</td>
      <td>${empresa.pais_origen || '-'}</td>
      <td>${empresa.precio_actual === undefined ? '-' : `$${formatNumber(empresa.precio_actual)}`}</td>
      <td>${empresa.variacion_porcentual === undefined ? '-' : `${formatNumber(empresa.variacion_porcentual)}%`}</td>
    </tr>
  `).join('');

  return `
    <div class="table-responsive">
      <table class="table table-sm table-hover align-middle mb-0">
        <caption class="visually-hidden">Resultados de empresas</caption>
        <thead>
          <tr>
            <th scope="col">Empresa</th>
            <th scope="col">Símbolo</th>
            <th scope="col">Sector</th>
            <th scope="col">País</th>
            <th scope="col">Precio</th>
            <th scope="col">Variación</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
};

const handleForm = (formId, callback) => {
  document.querySelector(formId).addEventListener('submit', async (event) => {
    event.preventDefault();
    clearAlert();

    try {
      await callback();
    } catch (error) {
      showAlert(error.message);
    }
  });
};

document.querySelectorAll('[data-feature]').forEach((button) => {
  button.addEventListener('click', () => showFeature(button.dataset.feature));
});

homeButton.addEventListener('click', showMenu);

handleForm('#company-form', async () => {
  const name = document.querySelector('#company-name').value.trim();
  const data = await requestJson(`/api/empresa/${encodeURIComponent(name)}`);
  document.querySelector('#company-result').innerHTML = renderCompany(data);
});

handleForm('#evolution-form', async () => {
  const name = document.querySelector('#evolution-name').value.trim();
  const data = await requestJson(`/api/evolucion/${encodeURIComponent(name)}`);
  document.querySelector('#evolution-result').innerHTML = renderEvolution(data);
});

handleForm('#compare-form', async () => {
  const companyOne = document.querySelector('#compare-company-one').value.trim();
  const companyTwo = document.querySelector('#compare-company-two').value.trim();
  const data = await requestJson(`/api/comparar?empresa1=${encodeURIComponent(companyOne)}&empresa2=${encodeURIComponent(companyTwo)}`);
  document.querySelector('#compare-result').innerHTML = renderCompare(data);
});

handleForm('#ranking-form', async () => {
  const criterion = document.querySelector('#ranking-criterion').value;
  const data = await requestJson(`/api/ranking/${encodeURIComponent(criterion)}`);
  document.querySelector('#ranking-result').innerHTML = renderTable(data);
});

handleForm('#filter-form', async () => {
  const param = document.querySelector('#filter-param').value;
  const value = document.querySelector('#filter-value').value.trim();
  const url = value
    ? `/api/filtrar?parametro=${encodeURIComponent(param)}&valor=${encodeURIComponent(value)}`
    : `/api/filtrar?parametro=${encodeURIComponent(param)}`;
  const data = await requestJson(url);
  document.querySelector('#filter-result').innerHTML = renderTable(data);
});
