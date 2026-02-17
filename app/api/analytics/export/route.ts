import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Attendance from "@/models/Attendance";
import Employee from "@/models/Employee";
import ExcelJS from "exceljs";
import { toZonedTime, fromZonedTime } from "date-fns-tz";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isWeekend,
  isBefore,
  set,
  format,
  startOfDay,
} from "date-fns";

export async function GET() {
  try {
    await connectDB();
    const timeZone = "Africa/Maputo";
    const nowMaputo = toZonedTime(new Date(), timeZone);

    // 1. DADOS
    const employees = await Employee.find({ active: true }).sort({ name: 1 });
    const startMonth = startOfMonth(nowMaputo);
    const endMonth = endOfMonth(nowMaputo);
    const records = await Attendance.find({
      checkIn: { $gte: startMonth, $lte: endMonth },
    });

    // 2. CÁLCULO ESTATÍSTICO (IGUAL AO DASHBOARD)
    const deadlineToday = set(nowMaputo, { hours: 12, minutes: 0, seconds: 0 });
    const isPastNoon = isBefore(deadlineToday, nowMaputo);
    // Analisa até ontem, ou até hoje se já passou das 12h
    const analysisEnd = isPastNoon
      ? nowMaputo
      : set(nowMaputo, { hours: 0, minutes: 0 });

    // Determinar dias úteis do mês até ao momento
    const monthDays = eachDayOfInterval({
      start: startMonth,
      end: analysisEnd,
    });
    const businessDays = monthDays.filter((d) => !isWeekend(d));

    const statsMap: Record<string, any> = {};

    // A. Inicializar Dados e Calcular Expectativa
    employees.forEach((emp) => {
      const empCreatedAt = toZonedTime(emp.createdAt, timeZone);

      // Se foi contratado a meio do mês, a contagem começa na data de criação
      const effectiveStartDate = isBefore(empCreatedAt, startMonth)
        ? startMonth
        : empCreatedAt;

      let expectedDays = 0;
      businessDays.forEach((day) => {
        // Só conta dias úteis DEPOIS da data de início efetiva
        if (!isBefore(day, startOfDay(effectiveStartDate))) {
          expectedDays++;
        }
      });

      statsMap[emp._id.toString()] = {
        name: emp.name,
        expectedDays: Math.max(1, expectedDays), // Evitar divisão por zero
        presentDays: 0,
        totalLateMinutes: 0,
        lateOccurrences: 0,
      };
    });

    // B. Processar Registos
    records.forEach((rec) => {
      const empId = rec.employeeId.toString();
      if (!statsMap[empId]) return;

      statsMap[empId].presentDays++;
      statsMap[empId].totalLateMinutes += rec.lateMinutes;

      if (rec.lateMinutes > 0) {
        statsMap[empId].lateOccurrences++;
      }
    });

    // C. Calcular KPIs Finais (Sem Score Arbitrário)
    const reportData = Object.values(statsMap)
      .map((emp: any) => {
        const absences = Math.max(0, emp.expectedDays - emp.presentDays);
        const attendanceRate = (emp.presentDays / emp.expectedDays) * 100;

        // Pontualidade: Dos dias que veio, quantos chegou a horas?
        const onTimeDays = emp.presentDays - emp.lateOccurrences;
        const punctualityRate =
          emp.presentDays > 0
            ? (onTimeDays / emp.presentDays) * 100
            : emp.expectedDays > 0
              ? 0
              : 100; // Se nunca veio mas devia, pontualidade 0. Se não devia vir, 100.

        return {
          ...emp,
          absences,
          attendanceRate: Math.round(attendanceRate),
          punctualityRate: Math.round(punctualityRate),
        };
      })
      .sort((a, b) => {
        // Ordenar por Assiduidade, depois Pontualidade
        if (b.attendanceRate !== a.attendanceRate)
          return b.attendanceRate - a.attendanceRate;
        return b.punctualityRate - a.punctualityRate;
      });

    // 3. GERAR EXCEL
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Estatísticas");

    // --- CABEÇALHO OFICIAL ---
    const headerLines = [
      "República de Moçambique",
      "Província de Inhambane",
      "Governo do Distrito de Maxixe",
      "Serviço Distrital de Educação, Juventude e Tecnologia de Maxixe",
      "Relatório Estatístico de Assiduidade e Pontualidade", // Título neutro
    ];

    headerLines.forEach((text, index) => {
      const rowNum = index + 1;
      const row = worksheet.getRow(rowNum);
      row.values = [text];
      worksheet.mergeCells(rowNum, 1, rowNum, 7); // A até G
      row.getCell(1).alignment = { horizontal: "center", vertical: "middle" };
      row.getCell(1).font = {
        name: "Arial",
        size: index === 4 ? 14 : 11,
        bold: true,
      };
    });

    // Disclaimer Institucional (Importante)
    worksheet.addRow([]);
    const disclaimerRow = worksheet.addRow([
      "Nota: Documento para fins de monitorização estatística. Ausências sujeitas a justificação administrativa.",
    ]);
    worksheet.mergeCells(7, 1, 7, 7);
    disclaimerRow.getCell(1).font = {
      italic: true,
      size: 9,
      color: { argb: "FF555555" },
    };
    disclaimerRow.getCell(1).alignment = { horizontal: "center" };

    worksheet.addRow([`Gerado em: ${format(nowMaputo, "dd/MM/yyyy HH:mm")}`]);
    worksheet.mergeCells(8, 1, 8, 7);
    worksheet.getCell("A8").alignment = { horizontal: "center" };

    // --- TABELA ---
    worksheet.columns = [
      { key: "name", width: 35 }, // A
      { key: "exp", width: 15 }, // B
      { key: "pres", width: 15 }, // C
      { key: "abs", width: 18 }, // D
      { key: "att", width: 18 }, // E (% Assiduidade)
      { key: "punc", width: 18 }, // F (% Pontualidade)
      { key: "late", width: 18 }, // G (Minutos)
    ];

    const headerRow = worksheet.addRow([
      "Funcionário",
      "Dias Previstos",
      "Dias Presentes",
      "Ausências (S/ Reg)",
      "Taxa Assiduidade",
      "Taxa Pontualidade",
      "Minutos Atraso",
    ]);

    // Estilo do Cabeçalho da Tabela
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF2c3e50" },
      }; // Azul Institucional
      cell.alignment = { horizontal: "center", vertical: "middle" };
    });

    // Preencher Dados
    reportData.forEach((emp) => {
      const row = worksheet.addRow({
        name: emp.name,
        exp: emp.expectedDays,
        pres: emp.presentDays,
        abs: emp.absences,
        att: emp.attendanceRate + "%",
        punc: emp.punctualityRate + "%",
        late: emp.totalLateMinutes,
      });

      // Formatação Condicional
      row.getCell(2).alignment = { horizontal: "center" };
      row.getCell(3).alignment = { horizontal: "center" };

      // Ausências (Vermelho se > 0)
      const absCell = row.getCell(4);
      absCell.alignment = { horizontal: "center" };
      if (emp.absences > 0) {
        absCell.font = { color: { argb: "FFFF0000" }, bold: true };
      }

      // Assiduidade (Cores por nível)
      const attCell = row.getCell(5);
      attCell.alignment = { horizontal: "center" };
      if (emp.attendanceRate < 75)
        attCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF8D7DA" },
        }; // Red background
      else if (emp.attendanceRate >= 95)
        attCell.font = { color: { argb: "FF155724" }, bold: true }; // Green text

      // Pontualidade
      const puncCell = row.getCell(6);
      puncCell.alignment = { horizontal: "center" };
      if (emp.punctualityRate < 80)
        puncCell.font = { color: { argb: "FF856404" } }; // Yellow/Orange text

      row.getCell(7).alignment = { horizontal: "center" };
    });

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="Relatorio_Estatistico_Assiduidade.xlsx"`,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao gerar Excel" }, { status: 500 });
  }
}
