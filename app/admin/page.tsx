// "use client";
// import { useState, useEffect, FormEvent } from "react";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
//   CartesianGrid,
//   LineChart,
//   Line,
//   Legend,
// } from "recharts";

// const Spinner = () => (
//   <svg
//     className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
//     xmlns="http://www.w3.org/2000/svg"
//     fill="none"
//     viewBox="0 0 24 24"
//   >
//     <circle
//       className="opacity-25"
//       cx="12"
//       cy="12"
//       r="10"
//       stroke="currentColor"
//       strokeWidth="4"
//     ></circle>
//     <path
//       className="opacity-75"
//       fill="currentColor"
//       d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//     ></path>
//   </svg>
// );

// interface IFuncionario {
//   _id: string;
//   name: string;
//   pin: string;
// }

// // --- CORREÇÃO DA INTERFACE DE ANALYTICS ---
// interface IAnalytics {
//   ranking: {
//     name: string;
//     attendanceRate: number; // % Assiduidade
//     punctualityRate: number; // % Pontualidade
//     avgDelayWhenLate: number; // Média quando atrasa
//     totalLateMinutes: number;
//     absences: number; // Ausências (Faltas)
//     presentDays: number;
//     expectedDays: number;
//   }[];
//   chartData: { day: string; avgDelay: number }[];
//   absenteesToday: string[];
//   isPastNoon: boolean;
//   summary: { totalCheckins: number; avgDelay: number };
// }

// interface linhaRelatorio {
//   employeeName: string;
//   checkIn: string;
//   lateMinutes: number;
// }

// export default function AdminPage() {
//   const [autenticado, setAutenticado] = useState(false);
//   const [senhaInput, setSenhaInput] = useState("");
//   const [erroLogin, setErroLogin] = useState("");
//   const [activeTab, setActiveTab] = useState<"dashboard" | "funcionarios">(
//     "dashboard",
//   );

//   const [funcionarios, setFuncionarios] = useState<IFuncionario[]>([]);
//   const [analytics, setAnalytics] = useState<IAnalytics | null>(null);

//   const [paginaAtual, setPaginaAtual] = useState(1);
//   const [totalPaginas, setTotalPaginas] = useState(1);
//   const [termoBusca, setTermoBusca] = useState("");
//   const [periodoSelecionado, setPeriodoSelecionado] = useState("diario");

//   const [carregandoPdf, setCarregandoPdf] = useState(false);
//   const [carregandoListaPdf, setCarregandoListaPdf] = useState(false);
//   const [carregandoDesempenhoPdf, setCarregandoDesempenhoPdf] = useState(false);
//   const [carregandoLista, setCarregandoLista] = useState(false);
//   const [criando, setCriando] = useState(false);
//   const [atualizando, setAtualizando] = useState(false);
//   const [apagando, setApagando] = useState(false);

//   const [novoNome, setNovoNome] = useState("");
//   const [novoPin, setNovoPin] = useState("");
//   const [funcionarioEditar, setFuncionarioEditar] =
//     useState<IFuncionario | null>(null);
//   const [funcionarioApagar, setFuncionarioApagar] =
//     useState<IFuncionario | null>(null);

//   useEffect(() => {
//     const sessaoAtiva = sessionStorage.getItem("admin_logado");
//     if (sessaoAtiva === "sim") {
//       setAutenticado(true);
//       carregarDadosIniciais();
//     }
//   }, []);

//   const carregarDadosIniciais = () => {
//     carregarAnalytics();
//     carregarFuncionarios(1, "");
//   };

//   const carregarAnalytics = () => {
//     fetch("/api/analytics")
//       .then((res) => res.json())
//       .then((data) => setAnalytics(data))
//       .catch(console.error);
//   };

//   const carregarFuncionarios = (pagina: number, busca: string = termoBusca) => {
//     setCarregandoLista(true);
//     fetch(`/api/employees?page=${pagina}&search=${encodeURIComponent(busca)}`)
//       .then((res) => res.json())
//       .then((dados) => {
//         if (dados.data) {
//           setFuncionarios(dados.data);
//           setTotalPaginas(dados.pagination.totalPages);
//           setPaginaAtual(dados.pagination.currentPage);
//         }
//       })
//       .catch(console.error)
//       .finally(() => setCarregandoLista(false));
//   };

//   const handleBusca = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const valor = e.target.value;
//     setTermoBusca(valor);
//     carregarFuncionarios(1, valor);
//   };

//   const fazerLogin = async (e: FormEvent) => {
//     e.preventDefault();
//     setErroLogin("");
//     try {
//       const res = await fetch("/api/auth/login", {
//         method: "POST",
//         body: JSON.stringify({ password: senhaInput }),
//       });
//       const dados = await res.json();
//       if (dados.success) {
//         setAutenticado(true);
//         sessionStorage.setItem("admin_logado", "sim");
//         carregarDadosIniciais();
//       } else {
//         setErroLogin("Senha incorreta.");
//       }
//     } catch (erro) {
//       setErroLogin("Erro de conexão.");
//     }
//   };

//   const sairDoSistema = () => {
//     setAutenticado(false);
//     sessionStorage.removeItem("admin_logado");
//     setSenhaInput("");
//   };

//   const criarFuncionario = async (e: FormEvent) => {
//     e.preventDefault();
//     if (!novoNome || !novoPin) return;
//     setCriando(true);
//     try {
//       await fetch("/api/employees", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ name: novoNome, pin: novoPin }),
//       });
//       setNovoNome("");
//       setNovoPin("");
//       carregarFuncionarios(paginaAtual);
//       carregarAnalytics();
//     } finally {
//       setCriando(false);
//     }
//   };

//   const atualizarFuncionario = async (e: FormEvent) => {
//     e.preventDefault();
//     if (!funcionarioEditar) return;
//     setAtualizando(true);
//     try {
//       await fetch(`/api/employees/${funcionarioEditar._id}`, {
//         method: "PUT",
//         body: JSON.stringify({
//           name: funcionarioEditar.name,
//           pin: funcionarioEditar.pin,
//         }),
//       });
//       setFuncionarioEditar(null);
//       carregarFuncionarios(paginaAtual);
//     } finally {
//       setAtualizando(false);
//     }
//   };

//   const executarApagar = async () => {
//     if (!funcionarioApagar) return;
//     setApagando(true);
//     try {
//       await fetch(`/api/employees/${funcionarioApagar._id}`, {
//         method: "DELETE",
//       });
//       setFuncionarioApagar(null);
//       carregarFuncionarios(paginaAtual);
//       carregarAnalytics();
//     } finally {
//       setApagando(false);
//     }
//   };

//   // --- PDF: LISTA NOMINAL ---
//   const gerarPDFFuncionarios = async () => {
//     setCarregandoListaPdf(true);
//     try {
//       const res = await fetch("/api/employees?all=true");
//       const dados: IFuncionario[] = await res.json();
//       const doc = new jsPDF();
//       const largura = doc.internal.pageSize.getWidth();
//       const cx = largura / 2;

//       doc.setFont("helvetica", "bold");
//       doc.setFontSize(14);
//       doc.text("República de Moçambique", cx, 15, { align: "center" });
//       doc.setFontSize(12);
//       doc.text("Província de Inhambane", cx, 22, { align: "center" });
//       doc.text("Governo do Distrito de Maxixe", cx, 29, { align: "center" });
//       doc.setFontSize(11);
//       doc.text(
//         "Serviço Distrital de Educação, Juventude e Tecnologia de Maxixe",
//         cx,
//         36,
//         { align: "center" },
//       );
//       doc.setLineWidth(0.5);
//       doc.line(40, 40, largura - 40, 40);

//       doc.setFontSize(16);
//       doc.setTextColor(40);
//       doc.text("Lista Nominal de Funcionários", cx, 50, { align: "center" });

