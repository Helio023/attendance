"use client";
import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";

// --- ÍCONES ---
const Spinner = () => (
  <svg
    className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

const HomeIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
    />
  </svg>
);

// --- TIPOS ---
interface IEmployeeSimple {
  _id: string;
  name: string;
}

interface IModalState {
  show: boolean;
  type: "success" | "error";
  title: string;
  message: string;
}

export default function MarkAttendancePage() {
  const [employees, setEmployees] = useState<IEmployeeSimple[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [pin, setPin] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [gpsStatus, setGpsStatus] = useState(""); // Estado para mensagem de GPS

  // Estado do Modal
  const [modal, setModal] = useState<IModalState>({
    show: false,
    type: "success",
    title: "",
    message: "",
  });

  useEffect(() => {
    // 1. Cache Local
    const cachedData = localStorage.getItem("funcionarios_cache");
    if (cachedData) {
      try {
        setEmployees(JSON.parse(cachedData));
      } catch (e) {}
    }

    // 2. API Funcionários
    fetch("/api/employees?all=true")
      .then((res) => res.json())
      .then((data) => {
        let lista = [];
        if (Array.isArray(data)) lista = data;
        else if (data.data && Array.isArray(data.data)) lista = data.data;

        if (lista.length > 0) {
          setEmployees(lista);
          localStorage.setItem("funcionarios_cache", JSON.stringify(lista));
        }
      })
      .catch(console.error);

    // 3. Token
    fetch("/api/auth/token")
      .then((res) => res.json())
      .then((data) => setToken(data.token))
      .catch(console.error);
  }, []);

  // --- NOVA FUNÇÃO DE SUBMISSÃO COM GPS ---
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedId || !pin) return;

    setLoading(true);
    setGpsStatus("A obter localização...");

    // Verificar suporte a GPS
    if (!navigator.geolocation) {
      setModal({
        show: true,
        type: "error",
        title: "Erro GPS",
        message: "Seu navegador não suporta geolocalização.",
      });
      setLoading(false);
      return;
    }

    // Pedir Localização
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        // SUCESSO NO GPS
        const { latitude, longitude } = position.coords;

        setGpsStatus("A enviar dados...");

        try {
          const res = await fetch("/api/attendance", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              employeeId: selectedId,
              pinEntered: pin,
              token: token,
              latitude, // Envia as coordenadas
              longitude,
            }),
          });

          const data = await res.json();

          if (data.success) {
            setModal({
              show: true,
              type: "success",
              title: "Sucesso!",
              message: data.message,
            });
          } else {
            setModal({
              show: true,
              type: "error",
              title: "Atenção",
              message: data.message,
            });
          }
        } catch (err) {
          setModal({
            show: true,
            type: "error",
            title: "Erro de Conexão",
            message: "Verifique a internet.",
          });
        } finally {
          setLoading(false);
          setGpsStatus("");
        }
      },
      (error) => {
        // ERRO NO GPS
        console.error(error);
        setLoading(false);
        setGpsStatus("");

        let msg = "Erro ao obter localização.";
        if (error.code === 1)
          msg = "Você precisa permitir o acesso à Localização.";
        if (error.code === 2) msg = "Sinal de GPS indisponível.";
        if (error.code === 3) msg = "Tempo limite do GPS esgotado.";

        setModal({
          show: true,
          type: "error",
          title: "Localização Necessária",
          message: msg,
        });
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  };

  const handleCloseModal = () => {
    setModal({ ...modal, show: false });
    if (modal.type === "success") {
      setPin("");
      setSelectedId("");
      fetch("/api/auth/token")
        .then((r) => r.json())
        .then((d) => setToken(d.token))
        .catch(console.error);
    }
    if (modal.type === "error") {
      setPin("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative">
      <div className="absolute top-4 left-4 z-10">
        <Link
          href="/"
          className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-full shadow-md border border-gray-200 hover:bg-gray-100 transition font-medium text-sm"
        >
          <HomeIcon /> Início
        </Link>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight">
              Marcar Presença
            </h1>
            <p className="text-sm text-gray-500 mt-2">SDEJT - MAXIXE</p>
            <div className="mt-2 inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Localização Obrigatória
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

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

            <button
              type="submit"
              disabled={loading || !token}
              className={`w-full rounded-xl py-4 font-bold text-white text-lg shadow-lg transition-all transform active:scale-95 flex justify-center items-center flex-col leading-none ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              }`}
            >
              <div className="flex items-center gap-2">
                {loading && <Spinner />}
                <span>{loading ? gpsStatus : "MARCAR PRESENÇA"}</span>
              </div>
            </button>

            <p className="text-center text-xs text-gray-400 mt-4">
              Deverá estar a menos de 100m do SDEJT-MAXIXE.
            </p>
          </form>
        </div>
      </div>

      {modal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100">
            <div
              className={`p-6 flex flex-col items-center justify-center ${modal.type === "success" ? "bg-green-50" : "bg-red-50"}`}
            >
              <div
                className={`rounded-full p-4 mb-4 ${modal.type === "success" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}
              >
                {modal.type === "success" ? (
                  <svg
                    className="w-10 h-10"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-10 h-10"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                )}
              </div>
              <h3
                className={`text-xl font-bold text-center ${modal.type === "success" ? "text-green-800" : "text-red-800"}`}
              >
                {modal.title}
              </h3>
            </div>
            <div className="p-6 text-center">
              <p className="text-gray-600 text-lg leading-relaxed">
                {modal.message}
              </p>
              <button
                onClick={handleCloseModal}
                className={`mt-6 w-full py-3 rounded-xl font-bold text-white transition shadow-md ${modal.type === "success" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}
              >
                {modal.type === "success" ? "OK, Próximo" : "Tentar Novamente"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
