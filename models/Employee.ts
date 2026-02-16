// // src/models/Employee.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEmployee extends Document {
  name: string;
  pin: string; // Guardado como texto simples para admin ver
  active: boolean;
}

const EmployeeSchema: Schema = new Schema({
  name: { type: String, required: true },
  pin: { type: String, required: true },
  active: { type: Boolean, default: true },
}, { timestamps: true });

// Evita erro de recompilação do modelo no Next.js
const Employee: Model<IEmployee> = mongoose.models.Employee || mongoose.model<IEmployee>('Employee', EmployeeSchema);

export default Employee;