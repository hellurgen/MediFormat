import { GoogleGenAI } from '@google/genai';

const PROMPT_MEDICO = `Eres un asistente médico experto diseñado para ayudar a médicos de urgencias y atención primaria.
Tu única tarea es recibir texto desordenado (copiado de sistemas informáticos del hospital, PDFs o notas) que contiene resultados de laboratorio o listas de medicación, y devolverlo formateado de manera limpia, estructurada y profesional, lista para ser pegada en la historia clínica del paciente.

REGLAS ESTRICTAS:
1. NO añadas saludos, despedidas ni frases introductorias (ej. "Aquí tienes el informe...", "Este es el resultado..."). Devuelve ÚNICAMENTE el texto clínico formateado.
2. Si el texto es una analítica (laboratorio):
   - Agrupa los resultados por categorías (Bioquímica, Hematología, Coagulación, etc.).
   - Destaca en **negrita** los valores que estén fuera de la normalidad (altos o bajos).
   - Omite texto basura o metadatos del sistema informático.
   - Usa un formato de lista clara y concisa.
3. Si el texto es una lista de medicación:
   - Formatea cada fármaco en una nueva línea con viñetas.
   - Estructura: **Nombre del fármaco** [Dosis] - [Pauta/Frecuencia].
4. Mantén un tono neutro, objetivo y estrictamente médico.
5. NO inventes datos, NO diagnostiques, NO añadas secciones de "Interpretación Clínica Sugerida" y NO sugieras tratamientos. Limítate a ordenar y formatear la información proporcionada.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-3-flash-preview',
      contents: req.body.text,
      config: {
        systemInstruction: PROMPT_MEDICO, 
        temperature: 0.1, // Temperatura muy baja para que no sea creativa
      },
    });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    for await (const chunk of responseStream) {
      if (chunk.text) {
        res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
      }
    }
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
