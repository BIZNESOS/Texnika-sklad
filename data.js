/* ============================================================
   TEXNIKA SKLAD — demo data
   Это тестовые (DEMO) товары для витрины прототипа.
   В реальном проекте данные приходят из Prisma/PostgreSQL.
   ============================================================ */

const CATEGORIES = [
  { id: 'phones',    name: 'Смартфоны',           icon: 'smartphone' },
  { id: 'tv',        name: 'Телевизоры',          icon: 'tv-2' },
  { id: 'fridge',    name: 'Холодильники',        icon: 'refrigerator' },
  { id: 'washer',    name: 'Стиральные машины',   icon: 'washing-machine' },
  { id: 'ac',        name: 'Кондиционеры',        icon: 'wind' },
  { id: 'home',      name: 'Бытовая техника',     icon: 'plug-zap' },
  { id: 'accessory', name: 'Аксессуары',          icon: 'headphones' },
  { id: 'house',     name: 'Техника для дома',    icon: 'house' },
];

const BRANDS = ['Samsung', 'LG', 'Bosch', 'Xiaomi', 'TCL', 'Gree', 'Philips', 'Midea'];

/* Палитра-заглушка для "фото" товара (вместо реальных изображений в демо) */
const ART = {
  phones:    ['#1e293b', '#0ea5e9'],
  tv:        ['#0f172a', '#f97316'],
  fridge:    ['#e2e8f0', '#64748b'],
  washer:    ['#f1f5f9', '#3b82f6'],
  ac:        ['#eff6ff', '#0ea5e9'],
  home:      ['#111827', '#22c55e'],
  accessory: ['#1f2937', '#a855f7'],
  house:     ['#fef2f2', '#ef4444'],
};

const ICONS = {
  phones: 'smartphone', tv: 'tv-2', fridge: 'refrigerator', washer: 'washing-machine',
  ac: 'wind', home: 'plug-zap', accessory: 'headphones', house: 'house',
};

function slugify(str) {
  const map = { а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'e',ж:'zh',з:'z',и:'i',й:'y',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'h',ц:'c',ч:'ch',ш:'sh',щ:'sch',ъ:'',ы:'y',ь:'',э:'e',ю:'yu',я:'ya',' ':'-','"':'','”':'' };
  return str.toLowerCase().split('').map(c => map[c] !== undefined ? map[c] : c).join('')
    .replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/(^-|-$)/g, '');
}

