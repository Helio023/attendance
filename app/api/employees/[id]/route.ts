// src/app/api/employees/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Employee from '@/models/Employee';

// ATUALIZAR (PUT)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const funcionarioAtualizado = await Employee.findByIdAndUpdate(
      id,
      { name: body.name, pin: body.pin },
      { new: true }
    );

    if (!funcionarioAtualizado) {
      return NextResponse.json({ message: "Funcionário não encontrado" }, { status: 404 });
    }

    return NextResponse.json(funcionarioAtualizado);
  } catch (error) {
    return NextResponse.json({ message: "Erro ao atualizar" }, { status: 500 });
  }
}

// APAGAR (DELETE)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    await Employee.findByIdAndDelete(id);

    return NextResponse.json({ message: "Funcionário apagado com sucesso" });
  } catch (error) {
    return NextResponse.json({ message: "Erro ao apagar" }, { status: 500 });
  }
}