// src/app/api/reports/excel/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Attendance from '@/models/Attendance';
import ExcelJS from 'exceljs';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from 'date-fns';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const periodo = searchParams.get('periodo') || 'diario';

    // 1. Configurar Datas (Maputo)
    const fusoHorario = 'Africa/Maputo';
    const agoraMaputo = toZonedTime(new Date(), fusoHorario);
    let inicio, fim;

    // Definição dos intervalos
    switch (periodo) {
      case 'semanal':
        inicio = startOfWeek(agoraMaputo, { weekStartsOn: 1 });
        fim = endOfWeek(agoraMaputo, { weekStartsOn: 1 });
        break;
      case 'mensal':
        inicio = startOfMonth(agoraMaputo);
        fim = endOfMonth(agoraMaputo);
        break;
      case 'diario':
      default:
        inicio = startOfDay(agoraMaputo);
        fim = endOfDay(agoraMaputo);
        break;
    }

    const queryInicio = fromZonedTime(inicio, fusoHorario);
    const queryFim = fromZonedTime(fim, fusoHorario);

    // 2. Buscar Dados (Logs Factuais)
    const dados = await Attendance.find({
      checkIn: { $gte: queryInicio, $lte: queryFim }
    }).sort({ checkIn: -1 });

    // 3. Criar Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Logs de Presença');

    // Definir Colunas
    worksheet.columns = [
      { key: 'nome', width: 35 },
      { key: 'data', width: 15 },
      { key: 'hora', width: 15 },
      { key: 'atraso', width: 15 },
      { key: 'estado', width: 20 },
    ];

    // --- CABEÇALHO OFICIAL MELHORADO ---
    const linhasCabecalho = [
      "República de Moçambique",
      "Província de Inhambane",
      "Governo do Distrito de Maxixe",
      "Serviço Distrital de Educação, Juventude e Tecnologia de Maxixe",
      "Lista de Presenças Registadas", // Mudança Semântica (Sugestão 1)
      "(Relatório Operacional de Caráter Informativo)" // Proteção Institucional (Sugestão 2)
    ];

    linhasCabecalho.forEach((texto, index) => {
      const numLinha = index + 1;
      const linha = worksheet.getRow(numLinha);
      linha.values = [texto];
      
      worksheet.mergeCells(numLinha, 1, numLinha, 5);
      
      const celula = linha.getCell(1);
      celula.alignment = { vertical: 'middle', horizontal: 'center' };
      
      // Formatação específica
      if (index === 5) {
        // Estilo para o aviso "(Informativo)"
        celula.font = { name: 'Arial', size: 10, italic: true, color: { argb: 'FF555555' } };
      } else {
        // Estilo para os títulos oficiais
        celula.font = { 
          name: 'Arial', 
          size: index === 4 ? 14 : 12, 
          bold: true 
        };
      }
    });

    worksheet.addRow([]); // Espaço

    // Linha 8: Cabeçalho da Tabela
    const headerRow = worksheet.addRow(['Nome Funcionário', 'Data', 'Hora', 'Atraso (min)', 'Estado']);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF2c3e50' }
      };
      cell.alignment = { horizontal: 'center' };
    });

    // 4. Inserir Dados
    dados.forEach(item => {
      const dataLocal = toZonedTime(item.checkIn, fusoHorario);
      
      const row = worksheet.addRow({
        nome: item.employeeName,
        data: format(dataLocal, 'dd/MM/yyyy'),
        hora: format(dataLocal, 'HH:mm'),
        atraso: item.lateMinutes,
        estado: item.lateMinutes > 0 ? 'Atrasado' : 'Pontual'
      });

      row.getCell(2).alignment = { horizontal: 'center' };
      row.getCell(3).alignment = { horizontal: 'center' };
      row.getCell(4).alignment = { horizontal: 'center' };
      row.getCell(5).alignment = { horizontal: 'center' };

      if (item.lateMinutes > 0) {
        row.getCell(4).font = { color: { argb: 'FFFF0000' }, bold: true };
        row.getCell(5).font = { color: { argb: 'FFFF0000' }, bold: true };
      }
    });

    // 5. Gerar Nome do Arquivo Dinâmico (Sugestão 3)
    const dataInicioStr = format(inicio, 'yyyy-MM-dd');
    const dataFimStr = format(fim, 'yyyy-MM-dd');
   
    const nomeArquivo = `Logs_Presenca_${periodo}_${dataInicioStr}_a_${dataFimStr}.xlsx`;

    const buffer = await workbook.xlsx.writeBuffer();
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${nomeArquivo}"`
      }
    });

  } catch (error) {
    return NextResponse.json({ error: 'Erro ao gerar Excel' }, { status: 500 });
  }
}