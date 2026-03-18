export async function processMedicalTextStream(text: string, onChunk: (text: string) => void): Promise<void> {
  try {
    const response = await fetch('/api/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) throw new Error('Error en el servidor intermedio.');

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader!.read();
      if (done) break;
      
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const dataStr = line.slice(6);
          if (dataStr === '[DONE]') return;
          try {
            const data = JSON.parse(dataStr);
            if (data.text) onChunk(data.text);
          } catch (e) {}
        }
      }
    }
  } catch (error: any) {
    console.error('Error:', error);
    throw new Error('Error de conexión. Revisa tu internet.');
  }
}
