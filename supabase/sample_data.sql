-- ============================================================
-- DATOS DE EJEMPLO - CONTROL DE GASTOS
-- ============================================================
-- INSTRUCCIONES:
-- 1. Primero registra un usuario en la aplicación
-- 2. Ve a Supabase Dashboard > Authentication > Users
-- 3. Copia el UUID de tu usuario
-- 4. Reemplaza 'TU_USER_ID_AQUI' con tu UUID real
-- 5. Ejecuta este script en el SQL Editor
-- ============================================================

-- ⚠️ REEMPLAZA ESTE ID CON TU USER_ID REAL ⚠️
-- Ejemplo: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
DO $$
DECLARE
  demo_user_id UUID := '61a5f44a-555f-4310-a360-188c4aac9edd'; -- UUID de Nordinrais
BEGIN

-- ============================================================
-- GASTOS FIJOS MENSUALES
-- ============================================================

INSERT INTO fixed_costs (user_id, category, monthly_amount) VALUES
  (demo_user_id, 'Alquiler local', 1200.00),
  (demo_user_id, 'Electricidad', 185.00),
  (demo_user_id, 'Agua', 45.00),
  (demo_user_id, 'Gas', 65.00),
  (demo_user_id, 'Internet y Teléfono', 89.00),
  (demo_user_id, 'Seguros', 150.00),
  (demo_user_id, 'Gestoría', 120.00),
  (demo_user_id, 'Salario empleado 1', 1800.00),
  (demo_user_id, 'Salario empleado 2', 1600.00),
  (demo_user_id, 'Cuota autónomo', 294.00),
  (demo_user_id, 'Software y licencias', 79.00),
  (demo_user_id, 'Mantenimiento', 100.00);

-- ============================================================
-- FACTURAS DE VENTA (Ingresos)
-- ============================================================

-- Enero 2026
INSERT INTO invoices (user_id, type, amount, provider_customer, issue_date, is_manual) VALUES
  (demo_user_id, 'venta', 3450.00, 'Muebles García S.L.', '2026-01-05', true),
  (demo_user_id, 'venta', 1890.00, 'Decoración Martínez', '2026-01-08', true),
  (demo_user_id, 'venta', 5200.00, 'Hotel Costa Brava', '2026-01-12', true),
  (demo_user_id, 'venta', 2100.00, 'Restaurante El Fogón', '2026-01-15', true),
  (demo_user_id, 'venta', 890.00, 'María López Fernández', '2026-01-18', true),
  (demo_user_id, 'venta', 4500.00, 'Inmobiliaria Pérez', '2026-01-20', true);

-- Diciembre 2025
INSERT INTO invoices (user_id, type, amount, provider_customer, issue_date, is_manual) VALUES
  (demo_user_id, 'venta', 6800.00, 'Centro Comercial Plaza Mayor', '2025-12-02', true),
  (demo_user_id, 'venta', 2340.00, 'Clínica Dental Sonrisa', '2025-12-05', true),
  (demo_user_id, 'venta', 1560.00, 'Peluquería Style', '2025-12-10', true),
  (demo_user_id, 'venta', 4200.00, 'Oficinas Tecnológicas S.A.', '2025-12-15', true),
  (demo_user_id, 'venta', 890.00, 'Juan Carlos Ruiz', '2025-12-18', true),
  (demo_user_id, 'venta', 3100.00, 'Farmacia Central', '2025-12-22', true),
  (demo_user_id, 'venta', 1750.00, 'Bar Restaurante La Tasca', '2025-12-28', true);

-- Noviembre 2025
INSERT INTO invoices (user_id, type, amount, provider_customer, issue_date, is_manual) VALUES
  (demo_user_id, 'venta', 5600.00, 'Constructora López Hermanos', '2025-11-03', true),
  (demo_user_id, 'venta', 1890.00, 'Tienda de Ropa Elegance', '2025-11-08', true),
  (demo_user_id, 'venta', 3200.00, 'Gimnasio FitZone', '2025-11-12', true),
  (demo_user_id, 'venta', 980.00, 'Laura Sánchez García', '2025-11-15', true),
  (demo_user_id, 'venta', 4100.00, 'Supermercado Ahorro Plus', '2025-11-20', true),
  (demo_user_id, 'venta', 2450.00, 'Óptica Visual', '2025-11-25', true);

-- Octubre 2025
INSERT INTO invoices (user_id, type, amount, provider_customer, issue_date, is_manual) VALUES
  (demo_user_id, 'venta', 3800.00, 'Escuela Infantil Arcoíris', '2025-10-05', true),
  (demo_user_id, 'venta', 2100.00, 'Ferretería Industrial', '2025-10-10', true),
  (demo_user_id, 'venta', 1450.00, 'Antonio Rodríguez Díaz', '2025-10-15', true),
  (demo_user_id, 'venta', 5500.00, 'Residencia Tercera Edad', '2025-10-20', true),
  (demo_user_id, 'venta', 890.00, 'Floristería El Jardín', '2025-10-25', true);

