import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

// Reset admin password - use with caution!
export async function GET() {
  try {
    // Find existing admin
    const existingAdmin = await db.adminUser.findFirst();

    if (!existingAdmin) {
      // Create new admin if none exists
      const hashedPassword = await bcrypt.hash("IsaMail@Admin2026", 10);
      
      const admin = await db.adminUser.create({
        data: {
          email: "admin@isamail.space",
          name: "Administrador",
          password: hashedPassword,
          role: "super_admin",
        },
      });

      return NextResponse.json({
        success: true,
        message: "Admin criado com sucesso!",
        admin: {
          email: admin.email,
          password: "IsaMail@Admin2026",
        },
      });
    }

    // Reset password for existing admin
    const hashedPassword = await bcrypt.hash("IsaMail@Admin2026", 10);
    
    await db.adminUser.update({
      where: { id: existingAdmin.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({
      success: true,
      message: "Senha do admin redefinida com sucesso!",
      admin: {
        email: existingAdmin.email,
        password: "IsaMail@Admin2026",
      },
    });
  } catch (error) {
    console.error("Reset admin error:", error);
    return NextResponse.json(
      { error: "Erro ao redefinir senha", details: String(error) },
      { status: 500 }
    );
  }
}
