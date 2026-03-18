import { GoogleGenAI } from '@google/genai';

export async function processMedicalTextStream(
  text: string, 
  onChunk: (text: string) => void
): Promise<void> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-3-flash-preview',
      contents: text,
      config: {
        systemInstruction: AUTO_PROMPT,
        temperature: 0.1,
      },
    });

    for await (const chunk of responseStream) {
      if (chunk.text) {
        onChunk(chunk.text);
      }
    }
  } catch (error: any) {
    console.error('Error processing text:', error);
    
    if (error.message === 'Failed to fetch' || error.message?.includes('fetch')) {
      throw new Error('Error de conexión: El navegador bloqueó la petición a la IA. Si usas un bloqueador de anuncios (como uBlock) o el navegador Brave, por favor desactívalo para esta página. Si estás en la red de un hospital, es probable que su firewall esté bloqueando el acceso a los servicios de IA de Google.');
    }
    
    throw new Error(error.message || 'Ocurrió un error al procesar el texto. Por favor, inténtalo de nuevo.');
  }
}
