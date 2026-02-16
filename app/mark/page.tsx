'use client';
import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';

// --- ÍCONES (SPINNER, CASA, CHECK, ERRO) ---
const Spinner = () => (
  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const HomeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
);

// --- TIPOS ---
interface IEmployeeSimple {
  _id: string;
  name: string;
}

interface IModalState {
  show: boolean;
  type: 'success' | 'error' | 'warning';
  title: string;
  message: string;
}

export default function MarkAttendancePage() {
  // --- ESTADOS ---
  const [employees, setEmployees] = useState<IEmployeeSimple[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [pin, setPin] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);

  // Estado do Pop-up (Modal)
  const [modal, setModal] = useState<IModalState>({ 
    show: false, type: 'success', title: '', message: '' 
  });

  // --- CARREGAMENTO INICIAL ---
  useEffect(() => {
    // 1. Busca Funcionários
    fetch('/api/employees?all=true')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setEmployees(data);
        else if (data.data && Array.isArray(data.data)) setEmployees(data.data);
        else setEmployees([]);
      })
      .catch(() => setEmployees([]));

    // 2. Busca Token de Segurança
    fetch('/api/auth/token')
      .then((res) => res.json())
      .then((data) => setToken(data.token))
      .catch(console.error);
  }, []);

  // --- ENVIAR PRESENÇA ---
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedId || !pin) return;
    
    setLoading(true);

    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          employeeId: selectedId, 
          pinEntered: pin,
          token: token 
        }),
      });

      const data = await res.json();
      
      if (data.success) {
        // Sucesso: Mostra modal verde
        setModal({
          show: true,
          type: 'success',
          title: 'Presença Confirmada!',
          message: data.message
        });
      } else {
        // Erro: Mostra modal vermelho
        setModal({
          show: true,
          type: 'error',
          title: 'Atenção',
          message: data.message
        });
      }
    } catch (err) {
      setModal({
        show: true,
        type: 'error',
        title: 'Erro de Conexão',
        message: 'Verifique a internet e tente novamente.'
      });
    } finally {
      setLoading(false);
    }
  };

  // --- FECHAR MODAL E LIMPAR ---
  const handleCloseModal = () => {
    setModal({ ...modal, show: false });
    
    // Se foi sucesso, limpa tudo e recarrega para o próximo
    if (modal.type === 'success') {
      setPin('');
      setSelectedId('');
      window.location.reload(); 
    }
    // Se foi erro, apenas fecha para ele tentar de novo (não limpa o nome)
    if (modal.type === 'error') {
      setPin(''); // Limpa só o PIN
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative">
      
      {/* --- BOTÃO DE VOLTAR AO INÍCIO --- */}
      <div className="absolute top-4 left-4 z-10">
        <Link 
          href="/" 
          className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-full shadow-md border border-gray-200 hover:bg-gray-100 transition font-medium text-sm"
        >
          <HomeIcon />
          <span>Início</span>
        </Link>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          
          <div className="text-center mb-8">
            <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight">
              Marcar presença
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              SDEJT - MAXIXE
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* SELECIONAR NOME */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
                Identificação
              </label>
              <div className="relative">
                <select
                  className="block w-full appearance-none rounded-xl border border-gray-300 bg-gray-50 p-4 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition font-medium"
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                  required
                >
                  <option value="">Selecione o seu nome...</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>

            {/* INSERIR PIN */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
                Código PIN
              </label>
              <input
                type="tel"
                maxLength={8}
                placeholder="• • • •"
                className="block w-full rounded-xl border border-gray-300 bg-gray-50 p-4 text-center text-3xl font-bold tracking-[0.5em] text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition placeholder-gray-300"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                required
              />
            </div>

            {/* BOTÃO CONFIRMAR */}
            <button
              type="submit"
              disabled={loading || !token}
              className={`w-full rounded-xl py-4 font-bold text-white text-lg shadow-lg transition-all transform active:scale-95 flex justify-center items-center ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
              }`}
            >
              {loading ? <Spinner /> : null}
              {loading ? 'Validando...' : 'MARCAR PRESENÇA'}
            </button>

            <p className="text-center text-xs text-gray-400 mt-4">
              Sessão segura ativa.
            </p>
          </form>
        </div>
      </div>

      {/* --- MODAL PROFISSIONAL (POP-UP) --- */}
      {modal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100">
            
            {/* Ícone e Cor de Fundo */}
            <div className={`p-6 flex flex-col items-center justify-center ${
              modal.type === 'success' ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <div className={`rounded-full p-4 mb-4 ${
                modal.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
              }`}>
                {modal.type === 'success' ? (
                  // Ícone Check
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                ) : (
                  // Ícone X
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                )}
              </div>
              
              <h3 className={`text-xl font-bold text-center ${
                modal.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {modal.title}
              </h3>
            </div>

            {/* Conteúdo da Mensagem */}
            <div className="p-6 text-center">
              <p className="text-gray-600 text-lg leading-relaxed">
                {modal.message}
              </p>

              <button
                onClick={handleCloseModal}
                className={`mt-6 w-full py-3 rounded-xl font-bold text-white transition shadow-md ${
                  modal.type === 'success' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {modal.type === 'success' ? 'OK, Próximo' : 'Tentar Novamente'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}