const RAW_PRODUCTS = [
  { cat:'tv', brand:'Samsung', name:'Телевизор Samsung 55" Crystal UHD 4K', price:6999, old:8999, rating:4.8, reviews:124, stock:12, badges:['sale'], specs:{'Диагональ':'55"','Разрешение':'4K Ultra HD (3840×2160)','Smart TV':'Да','ОС':'Tizen','Гарантия':'12 месяцев'}, variants:['43"','50"','55"','65"','75"'], desc:'Samsung Crystal UHD 4K — современный телевизор с потрясающим качеством изображения, яркими цветами и умными функциями. Идеальный выбор для дома и для игр на PS5.' },
  { cat:'tv', brand:'LG', name:'Телевизор LG 50" NanoCell 4K', price:5799, old:6999, rating:4.7, reviews:88, stock:9, badges:['new'], specs:{'Диагональ':'50"','Разрешение':'4K Ultra HD','Smart TV':'Да','ОС':'webOS','Гарантия':'12 месяцев'}, variants:['43"','50"','55"','65"'], desc:'LG NanoCell — точная цветопередача и технология обработки изображения нового поколения.' },
  { cat:'tv', brand:'TCL', name:'Телевизор TCL 43" Full HD', price:2999, old:null, rating:4.5, reviews:41, stock:20, badges:[], specs:{'Диагональ':'43"','Разрешение':'Full HD','Smart TV':'Да','Гарантия':'12 месяцев'}, variants:['32"','40"','43"'], desc:'Доступный телевизор TCL с ярким экраном и встроенным Smart TV.' },

  { cat:'fridge', brand:'LG', name:'Холодильник LG No Frost (592 л)', price:9499, old:12999, rating:4.9, reviews:98, stock:6, badges:['sale'], specs:{'Объём':'592 л','Система':'No Frost','Класс энергопотребления':'A++','Гарантия':'3 года'}, variants:['Серебристый','Чёрный'], desc:'Просторный холодильник LG с системой No Frost — никогда не придётся размораживать вручную.' },
  { cat:'fridge', brand:'Samsung', name:'Холодильник Samsung RB33 (350 л)', price:5799, old:6799, rating:4.6, reviews:52, stock:14, badges:[], specs:{'Объём':'350 л','Система':'No Frost','Класс энергопотребления':'A+','Гарантия':'24 месяца'}, variants:['Серебристый','Чёрный','Белый'], desc:'Компактный и стильный холодильник для небольшой семьи.' },
  { cat:'fridge', brand:'Midea', name:'Холодильник Midea (215 л)', price:3299, old:null, rating:4.4, reviews:23, stock:18, badges:['new'], specs:{'Объём':'215 л','Класс энергопотребления':'A+','Гарантия':'12 месяцев'}, variants:['Белый'], desc:'Бюджетный холодильник для дома или офиса.' },

  { cat:'washer', brand:'Bosch', name:'Стиральная машина Bosch (8 кг)', price:5999, old:7999, rating:4.7, reviews:76, stock:10, badges:['sale'], specs:{'Загрузка':'8 кг','Скорость отжима':'1400 об/мин','Тип управления':'Электронное','Гарантия':'24 месяца'}, variants:['6 кг','7 кг','8 кг'], desc:'Надёжная стиральная машина Bosch с множеством программ стирки и низким уровнем шума.' },
  { cat:'washer', brand:'Samsung', name:'Стиральная машина Samsung EcoBubble (7 кг)', price:4999, old:5799, rating:4.6, reviews:64, stock:11, badges:[], specs:{'Загрузка':'7 кг','Скорость отжима':'1200 об/мин','Технология':'EcoBubble','Гарантия':'24 месяца'}, variants:['6 кг','7 кг'], desc:'Технология EcoBubble бережно стирает даже в холодной воде.' },

  { cat:'ac', brand:'Gree', name:'Кондиционер Gree 12 (инверторный)', price:4999, old:6499, rating:4.6, reviews:62, stock:15, badges:['sale'], specs:{'Мощность':'12000 BTU','Тип':'Инверторный','Площадь':'до 35 м²','Гарантия':'36 месяцев'}, variants:['9','12','18','24'], desc:'Инверторный кондиционер Gree — тихая работа и низкое энергопотребление.' },
  { cat:'ac', brand:'Midea', name:'Кондиционер Midea 9', price:3499, old:null, rating:4.3, reviews:19, stock:22, badges:['new'], specs:{'Мощность':'9000 BTU','Тип':'Обычный','Площадь':'до 25 м²','Гарантия':'24 месяца'}, variants:['9','12'], desc:'Компактный кондиционер для небольших комнат.' },

  { cat:'home', brand:'Philips', name:'Пылесос Philips (вертикальный)', price:1999, old:2899, rating:4.7, reviews:53, stock:17, badges:['sale'], specs:{'Тип':'Вертикальный, беспроводной','Время работы':'до 45 мин','Гарантия':'12 месяцев'}, variants:['Чёрный'], desc:'Мощный беспроводной пылесос для быстрой уборки без лишних проводов.' },
  { cat:'home', brand:'Bosch', name:'Микроволновая печь Bosch (25 л)', price:1499, old:null, rating:4.5, reviews:31, stock:25, badges:[], specs:{'Объём':'25 л','Мощность':'900 Вт','Гарантия':'12 месяцев'}, variants:['Чёрный','Серебристый'], desc:'Вместительная микроволновая печь с грилем.' },

  { cat:'phones', brand:'Samsung', name:'Смартфон Samsung Galaxy A55', price:3999, old:4599, rating:4.7, reviews:140, stock:30, badges:['sale'], specs:{'Экран':'6.6" AMOLED','Память':'128 ГБ','Камера':'50 Мп','Гарантия':'12 месяцев'}, variants:['128 ГБ','256 ГБ'], desc:'Флагманские функции по доступной цене — яркий экран и мощная камера.' },
  { cat:'phones', brand:'Xiaomi', name:'Смартфон Xiaomi Redmi Note 13', price:2299, old:2699, rating:4.6, reviews:210, stock:40, badges:['new'], specs:{'Экран':'6.67" AMOLED','Память':'256 ГБ','Камера':'108 Мп','Гарантия':'12 месяцев'}, variants:['128 ГБ','256 ГБ'], desc:'Один из самых популярных смартфонов среднего сегмента.' },

  { cat:'accessory', brand:'Philips', name:'Наушники Philips беспроводные', price:899, old:1199, rating:4.5, reviews:38, stock:35, badges:['sale'], specs:{'Тип':'Накладные, Bluetooth','Автономность':'до 30 ч','Гарантия':'12 месяцев'}, variants:['Чёрный','Белый'], desc:'Комфортные беспроводные наушники с чистым звуком.' },
  { cat:'accessory', brand:'Xiaomi', name:'Кабель HDMI 2м', price:99, old:null, rating:4.8, reviews:12, stock:80, badges:[], specs:{'Длина':'2 м','Версия':'HDMI 2.1'}, variants:[], desc:'Качественный HDMI-кабель для подключения ТВ и приставок.' },

  { cat:'house', brand:'Bosch', name:'Чайник электрический Bosch', price:399, old:499, rating:4.6, reviews:27, stock:50, badges:['sale'], specs:{'Объём':'1.7 л','Мощность':'2200 Вт','Гарантия':'12 месяцев'}, variants:[], desc:'Быстрый и надёжный электрочайник на каждый день.' },
  { cat:'house', brand:'Midea', name:'Утюг Midea', price:349, old:null, rating:4.4, reviews:15, stock:45, badges:['new'], specs:{'Мощность':'2000 Вт','Подошва':'Керамическая','Гарантия':'12 месяцев'}, variants:[], desc:'Лёгкий утюг с керамической подошвой для лучшего скольжения.' },
];

