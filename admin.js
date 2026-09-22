/* ============================================================
   TEXNIKA SKLAD — Admin Panel (demo / client-only prototype)
   Пароль-заглушка на клиенте — только для демонстрации UX.
   В проде: Auth.js + роль ADMIN + защита на сервере (см. README).
   ============================================================ */

const ADMIN_PASSWORD = 'admin123';

function adminProducts() { return LS.get('ts_admin_products', PRODUCTS); }
function saveAdminProducts(list) { LS.set('ts_admin_products', list); }

function checkLogin(ev) {
  ev.preventDefault();
  const val = document.getElementById('loginPass').value;
  if (val === ADMIN_PASSWORD) {
    sessionStorage.setItem('ts_admin_auth', '1');
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('adminApp').classList.remove('hidden');
    initAdmin();
  } else {
    document.getElementById('loginError').classList.remove('hidden');
  }
}

function adminLogout() {
  sessionStorage.removeItem('ts_admin_auth');
  location.reload();
}

function fmt(n) { return n.toLocaleString('ru-RU') + ' с.'; }

/* ---------- NAV ---------- */
function showSection(name, btn) {
  document.querySelectorAll('.admin-section').forEach(s => s.classList.add('hidden'));
  document.getElementById('sec-' + name).classList.remove('hidden');
  document.querySelectorAll('.admin-nav-item').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  document.getElementById('mobileSidebar')?.classList.add('hidden');
  if (name === 'dashboard') renderDashboard();
  if (name === 'products') renderProductsTable();
  if (name === 'orders') renderOrdersTable();
  if (name === 'customers') renderCustomersTable();
  if (name === 'categories') renderCategoriesAdmin();
}

/* ---------- DASHBOARD ---------- */
function renderDashboard() {
  const orders = LS.get('ts_orders', []);
  const today = new Date().toDateString();
  const salesToday = orders.filter(o => new Date(o.date).toDateString() === today).reduce((s, o) => s + o.total, 0);
  const salesMonth = orders.reduce((s, o) => s + o.total, 0);
  const products = adminProducts();
  const lowStock = products.filter(p => p.stock <= 5);

  document.getElementById('statSalesToday').textContent = fmt(salesToday);
  document.getElementById('statSalesMonth').textContent = fmt(salesMonth);
  document.getElementById('statOrders').textContent = orders.length;
  document.getElementById('statCustomers').textContent = new Set(orders.map(o => o.phone)).size;
  document.getElementById('statProducts').textContent = products.length;
  document.getElementById('statLowStock').textContent = lowStock.length;

  const list = document.getElementById('recentOrders');
  list.innerHTML = orders.slice(0, 5).map(o => `
    <div class="flex items-center justify-between py-3 border-b border-[var(--line)] text-sm">
      <div><div class="font-semibold">#${o.id}</div><div class="text-xs text-[var(--ink-400)]">${o.name} · ${new Date(o.date).toLocaleDateString('ru-RU')}</div></div>
      <div class="text-right"><div class="font-bold">${fmt(o.total)}</div><span class="admin-status-badge status-${o.status}">${statusLabel(o.status)}</span></div>
    </div>`).join('') || '<p class="text-sm text-[var(--ink-400)] py-4">Заказов пока нет</p>';

  drawBarChart('salesChart', last7DaysSales(orders));
}

function last7DaysSales(orders) {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const key = d.toDateString();
    const total = orders.filter(o => new Date(o.date).toDateString() === key).reduce((s, o) => s + o.total, 0);
    days.push({ label: d.toLocaleDateString('ru-RU', { weekday: 'short' }), value: total });
  }
  return days;
}

