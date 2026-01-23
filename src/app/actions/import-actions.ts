'use server';

import OpenAI from 'openai';
import { createClient } from '@/lib/supabase/server';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function processBulkImport(rows: any[]) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { error: 'No autorizado' };
        }

        if (!rows || rows.length === 0) {
            return { error: 'No hay datos para procesar' };
        }

        // Limit batch size to prevent token limits
        const batchSize = 25;
        const processRows = rows.slice(0, batchSize);

        const prompt = `
            Analiza estas filas de un archivo Excel importado y extrame facturas estructuradas.
            El usuario es la empresa "Estil" (Estil Sofa).

            Reglas:
            1. 'type': Si el proveedor/cliente parece ser "Estil" (o variaciones), es una "venta". Si es otro nombre, es una "recibida" (gasto/compra).
            2. 'amount': Busca el valor monetario total. Normaliza a número (punto decimal).
            3. 'provider_customer': El nombre de la otra parte.
            4. 'issue_date': La fecha de la factura en formato YYYY-MM-DD. Si no hay fecha, usa la de hoy.

            Devuelve un JSON array puro con objetos: { type, amount, provider_customer, issue_date }.
            
            Datos:
            ${JSON.stringify(processRows)}
        `;

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "Eres un asistente contable experto. Devuelve SOLO JSON válido." },
                { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" }
        });

        const content = response.choices[0].message.content;
        if (!content) throw new Error("No response from AI");

        const result = JSON.parse(content);
        // Sometimes GPT returns { invoices: [...] } or just [...]
        const invoices = Array.isArray(result) ? result : (result.invoices || result.data || []);

        return { data: invoices };

    } catch (error: any) {
        console.error('Error in bulk import:', error);
        return { error: error.message || 'Error procesando el archivo' };
    }
}

export async function saveBulkInvoices(invoices: any[]) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return { error: 'No autorizado' };

        // Add user_id and defaults
        const invoicesToInsert = invoices.map(inv => ({
            user_id: user.id,
            type: inv.type,
            amount: inv.amount,
            provider_customer: inv.provider_customer,
            issue_date: inv.issue_date,
            is_manual: true,
            created_at: new Date().toISOString()
        }));

        const { error } = await supabase
            .from('invoices')
            .insert(invoicesToInsert);

        if (error) throw error;

        return { success: true };

    } catch (error: any) {
        console.error('Error saving invoices:', error);
        return { error: error.message };
    }
}
