import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Attendance from '@/models/Attendance';
import Employee from '@/models/Employee';
import { toZonedTime } from 'date-fns-tz';
import { 
  startOfMonth, endOfMonth, eachDayOfInterval, isWeekend, 
  isBefore, set, format, startOfDay 
} from 'date-fns';

export async function GET() {
  try {
    await connectDB();
    const timeZone = 'Africa/Maputo';
    const nowMaputo = toZonedTime(new Date(), timeZone);

    const employees = await Employee.find({ active: true });
    const startMonth = startOfMonth(nowMaputo);
    const endMonth = endOfMonth(nowMaputo);
    const records = await Attendance.find({
      checkIn: { $gte: startMonth, $lte: endMonth }
    });

    const deadlineToday = set(nowMaputo, { hours: 12, minutes: 0, seconds: 0 });
    const isPastNoon = isBefore(deadlineToday, nowMaputo);
    const analysisEnd = isPastNoon ? nowMaputo : set(nowMaputo, { hours: 0, minutes: 0 });

    const statsMap: Record<string, any> = {};
    const dailyTrendData: Record<string, { totalMinutes: number, countPeople: number }> = {};
    
    // Contadores Globais para KPIs melhorados
    let globalLateCount = 0;

    const monthDays = eachDayOfInterval({ start: startMonth, end: analysisEnd });
    const businessDays = monthDays.filter(d => !isWeekend(d));

    employees.forEach(emp => {
      const empCreatedAt = toZonedTime(emp.createdAt, timeZone);
      const effectiveStartDate = isBefore(empCreatedAt, startMonth) ? startMonth : empCreatedAt;
      
      let expectedDays = 0;
      businessDays.forEach(day => {
        if (!isBefore(day, startOfDay(effectiveStartDate))) {
          expectedDays++;
        }
      });

      statsMap[emp._id.toString()] = {
        name: emp.name,
        expectedDays: Math.max(1, expectedDays),
        presentDays: 0,
        totalLateMinutes: 0,
        lateOccurrences: 0,
      };
    });

    records.forEach(rec => {
      const empId = rec.employeeId.toString();
      if (!statsMap[empId]) return;

      statsMap[empId].presentDays++;
      statsMap[empId].totalLateMinutes += rec.lateMinutes;
      
      if (rec.lateMinutes > 0) {
        statsMap[empId].lateOccurrences++;
        globalLateCount++; // Soma global de atrasos
      }

      const dayStr = format(toZonedTime(rec.checkIn, timeZone), 'dd/MM');
      if (!dailyTrendData[dayStr]) dailyTrendData[dayStr] = { totalMinutes: 0, countPeople: 0 };
      dailyTrendData[dayStr].totalMinutes += rec.lateMinutes;
      dailyTrendData[dayStr].countPeople++;
    });

    const ranking = Object.values(statsMap).map((emp: any) => {
      const absences = Math.max(0, emp.expectedDays - emp.presentDays);
      const attendanceRate = (emp.presentDays / emp.expectedDays) * 100;
      
      const onTimeDays = emp.presentDays - emp.lateOccurrences;
      const punctualityRate = emp.presentDays > 0 
        ? (onTimeDays / emp.presentDays) * 100 
        : (emp.expectedDays > 0 ? 0 : 100);

      return {
        name: emp.name,
        attendanceRate: Math.round(attendanceRate),
        punctualityRate: Math.round(punctualityRate),
        totalLateMinutes: emp.totalLateMinutes,
        absences,
        presentDays: emp.presentDays,
        expectedDays: emp.expectedDays
      };
    }).sort((a, b) => {
      if (b.attendanceRate !== a.attendanceRate) return b.attendanceRate - a.attendanceRate;
      return b.punctualityRate - a.punctualityRate;
    });

    const chartData = Object.keys(dailyTrendData).map(day => {
      const data = dailyTrendData[day];
      const avgDelay = data.countPeople > 0 ? Math.round(data.totalMinutes / data.countPeople) : 0;
      return { day, avgDelay };
    }).sort((a, b) => a.day.localeCompare(b.day));

    // KPIs Globais
    const totalCompanyLateMinutes = records.reduce((acc, curr) => acc + curr.lateMinutes, 0);
    const globalCheckins = records.length;
    const globalAvgDelay = globalCheckins > 0 ? Math.round(totalCompanyLateMinutes / globalCheckins) : 0;
    
    // Novo KPI: Taxa de Ocorrência de Atraso (% das vezes que alguém chega atrasado)
    const delayOccurrenceRate = globalCheckins > 0 ? Math.round((globalLateCount / globalCheckins) * 100) : 0;

    const absenteesToday: string[] = [];
    if (!isWeekend(nowMaputo)) {
        employees.forEach(emp => {
            if (isBefore(startOfDay(nowMaputo), startOfDay(toZonedTime(emp.createdAt, timeZone)))) return;
            const hasRecord = records.some(r => r.employeeId.toString() === emp._id.toString() && r.checkIn >= startOfDay(nowMaputo)); // Simplificado
            if (!hasRecord) absenteesToday.push(emp.name);
        });
    }

    return NextResponse.json({
      ranking,
      chartData,
      absenteesToday,
      isPastNoon,
      summary: {
        totalCheckins: globalCheckins,
        avgDelay: globalAvgDelay,
        delayOccurrenceRate 
      }
    });

  } catch (error) {
    return NextResponse.json({ error: 'Erro analytics' }, { status: 500 });
  }
}