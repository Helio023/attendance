import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Employee from '@/models/Employee';
import Attendance from '@/models/Attendance';
import crypto from 'crypto';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import { getDay, set, differenceInMinutes, startOfDay, endOfDay } from 'date-fns';

const SECRET_KEY = process.env.SECRET_KEY || 'default-secret';
// CONFIGURAÇÃO: 20 Minutos de tolerância para preencher o formulário
const MAX_SESSION_TIME = 20 * 60 * 1000; 

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { employeeId, pinEntered, token } = await req.json();

    // ============================================================
    // 1. SEGURANÇA: Validar Token de Sessão (Anti-Fraude de Aba Aberta)
    // ============================================================
    if (!token) {
      return NextResponse.json({ success: false, message: "Sessão inválida. Atualize a página." }, { status: 403 });
    }

    const [timestampStr, signature] = token.split('.');
    const timestamp = parseInt(timestampStr);

    // 1.1 Verifica Assinatura
    const expectedSignature = crypto
      .createHmac('sha256', SECRET_KEY)
      .update(timestampStr)
      .digest('hex');

    if (signature !== expectedSignature) {
      return NextResponse.json({ success: false, message: "Token adulterado." }, { status: 403 });
    }

    // 1.2 Verifica Tempo (20 Minutos)
    const nowServer = Date.now();
    if (nowServer - timestamp > MAX_SESSION_TIME) {
      return NextResponse.json({ 
        success: false, 
        message: "A sessão expirou (passaram 20 min). Por favor, leia o QR Code novamente." 
      }, { status: 408 });
    }

    // ============================================================
    // 2. VALIDAR FUNCIONÁRIO
    // ============================================================
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return NextResponse.json({ success: false, message: "Funcionário não encontrado." }, { status: 404 });
    }

    if (employee.pin !== pinEntered) {
      return NextResponse.json({ success: false, message: "PIN Incorreto." }, { status: 401 });
    }

    // ============================================================
    // 3. FUSO HORÁRIO & DUPLICIDADE (MOÇAMBIQUE)
    // ============================================================
    const timeZone = 'Africa/Maputo';
    const nowUtc = new Date();
    const nowMaputo = toZonedTime(nowUtc, timeZone);

    // Definir intervalo do dia HOJE em Maputo (00:00:00 até 23:59:59)
    const startMaputo = startOfDay(nowMaputo);
    const endMaputo = endOfDay(nowMaputo);

    // Converter intervalo de volta para UTC para buscar no banco
    const queryStart = fromZonedTime(startMaputo, timeZone);
    const queryEnd = fromZonedTime(endMaputo, timeZone);

    // Verificar se já existe registo HOJE
    const existing = await Attendance.findOne({
      employeeId: employee._id,
      checkIn: { $gte: queryStart, $lte: queryEnd }
    });

    if (existing) {
      return NextResponse.json({ 
        success: false, 
        message: `Olá ${employee.name}, já registaste presença hoje!` 
      }, { status: 409 });
    }

    // ============================================================
    // 4. CÁLCULO DE ATRASO (Regra 07:30)
    // ============================================================
    const dayOfWeek = getDay(nowMaputo); // 0=Dom, 6=Sab
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    let lateMinutes = 0;

    if (!isWeekend) {
      // Define a meta: 07:30:00 do dia atual
      const limitTime = set(nowMaputo, { hours: 7, minutes: 30, seconds: 0, milliseconds: 0 });
      
      if (nowMaputo > limitTime) {
        lateMinutes = differenceInMinutes(nowMaputo, limitTime);
      }
    }

    // Salvar
    await Attendance.create({
      employeeId: employee._id,
      employeeName: employee.name,
      checkIn: nowUtc,
      lateMinutes: lateMinutes
    });

    const msg = lateMinutes > 0 
      ? `Marcado! ${lateMinutes} min de atraso.` 
      : "Marcado! Pontual.";

    return NextResponse.json({ success: true, message: msg });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Erro interno do servidor." }, { status: 500 });
  }
}