const PRODUCTS = RAW_PRODUCTS.map((p, i) => ({
  id: 'ts-' + (i + 1),
  slug: slugify(p.name),
  ...p,
  discount: p.old ? Math.round((1 - p.price / p.old) * 100) : 0,
  colors: ART[p.cat],
  icon: ICONS[p.cat],
}));

function getCategoryName(id) {
  const all = CATEGORIES.concat((function(){ try { return JSON.parse(localStorage.getItem('ts_custom_categories')) || []; } catch { return []; } })());
  const c = all.find(c => c.id === id);
  return c ? c.name : id;
}

/* ============================================================
   Category tile artwork — original SVG icons styled to resemble
   photographed products (shaded bodies + accent highlights),
   used instead of line icons on the homepage category grid.
   ============================================================ */
const CATEGORY_ICON_SVG = {
  phones: (id) => `
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ph-body-${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#334155"/><stop offset="1" stop-color="#0f172a"/></linearGradient>
        <linearGradient id="ph-scr-${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#38bdf8"/><stop offset="1" stop-color="#1d4ed8"/></linearGradient>
      </defs>
      <rect x="19" y="6" width="26" height="52" rx="7" fill="url(#ph-body-${id})"/>
      <rect x="22.5" y="11" width="19" height="37" rx="2" fill="url(#ph-scr-${id})"/>
      <rect x="27" y="12.5" width="10" height="2.4" rx="1.2" fill="#0f172a" opacity=".5"/>
      <circle cx="32" cy="52.5" r="2.1" fill="#64748b"/>
    </svg>`,
  tv: (id) => `
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="tv-scr-${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#38bdf8"/><stop offset=".55" stop-color="#1e3a8a"/><stop offset="1" stop-color="#0f172a"/></linearGradient>
      </defs>
      <rect x="5" y="12" width="54" height="33" rx="4" fill="#111827"/>
      <rect x="9" y="16" width="46" height="25" rx="2" fill="url(#tv-scr-${id})"/>
      <path d="M9 38 L23 27 L33 34 L45 20 L55 30 V41 H9 Z" fill="#0ea5e9" opacity=".35"/>
      <rect x="29" y="45" width="6" height="7" fill="#334155"/>
      <rect x="19" y="54" width="26" height="3" rx="1.5" fill="#475569"/>
    </svg>`,
  fridge: (id) => `
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="fr-body-${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e2e8f0"/><stop offset=".5" stop-color="#cbd5e1"/><stop offset="1" stop-color="#94a3b8"/></linearGradient>
      </defs>
      <rect x="13" y="5" width="38" height="54" rx="6" fill="url(#fr-body-${id})"/>
      <rect x="13" y="5" width="38" height="19" rx="6" fill="#0f172a" opacity=".08"/>
      <rect x="31.5" y="5" width="1.4" height="54" fill="#94a3b8"/>
      <rect x="18" y="11" width="3" height="10" rx="1.5" fill="#64748b"/>
      <rect x="18" y="33" width="3" height="20" rx="1.5" fill="#64748b"/>
      <rect x="37" y="14" width="9" height="11" rx="2" fill="#0f172a"/>
      <rect x="39" y="16.5" width="2.2" height="6" rx="1.1" fill="#38bdf8"/>
    </svg>`,
  washer: (id) => `
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="wa-body-${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#cbd5e1"/></linearGradient>
      </defs>
      <rect x="7" y="6" width="50" height="52" rx="8" fill="url(#wa-body-${id})"/>
      <rect x="13" y="11" width="38" height="6" rx="2" fill="#e2e8f0"/>
      <circle cx="47" cy="14" r="1.6" fill="#94a3b8"/>
      <circle cx="32" cy="38" r="17" fill="#0f172a"/>
      <circle cx="32" cy="38" r="13" fill="#1e293b"/>
      <circle cx="32" cy="38" r="13" fill="none" stroke="#2f7bff" stroke-width="2.6" opacity=".75"/>
      <circle cx="32" cy="38" r="7.5" fill="#0f172a" opacity=".6"/>
    </svg>`,
  ac: (id) => `
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ac-body-${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#dbe4f0"/></linearGradient>
      </defs>
      <rect x="4" y="23" width="56" height="18" rx="9" fill="url(#ac-body-${id})"/>
      <rect x="4" y="23" width="56" height="18" rx="9" fill="none" stroke="#b9c4d6" stroke-width="1"/>
      <rect x="10" y="29" width="40" height="2.3" rx="1.15" fill="#94a3b8"/>
      <rect x="10" y="33.5" width="40" height="2.3" rx="1.15" fill="#94a3b8"/>
      <circle cx="49" cy="31.5" r="2" fill="#2f7bff"/>
      <path d="M18 41 L14 47 M32 41 L32 48 M46 41 L50 47" stroke="#7db2ff" stroke-width="2" stroke-linecap="round" opacity=".6"/>
    </svg>`,
  home: (id) => `
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="fr2-body-${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1f2937"/><stop offset="1" stop-color="#0a0f1a"/></linearGradient>
      </defs>
      <rect x="12" y="10" width="40" height="47" rx="15" fill="url(#fr2-body-${id})"/>
      <rect x="18" y="16" width="12" height="3" rx="1.5" fill="#374151"/>
      <rect x="17" y="25" width="30" height="18" rx="9" fill="#111827"/>
      <circle cx="32" cy="34" r="7" fill="#0a1628"/>
      <circle cx="32" cy="34" r="7" fill="none" stroke="#4d8dff" stroke-width="2.2"/>
      <circle cx="32" cy="34" r="2.4" fill="#4d8dff"/>
    </svg>`,
  accessory: (id) => `
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ac2-bottle-${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7db2ff"/><stop offset="1" stop-color="#1d4ed8"/></linearGradient>
      </defs>
      <path d="M13 32 C13 15, 51 15, 51 32" stroke="#111827" stroke-width="4.2" fill="none" stroke-linecap="round"/>
      <rect x="8" y="30" width="11" height="17" rx="5.5" fill="#111827"/>
      <rect x="45" y="30" width="11" height="17" rx="5.5" fill="#111827"/>
      <rect x="47" y="18" width="9" height="24" rx="3.5" fill="url(#ac2-bottle-${id})"/>
      <rect x="49.3" y="13" width="4.4" height="6" rx="1.6" fill="#38bdf8"/>
    </svg>`,
  house: (id) => `
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ho-body-${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f87171"/><stop offset="1" stop-color="#dc2626"/></linearGradient>
      </defs>
      <path d="M14 46 C14 28, 22 18, 32 18 C42 18, 50 28, 50 46 Z" fill="url(#ho-body-${id})"/>
      <rect x="9" y="46" width="46" height="6" rx="3" fill="#7f1d1d"/>
      <path d="M48 26 C58 26, 58 38, 50 41" stroke="#7f1d1d" stroke-width="3.4" fill="none" stroke-linecap="round"/>
      <circle cx="32" cy="12" r="3" fill="#64748b"/>
      <rect x="30.5" y="14" width="3" height="5" fill="#64748b"/>
    </svg>`,
};
