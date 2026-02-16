"use client";
import { useState, useEffect, FormEvent } from "react";

interface IEmployeeSimple {
  _id: string;
  name: string;
}

export default function MarkAttendancePage() {
  // Inicializa SEMPRE com array vazio para não dar erro no primeiro render
  const [employees, setEmployees] = useState<IEmployeeSimple[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [pin, setPin] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    // 1. Carregar Funcionários (USANDO ?all=true)
    fetch("/api/employees?all=true")
      .then((res) => res.json())
      .then((data) => {
        // Verificação de segurança: Só define se for Array
        if (Array.isArray(data)) {
          setEmployees(data);
        } else if (data.data && Array.isArray(data.data)) {
          // Caso venha paginado por engano, pega a propriedade .data
          setEmployees(data.data);
        } else {
          console.error("Formato de dados inválido", data);
          setEmployees([]);
        }
      })
      .catch((err) => {
        console.error("Erro ao carregar equipa", err);
        setEmployees([]); // Em caso de erro, define array vazio
      });

    // 2. Obter Token de Sessão
    fetch("/api/auth/token")
      .then((res) => res.json())
      .then((data) => setToken(data.token))
      .catch((err) => console.error("Erro token", err));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedId || !pin) return;

    setLoading(true);
    setMsg("");

    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: selectedId,
          pinEntered: pin,
          token: token,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert(data.message);
        setPin("");
        setSelectedId("");
        window.location.reload();
      } else {
        setMsg(data.message);
        if (
          data.message.includes("expirou") ||
          data.message.includes("Sessão")
        ) {
          setTimeout(() => window.location.reload(), 2000);
        }
      }
    } catch (err) {
      setMsg("Erro de conexão. Verifique a internet.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl border border-gray-200">
        <h1 className="mb-2 text-center text-2xl font-bold text-gray-800">
          SDEJT - MAXIXE
        </h1>
        <p className="mb-6 text-center text-sm text-gray-500">
          Tens 5 minutos para marcar presença.
        </p>

        {msg && (
          <div
            className={`mb-4 p-3 rounded text-center text-sm font-bold ${msg.includes("Marcado") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
          >
            {msg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quem é você?
            </label>
            <select
              className="block w-full rounded-md border border-gray-300 p-3 text-black bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              required
            >
              <option value="">Selecione o nome...</option>

              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teu PIN
            </label>
            <input
              type="tel"
              placeholder="****"
              className="block w-full rounded-md border border-gray-300 p-3 text-center text-2xl tracking-[0.5em] text-black focus:ring-2 focus:ring-blue-500 outline-none"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || !token}
            className={`w-full rounded-md py-4 font-bold text-white transition-colors ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "A processar..." : "CONFIRMAR PRESENÇA"}
          </button>
        </form>
      </div>
    </div>
  );
}
