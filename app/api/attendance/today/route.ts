// src/app/api/attendance/today/route.ts
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Attendance from '@/models/Attendance';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import { startOfDay, endOfDay } from 'date-fns';

export async function GET() {
  try {
    await connectDB();
    const timeZone = 'Africa/Maputo';
    const nowMaputo = toZonedTime(new Date(), timeZone);

    const start = fromZonedTime(startOfDay(nowMaputo), timeZone);
    const end = fromZonedTime(endOfDay(nowMaputo), timeZone);

    const todayList = await Attendance.find({
      checkIn: { $gte: start, $lte: end }
    }).sort({ checkIn: -1 }); 

    return NextResponse.json(todayList);
  } catch (error) {
    return NextResponse.json([], { status: 500 });
  }
}