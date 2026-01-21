export default function HelpPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Ayuda</h1>

            <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">¿Cómo funciona el Breakeven?</h2>
                    <p className="text-gray-600">
                        El breakeven calcula: <strong>(Gastos Fijos + Facturas Recibidas) - Total Ventas</strong>.
                        Si el resultado es positivo, muestra cuánto falta para cubrir gastos.
                    </p>
                </div>

                <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">Gestión de Facturas</h2>
                    <p className="text-gray-600">
                        Puedes subir PDFs de tus facturas para tenerlas organizadas. Las facturas se clasifican como
                        Ventas (emitidas) o Recibidas (compras).
                    </p>
                </div>

                <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">Gastos Fijos</h2>
                    <p className="text-gray-600">
                        Registra tus gastos mensuales recurrentes (alquiler, luz, salarios) para calcular
                        correctamente el punto de equilibrio.
                    </p>
                </div>
            </div>
        </div>
    );
}
