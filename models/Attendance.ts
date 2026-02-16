// src/models/Attendance.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAttendance extends Document {
  employeeId: mongoose.Types.ObjectId;
  employeeName: string;
  checkIn: Date;
  lateMinutes: number;
}

const AttendanceSchema: Schema = new Schema({
  employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  employeeName: { type: String, required: true },
  checkIn: { type: Date, required: true },
  lateMinutes: { type: Number, default: 0 },
}, { timestamps: true });

const Attendance: Model<IAttendance> = mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', AttendanceSchema);

export default Attendance;