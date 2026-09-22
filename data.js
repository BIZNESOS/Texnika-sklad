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
  const c = CATEGORIES.find(c => c.id === id);
  return c ? c.name : id;
}
