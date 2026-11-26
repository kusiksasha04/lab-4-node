# Лабораторна робота — Node.js fullstack app

Fullstack-застосунок **«Список завдань» (Todo app)**:

- **backend**: власний REST API на **Node.js + Express**, дані зберігаються в **MongoDB Atlas** (через бібліотеку Mongoose);
- **frontend**: React-застосунок з попередньої лабораторної. Раніше він працював із тестовим API JSONPlaceholder, а тепер звертається до нашого бекенду.

Тепер завдання **справді зберігаються**: після перезавантаження сторінки вони нікуди не зникають.

## Технології

| Частина | Що використовується |
|---|---|
| Сервер | [Node.js](https://nodejs.org), [Express](https://www.npmjs.com/package/express) — створення сервера та маршрутів |
| База даних | [MongoDB Atlas](https://cloud.mongodb.com) (хмарна база), [Mongoose](https://www.npmjs.com/package/mongoose) — робота з нею з коду |
| Налаштування | [dotenv](https://www.npmjs.com/package/dotenv) — читає змінні з файлу `.env`, [cors](https://www.npmjs.com/package/cors) — дозволяє фронтенду звертатися до сервера |
| Клієнт | React 19 + Vite, [axios](https://axios-http.com) — HTTP-запити |
| Хостинг | [Render](https://render.com) — сервер працює в інтернеті |

## Структура проєкту

```
node-lab/
├── backend/                       СЕРВЕР
│   ├── server.js                  головний файл: CORS, маршрути, обробка помилок, підключення до бази, запуск
│   ├── services/db.js             підключення до MongoDB
│   ├── models/Task.js             модель (схема) завдання: які поля є і які в них правила
│   ├── middleware/validateTask.js перевірка даних із запиту перед збереженням
│   ├── controllers/taskController.js  функції: отримати / створити / змінити / видалити завдання
│   ├── routes/taskRoutes.js       маршрути: яка адреса + метод → яка функція контролера
│   ├── .env.example               зразок файлу з налаштуваннями
│   └── package.json
│
└── frontend/                      КЛІЄНТ (React)
    ├── src/api.js                 усі запити до нашого сервера
    ├── src/App.jsx                головний компонент: зберігає список і викликає api.js
    ├── src/components/            UpdateList, TodoList, TodoItem (без змін з минулої лаби)
    └── .env.example               зразок: адреса сервера на Render
```

## REST API

| Метод | Адреса | Що робить | Тіло запиту | Відповідь |
|---|---|---|---|---|
| GET | `/tasks` | список усіх завдань | — | `200` + масив завдань |
| POST | `/tasks` | створити завдання | `{ "title": "Купити хліб" }` | `201` + створене завдання |
| PATCH | `/tasks/:id` | змінити назву та/або статус | `{ "completed": true }` | `200` + оновлене завдання |
| DELETE | `/tasks/:id` | видалити завдання | — | `200` + повідомлення |

Помилки сервер повертає у форматі `{ "message": "..." }`:
- `400` — неправильні дані (наприклад, порожня назва або неправильний id);
- `404` — завдання з таким id немає або такої адреси не існує;
- `500` — помилка на сервері (наприклад, база недоступна).

Так виглядає завдання в базі:

```json
{
  "_id": "6745a1f2c3b9e0a1b2c3d4e5",
  "title": "Купити хліб",
  "completed": false,
  "createdAt": "2026-11-26T12:00:00.000Z"
}
```

`_id` MongoDB створює сама. У фронтенді (`App.jsx`, функція `toTask`) він перейменовується на `id`, тому компоненти з минулої лаби не довелося змінювати.

## Як це працює

Шлях запиту через сервер на прикладі натискання чекбокса «виконано»:

```
React (TodoItem) → App.toggleTask → api.updateTask → PATCH /tasks/6745... { completed: true }
                                                          │
server.js:   cors()  →  express.json()  →  /tasks  →  taskRoutes.js
                                                          │
taskRoutes.js:   router.patch("/:id", validateUpdateTask, updateTask)
                                          │                  │
                          перевірка даних ┘                  └ Task.findByIdAndUpdate(...) → MongoDB
                          (якщо погані — 400)                    │
                                                                 └ res.json(оновлене завдання) → React
```

Кожен файл має одну задачу:
1. **routes**: визначає адреси і HTTP-методи.
2. **middleware**: перевіряє дані до того, як вони потраплять у контролер.
3. **controllers**: виконує дію з базою і формує відповідь.
4. **models**: описує, як виглядає завдання в базі.
5. **services/db.js**: підключається до бази.

## Запуск на своєму комп'ютері

Потрібен [Node.js](https://nodejs.org) версії 20 або новішої і файл `backend/.env` (див. «Кроки, які треба виконати самому», кроки 1–2).

**Термінал 1: сервер**

```bash
cd backend
npm install     # один раз
npm start       # має з'явитися "MongoDB connected" і "Server running on port 3000"
```

Перевірка: відкрийте http://localhost:3000/tasks у браузері. Має з'явитися `[]` або список завдань.

**Термінал 2: фронтенд**

```bash
cd frontend
npm install     # один раз
npm start       # відкрийте http://localhost:5173
```

## Кроки, які треба виконати самому

### 1. Створити базу в MongoDB Atlas
1. Зареєструйтеся на https://cloud.mongodb.com.
2. Створіть кластер: **Create → Free** (безкоштовний, M0). Регіон будь-який, наприклад Frankfurt.
3. **Database Access** (або «Database & Network Access» → Users): додайте користувача, придумайте логін і пароль. Пароль краще без символів `@ : / ? #`, інакше рядок підключення зламається.
4. **Network Access** → **Add IP Address** → **Allow access from anywhere** (`0.0.0.0/0`). Без цього Render не зможе підключитися до бази.
5. На кластері натисніть **Connect → Drivers** і скопіюйте рядок підключення. Він виглядає приблизно так:
   `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

### 2. Створити файл `backend/.env`
Скопіюйте `backend/.env.example` в `backend/.env` і впишіть свій рядок:
- замініть `<username>` і `<password>` на дані користувача з пункту 1.3 (без кутових дужок);
- після `.mongodb.net/` допишіть назву бази, наприклад `todo`: `...mongodb.net/todo?retryWrites=...`

```
MONGO_URI=mongodb+srv://ivan:MyPass123@cluster0.xxxxx.mongodb.net/todo?retryWrites=true&w=majority&appName=Cluster0
PORT=3000
CLIENT_ORIGINS=http://localhost:5173
```

### 3. Завантажити на GitHub
1. Створіть порожній репозиторій на [github.com/new](https://github.com/new) (без README і .gitignore).
2. У терміналі в папці `node-lab`:

```bash
git init
git add .
git commit -m "Lab 4: Node.js fullstack app"
git branch -M main
git remote add origin https://github.com/ВАШ_ЛОГІН/НАЗВА_РЕПОЗИТОРІЮ.git
git push -u origin main
```

Файли `.env` і папки `node_modules` на GitHub не потраплять, їх виключає `.gitignore`. Так і має бути, бо в `.env` лежить пароль.

### 4. Задеплоїти сервер на Render
1. Зареєструйтеся на https://dashboard.render.com (найпростіше через GitHub).
2. **New → Web Service** і оберіть свій репозиторій.
3. Заповніть поля:
   - **Root Directory**: `backend` (сервер лежить у цій папці);
   - **Build Command**: `npm install`;
   - **Start Command**: `node server.js`;
   - **Instance Type**: Free.
4. **Environment Variables**: додайте `MONGO_URI` (той самий рядок, що в `.env`) і `CLIENT_ORIGINS` = `http://localhost:5173`. Змінну `PORT` можна не додавати, бо Render задає її сам.
5. Натисніть **Deploy Web Service** і зачекайте, поки в логах з'явиться `Server running on port ...`.
6. Скопіюйте адресу сервісу (вигляду `https://назва.onrender.com`) і перевірте `https://назва.onrender.com/tasks`.

> На безкоштовному тарифі сервер «засинає», якщо 15 хвилин ним ніхто не користується. Перший запит після цього може йти до хвилини, і це нормально.

### 5. Підключити фронтенд до задеплоєного сервера
Скопіюйте `frontend/.env.example` в `frontend/.env` і впишіть адресу з Render (без `/` у кінці):

```
VITE_API_URL=https://назва.onrender.com
```

Перезапустіть `npm start` у папці `frontend`. Тепер сайт на `localhost:5173` працює з сервером в інтернеті. Якщо видалити `frontend/.env`, фронтенд знову звертатиметься до локального сервера `localhost:3000`.

## Відповідність критеріям оцінювання

| Критерій | Бали | Де реалізовано |
|---|---|---|
| Серверна частина на Node.js (Express) | 5 | `backend/`: Express-сервер, підключення до MongoDB через Mongoose, модель `Task`, `.env` через dotenv |
| REST API | 4 | `routes/taskRoutes.js` + `controllers/taskController.js`: GET, POST, PATCH, DELETE для `/tasks`, відповіді JSON з правильними кодами (200, 201, 400, 404, 500) |
| Клієнтська частина | 4 | `frontend/`: React-застосунок (додавання, редагування, відмітка «виконано», видалення, прогрес) |
| Інтеграція фронтенду й бекенду | 3 | `frontend/src/api.js` звертається до нашого сервера, CORS налаштований у `server.js` через `CLIENT_ORIGINS` |
| Якість коду, структура, обробка помилок | 2 | розподіл на routes / middleware / controllers / models / services; валідація; `try/catch` у контролерах; обробники 404 і помилок у `server.js`; повідомлення про помилку на сторінці |
| Захист роботи | 2 | див. запитання нижче |

## Можливі запитання на захисті

**Що таке middleware і де він у вас є?**
Middleware — це функція `(req, res, next)`, яка виконується між отриманням запиту і контролером. У проєкті це `cors()`, `express.json()` і `validateCreateTask` / `validateUpdateTask`. Якщо дані правильні, викликається `next()` і запит іде далі. Якщо ні, middleware сам повертає помилку 400.

**Навіщо `express.json()`?**
Фронтенд надсилає дані у форматі JSON. `express.json()` перетворює їх в об'єкт `req.body`. Без нього `req.body` буде порожнім.

**Що таке CORS і навіщо він тут?**
Фронтенд працює на `localhost:5173`, а сервер на `localhost:3000` (або на Render). Це різні «джерела» (origin), і браузер за замовчуванням блокує запити між ними. Пакет `cors` додає до відповіді заголовок, який каже браузеру, що цьому сайту можна. Дозволені адреси записані в `CLIENT_ORIGINS`.

**Навіщо файл `.env` і чому його немає на GitHub?**
У ньому лежать налаштування, які відрізняються на різних комп'ютерах, і секрети (пароль від бази). Пакет dotenv читає його в `process.env`. На GitHub його не завантажують, щоб ніхто не побачив пароль. На Render ці значення вписуються в Environment Variables.

**Чим PATCH відрізняється від PUT? Чому PATCH?**
PUT замінює запис повністю, PATCH змінює лише передані поля. Фронтенд надсилає або тільки `title`, або тільки `completed`, тому підходить PATCH.

**Що таке Mongoose, схема і модель?**
Mongoose — бібліотека для роботи з MongoDB. Схема (`taskSchema`) описує поля і правила (`required`, `trim`, `default`). Модель (`Task`) створюється зі схеми і має методи для роботи з базою: `find`, `save`, `findByIdAndUpdate`, `findByIdAndDelete`.

**Навіщо `async/await` у контролерах?**
Запит до бази триває якийсь час. `await` чекає на результат, не блокуючи сервер, тож він тим часом може обробляти інші запити. Помилки ловимо через `try/catch`.

**Що означає `{ returnDocument: "after", runValidators: true }`?**
`returnDocument: "after"` повертає документ уже після оновлення, а не старий. У методичці для цього написано `new: true`, але в новій версії Mongoose ця опція застаріла (сервер виводить попередження), тому використано рекомендовану заміну. `runValidators: true` перевіряє нові дані за правилами схеми (під час оновлення Mongoose за замовчуванням цього не робить).

**Чому сервер запускається лише після підключення до бази?**
Без бази сервер нічого не зможе зробити. Тому в `server.js` спочатку `connectDB(...)`, і лише в `.then()` виконується `app.listen(...)`. Якщо підключення не вдалося, програма пише помилку і завершується.

**Чим цей код відрізняється від методички?**
Замість товарів (`Product`) зберігаються завдання (`Task`), бо фронтенд узято з лаби про Todo. Виправлено помилки в коді методички: неправильні шляхи імпорту, `getProduct`/`getProducts`, не імпортовані функції в маршрутах, відсутній `"type": "module"`. Також у CORS додано метод PATCH і значення за замовчуванням для `CLIENT_ORIGINS`, а застарілу опцію `new: true` замінено на `returnDocument: "after"`.
