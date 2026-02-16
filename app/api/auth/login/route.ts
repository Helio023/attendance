// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    
    // Compara com a senha que está guardada no servidor (segura)
    if (password === process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json({ success: false, message: "Senha incorreta" }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}