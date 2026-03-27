import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

function generateRandomPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export async function POST(
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

    // Generate new password
    const newPassword = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await db.emailAccount.update({
      where: { id },
      data: {
        password: hashedPassword,
        updatedAt: new Date(),
      },
    });

    // TODO: Update password in Mailu

    return NextResponse.json({
      message: 'Senha resetada com sucesso',
      newPassword,
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json(
      { error: 'Erro ao resetar senha' },
      { status: 500 }
    );
  }
}
