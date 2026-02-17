import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEmployee extends Document {
  name: string;
  pin: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeSchema = new Schema<IEmployee>(
  {
    name: { type: String, required: true },
    pin: { type: String, required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const Employee: Model<IEmployee> =
  mongoose.models.Employee ||
  mongoose.model<IEmployee>("Employee", EmployeeSchema);
export default Employee;
