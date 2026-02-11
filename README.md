# 🚀 OlympBase

**Агрегатор олимпиад** — удобный сервис для поиска и отслеживания школьных олимпиад в России.

## Возможности

- 📋 **Список олимпиад** с фильтрацией по предмету, классу, масштабу и датам
- 📅 **Календарь** с визуальным отображением сроков проведения
- 🔍 **Поиск** по названию олимпиады
- 📄 **Страница олимпиады** с подробной информацией: сайт, организатор, формат, требования, призы
- 🤖 **Автоматический сбор данных** с olimpiada.ru, postupi.online, ucheba.ru, vos.olimpiada.ru, mos.olimpiada.ru

## Стек технологий

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend:** Supabase (PostgreSQL, Edge Functions)
- **Парсинг:** Firecrawl + Google Gemini для извлечения структурированных данных

## Установка и запуск

```bash
# Клонирование репозитория
git clone https://github.com/<your-username>/olympbase.git
cd olympbase

# Установка зависимостей
npm install

# Создайте файл .env с переменными окружения
# VITE_SUPABASE_URL=<your-supabase-url>
# VITE_SUPABASE_PUBLISHABLE_KEY=<your-supabase-anon-key>
# VITE_SUPABASE_PROJECT_ID=<your-project-id>

# Запуск dev-сервера
npm run dev
```

## Деплой

Проект настроен для деплоя на **Vercel**. Добавьте переменные окружения в Settings → Environment Variables.

## Лицензия

MIT
