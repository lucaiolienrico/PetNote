# PetNote 🐾

PWA italiana per la gestione della salute degli animali domestici.

## Stack
React 18 · Vite 5 · TypeScript 5 · Tailwind CSS 3 · Supabase · PayPal · Vercel

## Setup locale

```bash
npm install
cp .env.example .env.local   # compila con valori Supabase/PayPal
npm run dev
```

## Migrations Supabase
Esegui in SQL Editor nell'ordine:
1. `supabase/migrations/20240001_initial_schema.sql`
2. `supabase/migrations/20240002_storage_rls.sql`

## Storage bucket (Dashboard → Storage)
- `pet-photos` — private, 5MB, image/*
- `pet-documents` — private, 20MB, pdf + image/*

## Pricing
| Piano | Prezzo |
|---|---|
| Free | €0 — 1 pet |
| Premium mensile | €4,99/mese |
| Premium annuale | €34,99/anno |