//       const linhas = dados.map((f) => [f.name, f.pin, f._id]);
//       autoTable(doc, {
//         startY: 60,
//         head: [["Nome Completo", "PIN", "ID"]],
//         body: linhas,
//         theme: "grid",
//         headStyles: { fillColor: [41, 128, 185], halign: "center" },
//         columnStyles: {
//           0: { cellWidth: 90 },
//           1: { halign: "center", fontStyle: "bold" },
//         },
//       });
//       doc.save("Lista_Funcionarios.pdf");
//     } catch {
//       alert("Erro lista");
//     } finally {
//       setCarregandoListaPdf(false);
//     }
//   };

//   // --- PDF: PRESENÇAS DIÁRIAS (LOGS) ---
//   const gerarPDFPresencas = async () => {
//     setCarregandoPdf(true);
//     try {
//       const res = await fetch(
//         `/api/reports/data?periodo=${periodoSelecionado}`,
//       );
//       const dados: linhaRelatorio[] = await res.json();
//       if (!dados || dados.length === 0) {
//         alert("Sem dados.");
//         return;
//       }

//       const doc = new jsPDF();
//       const largura = doc.internal.pageSize.getWidth();
//       const cx = largura / 2;

//       doc.setFont("helvetica", "bold");
//       doc.setFontSize(14);
//       doc.text("República de Moçambique", cx, 15, { align: "center" });
//       doc.setFontSize(12);
//       doc.text("Província de Inhambane", cx, 22, { align: "center" });
//       doc.text("Governo do Distrito de Maxixe", cx, 29, { align: "center" });
//       doc.setFontSize(11);
//       doc.text(
//         "Serviço Distrital de Educação, Juventude e Tecnologia de Maxixe",
//         cx,
//         36,
//         { align: "center" },
//       );
//       doc.setLineWidth(0.5);
//       doc.line(40, 40, largura - 40, 40);

//       doc.setFontSize(16);
//       doc.setTextColor(40);
//       doc.text("Lista de presença de funcionários", cx, 50, {
//         align: "center",
//       });

//       const nomes: Record<string, string> = {
//         diario: "Hoje",
//         semanal: "Semanal",
//         mensal: "Mensal",
//       };
//       doc.setFontSize(10);
//       doc.setTextColor(100);
//       doc.setFont("helvetica", "normal");
//       doc.text(
//         `Período: ${nomes[periodoSelecionado]} | Gerado: ${new Date().toLocaleDateString("pt-MZ")}`,
//         cx,
//         58,
//         { align: "center" },
//       );

//       const linhas = dados.map((r) => [
//         r.employeeName,
//         new Date(r.checkIn).toLocaleDateString("pt-MZ"),
//         new Date(r.checkIn).toLocaleTimeString("pt-MZ", {
//           hour: "2-digit",
//           minute: "2-digit",
//         }),
//         r.lateMinutes > 0 ? `+${r.lateMinutes}` : "-",
//         r.lateMinutes > 0 ? "ATRASADO" : "Pontual",
//       ]);

//       autoTable(doc, {
//         startY: 65,
//         head: [["Nome", "Data", "Hora", "Atraso", "Estado"]],
//         body: linhas,
//         styles: { halign: "center" },
//         columnStyles: { 0: { halign: "left" } },
//         headStyles: { fillColor: [44, 62, 80], halign: "center" },
//         didParseCell: function (data) {
//           if (
//             data.section === "body" &&
//             data.column.index === 4 &&
//             data.cell.raw === "ATRASADO"
//           ) {
//             data.cell.styles.textColor = [231, 76, 60];
//             data.cell.styles.fontStyle = "bold";
//           }
//         },
//       });
//       doc.save(`Presencas_${periodoSelecionado}.pdf`);
//     } catch {
//       alert("Erro PDF");
//     } finally {
//       setCarregandoPdf(false);
//     }
//   };

//   // --- PDF: DESEMPENHO (INDICADORES) ---
//   const gerarPDFDesempenho = () => {
//     if (!analytics) return;
//     setCarregandoDesempenhoPdf(true);

//     try {
//       const doc = new jsPDF();
//       const largura = doc.internal.pageSize.getWidth();
//       const cx = largura / 2;

//       doc.setFont("helvetica", "bold");
//       doc.setFontSize(14);
//       doc.text("República de Moçambique", cx, 15, { align: "center" });
//       doc.setFontSize(12);
//       doc.text("Província de Inhambane", cx, 22, { align: "center" });
//       doc.text("Governo do Distrito de Maxixe", cx, 29, { align: "center" });
//       doc.setFontSize(11);
//       doc.text(
//         "Serviço Distrital de Educação, Juventude e Tecnologia de Maxixe",
//         cx,
//         36,
//         { align: "center" },
//       );
//       doc.setLineWidth(0.5);
//       doc.line(40, 40, largura - 40, 40);

//       doc.setFontSize(16);
//       doc.setTextColor(40);
//       doc.text("Relatório de Desempenho e Assiduidade", cx, 50, {
//         align: "center",
//       });
//       doc.setFontSize(10);
//       doc.setTextColor(100);
//       doc.setFont("helvetica", "normal");
//       doc.text(
//         `Mês Atual | Gerado em: ${new Date().toLocaleDateString("pt-MZ")}`,
//         cx,
//         58,
//         { align: "center" },
//       );

//       const linhas = analytics.ranking.map((emp, i) => [
//         i + 1,
//         emp.name,
//         `${emp.presentDays} / ${emp.expectedDays}`,
//         emp.absences > 0 ? emp.absences : "-",
//         `${emp.attendanceRate}%`,
//         `${emp.punctualityRate}%`,
//         emp.totalLateMinutes + " min",
//       ]);

//       autoTable(doc, {
//         startY: 65,
//         head: [
//           [
//             "Rank",
//             "Nome",
//             "Presenças",
//             "Ausências",
//             "Assiduidade",
//             "Pontualidade",
//             "Atraso Total",
//           ],
//         ],
//         body: linhas,
//         styles: { halign: "center" },
//         columnStyles: { 1: { halign: "left" } },
//         headStyles: { fillColor: [44, 62, 80], halign: "center" },
//         didParseCell: function (data) {
//           // Destacar Assiduidade Baixa (Coluna 4 - índice 4)
//           if (data.section === "body" && data.column.index === 4) {
//             const val = parseInt(data.cell.raw as string);
//             if (val < 75) data.cell.styles.textColor = [220, 38, 38];
//           }
//           // Destacar Ausências (Coluna 3 - índice 3)
//           if (data.section === "body" && data.column.index === 3) {
//             if (data.cell.raw !== "-")
//               data.cell.styles.textColor = [220, 38, 38];
//           }
//         },
//       });

//       doc.save("Desempenho_Mensal.pdf");
//     } catch {
//       alert("Erro ao gerar PDF");
//     } finally {
//       setCarregandoDesempenhoPdf(false);
//     }
//   };

//   if (!autenticado)
//     return (
//       <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
//         <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-xl border border-gray-200">
//           <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
//             Área Restrita 🔒
//           </h1>
//           <form onSubmit={fazerLogin} className="space-y-4">
//             <input
//               type="password"
//               className="w-full rounded-md border border-gray-300 p-3"
//               value={senhaInput}
//               onChange={(e) => setSenhaInput(e.target.value)}
//               placeholder="Senha Mestra"
//               required
//             />
//             {erroLogin && (
//               <div className="text-red-600 text-sm text-center font-bold">
//                 {erroLogin}
//               </div>
//             )}
//             <button className="w-full rounded-md bg-gray-900 py-3 font-bold text-white hover:bg-gray-800">
//               ENTRAR
//             </button>
//           </form>
//           <div className="mt-4 text-center">
//             <a href="/" className="text-sm text-blue-600 hover:underline">
//               Voltar
//             </a>
//           </div>
//         </div>
//       </div>
//     );

