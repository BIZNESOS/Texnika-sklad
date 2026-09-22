# TEXNIKA SKLAD

Прототип интернет-магазина техники **TEXNIKA SKLAD**, собранный точно по референс-дизайну (скриншот): тёмно-синий hero с glassmorphism, светлый каталог, карточки товаров, AI-консультант, корзина и админ-панель.

🔗 **Демо:** открыть `index.html` в браузере (или включить GitHub Pages — см. ниже).

## Что реализовано в этой версии

Это **フронтенд-прототип** (статический сайт: HTML + Tailwind + vanilla JS), полностью совпадающий с дизайном на скриншоте и с UX-логикой, но без реального сервера/БД. Все данные хранятся в `localStorage` браузера.

- Главная страница: hero, категории, промо-баннер, хиты/новинки/скидки
- Каталог с поиском, фильтрами (категория/бренд/цена/скидка) и сортировкой
- Карточка товара: галерея, варианты, характеристики, описание, похожие товары
- Корзина (drawer) + оформление заказа → генерация `Order ID` (`TS-2026-XXXXXX`) и превью Telegram-уведомления
- Избранное, сравнение товаров (до 4 шт., таблица характеристик)
- **AI-консультант** (`TEXNIKA AI`) — имитация NLU по ключевым словам (бренд/категория/бюджет) поверх локальной базы товаров + ответы из Knowledge Base (доставка, гарантия, оплата и т.д.)
- Админ-панель (`admin.html`, демо-пароль `admin123`): дашборд со статистикой и графиком продаж, CRUD товаров, категории, заказы со сменой статуса, клиенты, промокоды, настройки AI и магазина
- Адаптивная вёрстка, нижняя навигация на мобильных, `prefers-reduced-motion`

## Структура проекта

```
texnika-sklad/
├── index.html          — главная страница
├── catalog.html         — каталог с фильтрами
├── favorites.html        — избранное
├── admin.html           — админ-панель
├── assets/
│   ├── css/style.css     — дизайн-токены и стили бренда
│   └── js/
│       ├── data.js       — демо-товары/категории (DEMO)
│       ├── app.js        — логика витрины (корзина, AI, модалки)
│       └── admin.js      — логика админ-панели
└── README.md
```

## Публикация на GitHub

```bash
cd texnika-sklad
git init
git add .
git commit -m "TEXNIKA SKLAD: frontend prototype"
git branch -M main
git remote add origin https://github.com/<ваш-логин>/texnika-sklad.git
git push -u origin main
```

Чтобы сразу получить рабочую ссылку — включите **GitHub Pages**:
`Settings → Pages → Source: Deploy from branch → main / (root)`.
Сайт будет доступен по адресу `https://<логин>.github.io/texnika-sklad/`.

## Важно: это DEMO-данные

Товары в `data.js` — тестовые (как и требует ТЗ, п. 42 «Не использовать fake data после завершения проекта» — здесь они явно помечены как демонстрационные). Реальные товары нужно загружать через полноценную админ-панель, подключённую к базе данных.

## Путь к полной production-версии из ТЗ

Исходное ТЗ описывает full-stack проект на **Next.js + PostgreSQL + Prisma + Auth.js + Telegram Bot API + AI (OpenAI/Anthropic/Gemini)** — это отдельный backend-проект, который нельзя выпустить как один статический файл. Этот прототип закрывает весь UI/UX 1:1 по дизайну и готов быть frontend-основой. Чтобы дойти до полного ТЗ, дальше нужно:

1. **Backend:** поднять Next.js App Router проект, перенести компоненты в React/TSX, подключить Prisma-схему (модели из п. 33 ТЗ: `User`, `Product`, `Category`, `Order`, `Review`, `Promotion`, `AIConversation` и т.д.) и PostgreSQL.
2. **Auth:** Auth.js с ролями `CUSTOMER`/`ADMIN`, защитить `/admin` серверными middleware (сейчас — клиентский пароль-заглушка).
3. **AI:** заменить локальную имитацию в `app.js → sendAIMessage()` на server-side маршрут, который зовёт Anthropic/OpenAI/Gemini API (провайдер — через `.env`) и подмешивает реальные данные о товарах (RAG на данных из БД, как в п. 14 ТЗ).
4. **Telegram Bot:** серверный webhook, который при создании заказа (сейчас — `submitOrder()` в `app.js`) шлёт сообщение админу через Telegram Bot API с inline-кнопками статусов.
5. **Изображения:** заменить SVG-заглушки товаров на реальные фото + `next/image`.
6. **SEO/Perf:** SSR/ISR через Next.js, structured data, sitemap — в статическом прототипе это не применимо.

`.env.example` для будущего backend (см. п. 43 исходного ТЗ):

```
DATABASE_URL=
AUTH_SECRET=
AI_PROVIDER=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GEMINI_API_KEY=
TELEGRAM_BOT_TOKEN=
TELEGRAM_ADMIN_CHAT_ID=
NEXT_PUBLIC_SITE_URL=
```

## Лицензия

Свободно используйте и дорабатывайте под свой магазин.
