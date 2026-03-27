import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);
    const body = await request.json();
    const { notifications } = body;

    if (typeof notifications !== 'boolean') {
      return NextResponse.json(
        { error: 'Valor inválido para notificações' },
        { status: 400 }
      );
    }

    await db.user.update({
      where: { id: session.userId },
      data: { notifications },
    });

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar notificações' },
      { status: 500 }
    );
  }
}