function drawBarChart(canvasId, data) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width = canvas.clientWidth * 2;
  const h = canvas.height = canvas.clientHeight * 2;
  ctx.clearRect(0, 0, w, h);
  const max = Math.max(...data.map(d => d.value), 1);
  const barW = w / data.length;
  data.forEach((d, i) => {
    const barH = (d.value / max) * (h - 60);
    const x = i * barW + barW * 0.28;
    const y = h - barH - 34;
    const grad = ctx.createLinearGradient(0, y, 0, h - 34);
    grad.addColorStop(0, '#2f7bff'); grad.addColorStop(1, '#7db2ff');
    ctx.fillStyle = grad;
    roundRect(ctx, x, y, barW * 0.44, barH, 8); ctx.fill();
    ctx.fillStyle = '#94a3b8'; ctx.font = '22px Inter'; ctx.textAlign = 'center';
    ctx.fillText(d.label, x + barW * 0.22, h - 10);
  });
}
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/* ---------- PRODUCTS ---------- */
function renderProductsTable(filter = '') {
  const list = adminProducts().filter(p => p.name.toLowerCase().includes(filter.toLowerCase()));
  document.getElementById('productsTableBody').innerHTML = list.map(p => `
    <tr class="border-b border-[var(--line)]">
      <td class="py-2.5 pr-3"><div class="w-10 h-10 rounded-lg overflow-hidden">${productArtSVG(p, 18)}</div></td>
      <td class="py-2.5 pr-3 font-medium max-w-[220px] truncate">${p.name}</td>
      <td class="py-2.5 pr-3 text-[var(--ink-400)]">${p.brand}</td>
      <td class="py-2.5 pr-3 text-[var(--ink-400)]">${getCategoryName(p.cat)}</td>
      <td class="py-2.5 pr-3 font-semibold">${fmt(p.price)}</td>
      <td class="py-2.5 pr-3">${p.stock <= 5 ? `<span class="text-red-500 font-semibold">${p.stock}</span>` : p.stock}</td>
      <td class="py-2.5 pr-3">
        <button class="text-xs font-semibold px-2.5 py-1 rounded-lg mr-1" style="background:#eef3ff;color:var(--blue-500)" onclick="editProduct('${p.id}')">Изменить</button>
        <button class="text-xs font-semibold px-2.5 py-1 rounded-lg" style="background:#fef2f2;color:#ef4444" onclick="deleteProduct('${p.id}')">Удалить</button>
      </td>
    </tr>`).join('') || `<tr><td colspan="7" class="text-center py-8 text-[var(--ink-400)]">Товары не найдены</td></tr>`;
  refreshIcons();
}

let editingProductId = null;
function openProductForm(id) {
  editingProductId = id || null;
  const p = id ? adminProducts().find(x => x.id === id) : null;
  document.getElementById('pfTitle').textContent = id ? 'Редактировать товар' : 'Новый товар';
  document.getElementById('pf-name').value = p?.name || '';
  document.getElementById('pf-brand').value = p?.brand || BRANDS[0];
  document.getElementById('pf-cat').value = p?.cat || CATEGORIES[0].id;
  document.getElementById('pf-price').value = p?.price || '';
  document.getElementById('pf-old').value = p?.old || '';
  document.getElementById('pf-stock').value = p?.stock ?? 10;
  document.getElementById('pf-desc').value = p?.desc || '';
  document.getElementById('pf-new').checked = p?.badges.includes('new') || false;
  document.getElementById('pf-sale').checked = p?.badges.includes('sale') || false;
  document.getElementById('productFormModal').classList.remove('hidden');
}
function closeProductForm() { document.getElementById('productFormModal').classList.add('hidden'); }
function editProduct(id) { openProductForm(id); }
function deleteProduct(id) {
  if (!confirm('Удалить товар из каталога?')) return;
  const list = adminProducts().filter(p => p.id !== id);
  saveAdminProducts(list);
  renderProductsTable();
  toast('Товар удалён');
}
function saveProductForm(ev) {
  ev.preventDefault();
  const list = adminProducts();
  const price = parseInt(document.getElementById('pf-price').value) || 0;
  const old = parseInt(document.getElementById('pf-old').value) || null;
  const badges = [];
  if (document.getElementById('pf-new').checked) badges.push('new');
  if (document.getElementById('pf-sale').checked && old) badges.push('sale');
  const cat = document.getElementById('pf-cat').value;
  const data = {
    name: document.getElementById('pf-name').value,
    brand: document.getElementById('pf-brand').value,
    cat, price, old,
    discount: old ? Math.round((1 - price / old) * 100) : 0,
    stock: parseInt(document.getElementById('pf-stock').value) || 0,
    desc: document.getElementById('pf-desc').value,
    badges, colors: ART[cat], icon: ICONS[cat],
    specs: {}, variants: [], rating: 4.5, reviews: 0,
  };
  if (editingProductId) {
    const idx = list.findIndex(p => p.id === editingProductId);
    list[idx] = { ...list[idx], ...data };
  } else {
    data.id = 'custom-' + Date.now();
    data.slug = slugify(data.name);
    list.unshift(data);
  }
  saveAdminProducts(list);
  closeProductForm();
  renderProductsTable();
  toast('Товар сохранён');
}

/* ---------- CATEGORIES ---------- */
function renderCategoriesAdmin() {
  document.getElementById('categoriesAdminList').innerHTML = CATEGORIES.map(c => `
    <div class="flex items-center justify-between py-3 border-b border-[var(--line)]">
      <div class="flex items-center gap-3"><div class="cat-icon-wrap"><i data-lucide="${c.icon}" class="w-4 h-4"></i></div><span class="font-medium text-sm">${c.name}</span></div>
      <span class="text-xs text-[var(--ink-400)]">${PRODUCTS.filter(p => p.cat === c.id).length} товаров</span>
    </div>`).join('');
  refreshIcons();
}