-- ============================================================
-- FACTURAS RECIBIDAS (Gastos Variables / Proveedores)
-- ============================================================

-- Enero 2026
INSERT INTO invoices (user_id, type, amount, provider_customer, issue_date, is_manual) VALUES
  (demo_user_id, 'recibida', 2800.00, 'Maderas del Norte S.L.', '2026-01-03', true),
  (demo_user_id, 'recibida', 450.00, 'Transportes Rápidos', '2026-01-07', true),
  (demo_user_id, 'recibida', 1200.00, 'Telas y Tapizados García', '2026-01-10', true),
  (demo_user_id, 'recibida', 380.00, 'Herrajes y Accesorios', '2026-01-14', true),
  (demo_user_id, 'recibida', 890.00, 'Espumas y Rellenos', '2026-01-17', true);

-- Diciembre 2025
INSERT INTO invoices (user_id, type, amount, provider_customer, issue_date, is_manual) VALUES
  (demo_user_id, 'recibida', 3500.00, 'Maderas del Norte S.L.', '2025-12-01', true),
  (demo_user_id, 'recibida', 1800.00, 'Telas y Tapizados García', '2025-12-05', true),
  (demo_user_id, 'recibida', 620.00, 'Transportes Rápidos', '2025-12-08', true),
  (demo_user_id, 'recibida', 290.00, 'Ferretería Industrial', '2025-12-12', true),
  (demo_user_id, 'recibida', 1100.00, 'Pinturas y Barnices', '2025-12-16', true),
  (demo_user_id, 'recibida', 450.00, 'Material de Embalaje', '2025-12-20', true),
  (demo_user_id, 'recibida', 780.00, 'Espumas y Rellenos', '2025-12-23', true);

-- Noviembre 2025
INSERT INTO invoices (user_id, type, amount, provider_customer, issue_date, is_manual) VALUES
  (demo_user_id, 'recibida', 4200.00, 'Maderas del Norte S.L.', '2025-11-02', true),
  (demo_user_id, 'recibida', 1500.00, 'Telas y Tapizados García', '2025-11-06', true),
  (demo_user_id, 'recibida', 890.00, 'Herrajes y Accesorios', '2025-11-10', true),
  (demo_user_id, 'recibida', 320.00, 'Transportes Rápidos', '2025-11-15', true),
  (demo_user_id, 'recibida', 650.00, 'Espumas y Rellenos', '2025-11-20', true),
  (demo_user_id, 'recibida', 1200.00, 'Cristales y Espejos', '2025-11-25', true);

-- Octubre 2025
INSERT INTO invoices (user_id, type, amount, provider_customer, issue_date, is_manual) VALUES
  (demo_user_id, 'recibida', 3100.00, 'Maderas del Norte S.L.', '2025-10-03', true),
  (demo_user_id, 'recibida', 1350.00, 'Telas y Tapizados García', '2025-10-08', true),
  (demo_user_id, 'recibida', 480.00, 'Transportes Rápidos', '2025-10-12', true),
  (demo_user_id, 'recibida', 720.00, 'Pinturas y Barnices', '2025-10-18', true),
  (demo_user_id, 'recibida', 550.00, 'Espumas y Rellenos', '2025-10-22', true);

RAISE NOTICE '✅ Datos de ejemplo insertados correctamente!';
RAISE NOTICE '📊 Gastos fijos: 12 registros';
RAISE NOTICE '💰 Facturas de venta: 24 registros';
RAISE NOTICE '📥 Facturas recibidas: 23 registros';

END $$;


-- ============================================================
-- RESUMEN DE DATOS INSERTADOS
-- ============================================================
-- 
-- GASTOS FIJOS MENSUALES (Total: 5,728€/mes)
-- - Alquiler: 1,200€
-- - Electricidad: 185€
-- - Agua: 45€
-- - Gas: 65€
-- - Internet/Teléfono: 89€
-- - Seguros: 150€
-- - Gestoría: 120€
-- - Salarios: 3,400€
-- - Autónomo: 294€
-- - Software: 79€
-- - Mantenimiento: 100€
--
-- FACTURAS DE VENTA (4 meses de datos)
-- - Clientes variados españoles
-- - Montos entre 890€ y 6,800€
--
-- FACTURAS RECIBIDAS (Proveedores)
-- - Maderas del Norte S.L.
-- - Telas y Tapizados García
-- - Transportes Rápidos
-- - Herrajes y Accesorios
-- - Espumas y Rellenos
-- - Pinturas y Barnices
-- - Y más...
-- ============================================================
