"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

import { toZonedTime } from "date-fns-tz";
import { format } from "date-fns";

interface IPresencaHoje {
  _id: string;
  employeeName: string;
  checkIn: string;
  lateMinutes: number;
}

export default function HomePage() {
  const [time, setTime] = useState<string>("");
  const [presencas, setPresencas] = useState<IPresencaHoje[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const updateTime = () => {
      const timeZone = "Africa/Maputo";
      const now = new Date();
      const zonedDate = toZonedTime(now, timeZone);

      setTime(format(zonedDate, "HH:mm:ss"));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchToday = () => {
    setLoading(true);
    fetch("/api/attendance/today")
      .then((res) => res.json())
      .then((data) => {
        setPresencas(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchToday();
  }, []);

  const formatarAtraso = (minutosTotais: number) => {
    const horas = Math.floor(minutosTotais / 60);
    const minutos = minutosTotais % 60;

    if (horas > 0) {
      return minutos > 0 ? `+${horas}h ${minutos}min` : `+${horas}h`;
    }

    return `+${minutosTotais} min`;
  };

  return (
    <main className="flex min-h-screen flex-col items-center bg-gray-50 p-6">
      <div className="text-center mb-8 mt-4">
        <h1 className="text-3xl font-extrabold text-gray-900">
          Ponto de presenças
        </h1>
        <div className="py-4">
          <div className="text-5xl font-mono font-bold text-blue-600 tracking-widest">
            {time || "--:--:--"}
          </div>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-wide">
            Hora Local
          </p>
        </div>

        {/* --- ÁREA DOS BOTÕES --- */}
        <div className="flex gap-4 justify-center mt-2 items-center">
          <Link
            href="/admin"
            className="text-xs font-bold text-gray-500 hover:text-blue-600 underline"
          >
            Painel Admin
          </Link>

          <span className="text-gray-300">|</span>

          <Link
            href="/mark"
            className="text-xs font-bold text-gray-500 hover:text-blue-600 underline"
          >
            📍 Marcar Presença
          </Link>
        </div>
      </div>

      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gray-100 px-6 py-4 flex justify-between items-center border-b">
          <h2 className="font-bold text-gray-700 flex items-center gap-2">
            📅 Presenças de Hoje
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
              {presencas.length}
            </span>
          </h2>
          <button
            onClick={fetchToday}
            className="text-xs bg-white border px-3 py-1 rounded hover:bg-gray-50 text-gray-600"
          >
            🔄 Atualizar
          </button>
        </div>

        <div className="max-h-[50vh] overflow-y-auto">
          {loading ? (
            <p className="p-8 text-center text-gray-400">A carregar dados...</p>
          ) : presencas.length === 0 ? (
            <div className="p-8 text-center flex flex-col items-center">
              <span className="text-4xl mb-2">zzz</span>
              <p className="text-gray-500">
                Ninguém marcou presença hoje ainda.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase">
                    Funcionário
                  </th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase">
                    Hora (MZ)
                  </th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase text-right">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {presencas.map((p) => {
                  const timeZone = "Africa/Maputo";
                  const dataOriginal = new Date(p.checkIn);
                  const dataMaputo = toZonedTime(dataOriginal, timeZone);

                  const horaLegivel = format(dataMaputo, "HH:mm");

                  return (
                    <tr key={p._id} className="hover:bg-blue-50/50 transition">
                      <td className="p-4 font-medium text-gray-900">
                        {p.employeeName}
                      </td>
                      <td className="p-4 font-mono text-gray-600 font-bold">
                        {horaLegivel}
                      </td>
                      <td className="p-4 text-right">
                        {p.lateMinutes > 0 ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {formatarAtraso(p.lateMinutes)}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Pontual
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  );
}
