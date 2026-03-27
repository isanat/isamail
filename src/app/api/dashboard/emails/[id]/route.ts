import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);
    const { id } = await params;

    // Check if email account belongs to user
    const emailAccount = await db.emailAccount.findFirst({
      where: {
        id,
        userId: session.userId,
      },
    });

    if (!emailAccount) {
      return NextResponse.json(
        { error: 'Conta de email não encontrada' },
        { status: 404 }
      );
    }

    // Delete email account
    await db.emailAccount.delete({
      where: { id },
    });

    // TODO: Delete from Mailu

    return NextResponse.json({ message: 'Conta de email excluída com sucesso' });
  } catch (error) {
    console.error('Error deleting email account:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir conta de email' },
      { status: 500 }
    );
  }
}
