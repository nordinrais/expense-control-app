-- Extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Usuarios/Perfiles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  company_name TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Facturas (Ventas y Compras)
CREATE TYPE invoice_type AS ENUM ('venta', 'recibida');

CREATE TABLE invoices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  type invoice_type NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  provider_customer TEXT NOT NULL,
  issue_date DATE DEFAULT CURRENT_DATE,
  file_url TEXT, -- Link a Supabase Storage
  is_manual BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Gastos Fijos
CREATE TABLE fixed_costs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  category TEXT NOT NULL, -- alquiler, luz, salarios, etc.
  monthly_amount DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) - Seguridad básica
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only see their own invoices" ON invoices
  FOR ALL USING (auth.uid() = user_id);

  3. Preparación para Despliegue (VPS + Dokploy)
Para desplegar en un VPS usando Dokploy, el sistema debe estar "dockerizado".

FROM node:20-alpine AS base

# Dependencias
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Construcción
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Ejecución
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]

4. Control de Versiones (Git & GitHub)
Configuración Inicial
Repositorio: Crear un repositorio privado en GitHub.

Ramas:

main: Producción (conectada a Dokploy).

develop: Desarrollo y pruebas.

Flujo de Trabajo:

git init

git add .

git commit -m "feat: initial architecture and schema"

git remote add origin <url-github>

git push -u origin main

5. Estructura de Carpetas

/
├── .github/workflows/   # CI/CD automatizado (opcional para Dokploy)
├── app/                 # Rutas de Next.js
│   ├── (auth)/          # Login/Register
│   ├── dashboard/       # Vista Principal (Ventas vs Gastos)
│   ├── facturas/        # CRUD Ventas y Recibidas
│   └── gastos-fijos/    # Configuración de fijos
├── components/          # UI con Tailwind
├── lib/                 # supabase-client.ts, utils.ts
├── public/              # Assets estáticos
├── Dockerfile           # Configuración para Dokploy
└── next.config.js       # Configurado con standalone