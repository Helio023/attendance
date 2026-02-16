// src/app/api/reports/data/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Attendance from '@/models/Attendance';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const periodo = searchParams.get('periodo') || 'diario'; // Recebe em PT

    const fusoHorario = 'Africa/Maputo';
    const agoraMaputo = toZonedTime(new Date(), fusoHorario);
    let inicio, fim;

    // Lógica traduzida
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

    const dados = await Attendance.find({
      checkIn: { $gte: queryInicio, $lte: queryFim }
    }).sort({ checkIn: -1 });

    return NextResponse.json(dados);
  } catch (erro) {
    return NextResponse.json([], { status: 500 });
  }
}