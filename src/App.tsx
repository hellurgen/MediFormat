import { useState } from 'react';
import { ClipboardCopy, Stethoscope, ArrowRight, Check, Loader2, Trash2 } from 'lucide-react';
import { processMedicalTextStream } from './services/gemini';

export default function App() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleProcess = async () => {
    if (!inputText.trim()) {
      setError('Por favor, ingresa algún texto para procesar.');
      return;
    }

    setError('');
    setIsProcessing(true);
    setOutputText('');
    setCopied(false);

    try {
      let fullText = '';
      await processMedicalTextStream(inputText, (chunk) => {
        fullText += chunk;
        setOutputText(fullText);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = async () => {
    if (!outputText) return;
    try {
      await navigator.clipboard.writeText(outputText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleClear = () => {
    setInputText('');
    setOutputText('');
    setError('');
    setCopied(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-200 selection:text-emerald-900">
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <header className="mb-8 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-emerald-100 text-emerald-600 rounded-2xl mb-4">
            <Stethoscope className="w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 mb-2">
            MediFormat
          </h1>
          <p className="text-slate-500 max-w-lg mx-auto">
            Pega tus resultados de laboratorio o listas de medicamentos y obtén un formato limpio, estandarizado y listo para copiar.
          </p>
        </header>

        <main className="space-y-6">
          {/* Input Area */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <label htmlFor="input-text" className="text-sm font-medium text-slate-700">
                Insertar Resultados o Medicamentos
              </label>
              <button
                onClick={handleClear}
                disabled={!inputText && !outputText}
                className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Borrar todo"
              >
                <Trash2 className="w-4 h-4" />
                Limpiar
              </button>
            </div>
            <textarea
              id="input-text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Pega aquí el texto desordenado de laboratorios o tratamientos..."
              className="w-full h-48 sm:h-64 p-4 resize-none outline-none text-slate-700 placeholder:text-slate-400"
              spellCheck={false}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm">
              {error}
            </div>
          )}

          {/* Action Button */}
          <div className="flex justify-center">
            <button
              onClick={handleProcess}
              disabled={isProcessing || !inputText.trim()}
              className="group relative flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-8 py-3.5 rounded-full font-medium shadow-sm hover:shadow transition-all active:scale-95"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  Procesar Texto
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>

          {/* Output Area */}
          <div className={`transition-all duration-500 ${outputText ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-4'}`}>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <span className="text-sm font-medium text-slate-700">Resultado formateado</span>
                <button
                  onClick={handleCopy}
                  disabled={!outputText}
                  className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700 disabled:text-slate-400 transition-colors bg-emerald-50 hover:bg-emerald-100 disabled:bg-transparent px-3 py-1.5 rounded-md"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <ClipboardCopy className="w-4 h-4" />
                      Copiar
                    </>
                  )}
                </button>
              </div>
              <textarea
                value={outputText}
                readOnly
                placeholder="El resultado aparecerá aquí..."
                className="w-full h-48 sm:h-64 p-4 resize-none outline-none text-slate-800 bg-slate-50/30 font-mono text-sm leading-relaxed"
              />
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-slate-500">
          <p className="font-medium text-slate-700">Desarrollado por el Dr. Antonio J. Arnal Meinhardt</p>
          <p className="mt-1">Médico de Urgencias | Atención Primaria</p>
        </footer>
      </div>
    </div>
  );
}
