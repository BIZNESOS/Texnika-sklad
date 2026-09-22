/* ============================================================
   TEXNIKA SKLAD — front-end logic (demo / client-only prototype)
   Хранение: localStorage (cart, favorites, compare, orders, lang)
   AI: упрощённая имитация NLU по ключевым словам + локальная база
   товаров — в проде заменяется на server-side вызов Anthropic API.
   ============================================================ */

const LS = {
  get(key, fallback) { try { const v = JSON.parse(localStorage.getItem(key)); return v ?? fallback; } catch { return fallback; } },
  set(key, val) { localStorage.setItem(key, JSON.stringify(val)); },
};

const state = {
  cart: LS.get('ts_cart', []),         // [{id, qty, variant}]
  favorites: LS.get('ts_favorites', []), // [id]
  compare: LS.get('ts_compare', []),   // [id] max 4
  lang: LS.get('ts_lang', 'ru'),
  activeCategory: null,
  activeTab: 'hits',
  search: '',
};

const money = n => n.toLocaleString('ru-RU') + ' с.';
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

function findProduct(id) { return PRODUCTS.find(p => p.id === id); }

/* ============ ICONS ============ */
function refreshIcons() { if (window.lucide) lucide.createIcons(); }

/* ============ HEADER COUNTS ============ */
function updateCounts() {
  const cartCount = state.cart.reduce((s, i) => s + i.qty, 0);
  const favCount = state.favorites.length;
  $$('.cart-count').forEach(el => { el.textContent = cartCount; el.classList.toggle('hidden', cartCount === 0); });
  $$('.fav-count').forEach(el => { el.textContent = favCount; el.classList.toggle('hidden', favCount === 0); });
  const cmp = state.compare.length;
  const bar = $('#compareBar');
  if (bar) {
    bar.classList.toggle('hidden', cmp === 0);
    $('#compareCount').textContent = cmp;
  }
}

/* ============ PRODUCT CARD RENDER ============ */
function productArtSVG(p, size = 64) {
  const [c1, c2] = p.colors;
  return `<div class="w-full h-full flex items-center justify-center" style="background:linear-gradient(150deg, ${c1}, ${c2}22)">
    <i data-lucide="${p.icon}" style="width:${size}px;height:${size}px;color:${c2}" stroke-width="1.5"></i>
  </div>`;
}

function starRow(rating) {
  const full = Math.round(rating);
  let out = '';
  for (let i = 0; i < 5; i++) out += `<i data-lucide="star" class="w-3.5 h-3.5 ${i < full ? '' : 'opacity-25'}" style="fill:currentColor"></i>`;
  return out;
}

function productCard(p) {
  const isFav = state.favorites.includes(p.id);
  const badges = p.badges.map(b => `<span class="badge badge-${b}">${b === 'sale' ? '-' + p.discount + '%' : 'NEW'}</span>`).join('');
  return `
  <div class="product-card fade-in" data-id="${p.id}">
    <div class="relative">
      <div class="product-art cursor-pointer" onclick="openProduct('${p.id}')">${productArtSVG(p)}</div>
      <div class="absolute top-2.5 left-2.5 flex gap-1.5">${badges}</div>
      <button class="fav-btn absolute top-2.5 right-2.5 ${isFav ? 'is-fav' : ''}" onclick="toggleFavorite('${p.id}', event)">
        <i data-lucide="heart" class="w-4 h-4" style="${isFav ? 'fill:currentColor' : ''}"></i>
      </button>
    </div>
    <div class="p-3.5 flex flex-col gap-1.5 flex-1">
      <div class="text-xs text-[var(--ink-400)] font-medium">${p.brand}</div>
      <div class="text-sm font-semibold leading-snug cursor-pointer line-clamp-2" onclick="openProduct('${p.id}')">${p.name}</div>
      <div class="flex items-center gap-1 star-row text-xs">${starRow(p.rating)}<span class="text-[var(--ink-400)] ml-1">(${p.reviews})</span></div>
      <div class="flex items-baseline gap-2 mt-0.5">
        <span class="text-base font-bold">${money(p.price)}</span>
        ${p.old ? `<span class="price-old">${money(p.old)}</span>` : ''}
      </div>
      <div class="flex items-center gap-1.5 text-xs text-[var(--success)] font-medium"><span class="stock-dot"></span>В наличии</div>
      <button class="add-cart-btn text-xs py-2.5 mt-2 flex items-center justify-center gap-1.5" onclick="handleAddToCart('${p.id}', this, event)">
        <i data-lucide="shopping-cart" class="w-3.5 h-3.5"></i><span>В корзину</span>
      </button>
    </div>
  </div>`;
}

