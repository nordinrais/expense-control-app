'use server';

import OpenAI from 'openai';
// @ts-ignore
import pdf from 'pdf-parse';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function processInvoice(formData: FormData) {
    try {
        if (!process.env.OPENAI_API_KEY) {
            console.error('OpenAI API Key missing');
            return { error: 'Configuración incompleta: Falta la API Key de OpenAI en el servidor.' };
        }

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

        if (!text || text.trim().length === 0) {
            console.warn('PDF has no text content');
            return { error: 'El PDF parece ser una imagen o escaneado sin texto seleccionable. Intenta con un PDF digital.' };
        }

        console.log('Extracted text length:', text.length);

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
                    ${text.substring(0, 3000)}
                    
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
    } catch (error: any) {
        console.error('Error processing invoice:', error);
        return { error: error.message || 'Error processing invoice' };
    }
}
