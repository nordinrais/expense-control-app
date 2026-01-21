'use server';

import OpenAI from 'openai';
// @ts-ignore
import pdf from 'pdf-parse';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function processInvoice(formData: FormData) {
    try {
        const file = formData.get('file') as File;
        if (!file) {
            throw new Error('No file uploaded');
        }

        // Convert file to buffer for pdf-parse
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Extract text from PDF
        const data = await pdf(buffer);
        const text = data.text;

        // Analyze text with OpenAI
        const completion = await openai.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "Eres un asistente experto en contabilidad. Tu tarea es extraer información estructurada (JSON) de facturas en texto plano. Debes extraer: 'type' (venta para facturas emitidas por 'Inva' o 'Usuario', recibida para facturas de proveedores), 'amount' (el total numérico), 'provider_customer' (nombre de la empresa cliente o proveedor), y 'issue_date' (fecha de emisión en formato YYYY-MM-DD)."
                },
                {
                    role: "user",
                    content: `Analiza el siguiente texto de una factura y extrae los datos en formato JSON.
                    Texto:
                    ${text.substring(0, 3000)} -- Limitamos a 3000 chars para no saturar tokens
                    
                    Formato de respuesta esperado (JSON puro sin markdown):
                    {
                        "type": "venta" | "recibida",
                        "amount": number,
                        "provider_customer": "string",
                        "issue_date": "YYYY-MM-DD"
                    }`
                }
            ],
            model: "gpt-4o",
            response_format: { type: "json_object" },
        });

        const result = completion.choices[0].message.content;
        if (!result) throw new Error('No analysis result');

        return JSON.parse(result);
    } catch (error) {
        console.error('Error processing invoice:', error);
        return { error: 'Error processing invoice' };
    }
}
