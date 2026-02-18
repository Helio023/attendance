import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Employee from "@/models/Employee";
import Attendance from "@/models/Attendance";
import { toZonedTime, fromZonedTime } from "date-fns-tz";
import {
  getDay,
  set,
  differenceInMinutes,
  startOfDay,
  endOfDay,
} from "date-fns";
import { getDistanceFromLatLonInMeters } from "@/lib/haversine"; 

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const { employeeId, pinEntered, latitude, longitude } = await req.json();

    // ============================================================
    // 1. VALIDAÇÃO DE GEOLOCALIZAÇÃO (GPS)
    // ============================================================
    const officeLat = parseFloat(process.env.OFFICE_LAT || "0");
    const officeLng = parseFloat(process.env.OFFICE_LNG || "0");
    const maxDist = parseInt(process.env.MAX_DISTANCE_METERS || "100");

    // Se as coordenadas do escritório estiverem configuradas, validamos
    if (officeLat !== 0 && officeLng !== 0) {
      if (!latitude || !longitude) {
        return NextResponse.json(
          {
            success: false,
            message: "Localização obrigatória. Ative o GPS.",
          },
          { status: 400 },
        );
      }

      const distance = getDistanceFromLatLonInMeters(
        latitude,
        longitude,
        officeLat,
        officeLng,
      );

      if (distance > maxDist) {
        return NextResponse.json(
          {
            success: false,
            message: `Você está longe do SDEJT-MAXIXE (${Math.round(distance)}m). Aproxime-se.`,
          },
          { status: 403 },
        );
      }
    }

    // ============================================================
    // 2. VALIDAR FUNCIONÁRIO E PIN (Igual ao anterior)
    // ============================================================
    const employee = await Employee.findById(employeeId);
    if (!employee)
      return NextResponse.json(
        { success: false, message: "Funcionário não encontrado." },
        { status: 404 },
      );
    if (employee.pin !== pinEntered)
      return NextResponse.json(
        { success: false, message: "PIN Incorreto." },
        { status: 401 },
      );

    // ============================================================
    // 3. FUSO HORÁRIO & DUPLICIDADE (Igual ao anterior)
    // ============================================================
    const timeZone = "Africa/Maputo";
    const nowUtc = new Date();
    const nowMaputo = toZonedTime(nowUtc, timeZone);
    const startMaputo = startOfDay(nowMaputo);
    const endMaputo = endOfDay(nowMaputo);
    const queryStart = fromZonedTime(startMaputo, timeZone);
    const queryEnd = fromZonedTime(endMaputo, timeZone);

    const existing = await Attendance.findOne({
      employeeId: employee._id,
      checkIn: { $gte: queryStart, $lte: queryEnd },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: `Olá ${employee.name}, já marcou hoje!` },
        { status: 409 },
      );
    }

    // Cálculo de Atraso
    const dayOfWeek = getDay(nowMaputo);
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    let lateMinutes = 0;

    if (!isWeekend) {
      const limitTime = set(nowMaputo, {
        hours: 7,
        minutes: 30,
        seconds: 0,
        milliseconds: 0,
      });
      if (nowMaputo > limitTime) {
        lateMinutes = differenceInMinutes(nowMaputo, limitTime);
      }
    }

    await Attendance.create({
      employeeId: employee._id,
      employeeName: employee.name,
      checkIn: nowUtc,
      lateMinutes: lateMinutes,
    });

    const msg =
      lateMinutes > 0
        ? `Marcado! Atraso de ${lateMinutes} min.`
        : "Marcado! Pontual.";
    return NextResponse.json({ success: true, message: msg });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Erro interno." },
      { status: 500 },
    );
  }
}
