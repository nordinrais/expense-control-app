# Expense Control App

Sistema de control de gastos y facturación con Next.js 14, Supabase y Docker.

## Quick Start

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales de Supabase

# Ejecutar en desarrollo
npm run dev
```

## Supabase Setup

1. Crear proyecto en [supabase.com](https://supabase.com)
2. Ejecutar `supabase/schema.sql` en el SQL Editor
3. Crear bucket `invoices` en Storage
4. Copiar URL y Anon Key a `.env.local`

## Deploy con Docker

```bash
docker build -t expense-app .
docker run -p 3000:3000 expense-app
```

## Estructura

```
src/
├── app/
│   ├── (auth)/login, register
│   ├── (dashboard)/dashboard, facturas, ventas, gastos-fijos, breakeven
├── components/
│   ├── layout/Sidebar, TopNav
│   └── dashboard/SummaryCards, RevenueChart, etc.
└── lib/supabase/client, server, middleware
```
