-- ============================================================
-- SCRIPT COMPLETO PARA SUPABASE - CONTROL DE GASTOS
-- Ejecutar en el SQL Editor de Supabase
-- ============================================================

-- ============================================================
-- PARTE 1: CREACIÓN DE ESTRUCTURA (TABLAS)
-- ============================================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabla de Perfiles de Usuario
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  company_name TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger para crear perfil automáticamente cuando se registra un usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Tipo de Factura (enum)
DO $$ BEGIN
  CREATE TYPE invoice_type AS ENUM ('venta', 'recibida');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. Tabla de Facturas (Ventas y Compras/Recibidas)
CREATE TABLE IF NOT EXISTS invoices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  type invoice_type NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  provider_customer TEXT NOT NULL,
  issue_date DATE DEFAULT CURRENT_DATE,
  file_url TEXT,
  is_manual BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_type ON invoices(type);
CREATE INDEX IF NOT EXISTS idx_invoices_issue_date ON invoices(issue_date);

-- 4. Tabla de Gastos Fijos
CREATE TABLE IF NOT EXISTS fixed_costs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  category TEXT NOT NULL,
  monthly_amount DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fixed_costs_user_id ON fixed_costs(user_id);

-- ============================================================
-- PARTE 2: SEGURIDAD (RLS - Row Level Security)
-- ============================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE fixed_costs ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Políticas para invoices
DROP POLICY IF EXISTS "Users can view own invoices" ON invoices;
CREATE POLICY "Users can view own invoices" ON invoices
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own invoices" ON invoices;
CREATE POLICY "Users can insert own invoices" ON invoices
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own invoices" ON invoices;
CREATE POLICY "Users can update own invoices" ON invoices
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own invoices" ON invoices;
CREATE POLICY "Users can delete own invoices" ON invoices
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para fixed_costs
DROP POLICY IF EXISTS "Users can view own fixed_costs" ON fixed_costs;
CREATE POLICY "Users can view own fixed_costs" ON fixed_costs
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own fixed_costs" ON fixed_costs;
CREATE POLICY "Users can insert own fixed_costs" ON fixed_costs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own fixed_costs" ON fixed_costs;
CREATE POLICY "Users can update own fixed_costs" ON fixed_costs
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own fixed_costs" ON fixed_costs;
CREATE POLICY "Users can delete own fixed_costs" ON fixed_costs
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- PARTE 3: STORAGE (Bucket para facturas)
-- ============================================================

-- Crear bucket para almacenar PDFs de facturas
INSERT INTO storage.buckets (id, name, public)
VALUES ('invoices', 'invoices', false)
ON CONFLICT (id) DO NOTHING;

-- Políticas de Storage (eliminar si existen antes de crear)
DROP POLICY IF EXISTS "Users can upload their own invoices" ON storage.objects;
CREATE POLICY "Users can upload their own invoices"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'invoices' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can view their own invoices" ON storage.objects;
CREATE POLICY "Users can view their own invoices"
ON storage.objects FOR SELECT
USING (bucket_id = 'invoices' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can delete their own invoices" ON storage.objects;
CREATE POLICY "Users can delete their own invoices"
ON storage.objects FOR DELETE
USING (bucket_id = 'invoices' AND auth.uid()::text = (storage.foldername(name))[1]);


-- ============================================================
-- FIN DEL SCRIPT DE ESTRUCTURA
-- ============================================================
-- ¡IMPORTANTE! 
-- Para insertar datos de ejemplo, primero debes:
-- 1. Registrar un usuario en la app
-- 2. Copiar el UUID del usuario
-- 3. Ejecutar el script de datos de ejemplo (sample_data.sql)
-- ============================================================
