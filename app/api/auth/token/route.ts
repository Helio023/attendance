import { NextResponse } from 'next/server';
import crypto from 'crypto';

const SECRET_KEY = process.env.SECRET_KEY || 'default-secret';

export async function GET() {
  // 1. Pega a hora atual
  const timestamp = Date.now();
  
  // 2. Cria uma assinatura digital usando a chave secreta
  // Isso impede que o funcionário altere o timestamp manualmente no frontend
  const signature = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(timestamp.toString())
    .digest('hex');

  // 3. Retorna o token: "HORA.ASSINATURA"
  const token = `${timestamp}.${signature}`;

  return NextResponse.json({ token });
}