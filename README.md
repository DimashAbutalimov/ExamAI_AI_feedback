# AI Review Analyzer

Учебный fullstack-проект для анализа тональности текстовых отзывов с использованием AI-модели.


## Структура проекта

```
ai-review-analyzer/
├── backend/
│   ├── main.py          # FastAPI приложение, все endpoints
│   ├── models.py        # SQLAlchemy/SQLModel модель таблицы
│   ├── database.py      # Подключение к SQLite
│   ├── ai_service.py    # Интеграция с Hugging Face Transformers
│   ├── schemas.py       # Pydantic схемы запросов/ответов
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx               # Главный компонент
│   │   ├── main.jsx              # Точка входа
│   │   ├── index.css             # Стили
│   │   └── components/
│   │       ├── AnalyzeForm.jsx   # Форма ввода текста
│   │       ├── ResultCard.jsx    # Результат анализа
│   │       ├── HistoryList.jsx   # История запросов
│   │       └── StatsPanel.jsx    # Статистика
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## ⚙️ Установка и запуск

### Backend (FastAPI + SQLite + AI)

```bash
# 1. Перейти в папку backend
cd backend

# 2. Создать и активировать виртуальное окружение (рекомендуется)
python -m venv venv
source venv/bin/activate        # Linux / macOS
venv\Scripts\activate           # Windows

# 3. Установить зависимости
pip install -r requirements.txt

# 4. Запустить сервер
uvicorn main:app --reload --port 8000
```

Backend запустится на: http://localhost:8000  
Swagger документация: http://localhost:8000/docs

> **Первый запуск** — модель `cardiffnlp/twitter-roberta-base-sentiment-latest` (~500MB)
> скачивается автоматически с Hugging Face при первом запросе.

---

### Frontend (React + Vite)

```bash
# 1. Перейти в папку frontend
cd frontend

# 2. Установить зависимости
npm install

# 3. (опционально) Создать .env файл
cp .env.example .env
# При необходимости изменить VITE_API_URL=http://localhost:8000

# 4. Запустить dev-сервер
npm run dev
```

Frontend запустится на: http://localhost:5173

---

## 🌐 API Endpoints

### `POST /analyze`
Принимает текст, запускает AI-анализ, сохраняет в БД.

**Request:**
```json
{ "text": "This product is absolutely amazing!" }
```

**Response:**
```json
{
  "id": 1,
  "input_text": "This product is absolutely amazing!",
  "sentiment": "positive",
  "confidence": 0.9821,
  "created_at": "2024-01-15T10:30:00"
}
```

---

### `GET /results`
Возвращает историю всех анализов (от новых к старым).

**Response:**
```json
[
  {
    "id": 2,
    "input_text": "Terrible experience, never coming back.",
    "sentiment": "negative",
    "confidence": 0.9435,
    "created_at": "2024-01-15T10:35:00"
  },
  ...
]
```

---

### `GET /stats`
Статистика по тональности.

**Response:**
```json
{
  "positive": 5,
  "neutral": 2,
  "negative": 3,
  "total": 10
}
```

---

### `DELETE /results/{id}`
Удаляет запись по ID.

**Response:**
```json
{ "message": "Feedback #1 deleted" }
```

---

## 🤖 AI Модель

- **Модель:** `cardiffnlp/twitter-roberta-base-sentiment-latest`
- **Тип:** RoBERTa, обученная на ~124M твитов
- **Классы:** `positive`, `neutral`, `negative`
- **Библиотека:** Hugging Face `transformers`

Модель загружается один раз при старте сервера и переиспользуется для всех запросов.

---

## 🗄️ База данных

SQLite файл `reviews.db` создаётся автоматически в папке `backend/`.

Схема таблицы `feedback`:

| Поле         | Тип       | Описание                    |
|--------------|-----------|-----------------------------|
| `id`         | INTEGER   | Первичный ключ, автоинкремент|
| `input_text` | VARCHAR   | Исходный текст              |
| `sentiment`  | VARCHAR   | positive / neutral / negative|
| `confidence` | FLOAT     | Уверенность модели 0.0–1.0  |
| `created_at` | DATETIME  | Дата и время анализа        |

---

## 🏗️ Архитектура (для защиты)

```
[React Frontend]
      │
      │ HTTP (fetch API)
      ▼
[FastAPI Backend]
      │
      ├── POST /analyze
      │     ├── Валидация (Pydantic)
      │     ├── AI анализ (Transformers)
      │     └── Сохранение (SQLModel → SQLite)
      │
      ├── GET /results  → Чтение из БД
      ├── GET /stats    → Агрегация по БД
      └── DELETE /results/{id} → Удаление из БД
```

**Поток данных:**
1. Пользователь вводит текст в форму (React)
2. Frontend отправляет `POST /analyze` на FastAPI
3. Backend валидирует текст через Pydantic
4. AI-модель (Transformers) анализирует тональность
5. Результат сохраняется в SQLite через SQLModel
6. Ответ возвращается на Frontend
7. Frontend обновляет историю (`GET /results`) и статистику (`GET /stats`)