//   return (
//     <div className="min-h-screen bg-gray-50 p-4 md:p-8 text-gray-800">
//       <div className="mx-auto max-w-7xl">
//         <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
//           <div>
//             <h1 className="text-3xl font-extrabold text-gray-900">
//               Painel de Gestão
//             </h1>
//             <p className="text-sm text-gray-500">
//               SDEJT Maxixe - Analytics & Controle
//             </p>
//           </div>
//           <div className="flex gap-4 items-center">
//             <a
//               href="/admin/qrcode"
//               className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1"
//             >
//               <svg
//                 className="w-4 h-4"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
//                 />
//               </svg>{" "}
//               QR Code
//             </a>
//             <button
//               onClick={sairDoSistema}
//               className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded hover:bg-red-100 transition"
//             >
//               Sair
//             </button>
//           </div>
//         </header>

//         <div className="flex gap-6 mb-6 border-b border-gray-200">
//           <button
//             onClick={() => setActiveTab("dashboard")}
//             className={`pb-3 px-2 font-bold transition flex items-center gap-2 ${activeTab === "dashboard" ? "border-b-4 border-blue-600 text-blue-700" : "text-gray-500 hover:text-gray-700"}`}
//           >
//             <span>📊</span> Dashboard & Métricas
//           </button>
//           <button
//             onClick={() => setActiveTab("funcionarios")}
//             className={`pb-3 px-2 font-bold transition flex items-center gap-2 ${activeTab === "funcionarios" ? "border-b-4 border-blue-600 text-blue-700" : "text-gray-500 hover:text-gray-700"}`}
//           >
//             <span>👥</span> Gestão de Funcionários
//           </button>
//         </div>

//         {activeTab === "dashboard" && analytics && (
//           <div className="space-y-8 animate-in fade-in duration-300">
//             {/* ALERTA DE AUSÊNCIAS */}
//             {analytics.isPastNoon && analytics.absenteesToday.length > 0 && (
//               <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 shadow-sm">
//                 <h3 className="text-orange-800 font-bold flex items-center gap-2 mb-2">
//                   ⚠️ Ausências Registadas Hoje (
//                   {analytics.absenteesToday.length})
//                 </h3>
//                 <p className="text-orange-700 text-sm mb-3">
//                   Funcionários sem registo após as 12:00. Verifique se estão
//                   justificados.
//                 </p>
//                 <div className="flex flex-wrap gap-2">
//                   {analytics.absenteesToday.map((nome, i) => (
//                     <span
//                       key={i}
//                       className="bg-white border border-orange-200 text-orange-800 px-3 py-1 rounded-full text-xs font-bold shadow-sm"
//                     >
//                       {nome}
//                     </span>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* BOTÕES EXPORTAR DESEMPENHO */}
//             <div className="flex justify-end gap-2">
//               <a
//                 href="/api/analytics/export"
//                 target="_blank"
//                 className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-green-700 transition shadow-sm"
//               >
//                 <svg
//                   className="w-4 h-4"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
//                   />
//                 </svg>
//                 Baixar Desempenho (Excel)
//               </a>
//               <button
//                 onClick={gerarPDFDesempenho}
//                 disabled={carregandoDesempenhoPdf}
//                 className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-red-700 transition shadow-sm disabled:opacity-50"
//               >
//                 {carregandoDesempenhoPdf ? (
//                   <Spinner />
//                 ) : (
//                   <svg
//                     className="w-4 h-4"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
//                     />
//                   </svg>
//                 )}
//                 Baixar PDF
//               </button>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
//                 <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">
//                   Atraso Médio (Pessoa)
//                 </h3>
//                 <p className="text-3xl font-extrabold text-gray-800 mt-2">
//                   {analytics.summary.avgDelay}{" "}
//                   <span className="text-sm text-gray-400 font-normal">min</span>
//                 </p>
//               </div>
//               <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
//                 <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">
//                   Total Presenças (Mês)
//                 </h3>
//                 <p className="text-3xl font-extrabold text-blue-600 mt-2">
//                   {analytics.summary.totalCheckins}
//                 </p>
//               </div>
//               <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
//                 <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">
//                   Líder de Assiduidade
//                 </h3>
//                 <p className="text-xl font-extrabold text-green-600 mt-2 truncate">
//                   {analytics.ranking[0]?.name || "-"}
//                 </p>
//                 <div className="flex gap-2 mt-1">
//                   <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-bold">
//                     {analytics.ranking[0]?.attendanceRate || 0}% Presença
//                   </span>
//                 </div>
//               </div>
//             </div>

//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//               <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
//                 <h3 className="text-lg font-bold mb-6 text-gray-800">
//                   🏆 Top 5 - Assiduidade
//                 </h3>
//                 <div className="h-64 w-full">
//                   <ResponsiveContainer width="100%" height="100%">
//                     <BarChart
//                       data={analytics.ranking.slice(0, 5)}
//                       layout="vertical"
//                       margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
//                     >
//                       <CartesianGrid strokeDasharray="3 3" horizontal={false} />
//                       <XAxis type="number" domain={[0, 100]} />
//                       <YAxis
//                         dataKey="name"
//                         type="category"
//                         width={100}
//                         style={{ fontSize: "11px", fontWeight: "bold" }}
//                       />
//                       <Tooltip
//                         cursor={{ fill: "#F3F4F6" }}
//                         formatter={(value) => [`${value}%`, "Assiduidade"]}
//                       />
//                       <Bar
//                         dataKey="attendanceRate"
//                         fill="#10B981"
//                         radius={[0, 4, 4, 0]}
//                         name="Assiduidade (%)"
//                         barSize={20}
//                       />
//                     </BarChart>
//                   </ResponsiveContainer>
//                 </div>
//               </div>

//               <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
//                 <h3 className="text-lg font-bold mb-6 text-gray-800">
//                   📉 Média de Atraso (Tendência)
//                 </h3>
//                 <div className="h-64 w-full">
//                   <ResponsiveContainer width="100%" height="100%">
//                     <LineChart
//                       data={analytics.chartData}
//                       margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
//                     >
//                       <CartesianGrid strokeDasharray="3 3" vertical={false} />
//                       <XAxis dataKey="day" style={{ fontSize: "12px" }} />
//                       <YAxis />
//                       <Tooltip
//                         formatter={(value) => [`${value} min`, "Média"]}
//                       />
//                       <Legend />
//                       <Line
//                         type="monotone"
//                         dataKey="avgDelay"
//                         stroke="#F59E0B"
//                         strokeWidth={3}
//                         dot={{ r: 4 }}
//                         name="Min/Pessoa"
//                       />
//                     </LineChart>
//                   </ResponsiveContainer>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
//               <div className="p-6 border-b border-gray-100 bg-gray-50">
//                 <h3 className="text-lg font-bold text-gray-800">
//                   Indicadores de Desempenho
//                 </h3>
//               </div>
//               <div className="overflow-x-auto">
//                 <table className="w-full text-left">
//                   <thead className="bg-white text-gray-500 text-xs uppercase tracking-wider border-b">
//                     <tr>
//                       <th className="p-4">Nome</th>
//                       <th className="p-4 text-center">Previstos</th>
//                       <th className="p-4 text-center">Realizados</th>
//                       <th className="p-4 text-center text-red-600">
//                         Ausências
//                       </th>
//                       <th className="p-4 text-center">Assiduidade</th>
//                       <th className="p-4 text-center">Pontualidade</th>
//                       <th className="p-4 text-right">Tempo Perdido</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-gray-100">
//                     {analytics.ranking.map((emp, index) => (
//                       <tr
//                         key={index}
//                         className="hover:bg-blue-50/30 transition"
//                       >
//                         <td className="p-4 font-medium text-gray-900">
//                           {emp.name}
//                         </td>
//                         <td className="p-4 text-center text-gray-400">
//                           {emp.expectedDays}
//                         </td>
//                         <td className="p-4 text-center text-gray-600">
//                           {emp.presentDays}
//                         </td>
//                         <td className="p-4 text-center">
//                           {emp.absences > 0 ? (
//                             <span className="text-red-600 font-bold">
//                               {emp.absences}
//                             </span>
//                           ) : (
//                             <span className="text-gray-300">-</span>
//                           )}
//                         </td>
//                         <td className="p-4 text-center">
//                           <span
//                             className={`px-2 py-1 rounded text-xs font-bold ${
//                               emp.attendanceRate >= 90
//                                 ? "bg-green-100 text-green-800"
//                                 : emp.attendanceRate >= 75
//                                   ? "bg-yellow-100 text-yellow-800"
//                                   : "bg-red-100 text-red-800"
//                             }`}
//                           >
//                             {emp.attendanceRate}%
//                           </span>
//                         </td>
//                         <td className="p-4 text-center">
//                           <span
//                             className={`px-2 py-1 rounded text-xs font-bold ${
//                               emp.punctualityRate >= 90
//                                 ? "bg-blue-100 text-blue-800"
//                                 : "bg-gray-100 text-gray-600"
//                             }`}
//                           >
//                             {emp.punctualityRate}%
//                           </span>
//                         </td>
//                         <td className="p-4 text-right text-sm text-gray-600 font-mono">
//                           {emp.totalLateMinutes > 0
//                             ? `${emp.totalLateMinutes} min`
//                             : "-"}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>
//         )}