/* ---------- ORDERS ---------- */
const STATUS_FLOW = ['NEW', 'CONFIRMED', 'PROCESSING', 'READY', 'DELIVERING', 'COMPLETED', 'CANCELLED'];
function statusLabel(s) {
  return { NEW: 'Новый', CONFIRMED: 'Подтверждён', PROCESSING: 'В обработке', READY: 'Готов', DELIVERING: 'Доставляется', COMPLETED: 'Завершён', CANCELLED: 'Отменён' }[s] || s;
}
function renderOrdersTable() {
  const orders = LS.get('ts_orders', []);
  document.getElementById('ordersTableBody').innerHTML = orders.map((o, idx) => `
    <tr class="border-b border-[var(--line)]">
      <td class="py-2.5 pr-3 font-semibold">#${o.id}</td>
      <td class="py-2.5 pr-3">${o.name}</td>
      <td class="py-2.5 pr-3 text-[var(--ink-400)]">${o.phone}</td>
      <td class="py-2.5 pr-3 font-semibold">${fmt(o.total)}</td>
      <td class="py-2.5 pr-3">
        <select onchange="updateOrderStatus(${idx}, this.value)" class="admin-status-badge status-${o.status} border-none outline-none text-xs font-semibold py-1 px-2 rounded-lg">
          ${STATUS_FLOW.map(s => `<option value="${s}" ${o.status===s?'selected':''}>${statusLabel(s)}</option>`).join('')}
        </select>
      </td>
      <td class="py-2.5 pr-3 text-[var(--ink-400)]">${new Date(o.date).toLocaleDateString('ru-RU')}</td>
      <td class="py-2.5 pr-3"><button class="text-xs font-semibold px-2.5 py-1 rounded-lg" style="background:#eef3ff;color:var(--blue-500)" onclick="viewOrder(${idx})">Открыть</button></td>
    </tr>`).join('') || `<tr><td colspan="7" class="text-center py-8 text-[var(--ink-400)]">Заказов пока нет</td></tr>`;
}
function updateOrderStatus(idx, status) {
  const orders = LS.get('ts_orders', []);
  orders[idx].status = status;
  LS.set('ts_orders', orders);
  renderOrdersTable();
  toast('Статус заказа обновлён');
}
function viewOrder(idx) {
  const o = LS.get('ts_orders', [])[idx];
  const items = o.items.map(i => `<div class="flex justify-between text-sm py-1"><span>${i.qty}× ${i.name}</span><span class="font-medium">${fmt(i.price * i.qty)}</span></div>`).join('');
  document.getElementById('orderViewModal').innerHTML = `
  <div class="overlay-scrim fixed inset-0 z-[85] flex items-center justify-center p-4" onclick="if(event.target===this) closeOrderView()">
    <div class="modal-card w-full max-w-md p-6">
      <div class="flex items-center justify-between mb-4"><h3 class="font-display font-bold">Заказ #${o.id}</h3><button class="icon-btn" onclick="closeOrderView()"><i data-lucide="x" class="w-5 h-5"></i></button></div>
      <div class="text-sm space-y-1.5 mb-4">
        <div><span class="text-[var(--ink-400)]">Клиент:</span> ${o.name}</div>
        <div><span class="text-[var(--ink-400)]">Телефон:</span> ${o.phone}</div>
        <div><span class="text-[var(--ink-400)]">Город:</span> ${o.city} ${o.address ? '· ' + o.address : ''}</div>
        <div><span class="text-[var(--ink-400)]">Получение:</span> ${o.delivery === 'delivery' ? 'Доставка' : 'Самовывоз'}</div>
        <div><span class="text-[var(--ink-400)]">Оплата:</span> ${{cash:'Наличными',transfer:'Перевод',other:'Другое'}[o.payment]}</div>
        ${o.comment ? `<div><span class="text-[var(--ink-400)]">Комментарий:</span> ${o.comment}</div>` : ''}
      </div>
      <div class="border-t border-[var(--line)] pt-3">${items}</div>
      <div class="flex justify-between font-bold mt-3 pt-3 border-t border-[var(--line)]"><span>Итого</span><span>${fmt(o.total)}</span></div>
    </div>
  </div>`;
  document.getElementById('orderViewModal').classList.remove('hidden');
  refreshIcons();
}
function closeOrderView() { document.getElementById('orderViewModal').classList.add('hidden'); document.getElementById('orderViewModal').innerHTML=''; }

