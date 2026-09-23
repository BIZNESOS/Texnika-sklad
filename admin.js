/* ============================================================
   TEXNIKA SKLAD — Admin Panel (demo / client-only prototype)
   Пароль-заглушка на клиенте — только для демонстрации UX.
   ADMIN_PASSWORD и allProducts() определены в app.js (общие для
   витрины, AI-чата и админки).
   В проде: Auth.js + роль ADMIN + защита на сервере (см. README).
   ============================================================ */

function adminProducts() { return allProducts(); }
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
let pfPhotos = [];
let pfSpecs = [];

function openProductForm(id) {
  editingProductId = id || null;
  const p = id ? adminProducts().find(x => x.id === id) : null;
  document.getElementById('pfTitle').textContent = id ? 'Редактировать товар' : 'Новый товар';
  document.getElementById('pf-name').value = p?.name || '';
  document.getElementById('pf-brand').value = p?.brand || BRANDS[0];
  document.getElementById('pf-cat').value = p?.cat || activeCategories()[0].id;
  document.getElementById('pf-price').value = p?.price || '';
  document.getElementById('pf-old').value = p?.old || '';
  document.getElementById('pf-stock').value = p?.stock ?? 10;
  document.getElementById('pf-desc').value = p?.desc || '';
  document.getElementById('pf-new').checked = p?.badges.includes('new') || false;
  document.getElementById('pf-sale').checked = p?.badges.includes('sale') || false;

  pfPhotos = p?.photos ? [...p.photos] : [];
  renderPfPhotos();
  pfSpecs = p?.specs && Object.keys(p.specs).length ? Object.entries(p.specs).map(([k, v]) => ({ k, v })) : [{ k: '', v: '' }];
  renderPfSpecs();

  document.getElementById('productFormModal').classList.remove('hidden');
  updatePfAiFillButtonUI();
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

/* ---------- Фото товара: до 10 шт., автосжатие на клиенте ---------- */
async function handlePfPhotoUpload(input) {
  const files = Array.from(input.files || []);
  input.value = '';
  const room = 10 - pfPhotos.length;
  if (room <= 0) { toast('Максимум 10 фото на товар'); return; }
  const toProcess = files.slice(0, room);
  toast(`Сжимаем ${toProcess.length} фото…`);
  for (const file of toProcess) {
    try { const dataUrl = await compressImage(file, 1000, 0.72); pfPhotos.push(dataUrl); }
    catch (e) { console.error(e); }
  }
  renderPfPhotos();
}
function removePfPhoto(i) { pfPhotos.splice(i, 1); renderPfPhotos(); }
function renderPfPhotos() {
  const el = document.getElementById('pfPhotoPreview');
  if (!el) return;
  el.innerHTML = pfPhotos.map((src, i) => `
    <div class="relative w-16 h-16 rounded-lg overflow-hidden border border-[var(--line)] shrink-0">
      <img src="${src}" class="w-full h-full object-cover">
      <button type="button" onclick="removePfPhoto(${i})" class="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center text-xs">✕</button>
    </div>`).join('') +
    (pfPhotos.length < 10 ? `<label class="w-16 h-16 rounded-lg border-2 border-dashed border-[var(--line)] flex items-center justify-center shrink-0 cursor-pointer text-[var(--ink-400)]">
      <i data-lucide="plus" class="w-5 h-5"></i>
      <input type="file" accept="image/*" multiple class="hidden" onchange="handlePfPhotoUpload(this)">
    </label>` : '');
  document.getElementById('pfPhotoCount').textContent = pfPhotos.length + '/10';
  refreshIcons();
}

/* ---------- Характеристики товара: динамические пары ключ/значение ---------- */
function addPfSpecRow() { pfSpecs.push({ k: '', v: '' }); renderPfSpecs(); }
function removePfSpecRow(i) { pfSpecs.splice(i, 1); renderPfSpecs(); }
function updatePfSpec(i, field, val) { pfSpecs[i][field] = val; }
function renderPfSpecs() {
  const el = document.getElementById('pfSpecsRows');
  if (!el) return;
  el.innerHTML = pfSpecs.map((row, i) => `
    <div class="flex gap-2">
      <input value="${(row.k || '').replace(/"/g, '&quot;')}" placeholder="Параметр (напр. Диагональ)" oninput="updatePfSpec(${i},'k',this.value)" class="flex-1 border border-[var(--line)] rounded-lg px-2.5 py-2 text-xs outline-none">
      <input value="${(row.v || '').replace(/"/g, '&quot;')}" placeholder="Значение (напр. 55 дюймов)" oninput="updatePfSpec(${i},'v',this.value)" class="flex-1 border border-[var(--line)] rounded-lg px-2.5 py-2 text-xs outline-none">
      <button type="button" onclick="removePfSpecRow(${i})" class="w-8 h-8 shrink-0 rounded-lg text-red-500 flex items-center justify-center" style="background:#fef2f2"><i data-lucide="x" class="w-3.5 h-3.5"></i></button>
    </div>`).join('');
  refreshIcons();
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
  const specs = {};
  pfSpecs.forEach(row => { if (row.k && row.k.trim()) specs[row.k.trim()] = row.v; });
  const catInfo = activeCategories().find(c => c.id === cat);
  const data = {
    name: document.getElementById('pf-name').value,
    brand: document.getElementById('pf-brand').value,
    cat, price, old,
    discount: old ? Math.round((1 - price / old) * 100) : 0,
    stock: parseInt(document.getElementById('pf-stock').value) || 0,
    desc: document.getElementById('pf-desc').value,
    badges, colors: ART[cat] || ['#1e293b', '#2f7bff'], icon: (catInfo && catInfo.icon) || ICONS[cat] || 'box',
    specs, variants: [], rating: 4.5, reviews: 0,
    photos: [...pfPhotos],
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
  const custom = LS.get('ts_custom_categories', []);
  const customIds = new Set(custom.map(c => c.id));
  document.getElementById('categoriesAdminList').innerHTML = activeCategories().map(c => {
    const photo = categoryPhoto(c.id);
    const isCustom = customIds.has(c.id);
    const thumb = photo ? `<img src="${photo}" class="w-full h-full object-cover">` : `<i data-lucide="${c.icon || 'shapes'}" class="w-4 h-4"></i>`;
    return `
    <div class="flex items-center justify-between py-3 border-b border-[var(--line)]">
      <div class="flex items-center gap-3">
        <div class="cat-icon-wrap" style="width:40px;height:40px;border-radius:10px">${thumb}</div>
        <div><span class="font-medium text-sm">${c.name}</span>${isCustom ? '<span class="ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded" style="background:#eef3ff;color:var(--blue-500)">своя</span>' : ''}</div>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-xs text-[var(--ink-400)]">${adminProducts().filter(p => p.cat === c.id).length} товаров</span>
        <label class="text-xs font-semibold px-2.5 py-1 rounded-lg cursor-pointer" style="background:#eef3ff;color:var(--blue-500)">Фото
          <input type="file" accept="image/*" class="hidden" onchange="handleCategoryPhotoUpload('${c.id}', this)">
        </label>
        ${isCustom ? `<button class="text-xs font-semibold px-2.5 py-1 rounded-lg" style="background:#fef2f2;color:#ef4444" onclick="deleteCategory('${c.id}')">Удалить</button>` : ''}
      </div>
    </div>`;
  }).join('');
  refreshIcons();
}

async function handleCategoryPhotoUpload(catId, input) {
  const file = input.files && input.files[0];
  input.value = '';
  if (!file) return;
  try {
    const dataUrl = await compressImage(file, 500, 0.75);
    const photos = LS.get('ts_category_photos', {});
    photos[catId] = dataUrl;
    LS.set('ts_category_photos', photos);
    renderCategoriesAdmin();
    toast('Фото категории обновлено');
  } catch (e) { console.error(e); toast('Не удалось загрузить фото'); }
}

function openCategoryForm() {
  document.getElementById('catf-name').value = '';
  document.getElementById('categoryFormModal').classList.remove('hidden');
}
function closeCategoryForm() { document.getElementById('categoryFormModal').classList.add('hidden'); }
function saveCategoryForm(ev) {
  ev.preventDefault();
  const name = document.getElementById('catf-name').value.trim();
  if (!name) return;
  const id = slugify(name) + '-' + Date.now().toString(36);
  const custom = LS.get('ts_custom_categories', []);
  custom.push({ id, name, icon: 'shapes' });
  LS.set('ts_custom_categories', custom);
  closeCategoryForm();
  renderCategoriesAdmin();
  populateProductFormSelectors();
  toast('Категория создана');
}
function deleteCategory(id) {
  if (!confirm('Удалить категорию? Товары в ней останутся, но без категории.')) return;
  let custom = LS.get('ts_custom_categories', []);
  custom = custom.filter(c => c.id !== id);
  LS.set('ts_custom_categories', custom);
  const photos = LS.get('ts_category_photos', {});
  delete photos[id];
  LS.set('ts_category_photos', photos);
  renderCategoriesAdmin();
  populateProductFormSelectors();
  toast('Категория удалена');
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

/* ---------- ИНТЕГРАЦИИ: Firebase (структурированный конфиг) + Telegram-бот ---------- */
const FIREBASE_FIELDS = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
function loadIntegrations() {
  const s = LS.get('ts_integrations', {});
  const fb = s.firebase || {};
  FIREBASE_FIELDS.forEach(k => { const el = document.getElementById('fb-' + k); if (el) el.value = fb[k] || ''; });
  document.getElementById('int-tg-token').value = s.tgToken || '';
  document.getElementById('int-tg-chat').value = s.tgChatId || '';
}
function saveIntegrations(ev) {
  ev.preventDefault();
  const firebase = {};
  FIREBASE_FIELDS.forEach(k => { firebase[k] = document.getElementById('fb-' + k).value.trim(); });
  const s = {
    firebase,
    tgToken: document.getElementById('int-tg-token').value.trim(),
    tgChatId: document.getElementById('int-tg-chat').value.trim(),
  };
  LS.set('ts_integrations', s);
  toast('Настройки интеграций сохранены');
}
async function sendTelegramTest() {
  const s = LS.get('ts_integrations', {});
  if (!s.tgToken || !s.tgChatId) { toast('Заполните токен бота и Chat ID'); return; }
  try {
    const res = await fetch(`https://api.telegram.org/bot${s.tgToken}/sendMessage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: s.tgChatId, text: '✅ TEXNIKA SKLAD: тестовое сообщение. Бот подключён верно.' }),
    });
    const data = await res.json();
    toast(data.ok ? 'Тестовое сообщение отправлено!' : 'Ошибка Telegram: ' + (data.description || 'проверьте токен/Chat ID'));
  } catch (e) { toast('Не удалось отправить — проверьте токен и Chat ID'); }
}

/* ---------- БАННЕРЫ: главный (hero) и промо, с автосжатием ---------- */
function loadBanners() {
  const b = LS.get('ts_banners', {});
  renderBannerPreview('hero', b.hero);
  renderBannerPreview('promo', b.promo);
}
function renderBannerPreview(key, src) {
  const el = document.getElementById('banner-preview-' + key);
  if (!el) return;
  el.innerHTML = src
    ? `<img src="${src}" class="w-full h-28 object-cover rounded-xl">`
    : `<div class="w-full h-28 rounded-xl flex items-center justify-center text-xs text-[var(--ink-400)]" style="background:var(--bg-light)">Фото не выбрано</div>`;
}
async function handleBannerUpload(key, input) {
  const file = input.files && input.files[0];
  input.value = '';
  if (!file) return;
  try {
    const dataUrl = await compressImage(file, 1600, 0.78);
    const b = LS.get('ts_banners', {});
    b[key] = dataUrl;
    LS.set('ts_banners', b);
    renderBannerPreview(key, dataUrl);
    toast('Баннер обновлён — будет виден на главной странице');
  } catch (e) { toast('Не удалось загрузить фото'); }
}
function clearBanner(key) {
  const b = LS.get('ts_banners', {});
  delete b[key];
  LS.set('ts_banners', b);
  renderBannerPreview(key, null);
}

/* ---------- AI SETTINGS ---------- */
function loadAISettings() {
  const s = LS.get('ts_ai_settings', { provider: 'anthropic', model: 'claude-sonnet-4-6', apiKey: '', temperature: 0.5, prompt: 'Ты — консультант TEXNIKA AI. Отвечай только на основе данных из базы товаров магазина, кратко и дружелюбно.' });
  document.getElementById('ai-provider').value = s.provider;
  document.getElementById('ai-model').value = s.model;
  document.getElementById('ai-key').value = s.apiKey || '';
  document.getElementById('ai-temp').value = s.temperature;
  document.getElementById('ai-prompt').value = s.prompt;
}
function saveAISettings(ev) {
  ev.preventDefault();
  const s = {
    provider: document.getElementById('ai-provider').value,
    model: document.getElementById('ai-model').value,
    apiKey: document.getElementById('ai-key').value.trim(),
    temperature: document.getElementById('ai-temp').value,
    prompt: document.getElementById('ai-prompt').value,
  };
  LS.set('ts_ai_settings', s);
  toast('Настройки AI сохранены');
}

/* ---------- Прямой вызов реального AI-провайдера из браузера ----------
   Используется только внутри админ-панели (кнопка автозаполнения товара).
   Ключ хранится в localStorage этого браузера — не для публичных страниц. */
async function callAI(prompt) {
  const s = LS.get('ts_ai_settings', {});
  if (!s.apiKey) throw new Error('Не задан API-ключ в разделе AI Management → API ключ');
  const temp = parseFloat(s.temperature) || 0.5;

  if (s.provider === 'openai') {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + s.apiKey },
      body: JSON.stringify({ model: s.model || 'gpt-4o-mini', temperature: temp, messages: [{ role: 'user', content: prompt }] }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message || 'OpenAI API error');
    return data.choices?.[0]?.message?.content || '';
  }

  if (s.provider === 'gemini') {
    const model = s.model || 'gemini-1.5-flash';
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${s.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: temp } }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message || 'Gemini API error');
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  // anthropic (по умолчанию)
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': s.apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({ model: s.model || 'claude-sonnet-4-6', max_tokens: 1000, messages: [{ role: 'user', content: prompt }] }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || 'Anthropic API error');
  return (data.content || []).map(b => b.text || '').join('\n');
}

/* ---------- Автозаполнение характеристик и описания товара кнопкой AI ---------- */
async function aiFillProduct() {
  const name = document.getElementById('pf-name').value.trim();
  if (!name) { toast('Сначала введите название/модель товара'); return; }
  const brand = document.getElementById('pf-brand').value;
  const catId = document.getElementById('pf-cat').value;
  const catName = (activeCategories().find(c => c.id === catId) || {}).name || catId;

  const btn = document.getElementById('pfAiFillBtn');
  const label = document.getElementById('pfAiFillBtnLabel');
  btn.disabled = true;
  label.textContent = 'Думаю…';

  const prompt = `Ты — эксперт по бытовой технике и электронике. Дан товар для интернет-магазина:
Название/модель: "${name}"
Бренд: ${brand}
Категория: ${catName}

Найди в своих знаниях реальные технические характеристики именно этой модели (или, если это невозможно определить точно, дай максимально реалистичные типичные характеристики для такой модели в этой категории).

Ответь СТРОГО в формате JSON без markdown-разметки, без пояснений, без текста до или после — только один JSON-объект:
{
  "desc": "подробное продающее описание товара на русском языке, 2-4 предложения",
  "specs": { "Параметр 1": "значение", "Параметр 2": "значение", "...": "..." }
}
В "specs" включи 6-10 самых важных характеристик для этой категории товара (например для ТВ — диагональ, разрешение, Smart TV, ОС, гарантия; для холодильника — объём, система разморозки, класс энергопотребления; для смартфона — экран, память, камера, батарея и т.д.). Значения делай короткими и конкретными.`;

  try {
    const raw = await callAI(prompt);
    const jsonText = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(jsonText);
    if (parsed.desc) document.getElementById('pf-desc').value = parsed.desc;
    if (parsed.specs && typeof parsed.specs === 'object') {
      pfSpecs = Object.entries(parsed.specs).map(([k, v]) => ({ k, v: String(v) }));
      if (!pfSpecs.length) pfSpecs = [{ k: '', v: '' }];
      renderPfSpecs();
    }
    toast('Готово — характеристики и описание заполнены AI');
    incrementAIProUsage();
  } catch (e) {
    console.error(e);
    toast('Ошибка AI: ' + (e.message || 'проверьте API-ключ в разделе AI Management'));
  } finally {
    btn.disabled = false;
    updatePfAiFillButtonUI();
  }
}

/* ============================================================
   TEXNIKA AI Pro — платное автозаполнение, лимит и окно покупки
   ЛОКАЛЬНЫЙ переключатель (localStorage) — временная замена,
   пока не подключён реальный бэкенд (Firebase/Cloud Function),
   который бы проверял оплату на сервере, а не в браузере клиента.
   ============================================================ */
const AI_PRO_CONFIG = { price: '49 TJS / месяц', limit: 15, cycleHours: 12 };

/* Заполните сами перед публикацией сайта — НЕ используйте токен,
   который когда-либо был отправлен в чат/скриншот/лог: получите
   новый через @BotFather → /revoke → /token, и вставьте сюда. */
const AI_PRO_BOT_TOKEN = '8949070949:AAEogOkMSw-EG-U4aU-ondrJQ_9GrZ5Yo2M';       // токен вашего бота-продавца
const AI_PRO_ADMIN_CHAT_ID = '8506743201';   // ваш личный Telegram chat_id для одобрения оплат

function getAIProState() { return LS.get('ts_ai_pro', { active: false, used: 0, cycleStart: null }); }
function saveAIProState(s) { LS.set('ts_ai_pro', s); }

function aiProStatus() {
  const s = getAIProState();
  if (!s.active) return { state: 'inactive' };
  if (s.used >= AI_PRO_CONFIG.limit && s.cycleStart) {
    const remain = AI_PRO_CONFIG.cycleHours * 3600 * 1000 - (Date.now() - s.cycleStart);
    if (remain > 0) return { state: 'cooldown', remainMs: remain };
    saveAIProState({ ...s, used: 0, cycleStart: null });
    return { state: 'ok', used: 0, limit: AI_PRO_CONFIG.limit };
  }
  return { state: 'ok', used: s.used, limit: AI_PRO_CONFIG.limit };
}
function incrementAIProUsage() {
  const s = getAIProState();
  s.used = (s.used || 0) + 1;
  if (s.used >= AI_PRO_CONFIG.limit && !s.cycleStart) s.cycleStart = Date.now();
  saveAIProState(s);
  renderAIProStatusCard();
  updatePfAiFillButtonUI();
}
function formatCountdown(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(total / 3600)).padStart(2, '0');
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
  const s = String(total % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function renderAIProStatusCard() {
  const badge = document.getElementById('aiProStatusBadge');
  if (!badge) return;
  const usageLine = document.getElementById('aiProUsageLine');
  const manualBtn = document.getElementById('aiProManualBtn');
  const deactivateBtn = document.getElementById('aiProDeactivateBtn');
  const st = aiProStatus();
  if (st.state === 'inactive') {
    badge.textContent = 'не активен'; badge.className = 'admin-status-badge status-CANCELLED';
    usageLine.classList.add('hidden');
    manualBtn.classList.remove('hidden'); deactivateBtn.classList.add('hidden');
  } else if (st.state === 'cooldown') {
    badge.textContent = 'лимит исчерпан'; badge.className = 'admin-status-badge status-PROCESSING';
    usageLine.textContent = 'Доступно через ' + formatCountdown(st.remainMs);
    usageLine.classList.remove('hidden');
    manualBtn.classList.add('hidden'); deactivateBtn.classList.remove('hidden');
  } else {
    badge.textContent = 'активен'; badge.className = 'admin-status-badge status-COMPLETED';
    usageLine.textContent = `Использовано ${st.used}/${st.limit} за текущий 12-часовой период`;
    usageLine.classList.remove('hidden');
    manualBtn.classList.add('hidden'); deactivateBtn.classList.remove('hidden');
  }
}

function updatePfAiFillButtonUI() {
  const btn = document.getElementById('pfAiFillBtn');
  const label = document.getElementById('pfAiFillBtnLabel');
  const sub = document.getElementById('pfAiFillSub');
  const icon = btn ? btn.querySelector('i') : null;
  if (!btn) return;
  const st = aiProStatus();
  btn.classList.remove('cursor-not-allowed');
  if (st.state === 'inactive') {
    btn.style.background = '#94a3b8';
    label.textContent = 'AI Pro заблокирован — нажмите, чтобы подключить';
    sub.textContent = `${AI_PRO_CONFIG.price} · до ${AI_PRO_CONFIG.limit} заполнений каждые ${AI_PRO_CONFIG.cycleHours} ч`;
    if (icon) icon.setAttribute('data-lucide', 'lock');
  } else if (st.state === 'cooldown') {
    btn.style.background = '#cbd5e1';
    btn.classList.add('cursor-not-allowed');
    label.textContent = 'Лимит исчерпан';
    sub.textContent = 'Доступно через ' + formatCountdown(st.remainMs);
    if (icon) icon.setAttribute('data-lucide', 'clock');
  } else {
    btn.style.background = 'linear-gradient(150deg,var(--blue-500),#7c3aed)';
    label.textContent = 'Заполнить характеристики и описание с помощью AI';
    sub.textContent = `Использовано: ${st.used}/${st.limit} за текущий 12-часовой период`;
    if (icon) icon.setAttribute('data-lucide', 'sparkles');
  }
  refreshIcons();
}

function onPfAiFillClick() {
  const st = aiProStatus();
  if (st.state === 'inactive') { openAIProModal(); return; }
  if (st.state === 'cooldown') { toast('Лимит исчерпан. Доступно через ' + formatCountdown(st.remainMs)); return; }
  aiFillProduct();
}

function openAIProModal() { document.getElementById('aiProModal').classList.remove('hidden'); refreshIcons(); }
function closeAIProModal() { document.getElementById('aiProModal').classList.add('hidden'); }

/* Отправляет заявку в Telegram (если бот настроен) и открывает чат с ботом.
   Подтверждение оплаты всё равно делает человек вручную — кнопкой ниже,
   пока не подключён сервер, который читал бы нажатия внутри Telegram. */
async function requestAIProPurchase() {
  if (!AI_PRO_BOT_TOKEN || !AI_PRO_ADMIN_CHAT_ID) {
    toast('Приём оплаты ещё не настроен: впишите AI_PRO_BOT_TOKEN и AI_PRO_ADMIN_CHAT_ID в admin.js');
    return;
  }
  const storeName = (LS.get('ts_settings', {}).name) || 'TEXNIKA SKLAD';
  const text = `💳 Заявка на AI Pro (${AI_PRO_CONFIG.price})\nМагазин: ${storeName}\nВремя: ${new Date().toLocaleString('ru-RU')}\n\nПодтвердите вручную после получения оплаты.`;
  try {
    await fetch(`https://api.telegram.org/bot${AI_PRO_BOT_TOKEN}/sendMessage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: AI_PRO_ADMIN_CHAT_ID, text }),
    });
  } catch (e) { console.error(e); }
  try {
    const meRes = await fetch(`https://api.telegram.org/bot${AI_PRO_BOT_TOKEN}/getMe`);
    const me = await meRes.json();
    if (me.ok && me.result && me.result.username) window.open(`https://t.me/${me.result.username}`, '_blank');
  } catch (e) { console.error(e); }
  closeAIProModal();
  toast('Заявка отправлена — оплатите и пришлите чек в Telegram');
}

function activateAIProManually() {
  if (!confirm('Активировать AI Pro? Делайте это только после того как реально убедились, что оплата получена.')) return;
  saveAIProState({ active: true, used: 0, cycleStart: null });
  renderAIProStatusCard();
  updatePfAiFillButtonUI();
  closeAIProModal();
  toast('AI Pro активирован');
}
function deactivateAIPro() {
  saveAIProState({ active: false, used: 0, cycleStart: null });
  renderAIProStatusCard();
  updatePfAiFillButtonUI();
  toast('AI Pro отключён');
}

setInterval(() => { renderAIProStatusCard(); updatePfAiFillButtonUI(); }, 1000);

/* ---------- INIT ---------- */
function populateProductFormSelectors() {
  const brandSel = document.getElementById('pf-brand');
  const catSel = document.getElementById('pf-cat');
  if (brandSel) brandSel.innerHTML = BRANDS.map(b => `<option value="${b}">${b}</option>`).join('');
  if (catSel) catSel.innerHTML = activeCategories().map(c => `<option value="${c.id}">${c.name}</option>`).join('');
}

function initAdmin() {
  refreshIcons();
  showSection('dashboard', document.querySelector('.admin-nav-item'));
  renderPromotions();
  loadSettings();
  loadAISettings();
  loadIntegrations();
  loadBanners();
  populateProductFormSelectors();
  renderAIProStatusCard();
  updatePfAiFillButtonUI();
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
