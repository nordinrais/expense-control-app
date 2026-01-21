-- Extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Usuarios/Perfiles
CREATE TABLE profiles (
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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

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

-- Índices para mejorar rendimiento
CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_type ON invoices(type);
CREATE INDEX idx_invoices_issue_date ON invoices(issue_date);

-- 3. Gastos Fijos
CREATE TABLE fixed_costs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  category TEXT NOT NULL, -- alquiler, luz, salarios, etc.
  monthly_amount DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_fixed_costs_user_id ON fixed_costs(user_id);

-- RLS (Row Level Security) - Seguridad
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only see their own invoices" ON invoices
  FOR ALL USING (auth.uid() = user_id);

ALTER TABLE fixed_costs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only see their own fixed_costs" ON fixed_costs
  FOR ALL USING (auth.uid() = user_id);

-- Storage Bucket (ejecutar en SQL Editor o Dashboard)
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('invoices', 'invoices', false);

-- Política de Storage para invoices
-- CREATE POLICY "Users can upload their own invoices"
-- ON storage.objects FOR INSERT
-- WITH CHECK (bucket_id = 'invoices' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can view their own invoices"
-- ON storage.objects FOR SELECT
-- USING (bucket_id = 'invoices' AND auth.uid()::text = (storage.foldername(name))[1]);