/* ---------- CUSTOMERS ---------- */
function renderCustomersTable() {
  const orders = LS.get('ts_orders', []);
  const map = {};
  orders.forEach(o => {
    if (!map[o.phone]) map[o.phone] = { name: o.name, phone: o.phone, count: 0, total: 0, last: o.date };
    map[o.phone].count++; map[o.phone].total += o.total;
    if (new Date(o.date) > new Date(map[o.phone].last)) map[o.phone].last = o.date;
  });
  const customers = Object.values(map);
  document.getElementById('customersTableBody').innerHTML = customers.map(c => `
    <tr class="border-b border-[var(--line)]">
      <td class="py-2.5 pr-3 font-medium">${c.name}</td>
      <td class="py-2.5 pr-3 text-[var(--ink-400)]">${c.phone}</td>
      <td class="py-2.5 pr-3">${c.count}</td>
      <td class="py-2.5 pr-3 font-semibold">${fmt(c.total)}</td>
      <td class="py-2.5 pr-3 text-[var(--ink-400)]">${new Date(c.last).toLocaleDateString('ru-RU')}</td>
    </tr>`).join('') || `<tr><td colspan="5" class="text-center py-8 text-[var(--ink-400)]">Клиентов пока нет</td></tr>`;
}

/* ---------- PROMOTIONS ---------- */
function renderPromotions() {
  const promos = LS.get('ts_promos', [{ code: 'WELCOME10', discount: 10 }]);
  document.getElementById('promosList').innerHTML = promos.map((p, i) => `
    <div class="flex items-center justify-between py-3 border-b border-[var(--line)]">
      <div><div class="font-semibold text-sm">${p.code}</div><div class="text-xs text-[var(--ink-400)]">Скидка ${p.discount}%</div></div>
      <button class="text-xs font-semibold px-2.5 py-1 rounded-lg" style="background:#fef2f2;color:#ef4444" onclick="removePromo(${i})">Удалить</button>
    </div>`).join('');
}
function addPromo(ev) {
  ev.preventDefault();
  const code = document.getElementById('promoCode').value.toUpperCase();
  const discount = parseInt(document.getElementById('promoDiscount').value);
  if (!code || !discount) return;
  const promos = LS.get('ts_promos', [{ code: 'WELCOME10', discount: 10 }]);
  promos.push({ code, discount });
  LS.set('ts_promos', promos);
  ev.target.reset();
  renderPromotions();
  toast('Промокод создан');
}
function removePromo(i) {
  const promos = LS.get('ts_promos', []);
  promos.splice(i, 1);
  LS.set('ts_promos', promos);
  renderPromotions();
}

/* ---------- SETTINGS ---------- */
function loadSettings() {
  const s = LS.get('ts_settings', { name: 'TEXNIKA SKLAD', phone: '+992 90 123 45 67', address: 'г. Душанбе, ул. Рудаки 123', hours: 'Пн–Вс: 09:00 – 21:00', currency: 'TJS' });
  Object.keys(s).forEach(k => { const el = document.getElementById('set-' + k); if (el) el.value = s[k]; });
}
function saveSettings(ev) {
  ev.preventDefault();
  const s = {};
  ['name','phone','address','hours','currency'].forEach(k => s[k] = document.getElementById('set-' + k).value);
  LS.set('ts_settings', s);
  toast('Настройки сохранены');
}

/* ---------- AI SETTINGS ---------- */
function loadAISettings() {
  const s = LS.get('ts_ai_settings', { provider: 'anthropic', model: 'claude-sonnet-4-6', temperature: 0.5, prompt: 'Ты — консультант TEXNIKA AI. Отвечай только на основе данных из базы товаров магазина, кратко и дружелюбно.' });
  document.getElementById('ai-provider').value = s.provider;
  document.getElementById('ai-model').value = s.model;
  document.getElementById('ai-temp').value = s.temperature;
  document.getElementById('ai-prompt').value = s.prompt;
}
function saveAISettings(ev) {
  ev.preventDefault();
  const s = {
    provider: document.getElementById('ai-provider').value,
    model: document.getElementById('ai-model').value,
    temperature: document.getElementById('ai-temp').value,
    prompt: document.getElementById('ai-prompt').value,
  };
  LS.set('ts_ai_settings', s);
  toast('Настройки AI сохранены');
}

/* ---------- INIT ---------- */
function initAdmin() {
  refreshIcons();
  showSection('dashboard', document.querySelector('.admin-nav-item'));
  renderPromotions();
  loadSettings();
  loadAISettings();
  document.getElementById('productSearch')?.addEventListener('input', e => renderProductsTable(e.target.value));
}

document.addEventListener('DOMContentLoaded', () => {
  if (sessionStorage.getItem('ts_admin_auth') === '1') {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('adminApp').classList.remove('hidden');
    initAdmin();
  }
  refreshIcons();
});