function handleAddToCart(id, btn, ev) {
  if (ev) ev.stopPropagation();
  addToCart(id, 1);
  if (btn) {
    const span = btn.querySelector('span');
    const original = span.textContent;
    btn.classList.add('added');
    span.textContent = '✓ Добавлено';
    setTimeout(() => { btn.classList.remove('added'); span.textContent = original; }, 1400);
  }
}

function addToCart(id, qty, variant) {
  const existing = state.cart.find(i => i.id === id && i.variant === variant);
  if (existing) existing.qty += qty;
  else state.cart.push({ id, qty, variant: variant || null });
  LS.set('ts_cart', state.cart);
  updateCounts();
  renderCart();
}

function toggleFavorite(id, ev) {
  if (ev) ev.stopPropagation();
  const idx = state.favorites.indexOf(id);
  if (idx > -1) state.favorites.splice(idx, 1); else state.favorites.push(id);
  LS.set('ts_favorites', state.favorites);
  updateCounts();
  document.querySelectorAll(`[data-id="${id}"] .fav-btn`).forEach(b => b.classList.toggle('is-fav'));
  refreshIcons();
}

function toggleCompare(id) {
  const idx = state.compare.indexOf(id);
  if (idx > -1) { state.compare.splice(idx, 1); }
  else {
    if (state.compare.length >= 4) { toast('Можно сравнить не более 4 товаров'); return; }
    state.compare.push(id);
  }
  LS.set('ts_compare', state.compare);
  updateCounts();
}

/* ============ CATALOG RENDER ============ */
function renderCategories(targetSel) {
  const el = $(targetSel);
  if (!el) return;
  el.innerHTML = CATEGORIES.map(c => `
    <div class="cat-card flex flex-col items-center gap-2.5 py-5 px-2 cursor-pointer" onclick="filterByCategory('${c.id}')">
      <div class="cat-icon-wrap"><i data-lucide="${c.icon}" class="w-5 h-5"></i></div>
      <span class="text-xs font-semibold text-center leading-tight">${c.name}</span>
    </div>`).join('') +
    `<div class="cat-card flex flex-col items-center justify-center gap-2.5 py-5 px-2 cursor-pointer" onclick="location.href='catalog.html'">
      <div class="cat-icon-wrap"><i data-lucide="arrow-right" class="w-5 h-5"></i></div>
      <span class="text-xs font-semibold text-center leading-tight">Все категории</span>
    </div>`;
  refreshIcons();
}

function filterByCategory(id) {
  location.href = `catalog.html?cat=${id}`;
}

function renderProductGrid(targetSel, list) {
  const el = $(targetSel);
  if (!el) return;
  if (!list.length) {
    el.innerHTML = `<div class="col-span-full flex flex-col items-center justify-center py-16 text-center gap-3">
      <i data-lucide="package-search" class="w-10 h-10 text-[var(--ink-400)]"></i>
      <div class="font-semibold">Товаров пока нет</div>
      <div class="text-sm text-[var(--ink-400)]">Попробуйте изменить фильтры или запрос поиска</div>
    </div>`;
  } else {
    el.innerHTML = list.map(productCard).join('');
  }
  refreshIcons();
}

function getPopularList() {
  let list = [...PRODUCTS];
  if (state.activeTab === 'hits') list.sort((a, b) => b.reviews - a.reviews);
  else if (state.activeTab === 'new') list = list.filter(p => p.badges.includes('new'));
  else if (state.activeTab === 'sale') list = list.filter(p => p.badges.includes('sale'));
  return list.slice(0, 10);
}

