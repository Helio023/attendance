"use client";
import { useEffect, useState } from "react";
import QRCode from "react-qr-code";

export default function GerarQrCodePage() {
  const [urlDestino, setUrlDestino] = useState("");
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    setMontado(true);
    if (typeof window !== "undefined") {
      const origin = window.location.origin;
      setUrlDestino(`${origin}/mark`);
    }
  }, []);

  const handleImprimir = () => {
    window.print();
  };

  if (!montado) return null;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="print:hidden mb-8 flex flex-col items-center gap-4">
        <div className="flex gap-4">
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-gray-600 text-white rounded font-bold hover:bg-gray-700 transition"
          >
            Voltar
          </button>
          <button
            onClick={handleImprimir}
            className="px-6 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 transition flex items-center gap-2 shadow-lg"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            IMPRIMIR CARTAZ
          </button>
        </div>
      </div>

      {/* --- ÁREA DO CARTAZ (O que sai no papel) --- */}
      <div className="bg-white p-10 rounded-xl shadow-2xl border border-gray-200 text-center max-w-[210mm] w-full print:shadow-none print:border-none print:w-full print:h-screen print:flex print:flex-col print:justify-center print:items-center">
        {/* Cabeçalho Oficial */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 uppercase tracking-widest mb-1">
            Ponto de presenças
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            Serviço Distrital de Educação, Juventude e Tecnologia de Maxixe
          </p>
          <div className="h-1 w-32 bg-blue-600 mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="bg-white p-4 inline-block border-4 border-gray-900 rounded-lg">
          {urlDestino && <QRCode value={urlDestino} size={300} level="L" />}
        </div>

        {/* Instruções */}
        <div className="mt-8 space-y-2">
          <h2 className="text-xl font-bold text-gray-900">
            ESCANEIE PARA MARCAR PRESENÇA
          </h2>
          <p className="text-gray-600">
            Aponte a câmara do seu telemóvel para o código acima.
          </p>
        </div>

        {/* Rodapé do Cartaz */}
        <div className="mt-12 pt-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400">
          <span>Sistema Interno de presenças</span>
        </div>
      </div>
    </div>
  );
}
