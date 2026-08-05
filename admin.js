/*
  RK2 TINTAS — painel admin de produtos
  Edita window.RK2_PRODUCTS (carregado de products-data.js) em memória
  e permite baixar um novo products-data.js pronto pra substituir no site.
*/

let products = JSON.parse(JSON.stringify(window.RK2_PRODUCTS || []));
let originalProducts = JSON.parse(JSON.stringify(products));

const listEl = document.getElementById('productList');
const toastEl = document.getElementById('toast');

function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  setTimeout(() => toastEl.classList.remove('show'), 2200);
}

function render() {
  listEl.innerHTML = products.map((p, i) => `
    <div class="product-row" data-index="${i}">
      <div class="swatch-col">
        <input type="color" value="${p.color || '#1E2420'}" data-field="color" aria-label="Cor do produto">
      </div>
      <div class="fields">
        <div>
          <label>Nome</label>
          <input type="text" value="${escapeHtml(p.name)}" data-field="name">
        </div>
        <div>
          <label>Preço (opcional)</label>
          <input type="text" placeholder="Ex: R$ 89,90" value="${escapeHtml(p.price || '')}" data-field="price">
        </div>
        <div class="field-full">
          <label>Descrição</label>
          <textarea data-field="description">${escapeHtml(p.description)}</textarea>
        </div>
        <div class="row-actions">
          <button type="button" data-action="up">↑ Subir</button>
          <button type="button" data-action="down">↓ Descer</button>
          <button type="button" class="danger" data-action="remove">Remover</button>
        </div>
      </div>
    </div>
  `).join('');
}

function escapeHtml(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function slugify(str) {
  return (str || 'produto')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'produto';
}

listEl.addEventListener('input', (e) => {
  const row = e.target.closest('.product-row');
  if (!row) return;
  const i = Number(row.dataset.index);
  const field = e.target.dataset.field;
  if (!field) return;
  products[i][field] = e.target.value;
  if (field === 'name') {
    products[i].id = slugify(e.target.value);
  }
});

listEl.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  const row = btn.closest('.product-row');
  const i = Number(row.dataset.index);
  const action = btn.dataset.action;

  if (action === 'remove') {
    products.splice(i, 1);
    render();
  } else if (action === 'up' && i > 0) {
    [products[i - 1], products[i]] = [products[i], products[i - 1]];
    render();
  } else if (action === 'down' && i < products.length - 1) {
    [products[i + 1], products[i]] = [products[i], products[i + 1]];
    render();
  }
});

document.getElementById('addBtn').addEventListener('click', () => {
  products.push({
    id: 'novo-produto-' + (products.length + 1),
    name: 'Novo produto',
    description: '',
    price: '',
    color: '#1E2420'
  });
  render();
  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
});

function buildFileContent() {
  const lines = products.map(p => `  {
    id: ${JSON.stringify(p.id)},
    name: ${JSON.stringify(p.name)},
    description: ${JSON.stringify(p.description)},
    price: ${JSON.stringify(p.price || '')},
    color: ${JSON.stringify(p.color || '#1E2420')}
  }`).join(',\n');

  return `/*
  RK2 TINTAS — dados dos produtos
  Gerado pelo painel admin em ${new Date().toLocaleString('pt-BR')}
*/
window.RK2_PRODUCTS = [
${lines}
];
`;
}

function downloadFile() {
  const content = buildFileContent();
  const blob = new Blob([content], { type: 'text/javascript' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'products-data.js';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Arquivo baixado — agora envie para o seu site.');
}

document.getElementById('downloadBtn').addEventListener('click', downloadFile);
document.getElementById('downloadBtn2').addEventListener('click', downloadFile);

document.getElementById('resetBtn').addEventListener('click', () => {
  products = JSON.parse(JSON.stringify(originalProducts));
  render();
  showToast('Restaurado para o último arquivo carregado.');
});

document.getElementById('importInput').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      // Executa o arquivo importado em um escopo isolado pra extrair o array
      const sandbox = {};
      new Function('window', reader.result)(sandbox);
      if (Array.isArray(sandbox.RK2_PRODUCTS)) {
        products = sandbox.RK2_PRODUCTS;
        originalProducts = JSON.parse(JSON.stringify(products));
        render();
        showToast('Arquivo importado com sucesso.');
      } else {
        showToast('Não encontrei RK2_PRODUCTS nesse arquivo.');
      }
    } catch (err) {
      showToast('Não consegui ler esse arquivo.');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
});

render();
