import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Employee from '@/models/Employee';
import ExcelJS from 'exceljs';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    // Busca todos os funcionários ativos ordenados por nome
    const employees = await Employee.find({ active: true }).sort({ name: 1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Lista Funcionários');

    // --- CABEÇALHO OFICIAL ---
    const headerLines = [
      "República de Moçambique",
      "Província de Inhambane",
      "Governo do Distrito de Maxixe",
      "Serviço Distrital de Educação, Juventude e Tecnologia de Maxixe",
      "Lista Nominal de Funcionários e Credenciais"
    ];

    headerLines.forEach((text, index) => {
      const rowNumber = index + 1;
      const row = worksheet.getRow(rowNumber);
      row.values = [text];
      worksheet.mergeCells(rowNumber, 1, rowNumber, 3); // A até C
      const cell = row.getCell(1);
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.font = { name: 'Arial', size: index === 4 ? 14 : 12, bold: true };
    });

    worksheet.addRow([]);

    // --- TABELA ---
    worksheet.columns = [
      { key: 'name', width: 40 },
      { key: 'pin', width: 15 },
      { key: 'id', width: 30 },
    ];

    const headerRow = worksheet.addRow(['Nome Completo', 'PIN de Acesso', 'ID do Sistema']);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2c3e50' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    // Dados
    employees.forEach(emp => {
      const row = worksheet.addRow({
        name: emp.name,
        pin: emp.pin,
        id: emp._id.toString()
      });
      // Centralizar PIN e ID
      row.getCell(2).alignment = { horizontal: 'center' };
      row.getCell(3).alignment = { horizontal: 'center' };
    });

    const buffer = await workbook.xlsx.writeBuffer();
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="Lista_Funcionarios_SDEJT.xlsx"`
      }
    });

  } catch (error) {
    return NextResponse.json({ error: 'Erro ao gerar Excel' }, { status: 500 });
  }
}