import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'Estil - Control de Gastos y Facturación',
    description: 'Sistema de control de gastos y facturación empresarial',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es">
            <body className="antialiased">{children}</body>
        </html>
    );
}