//         {activeTab === "funcionarios" && (
//           <div className="animate-in fade-in duration-300 space-y-8">
//             {/* ... (Todo o conteúdo de gestão de funcionários mantido aqui, idêntico ao que já tínhamos) ... */}
//             <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
//               <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
//                 📂 Relatórios de Presença (Logs)
//               </h2>
//               <div className="flex flex-col md:flex-row gap-4 items-center">
//                 <div className="relative w-full md:w-64">
//                   <select
//                     value={periodoSelecionado}
//                     onChange={(e) => setPeriodoSelecionado(e.target.value)}
//                     className="w-full appearance-none bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:border-blue-500 cursor-pointer"
//                   >
//                     <option value="diario">📅 Hoje (Diário)</option>
//                     <option value="semanal">📆 Esta Semana</option>
//                     <option value="mensal">📊 Este Mês</option>
//                   </select>
//                   <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
//                     <svg
//                       className="fill-current h-4 w-4"
//                       xmlns="http://www.w3.org/2000/svg"
//                       viewBox="0 0 20 20"
//                     >
//                       <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
//                     </svg>
//                   </div>
//                 </div>
//                 <a
//                   href={`/api/reports/excel?periodo=${periodoSelecionado}`}
//                   target="_blank"
//                   className="w-full md:w-auto bg-green-600 text-white px-6 py-3 rounded font-bold hover:bg-green-700 text-center flex items-center justify-center gap-2 shadow-sm"
//                 >
//                   <svg
//                     className="w-5 h-5"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
//                     />
//                   </svg>{" "}
//                   Baixar Logs (Excel)
//                 </a>
//                 <button
//                   onClick={gerarPDFPresencas}
//                   disabled={carregandoPdf}
//                   className="w-full md:w-auto bg-red-600 text-white px-6 py-3 rounded font-bold hover:bg-red-700 flex items-center justify-center gap-2 shadow-sm disabled:opacity-70"
//                 >
//                   {carregandoPdf ? (
//                     <Spinner />
//                   ) : (
//                     <svg
//                       className="w-5 h-5"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
//                       />
//                     </svg>
//                   )}{" "}
//                   {carregandoPdf ? "A Gerar..." : "Baixar PDF"}
//                 </button>
//               </div>
//             </section>

//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//               <div className="lg:col-span-1 h-fit bg-white p-6 rounded-lg shadow-sm border border-gray-200 sticky top-4">
//                 <h3 className="font-bold mb-4 border-b pb-2 text-gray-700">
//                   Novo Funcionário
//                 </h3>
//                 <form
//                   onSubmit={criarFuncionario}
//                   className="flex flex-col gap-4"
//                 >
//                   <div>
//                     <label className="text-xs font-bold text-gray-500 uppercase">
//                       Nome Completo
//                     </label>
//                     <input
//                       value={novoNome}
//                       onChange={(e) => setNovoNome(e.target.value)}
//                       placeholder="Ex: Ana Silva"
//                       className="w-full border p-3 rounded mt-1 outline-none focus:border-blue-500 transition"
//                       required
//                     />
//                   </div>
//                   <div>
//                     <label className="text-xs font-bold text-gray-500 uppercase">
//                       PIN (4-8 Dígitos)
//                     </label>
//                     <input
//                       value={novoPin}
//                       onChange={(e) => setNovoPin(e.target.value)}
//                       placeholder="1234"
//                       type="number"
//                       maxLength={8}
//                       className="w-full border p-3 rounded mt-1 outline-none focus:border-blue-500 transition"
//                       required
//                     />
//                   </div>
//                   <button
//                     disabled={criando}
//                     className="bg-blue-600 text-white py-3 rounded font-bold hover:bg-blue-700 flex items-center justify-center disabled:opacity-70 transition shadow-sm"
//                   >
//                     {criando ? <Spinner /> : null}{" "}
//                     {criando ? "A Gravar..." : "Adicionar"}
//                   </button>
//                 </form>
//               </div>

//               <div className="lg:col-span-2 flex flex-col gap-4">
//                 <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 justify-between items-center">
//                   <div className="w-full md:flex-1 relative">
//                     <input
//                       type="text"
//                       placeholder="🔍 Pesquisar funcionário..."
//                       value={termoBusca}
//                       onChange={handleBusca}
//                       className="w-full border border-gray-300 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     />
//                     <div className="absolute left-3 top-2.5 text-gray-400">
//                       <svg
//                         className="w-5 h-5"
//                         fill="none"
//                         stroke="currentColor"
//                         viewBox="0 0 24 24"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
//                         />
//                       </svg>
//                     </div>
//                   </div>
//                   <div className="flex gap-2 w-full md:w-auto">
//                     <a
//                       href="/api/employees/export"
//                       target="_blank"
//                       className="flex-1 md:flex-none text-center bg-gray-100 text-gray-700 border border-gray-300 px-3 py-2 rounded font-bold text-sm hover:bg-gray-200 transition"
//                       title="Baixar lista em Excel"
//                     >
//                       Excel Lista
//                     </a>
//                     <button
//                       onClick={gerarPDFFuncionarios}
//                       disabled={carregandoListaPdf}
//                       className="flex-1 md:flex-none flex items-center justify-center gap-1 bg-gray-800 text-white px-3 py-2 rounded font-bold text-sm hover:bg-gray-900 transition disabled:opacity-50"
//                       title="Baixar lista em PDF"
//                     >
//                       {carregandoListaPdf ? <Spinner /> : null} PDF Lista
//                     </button>
//                   </div>
//                 </div>

//                 <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden min-h-[400px]">
//                   <table className="w-full text-left">
//                     <thead className="bg-gray-100 border-b">
//                       <tr>
//                         <th className="p-4 text-sm font-semibold text-gray-600 uppercase">
//                           Nome
//                         </th>
//                         <th className="p-4 text-sm font-semibold text-gray-600 uppercase">
//                           PIN
//                         </th>
//                         <th className="p-4 text-sm font-semibold text-gray-600 uppercase text-right">
//                           Ações
//                         </th>
//                       </tr>
//                     </thead>
//                     <tbody className="divide-y divide-gray-100">
//                       {carregandoLista ? (
//                         <tr>
//                           <td
//                             colSpan={3}
//                             className="p-8 text-center text-gray-500"
//                           >
//                             Carregando dados...
//                           </td>
//                         </tr>
//                       ) : (
//                         funcionarios.map((func) => (
//                           <tr
//                             key={func._id}
//                             className="hover:bg-blue-50/30 transition"
//                           >
//                             <td className="p-4 font-medium text-gray-900">
//                               {func.name}
//                             </td>
//                             <td className="p-4">
//                               <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100">
//                                 {func.pin}
//                               </span>
//                             </td>
//                             <td className="p-4 flex justify-end gap-2">
//                               <button
//                                 onClick={() => setFuncionarioEditar(func)}
//                                 className="p-2 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition"
//                               >
//                                 <svg
//                                   className="w-5 h-5"
//                                   fill="none"
//                                   stroke="currentColor"
//                                   viewBox="0 0 24 24"
//                                 >
//                                   <path
//                                     strokeLinecap="round"
//                                     strokeLinejoin="round"
//                                     strokeWidth={2}
//                                     d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
//                                   />
//                                 </svg>
//                               </button>
//                               <button
//                                 onClick={() => setFuncionarioApagar(func)}
//                                 className="p-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
//                               >
//                                 <svg
//                                   className="w-5 h-5"
//                                   fill="none"
//                                   stroke="currentColor"
//                                   viewBox="0 0 24 24"
//                                 >
//                                   <path
//                                     strokeLinecap="round"
//                                     strokeLinejoin="round"
//                                     strokeWidth={2}
//                                     d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
//                                   />
//                                 </svg>
//                               </button>
//                             </td>
//                           </tr>
//                         ))
//                       )}
//                       {!carregandoLista && funcionarios.length === 0 && (
//                         <tr>
//                           <td
//                             colSpan={3}
//                             className="p-8 text-center text-gray-400"
//                           >
//                             Nenhum funcionário encontrado.
//                           </td>
//                         </tr>
//                       )}
//                     </tbody>
//                   </table>
//                 </div>

