import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Employee from '@/models/Employee';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 10;
    const fetchAll = searchParams.get('all') === 'true';
    const search = searchParams.get('search') || ''; // <--- NOVO: Termo de busca

    // Filtro base (apenas ativos)
    let query: any = { active: true };

    // Se tiver busca, adiciona filtro de nome (case insensitive)
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    // 1. SE PEDIR "ALL" (Para Exportação/Dropdown), RETORNA TUDO
    if (fetchAll) {
      const employees = await Employee.find(query).sort({ name: 1 });
      return NextResponse.json(employees);
    }

    // 2. SENÃO, RETORNA PAGINAÇÃO (Para a Tabela)
    const skip = (page - 1) * limit;

    const employees = await Employee.find(query)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Employee.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: employees,
      pagination: {
        total,
        totalPages,
        currentPage: page,
        perPage: limit
      }
    });

  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar funcionários' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const newEmp = await Employee.create(body);
    return NextResponse.json(newEmp);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar' }, { status: 500 });
  }
}