function setTab(tab, btn) {
  state.activeTab = tab;
  $$('.tab-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderProductGrid('#popularGrid', getPopularList());
}

/* ============ PRODUCT MODAL ============ */
let currentProduct = null;
let currentQty = 1;
let currentVariant = null;

function openProduct(id) {
  const p = findProduct(id);
  if (!p) return;
  currentProduct = p;
  currentQty = 1;
  currentVariant = p.variants[0] || null;
  const modal = $('#productModal');
  modal.innerHTML = productModalHTML(p);
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  refreshIcons();
}

function closeProduct() {
  $('#productModal').classList.add('hidden');
  document.body.style.overflow = '';
}

function productModalHTML(p) {
  const specsRows = Object.entries(p.specs).map(([k, v]) => `
    <div class="flex justify-between py-2.5 border-b border-[var(--line)] text-sm">
      <span class="text-[var(--ink-400)]">${k}</span><span class="font-medium">${v}</span>
    </div>`).join('');
  const variantChips = p.variants.length ? `
    <div class="flex flex-wrap gap-2 mb-4">
      ${p.variants.map(v => `<button class="chip-select px-3.5 py-1.5 text-sm ${v === currentVariant ? 'active' : ''}" onclick="selectVariant('${v.replace(/"/g, '&quot;')}', this)">${v}</button>`).join('')}
    </div>` : '';
  const related = PRODUCTS.filter(x => x.cat === p.cat && x.id !== p.id).slice(0, 4);

  return `
  <div class="overlay-scrim fixed inset-0 z-[70] flex items-end sm:items-center justify-center" onclick="if(event.target===this) closeProduct()">
    <div class="modal-card w-full sm:max-w-4xl max-h-[92vh] overflow-y-auto hide-scrollbar rounded-t-3xl sm:rounded-3xl">
      <div class="sticky top-0 bg-white/95 backdrop-blur flex items-center justify-between px-5 py-4 border-b border-[var(--line)] z-10">
        <button class="icon-btn" onclick="closeProduct()"><i data-lucide="arrow-left" class="w-5 h-5"></i></button>
        <span class="text-sm font-semibold">${getCategoryName(p.cat)}</span>
        <div class="flex items-center gap-1">
          <button class="icon-btn" onclick="toggleFavorite('${p.id}')"><i data-lucide="heart" class="w-5 h-5 ${state.favorites.includes(p.id) ? 'text-red-500' : ''}" style="${state.favorites.includes(p.id) ? 'fill:currentColor' : ''}"></i></button>
          <button class="icon-btn" onclick="closeProduct()"><i data-lucide="x" class="w-5 h-5"></i></button>
        </div>
      </div>

      <div class="grid sm:grid-cols-2 gap-0">
        <div class="p-6">
          <div class="rounded-2xl overflow-hidden aspect-square mb-3">${productArtSVG(p, 110)}</div>
          <div class="flex gap-2">
            ${[1,2,3].map(i => `<div class="w-14 h-14 rounded-lg overflow-hidden border border-[var(--line)]">${productArtSVG(p, 26)}</div>`).join('')}
          </div>
        </div>

        <div class="p-6 sm:pl-0">
          <div class="text-xs font-semibold text-[var(--blue-500)] uppercase tracking-wide mb-1" style="color:var(--blue-500)">${p.brand}</div>
          <h2 class="text-xl font-bold font-display mb-2">${p.name}</h2>
          <div class="flex items-center gap-2 mb-4">
            <div class="flex star-row text-sm">${starRow(p.rating)}</div>
            <span class="text-sm text-[var(--ink-400)]">${p.rating} · ${p.reviews} отзывов</span>
          </div>

          <div class="flex items-baseline gap-3 mb-1">
            <span class="text-2xl font-bold">${money(p.price)}</span>
            ${p.old ? `<span class="price-old text-base">${money(p.old)}</span><span class="badge badge-sale">-${p.discount}%</span>` : ''}
          </div>
          <div class="flex items-center gap-1.5 text-sm text-[var(--success)] font-medium mb-5"><span class="stock-dot"></span>В наличии · ${p.stock} шт.</div>

          ${p.variants.length ? `<div class="text-xs font-semibold text-[var(--ink-400)] mb-2 uppercase tracking-wide">Вариант</div>${variantChips}` : ''}

          <div class="flex items-center gap-3 mb-4">
            <div class="qty-stepper flex items-center">
              <button onclick="changeQty(-1)"><i data-lucide="minus" class="w-4 h-4 mx-auto"></i></button>
              <span class="w-9 text-center font-semibold" id="qtyLabel">${currentQty}</span>
              <button onclick="changeQty(1)"><i data-lucide="plus" class="w-4 h-4 mx-auto"></i></button>
            </div>
            <button class="btn-outline px-4 py-2.5 text-sm flex items-center gap-2" onclick="toggleCompare('${p.id}'); toast('Товар добавлен к сравнению')">
              <i data-lucide="scale" class="w-4 h-4"></i>Сравнить
            </button>
          </div>

          <div class="flex flex-col gap-2.5 mb-3">
            <button class="btn-primary py-3 text-sm" onclick="buyNow('${p.id}')">Купить сейчас</button>
            <button class="add-cart-btn py-3 text-sm flex items-center justify-center gap-2" onclick="addToCart('${p.id}', currentQty, currentVariant); toast('Добавлено в корзину')">
              <i data-lucide="shopping-cart" class="w-4 h-4"></i>Добавить в корзину
            </button>
          </div>
          <button class="w-full flex items-center justify-center gap-2 text-sm font-semibold py-2.5 rounded-full" style="background:#f2f7ff;color:var(--blue-500)" onclick="closeProduct(); askAIAbout('${p.id}')">
            <i data-lucide="sparkles" class="w-4 h-4"></i>Спросить AI об этом товаре
          </button>

          <div class="mt-6 border-t border-[var(--line)] pt-4">
            <div class="flex gap-5 text-sm font-semibold text-[var(--ink-400)] mb-3">
              <span class="pd-tab active" data-t="specs" onclick="switchPdTab('specs', this)" style="color:var(--navy-900);cursor:pointer">Характеристики</span>
              <span class="pd-tab" data-t="desc" onclick="switchPdTab('desc', this)" style="cursor:pointer">Описание</span>
              <span class="pd-tab" data-t="reviews" onclick="switchPdTab('reviews', this)" style="cursor:pointer">Отзывы</span>
            </div>
            <div id="pd-specs">${specsRows || '<p class="text-sm text-[var(--ink-400)]">Характеристики уточняйте у менеджера.</p>'}</div>
            <div id="pd-desc" class="hidden text-sm text-[var(--ink-600)] leading-relaxed">${p.desc}</div>
            <div id="pd-reviews" class="hidden text-sm text-[var(--ink-600)]">
              <div class="flex items-center gap-3 mb-3">
                <span class="text-3xl font-bold">${p.rating}</span>
                <div><div class="flex star-row text-sm">${starRow(p.rating)}</div><div class="text-xs text-[var(--ink-400)]">${p.reviews} отзывов</div></div>
              </div>
              <p class="text-[var(--ink-400)]">Отзывы клиентов появятся здесь после подключения к базе данных.</p>
            </div>
          </div>
        </div>
      </div>

      ${related.length ? `
      <div class="px-6 pb-6 border-t border-[var(--line)] pt-5">
        <div class="font-display font-bold mb-3">Похожие товары</div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">${related.map(productCard).join('')}</div>
      </div>` : ''}
    </div>
  </div>`;
}

function selectVariant(v, btn) {
  currentVariant = v;
  btn.parentElement.querySelectorAll('.chip-select').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
}
function changeQty(delta) {
  currentQty = Math.max(1, currentQty + delta);
  $('#qtyLabel').textContent = currentQty;
}
function switchPdTab(tab, el) {
  ['specs', 'desc', 'reviews'].forEach(t => $('#pd-' + t).classList.toggle('hidden', t !== tab));
  el.parentElement.querySelectorAll('.pd-tab').forEach(t => t.style.color = 'var(--ink-400)');
  el.style.color = 'var(--navy-900)';
}
function buyNow(id) {
  addToCart(id, currentQty, currentVariant);
  closeProduct();
  openCheckout();
}

/* ============ CART DRAWER ============ */
function renderCart() {
  const wrap = $('#cartItems');
  if (!wrap) return;
  if (!state.cart.length) {
    wrap.innerHTML = `<div class="flex flex-col items-center justify-center py-16 text-center gap-3">
      <i data-lucide="shopping-cart" class="w-10 h-10 text-[var(--ink-400)]"></i>
      <div class="font-semibold">Корзина пуста</div>
      <div class="text-sm text-[var(--ink-400)]">Добавьте товары из каталога</div>
    </div>`;
    $('#cartTotal').textContent = money(0);
    refreshIcons();
    return;
  }
  wrap.innerHTML = state.cart.map((item, idx) => {
    const p = findProduct(item.id);
    if (!p) return '';
    return `
    <div class="flex gap-3 py-3.5 border-b border-[var(--line)]">
      <div class="w-16 h-16 rounded-xl overflow-hidden shrink-0">${productArtSVG(p, 30)}</div>
      <div class="flex-1 min-w-0">
        <div class="text-sm font-semibold line-clamp-1">${p.name}</div>
        ${item.variant ? `<div class="text-xs text-[var(--ink-400)]">${item.variant}</div>` : ''}
        <div class="flex items-center justify-between mt-2">
          <div class="qty-stepper flex items-center scale-90 origin-left">
            <button onclick="cartQty(${idx}, -1)"><i data-lucide="minus" class="w-3.5 h-3.5 mx-auto"></i></button>
            <span class="w-7 text-center text-sm font-semibold">${item.qty}</span>
            <button onclick="cartQty(${idx}, 1)"><i data-lucide="plus" class="w-3.5 h-3.5 mx-auto"></i></button>
          </div>
          <span class="font-bold text-sm">${money(p.price * item.qty)}</span>
        </div>
      </div>
      <button class="text-[var(--ink-400)] hover:text-red-500 h-fit" onclick="removeFromCart(${idx})"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
    </div>`;
  }).join('');
  const total = state.cart.reduce((s, i) => { const p = findProduct(i.id); return s + (p ? p.price * i.qty : 0); }, 0);
  $('#cartTotal').textContent = money(total);
  refreshIcons();
}
function cartQty(idx, delta) {
  state.cart[idx].qty = Math.max(1, state.cart[idx].qty + delta);
  LS.set('ts_cart', state.cart);
  updateCounts(); renderCart();
}
function removeFromCart(idx) {
  state.cart.splice(idx, 1);
  LS.set('ts_cart', state.cart);
  updateCounts(); renderCart();
}
function openCart() {
  renderCart();
  $('#cartDrawer').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  $('#cartDrawer').classList.add('hidden');
  document.body.style.overflow = '';
}

/* ============ CHECKOUT ============ */
function openCheckout() {
  if (!state.cart.length) { toast('Корзина пуста'); return; }
  closeCart();
  $('#checkoutModal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  refreshIcons();
}
function closeCheckout() {
  $('#checkoutModal').classList.add('hidden');
  document.body.style.overflow = '';
}
function submitOrder(ev) {
  ev.preventDefault();
  const f = ev.target;
  const total = state.cart.reduce((s, i) => { const p = findProduct(i.id); return s + (p ? p.price * i.qty : 0); }, 0);
  const orderId = 'TS-2026-' + String(Math.floor(100000 + Math.random() * 899999)).slice(0, 6);
  const order = {
    id: orderId,
    date: new Date().toISOString(),
    name: f.name.value, phone: f.phone.value, city: f.city.value, address: f.address.value, comment: f.comment.value,
    delivery: f.delivery.value, payment: f.payment.value,
    items: state.cart.map(i => { const p = findProduct(i.id); return { name: p.name, qty: i.qty, price: p.price }; }),
    total, status: 'NEW',
  };
  const orders = LS.get('ts_orders', []);
  orders.unshift(order);
  LS.set('ts_orders', orders);

  state.cart = [];
  LS.set('ts_cart', state.cart);
  updateCounts();

  closeCheckout();
  showOrderSuccess(order);
}

function showOrderSuccess(order) {
  const itemsText = order.items.map(i => `${i.qty}× ${i.name} — ${money(i.price * i.qty)}`).join('<br>');
  $('#successModal').innerHTML = `
  <div class="overlay-scrim fixed inset-0 z-[80] flex items-center justify-center p-4" onclick="if(event.target===this) closeSuccess()">
    <div class="modal-card w-full max-w-md p-6 text-center">
      <div class="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style="background:#e9fbf1;color:var(--success)"><i data-lucide="check-circle-2" class="w-9 h-9"></i></div>
      <h3 class="text-lg font-bold font-display mb-1">Заказ оформлен!</h3>
      <p class="text-sm text-[var(--ink-400)] mb-4">Номер заказа <span class="font-semibold text-[var(--ink-900)]">#${order.id}</span></p>
      <div class="text-left bg-[var(--bg-light)] rounded-xl p-3.5 text-xs leading-relaxed mb-4">
        <div class="font-semibold mb-1">🛍 Уведомление отправлено администратору в Telegram:</div>
        <div class="text-[var(--ink-600)]">${itemsText}<br><b>Итого: ${money(order.total)}</b></div>
      </div>
      <button class="btn-primary w-full py-3 text-sm" onclick="closeSuccess()">Готово</button>
    </div>
  </div>`;
  $('#successModal').classList.remove('hidden');
  refreshIcons();
}
function closeSuccess() {
  $('#successModal').classList.add('hidden');
  $('#successModal').innerHTML = '';
  document.body.style.overflow = '';
}

/* ============ TOAST ============ */
function toast(msg) {
  let el = $('#toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    el.className = 'fixed left-1/2 -translate-x-1/2 bottom-24 sm:bottom-8 z-[90] bg-[var(--navy-900)] text-white text-sm font-medium px-4 py-2.5 rounded-full shadow-xl transition-opacity';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.style.opacity = '1';
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => { el.style.opacity = '0'; }, 2200);
}

/* ============ SEARCH ============ */
function openSearch() {
  $('#searchOverlay').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  setTimeout(() => $('#searchInput').focus(), 50);
}
function closeSearch() {
  $('#searchOverlay').classList.add('hidden');
  document.body.style.overflow = '';
}
function runSearch(q) {
  const query = q.trim().toLowerCase();
  const resultsEl = $('#searchResults');
  if (!query) { resultsEl.innerHTML = ''; return; }
  const results = PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(query) || p.brand.toLowerCase().includes(query) || getCategoryName(p.cat).toLowerCase().includes(query)
  ).slice(0, 8);
  resultsEl.innerHTML = results.length ? results.map(p => `
    <div class="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[var(--bg-light)] cursor-pointer" onclick="closeSearch(); openProduct('${p.id}')">
      <div class="w-11 h-11 rounded-lg overflow-hidden shrink-0">${productArtSVG(p, 20)}</div>
      <div class="min-w-0"><div class="text-sm font-semibold line-clamp-1">${p.name}</div><div class="text-xs text-[var(--ink-400)]">${p.brand} · ${money(p.price)}</div></div>
    </div>`).join('') : `<div class="text-center text-sm text-[var(--ink-400)] py-8">Ничего не найдено по запросу «${q}»</div>`;
  refreshIcons();
}

/* ============ AI CHAT ============ */
const AI_KB = {
  доставка: 'Доставка по Душанбе — в течение 1-2 дней. По регионам — 3-5 дней. Стоимость зависит от адреса и уточняется при оформлении заказа.',
  гарантия: 'На большинство товаров действует официальная гарантия от 12 до 36 месяцев в зависимости от бренда и категории — срок указан в карточке товара.',
  оплата: 'Мы принимаем оплату наличными при получении, банковским переводом и рассрочку — уточняйте условия у менеджера.',
  рассрочка: 'Рассрочка доступна на большинство товаров дороже 1000 сомони, без переплат при выборе некоторых партнёров-банков.',
  возврат: 'Возврат или обмен товара возможен в течение 14 дней при сохранении товарного вида и упаковки.',
  адрес: 'Наш магазин находится в Душанбе, ул. Рудаки 123. Часы работы: Пн–Вс, 09:00–21:00.',
};

function aiPanel() { return $('#aiPanel'); }
function openAI() {
  aiPanel().classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  refreshIcons();
  const box = $('#aiMessages');
  if (!box.dataset.greeted) {
    box.dataset.greeted = '1';
    aiAddBot('Здравствуйте! Я TEXNIKA AI — ваш персональный консультант по технике. Спросите о товаре, бюджете или доставке 👇');
  }
}
function closeAI() {
  aiPanel().classList.add('hidden');
  document.body.style.overflow = '';
}
function askAIAbout(id) {
  const p = findProduct(id);
  openAI();
  setTimeout(() => sendAIMessage(`Расскажи подробнее про ${p.name}`), 150);
}
function aiAddUser(text) {
  $('#aiMessages').insertAdjacentHTML('beforeend', `
    <div class="flex justify-end"><div class="ai-msg-user px-3.5 py-2.5 text-sm max-w-[80%]">${escapeHTML(text)}</div></div>`);
  scrollAI();
}
function aiAddBot(html) {
  $('#aiMessages').insertAdjacentHTML('beforeend', `
    <div class="flex justify-start gap-2">
      <div class="w-7 h-7 rounded-full ai-fab shrink-0 flex items-center justify-center"><i data-lucide="sparkles" class="w-3.5 h-3.5 text-white"></i></div>
      <div class="ai-msg-bot px-3.5 py-2.5 text-sm max-w-[82%]">${html}</div>
    </div>`);
  refreshIcons();
  scrollAI();
}
function aiTyping(show) {
  let el = $('#aiTyping');
  if (show) {
    if (el) return;
    $('#aiMessages').insertAdjacentHTML('beforeend', `<div id="aiTyping" class="flex gap-2 items-center"><div class="w-7 h-7 rounded-full ai-fab shrink-0 flex items-center justify-center"><i data-lucide="sparkles" class="w-3.5 h-3.5 text-white"></i></div><div class="ai-msg-bot px-3.5 py-3 flex gap-1"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></div></div>`);
    refreshIcons(); scrollAI();
  } else { el?.remove(); }
}
function scrollAI() { const box = $('#aiMessages'); box.scrollTop = box.scrollHeight; }
function escapeHTML(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

function aiMiniCards(list) {
  if (!list.length) return '';
  return `<div class="grid grid-cols-2 gap-2 mt-2">${list.slice(0, 4).map(p => `
    <div class="ai-mini-card p-2 cursor-pointer" onclick="closeAI(); openProduct('${p.id}')">
      <div class="w-full aspect-square rounded-lg overflow-hidden mb-1.5">${productArtSVG(p, 26)}</div>
      <div class="text-xs font-semibold line-clamp-1">${p.name}</div>
      <div class="text-xs font-bold mt-0.5">${money(p.price)}</div>
    </div>`).join('')}</div>`;
}

function parseAIQuery(text) {
  const q = text.toLowerCase();
  let category = null, brand = null, budget = null;
  for (const c of CATEGORIES) {
    const words = c.name.toLowerCase();
    if (q.includes(words) || q.includes(words.slice(0, -1))) category = c.id;
  }
  const catAliases = { холодильник:'fridge', телевизор:'tv', тв:'tv', стиральн:'washer', кондиционер:'ac', смартфон:'phones', телефон:'phones', наушник:'accessory', пылесос:'home' };
  for (const key in catAliases) if (q.includes(key)) category = catAliases[key];
  for (const b of BRANDS) if (q.includes(b.toLowerCase())) brand = b;
  const priceMatch = q.match(/(\d{3,6})/);
  if (priceMatch) budget = parseInt(priceMatch[1], 10);
  return { category, brand, budget };
}

function sendAIMessage(presetText) {
  const input = $('#aiInput');
  const text = (presetText || input.value).trim();
  if (!text) return;
  aiAddUser(text);
  input.value = '';
  aiTyping(true);

  setTimeout(() => {
    aiTyping(false);
    const lower = text.toLowerCase();

    // knowledge base
    const kbHit = Object.keys(AI_KB).find(k => lower.includes(k));
    if (kbHit && !lower.match(/\d/)) {
      aiAddBot(AI_KB[kbHit] + `<div class="mt-2"><button class="ai-chip px-3 py-1.5 rounded-full text-xs" style="color:#0f172a;background:#eef3ff;border-color:#dbe6fb" onclick="sendAIMessage('Связаться с менеджером')">Связаться с менеджером</button></div>`);
      return;
    }
    if (lower.includes('менеджер')) {
      aiAddBot('Передаю вас менеджеру — он свяжется с вами в ближайшее время. А пока можете продолжать выбирать товары 🙂');
      return;
    }
    if (lower.includes('сравни')) {
      if (state.compare.length >= 2) { closeAI(); openCompare(); }
      else aiAddBot('Добавьте минимум 2 товара к сравнению (кнопка «Сравнить» на странице товара), и я покажу подробную таблицу.');
      return;
    }

    const { category, brand, budget } = parseAIQuery(text);
    let results = [...PRODUCTS];
    if (category) results = results.filter(p => p.cat === category);
    if (brand) results = results.filter(p => p.brand === brand);
    if (budget) results = results.filter(p => p.price <= budget);

    if (!category && !brand && !budget) {
      aiAddBot('Уточните, пожалуйста: какая категория товара вас интересует, есть ли предпочтительный бренд и какой у вас бюджет?');
      return;
    }

    results.sort((a, b) => a.price - b.price);
    if (results.length) {
      const parts = [];
      if (category) parts.push(getCategoryName(category).toLowerCase());
      if (brand) parts.push(brand);
      if (budget) parts.push('до ' + money(budget));
      aiAddBot(`Нашёл ${results.length} вариант(ов)${parts.length ? ': ' + parts.join(', ') : ''}. Вот лучшие по цене:` + aiMiniCards(results));
    } else {
      aiAddBot('К сожалению, у меня нет точной информации по такому запросу в наличии. Я могу передать вас менеджеру для уточнения.' +
        `<div class="mt-2"><button class="ai-chip px-3 py-1.5 rounded-full text-xs" style="color:#0f172a;background:#eef3ff;border-color:#dbe6fb" onclick="sendAIMessage('Связаться с менеджером')">Связаться с менеджером</button></div>`);
    }
  }, 650 + Math.random() * 500);
}

/* ============ COMPARE ============ */
function openCompare() {
  const items = state.compare.map(findProduct).filter(Boolean);
  if (items.length < 2) { toast('Добавьте минимум 2 товара для сравнения'); return; }
  const allSpecKeys = [...new Set(items.flatMap(p => Object.keys(p.specs)))];
  $('#compareModal').innerHTML = `
  <div class="overlay-scrim fixed inset-0 z-[75] flex items-center justify-center p-4" onclick="if(event.target===this) closeCompare()">
    <div class="modal-card w-full max-w-4xl max-h-[88vh] overflow-y-auto hide-scrollbar p-6">
      <div class="flex items-center justify-between mb-5">
        <h3 class="text-lg font-bold font-display">Сравнение товаров</h3>
        <button class="icon-btn" onclick="closeCompare()"><i data-lucide="x" class="w-5 h-5"></i></button>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm border-collapse min-w-[600px]">
          <thead><tr><td class="w-32"></td>${items.map(p => `<td class="p-3 text-center align-top">
            <div class="w-16 h-16 mx-auto rounded-xl overflow-hidden mb-2">${productArtSVG(p, 30)}</div>
            <div class="font-semibold text-xs">${p.name}</div>
            <div class="font-bold mt-1">${money(p.price)}</div>
            <button class="text-xs text-[var(--ink-400)] mt-1" onclick="toggleCompare('${p.id}'); openCompare()">Убрать</button>
          </td>`).join('')}</tr></thead>
          <tbody>
            <tr class="border-t border-[var(--line)]"><td class="py-2.5 text-[var(--ink-400)]">Рейтинг</td>${items.map(p => `<td class="text-center py-2.5 font-medium">${p.rating} (${p.reviews})</td>`).join('')}</tr>
            ${allSpecKeys.map(k => `<tr class="border-t border-[var(--line)]"><td class="py-2.5 text-[var(--ink-400)]">${k}</td>${items.map(p => `<td class="text-center py-2.5 font-medium">${p.specs[k] || '—'}</td>`).join('')}</tr>`).join('')}
          </tbody>
        </table>
      </div>
      <p class="text-xs text-[var(--ink-400)] mt-4">Совет: если цена важнее диагонали — обратите внимание на модель с наименьшей стоимостью; если приоритет — качество изображения, смотрите на разрешение и Smart TV функции.</p>
    </div>
  </div>`;
  $('#compareModal').classList.remove('hidden');
  refreshIcons();
}
function closeCompare() { $('#compareModal').classList.add('hidden'); $('#compareModal').innerHTML = ''; }

/* ============ INIT ============ */
function initCommon() {
  updateCounts();
  renderCart();
  refreshIcons();
  const langBtns = $$('.lang-toggle button');
  langBtns.forEach(b => b.classList.toggle('active', b.dataset.lang === state.lang));
}
document.addEventListener('DOMContentLoaded', initCommon);