//                 <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200">
//                   <button
//                     onClick={() => carregarFuncionarios(paginaAtual - 1)}
//                     disabled={paginaAtual === 1 || carregandoLista}
//                     className="px-4 py-2 border rounded text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
//                   >
//                     ← Anterior
//                   </button>
//                   <span className="text-sm text-gray-600 font-medium">
//                     Página {paginaAtual} de {totalPaginas}
//                   </span>
//                   <button
//                     onClick={() => carregarFuncionarios(paginaAtual + 1)}
//                     disabled={
//                       paginaAtual === totalPaginas ||
//                       totalPaginas === 0 ||
//                       carregandoLista
//                     }
//                     className="px-4 py-2 border rounded text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
//                   >
//                     Próximo →
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {funcionarioEditar && (
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
//           <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
//             <h3 className="text-xl font-bold mb-4">Editar Funcionário</h3>
//             <form
//               onSubmit={atualizarFuncionario}
//               className="flex flex-col gap-4"
//             >
//               <div>
//                 <label className="text-sm font-bold text-gray-500">Nome</label>
//                 <input
//                   className="w-full border p-3 rounded mt-1 outline-none focus:ring-2 focus:ring-blue-500"
//                   value={funcionarioEditar.name}
//                   onChange={(e) =>
//                     setFuncionarioEditar({
//                       ...funcionarioEditar,
//                       name: e.target.value,
//                     })
//                   }
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="text-sm font-bold text-gray-500">PIN</label>
//                 <input
//                   className="w-full border p-3 rounded mt-1 outline-none focus:ring-2 focus:ring-blue-500"
//                   type="number"
//                   maxLength={8}
//                   value={funcionarioEditar.pin}
//                   onChange={(e) =>
//                     setFuncionarioEditar({
//                       ...funcionarioEditar,
//                       pin: e.target.value,
//                     })
//                   }
//                   required
//                 />
//               </div>
//               <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
//                 <button
//                   type="button"
//                   onClick={() => setFuncionarioEditar(null)}
//                   className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded font-medium"
//                   disabled={atualizando}
//                 >
//                   Cancelar
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={atualizando}
//                   className="px-5 py-2.5 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 flex items-center gap-2"
//                 >
//                   {atualizando && <Spinner />} Salvar
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//       {funcionarioApagar && (
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
//           <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl border-t-4 border-red-500">
//             <h3 className="text-lg font-bold mb-2">Tem a certeza?</h3>
//             <p className="text-gray-700 mb-6 bg-gray-50 p-3 rounded">
//               Vai apagar <strong>{funcionarioApagar.name}</strong>.
//             </p>
//             <div className="flex justify-end gap-3">
//               <button
//                 onClick={() => setFuncionarioApagar(null)}
//                 className="px-4 py-2 border rounded font-medium"
//                 disabled={apagando}
//               >
//                 Cancelar
//               </button>
//               <button
//                 onClick={executarApagar}
//                 disabled={apagando}
//                 className="px-4 py-2 bg-red-600 text-white rounded font-bold flex items-center gap-2"
//               >
//                 {apagando && <Spinner />} Sim, Apagar
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

"use client";
import { useState, useEffect, FormEvent } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
} from "recharts";

const Spinner = () => (
  <svg
    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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

interface IFuncionario {
  _id: string;
  name: string;
  pin: string;
}

interface IAnalytics {
  ranking: {
    name: string;
    attendanceRate: number;
    punctualityRate: number;
    totalLateMinutes: number;
    absences: number;
    presentDays: number;
    expectedDays: number;
  }[];
  chartData: { day: string; avgDelay: number }[];
  absenteesToday: string[];
  isPastNoon: boolean;
  summary: {
    totalCheckins: number;
    avgDelay: number;
    delayOccurrenceRate: number;
  }; // Novo Campo
}

interface linhaRelatorio {
  employeeName: string;
  checkIn: string;
  lateMinutes: number;
}

export default function AdminPage() {
  const [autenticado, setAutenticado] = useState(false);
  const [senhaInput, setSenhaInput] = useState("");
  const [erroLogin, setErroLogin] = useState("");
  const [activeTab, setActiveTab] = useState<"dashboard" | "funcionarios">(
    "dashboard",
  );

  const [funcionarios, setFuncionarios] = useState<IFuncionario[]>([]);
  const [analytics, setAnalytics] = useState<IAnalytics | null>(null);

  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [termoBusca, setTermoBusca] = useState("");
  const [periodoSelecionado, setPeriodoSelecionado] = useState("diario");

  const [carregandoPdf, setCarregandoPdf] = useState(false);
  const [carregandoListaPdf, setCarregandoListaPdf] = useState(false);
  const [carregandoDesempenhoPdf, setCarregandoDesempenhoPdf] = useState(false);
  const [carregandoLista, setCarregandoLista] = useState(false);
  const [criando, setCriando] = useState(false);
  const [atualizando, setAtualizando] = useState(false);
  const [apagando, setApagando] = useState(false);

  const [novoNome, setNovoNome] = useState("");
  const [novoPin, setNovoPin] = useState("");
  const [funcionarioEditar, setFuncionarioEditar] =
    useState<IFuncionario | null>(null);
  const [funcionarioApagar, setFuncionarioApagar] =
    useState<IFuncionario | null>(null);

  useEffect(() => {
    const sessaoAtiva = sessionStorage.getItem("admin_logado");
    if (sessaoAtiva === "sim") {
      setAutenticado(true);
      carregarDadosIniciais();
    }
  }, []);

  const carregarDadosIniciais = () => {
    carregarAnalytics();
    carregarFuncionarios(1, "");
  };

  const carregarAnalytics = () => {
    fetch("/api/analytics")
      .then((res) => res.json())
      .then((data) => setAnalytics(data))
      .catch(console.error);
  };

  const carregarFuncionarios = (pagina: number, busca: string = termoBusca) => {
    setCarregandoLista(true);
    fetch(`/api/employees?page=${pagina}&search=${encodeURIComponent(busca)}`)
      .then((res) => res.json())
      .then((dados) => {
        if (dados.data) {
          setFuncionarios(dados.data);
          setTotalPaginas(dados.pagination.totalPages);
          setPaginaAtual(dados.pagination.currentPage);
        }
      })
      .catch(console.error)
      .finally(() => setCarregandoLista(false));
  };

  const handleBusca = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    setTermoBusca(valor);
    carregarFuncionarios(1, valor);
  };

  const fazerLogin = async (e: FormEvent) => {
    e.preventDefault();
    setErroLogin("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ password: senhaInput }),
      });
      const dados = await res.json();
      if (dados.success) {
        setAutenticado(true);
        sessionStorage.setItem("admin_logado", "sim");
        carregarDadosIniciais();
      } else {
        setErroLogin("Senha incorreta.");
      }
    } catch (erro) {
      setErroLogin("Erro de conexão.");
    }
  };

  const sairDoSistema = () => {
    setAutenticado(false);
    sessionStorage.removeItem("admin_logado");
    setSenhaInput("");
  };

  const criarFuncionario = async (e: FormEvent) => {
    e.preventDefault();
    if (!novoNome || !novoPin) return;
    setCriando(true);
    try {
      await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: novoNome, pin: novoPin }),
      });
      setNovoNome("");
      setNovoPin("");
      carregarFuncionarios(paginaAtual);
      carregarAnalytics();
    } finally {
      setCriando(false);
    }
  };

  const atualizarFuncionario = async (e: FormEvent) => {
    e.preventDefault();
    if (!funcionarioEditar) return;
    setAtualizando(true);
    try {
      await fetch(`/api/employees/${funcionarioEditar._id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: funcionarioEditar.name,
          pin: funcionarioEditar.pin,
        }),
      });
      setFuncionarioEditar(null);
      carregarFuncionarios(paginaAtual);
    } finally {
      setAtualizando(false);
    }
  };

  const executarApagar = async () => {
    if (!funcionarioApagar) return;
    setApagando(true);
    try {
      await fetch(`/api/employees/${funcionarioApagar._id}`, {
        method: "DELETE",
      });
      setFuncionarioApagar(null);
      carregarFuncionarios(paginaAtual);
      carregarAnalytics();
    } finally {
      setApagando(false);
    }
  };

  // --- PDF: LISTA NOMINAL ---
  const gerarPDFFuncionarios = async () => {
    setCarregandoListaPdf(true);
    try {
      const res = await fetch("/api/employees?all=true");
      const dados: IFuncionario[] = await res.json();
      const doc = new jsPDF();
      const largura = doc.internal.pageSize.getWidth();
      const altura = doc.internal.pageSize.getHeight();
      const cx = largura / 2;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("República de Moçambique", cx, 15, { align: "center" });
      doc.setFontSize(12);
      doc.text("Província de Inhambane", cx, 22, { align: "center" });
      doc.text("Governo do Distrito de Maxixe", cx, 29, { align: "center" });
      doc.setFontSize(11);
      doc.text(
        "Serviço Distrital de Educação, Juventude e Tecnologia de Maxixe",
        cx,
        36,
        { align: "center" },
      );
      doc.setLineWidth(0.5);
      doc.line(40, 40, largura - 40, 40);

      doc.setFontSize(16);
      doc.setTextColor(40);
      doc.text("Lista Nominal de Funcionários", cx, 50, { align: "center" });

      const linhas = dados.map((f) => [f.name, f.pin, f._id]);
      autoTable(doc, {
        startY: 60,
        head: [["Nome Completo", "PIN", "ID"]],
        body: linhas,
        theme: "grid",
        headStyles: { fillColor: [41, 128, 185], halign: "center" },
        columnStyles: {
          0: { cellWidth: 90 },
          1: { halign: "center", fontStyle: "bold" },
        },
      });

      // DISCLAIMER LEGAL
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        "Documento de uso interno. Contém credenciais sensíveis.",
        14,
        altura - 10,
      );

      doc.save("Lista_Funcionarios.pdf");
    } catch {
      alert("Erro lista");
    } finally {
      setCarregandoListaPdf(false);
    }
  };

  // --- PDF: PRESENÇAS DIÁRIAS (LOGS) ---
  const gerarPDFPresencas = async () => {
    setCarregandoPdf(true);
    try {
      const res = await fetch(
        `/api/reports/data?periodo=${periodoSelecionado}`,
      );
      const dados: linhaRelatorio[] = await res.json();
      if (!dados || dados.length === 0) {
        alert("Sem dados.");
        return;
      }

      const doc = new jsPDF();
      const largura = doc.internal.pageSize.getWidth();
      const altura = doc.internal.pageSize.getHeight();
      const cx = largura / 2;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("República de Moçambique", cx, 15, { align: "center" });
      doc.setFontSize(12);
      doc.text("Província de Inhambane", cx, 22, { align: "center" });
      doc.text("Governo do Distrito de Maxixe", cx, 29, { align: "center" });
      doc.setFontSize(11);
      doc.text(
        "Serviço Distrital de Educação, Juventude e Tecnologia de Maxixe",
        cx,
        36,
        { align: "center" },
      );
      doc.setLineWidth(0.5);
      doc.line(40, 40, largura - 40, 40);

      doc.setFontSize(16);
      doc.setTextColor(40);
      doc.text("Lista de presença de funcionários", cx, 50, {
        align: "center",
      });

      const nomes: Record<string, string> = {
        diario: "Hoje",
        semanal: "Semanal",
        mensal: "Mensal",
      };
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Período: ${nomes[periodoSelecionado]} | Gerado: ${new Date().toLocaleDateString("pt-MZ")}`,
        cx,
        58,
        { align: "center" },
      );

      const linhas = dados.map((r) => [
        r.employeeName,
        new Date(r.checkIn).toLocaleDateString("pt-MZ"),
        new Date(r.checkIn).toLocaleTimeString("pt-MZ", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        r.lateMinutes > 0 ? `+${r.lateMinutes}` : "-",
        r.lateMinutes > 0 ? "ATRASADO" : "Pontual",
      ]);

      autoTable(doc, {
        startY: 65,
        head: [["Nome", "Data", "Hora", "Atraso", "Estado"]],
        body: linhas,
        styles: { halign: "center" },
        columnStyles: { 0: { halign: "left" } },
        headStyles: { fillColor: [44, 62, 80], halign: "center" },
        didParseCell: function (data) {
          if (
            data.section === "body" &&
            data.column.index === 4 &&
            data.cell.raw === "ATRASADO"
          ) {
            data.cell.styles.textColor = [231, 76, 60];
            data.cell.styles.fontStyle = "bold";
          }
        },
      });

      // DISCLAIMER LEGAL (Fase 1 do Plano)
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text(
        "Nota: Este relatório é para monitorização interna e não substitui processos administrativos oficiais.",
        cx,
        altura - 10,
        { align: "center" },
      );

      doc.save(`Presencas_${periodoSelecionado}.pdf`);
    } catch {
      alert("Erro PDF");
    } finally {
      setCarregandoPdf(false);
    }
  };

  // --- PDF: DESEMPENHO (INDICADORES) ---
  const gerarPDFDesempenho = () => {
    if (!analytics) return;
    setCarregandoDesempenhoPdf(true);

    try {
      const doc = new jsPDF();
      const largura = doc.internal.pageSize.getWidth();
      const altura = doc.internal.pageSize.getHeight();
      const cx = largura / 2;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("República de Moçambique", cx, 15, { align: "center" });
      doc.setFontSize(12);
      doc.text("Província de Inhambane", cx, 22, { align: "center" });
      doc.text("Governo do Distrito de Maxixe", cx, 29, { align: "center" });
      doc.setFontSize(11);
      doc.text(
        "Serviço Distrital de Educação, Juventude e Tecnologia de Maxixe",
        cx,
        36,
        { align: "center" },
      );
      doc.setLineWidth(0.5);
      doc.line(40, 40, largura - 40, 40);

      doc.setFontSize(16);
      doc.setTextColor(40);
      doc.text("Relatório de Desempenho e Assiduidade", cx, 50, {
        align: "center",
      });
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Mês Atual | Gerado em: ${new Date().toLocaleDateString("pt-MZ")}`,
        cx,
        58,
        { align: "center" },
      );

      const linhas = analytics.ranking.map((emp, i) => [
        i + 1,
        emp.name,
        `${emp.presentDays} / ${emp.expectedDays}`,
        emp.absences > 0 ? emp.absences : "-",
        `${emp.attendanceRate}%`,
        `${emp.punctualityRate}%`,
        emp.totalLateMinutes + " min",
      ]);

      autoTable(doc, {
        startY: 65,
        head: [
          [
            "Rank",
            "Nome",
            "Presenças",
            "Ausências",
            "Assiduidade",
            "Pontualidade",
            "Atraso Total",
          ],
        ],
        body: linhas,
        styles: { halign: "center" },
        columnStyles: { 1: { halign: "left" } },
        headStyles: { fillColor: [44, 62, 80], halign: "center" },
        didParseCell: function (data) {
          if (data.section === "body" && data.column.index === 4) {
            const val = parseInt(data.cell.raw as string);
            if (val < 75) data.cell.styles.textColor = [220, 38, 38];
          }
          if (data.section === "body" && data.column.index === 3) {
            if (data.cell.raw !== "-")
              data.cell.styles.textColor = [220, 38, 38];
          }
        },
      });

      // DISCLAIMER LEGAL (Fase 1 do Plano)
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text(
        "Nota: Relatório estatístico gerado automaticamente. Não substitui análise individual ou justificação de faltas.",
        cx,
        altura - 10,
        { align: "center" },
      );

      doc.save("Desempenho_Mensal.pdf");
    } catch {
      alert("Erro ao gerar PDF");
    } finally {
      setCarregandoDesempenhoPdf(false);
    }
  };

  if (!autenticado)
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
        <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-xl border border-gray-200">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Área Restrita 🔒
          </h1>
          <form onSubmit={fazerLogin} className="space-y-4">
            <input
              type="password"
              className="w-full rounded-md border border-gray-300 p-3"
              value={senhaInput}
              onChange={(e) => setSenhaInput(e.target.value)}
              placeholder="Senha Mestra"
              required
            />
            {erroLogin && (
              <div className="text-red-600 text-sm text-center font-bold">
                {erroLogin}
              </div>
            )}
            <button className="w-full rounded-md bg-gray-900 py-3 font-bold text-white hover:bg-gray-800">
              ENTRAR
            </button>
          </form>
          <div className="mt-4 text-center">
            <a href="/" className="text-sm text-blue-600 hover:underline">
              Voltar
            </a>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 text-gray-800">
      <div className="mx-auto max-w-7xl">
        <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">
              Painel de Gestão
            </h1>
            <p className="text-sm text-gray-500">
              SDEJT Maxixe - Analytics & Controle
            </p>
          </div>
          <div className="flex gap-4 items-center">
            <a
              href="/admin/qrcode"
              className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                />
              </svg>{" "}
              QR Code
            </a>
            <button
              onClick={sairDoSistema}
              className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded hover:bg-red-100 transition"
            >
              Sair
            </button>
          </div>
        </header>

        <div className="flex gap-6 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`pb-3 px-2 font-bold transition flex items-center gap-2 ${activeTab === "dashboard" ? "border-b-4 border-blue-600 text-blue-700" : "text-gray-500 hover:text-gray-700"}`}
          >
            <span>📊</span> Dashboard & Métricas
          </button>
          <button
            onClick={() => setActiveTab("funcionarios")}
            className={`pb-3 px-2 font-bold transition flex items-center gap-2 ${activeTab === "funcionarios" ? "border-b-4 border-blue-600 text-blue-700" : "text-gray-500 hover:text-gray-700"}`}
          >
            <span>👥</span> Gestão de Funcionários
          </button>
        </div>

        {activeTab === "dashboard" && analytics && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* ALERTA DE AUSÊNCIAS (Fase 2 do Plano: "Pendente") */}
            {analytics.isPastNoon && analytics.absenteesToday.length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-orange-800 font-bold flex items-center gap-2 mb-2">
                  ⚠️ Sem Registo / Pendente Hoje (
                  {analytics.absenteesToday.length})
                </h3>
                <p className="text-orange-700 text-sm mb-3">
                  Funcionários que ainda não marcaram presença (Verificar
                  justificações).
                </p>
                <div className="flex flex-wrap gap-2">
                  {analytics.absenteesToday.map((nome, i) => (
                    <span
                      key={i}
                      className="bg-white border border-orange-200 text-orange-800 px-3 py-1 rounded-full text-xs font-bold shadow-sm"
                    >
                      {nome}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* BOTÕES EXPORTAR DESEMPENHO */}
            <div className="flex justify-end gap-2">
              <a
                href="/api/analytics/export"
                target="_blank"
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-green-700 transition shadow-sm"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Baixar Desempenho (Excel)
              </a>
              <button
                onClick={gerarPDFDesempenho}
                disabled={carregandoDesempenhoPdf}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-red-700 transition shadow-sm disabled:opacity-50"
              >
                {carregandoDesempenhoPdf ? (
                  <Spinner />
                ) : (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                )}
                Baixar PDF
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">
                  Atraso Médio (Pessoa)
                </h3>
                <p className="text-3xl font-extrabold text-gray-800 mt-2">
                  {analytics.summary.avgDelay}{" "}
                  <span className="text-sm text-gray-400 font-normal">min</span>
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Impacto médio na produção
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">
                  % de Atrasos
                </h3>
                {/* NOVO KPI: TAXA DE OCORRÊNCIA DE ATRASO */}
                <p className="text-3xl font-extrabold text-yellow-600 mt-2">
                  {analytics.summary.delayOccurrenceRate}%
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Das presenças, quantas chegam tarde
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">
                  Líder de Assiduidade
                </h3>
                <p className="text-xl font-extrabold text-green-600 mt-2 truncate">
                  {analytics.ranking[0]?.name || "-"}
                </p>
                <div className="flex gap-2 mt-1">
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-bold">
                    {analytics.ranking[0]?.attendanceRate || 0}% Presença
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold mb-6 text-gray-800">
                  🏆 Top 5 - Assiduidade
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={analytics.ranking.slice(0, 5)}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis
                        dataKey="name"
                        type="category"
                        width={100}
                        style={{ fontSize: "11px", fontWeight: "bold" }}
                      />
                      <Tooltip
                        cursor={{ fill: "#F3F4F6" }}
                        formatter={(value) => [`${value}%`, "Assiduidade"]}
                      />
                      <Bar
                        dataKey="attendanceRate"
                        fill="#10B981"
                        radius={[0, 4, 4, 0]}
                        name="Assiduidade (%)"
                        barSize={20}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold mb-6 text-gray-800">
                  📉 Média de Atraso (Tendência)
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={analytics.chartData}
                      margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="day" style={{ fontSize: "12px" }} />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => [`${value} min`, "Média"]}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="avgDelay"
                        stroke="#F59E0B"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        name="Min/Pessoa"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50">
                <h3 className="text-lg font-bold text-gray-800">
                  Indicadores de Desempenho
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white text-gray-500 text-xs uppercase tracking-wider border-b">
                    <tr>
                      <th className="p-4">Nome</th>
                      <th className="p-4 text-center">Previstos</th>
                      <th className="p-4 text-center">Realizados</th>
                      <th className="p-4 text-center text-red-600">
                        Ausências
                      </th>
                      <th className="p-4 text-center">Assiduidade</th>
                      <th className="p-4 text-center">Pontualidade</th>
                      <th className="p-4 text-right">Tempo Perdido</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {analytics.ranking.map((emp, index) => (
                      <tr
                        key={index}
                        className="hover:bg-blue-50/30 transition"
                      >
                        <td className="p-4 font-medium text-gray-900">
                          {emp.name}
                        </td>
                        <td className="p-4 text-center text-gray-400">
                          {emp.expectedDays}
                        </td>
                        <td className="p-4 text-center text-gray-600">
                          {emp.presentDays}
                        </td>
                        <td className="p-4 text-center">
                          {emp.absences > 0 ? (
                            <span className="text-red-600 font-bold">
                              {emp.absences}
                            </span>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <span
                            className={`px-2 py-1 rounded text-xs font-bold ${
                              emp.attendanceRate >= 90
                                ? "bg-green-100 text-green-800"
                                : emp.attendanceRate >= 75
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {emp.attendanceRate}%
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span
                            className={`px-2 py-1 rounded text-xs font-bold ${
                              emp.punctualityRate >= 90
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {emp.punctualityRate}%
                          </span>
                        </td>
                        <td className="p-4 text-right text-sm text-gray-600 font-mono">
                          {emp.totalLateMinutes > 0
                            ? `${emp.totalLateMinutes} min`
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "funcionarios" && (
          <div className="animate-in fade-in duration-300 space-y-8">
            <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                📂 Relatórios de Presença (Logs)
              </h2>
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative w-full md:w-64">
                  <select
                    value={periodoSelecionado}
                    onChange={(e) => setPeriodoSelecionado(e.target.value)}
                    className="w-full appearance-none bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="diario">📅 Hoje (Diário)</option>
                    <option value="semanal">📆 Esta Semana</option>
                    <option value="mensal">📊 Este Mês</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg
                      className="fill-current h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
                <a
                  href={`/api/reports/excel?periodo=${periodoSelecionado}`}
                  target="_blank"
                  className="w-full md:w-auto bg-green-600 text-white px-6 py-3 rounded font-bold hover:bg-green-700 text-center flex items-center justify-center gap-2 shadow-sm"
                >
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
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>{" "}
                  Baixar Logs (Excel)
                </a>
                <button
                  onClick={gerarPDFPresencas}
                  disabled={carregandoPdf}
                  className="w-full md:w-auto bg-red-600 text-white px-6 py-3 rounded font-bold hover:bg-red-700 flex items-center justify-center gap-2 shadow-sm disabled:opacity-70"
                >
                  {carregandoPdf ? (
                    <Spinner />
                  ) : (
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
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                  )}{" "}
                  {carregandoPdf ? "A Gerar..." : "Baixar PDF"}
                </button>
              </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 h-fit bg-white p-6 rounded-lg shadow-sm border border-gray-200 sticky top-4">
                <h3 className="font-bold mb-4 border-b pb-2 text-gray-700">
                  Novo Funcionário
                </h3>
                <form
                  onSubmit={criarFuncionario}
                  className="flex flex-col gap-4"
                >
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">
                      Nome Completo
                    </label>
                    <input
                      value={novoNome}
                      onChange={(e) => setNovoNome(e.target.value)}
                      placeholder="Ex: Ana Silva"
                      className="w-full border p-3 rounded mt-1 outline-none focus:border-blue-500 transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">
                      PIN (4-8 Dígitos)
                    </label>
                    <input
                      value={novoPin}
                      onChange={(e) => setNovoPin(e.target.value)}
                      placeholder="1234"
                      type="number"
                      maxLength={8}
                      className="w-full border p-3 rounded mt-1 outline-none focus:border-blue-500 transition"
                      required
                    />
                  </div>
                  <button
                    disabled={criando}
                    className="bg-blue-600 text-white py-3 rounded font-bold hover:bg-blue-700 flex items-center justify-center disabled:opacity-70 transition shadow-sm"
                  >
                    {criando ? <Spinner /> : null}{" "}
                    {criando ? "A Gravar..." : "Adicionar"}
                  </button>
                </form>
              </div>

              <div className="lg:col-span-2 flex flex-col gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 justify-between items-center">
                  <div className="w-full md:flex-1 relative">
                    <input
                      type="text"
                      placeholder="🔍 Pesquisar funcionário..."
                      value={termoBusca}
                      onChange={handleBusca}
                      className="w-full border border-gray-300 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="absolute left-3 top-2.5 text-gray-400">
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
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    <a
                      href="/api/employees/export"
                      target="_blank"
                      className="flex-1 md:flex-none text-center bg-gray-100 text-gray-700 border border-gray-300 px-3 py-2 rounded font-bold text-sm hover:bg-gray-200 transition"
                      title="Baixar lista em Excel"
                    >
                      Excel Lista
                    </a>
                    <button
                      onClick={gerarPDFFuncionarios}
                      disabled={carregandoListaPdf}
                      className="flex-1 md:flex-none flex items-center justify-center gap-1 bg-gray-800 text-white px-3 py-2 rounded font-bold text-sm hover:bg-gray-900 transition disabled:opacity-50"
                      title="Baixar lista em PDF"
                    >
                      {carregandoListaPdf ? <Spinner /> : null} PDF Lista
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden min-h-[400px]">
                  <table className="w-full text-left">
                    <thead className="bg-gray-100 border-b">
                      <tr>
                        <th className="p-4 text-sm font-semibold text-gray-600 uppercase">
                          Nome
                        </th>
                        <th className="p-4 text-sm font-semibold text-gray-600 uppercase">
                          PIN
                        </th>
                        <th className="p-4 text-sm font-semibold text-gray-600 uppercase text-right">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {carregandoLista ? (
                        <tr>
                          <td
                            colSpan={3}
                            className="p-8 text-center text-gray-500"
                          >
                            Carregando dados...
                          </td>
                        </tr>
                      ) : (
                        funcionarios.map((func) => (
                          <tr
                            key={func._id}
                            className="hover:bg-blue-50/30 transition"
                          >
                            <td className="p-4 font-medium text-gray-900">
                              {func.name}
                            </td>
                            <td className="p-4">
                              <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100">
                                {func.pin}
                              </span>
                            </td>
                            <td className="p-4 flex justify-end gap-2">
                              <button
                                onClick={() => setFuncionarioEditar(func)}
                                className="p-2 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition"
                              >
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
                                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={() => setFuncionarioApagar(func)}
                                className="p-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                              >
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
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                      {!carregandoLista && funcionarios.length === 0 && (
                        <tr>
                          <td
                            colSpan={3}
                            className="p-8 text-center text-gray-400"
                          >
                            Nenhum funcionário encontrado.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <button
                    onClick={() => carregarFuncionarios(paginaAtual - 1)}
                    disabled={paginaAtual === 1 || carregandoLista}
                    className="px-4 py-2 border rounded text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                  >
                    ← Anterior
                  </button>
                  <span className="text-sm text-gray-600 font-medium">
                    Página {paginaAtual} de {totalPaginas}
                  </span>
                  <button
                    onClick={() => carregarFuncionarios(paginaAtual + 1)}
                    disabled={
                      paginaAtual === totalPaginas ||
                      totalPaginas === 0 ||
                      carregandoLista
                    }
                    className="px-4 py-2 border rounded text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                  >
                    Próximo →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {funcionarioEditar && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold mb-4">Editar Funcionário</h3>
            <form
              onSubmit={atualizarFuncionario}
              className="flex flex-col gap-4"
            >
              <div>
                <label className="text-sm font-bold text-gray-500">Nome</label>
                <input
                  className="w-full border p-3 rounded mt-1 outline-none focus:ring-2 focus:ring-blue-500"
                  value={funcionarioEditar.name}
                  onChange={(e) =>
                    setFuncionarioEditar({
                      ...funcionarioEditar,
                      name: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-500">PIN</label>
                <input
                  className="w-full border p-3 rounded mt-1 outline-none focus:ring-2 focus:ring-blue-500"
                  type="number"
                  maxLength={8}
                  value={funcionarioEditar.pin}
                  onChange={(e) =>
                    setFuncionarioEditar({
                      ...funcionarioEditar,
                      pin: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setFuncionarioEditar(null)}
                  className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded font-medium"
                  disabled={atualizando}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={atualizando}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 flex items-center gap-2"
                >
                  {atualizando && <Spinner />} Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {funcionarioApagar && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl border-t-4 border-red-500">
            <h3 className="text-lg font-bold mb-2">Tem a certeza?</h3>
            <p className="text-gray-700 mb-6 bg-gray-50 p-3 rounded">
              Vai apagar <strong>{funcionarioApagar.name}</strong>.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setFuncionarioApagar(null)}
                className="px-4 py-2 border rounded font-medium"
                disabled={apagando}
              >
                Cancelar
              </button>
              <button
                onClick={executarApagar}
                disabled={apagando}
                className="px-4 py-2 bg-red-600 text-white rounded font-bold flex items-center gap-2"
              >
                {apagando && <Spinner />} Sim, Apagar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
