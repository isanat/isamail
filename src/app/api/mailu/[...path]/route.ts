import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// Mailu API configuration
// Server IP: 207.180.209.114
// Admin URL: https://mail.isamail.space/admin
const MAILU_API_URL = process.env.MAILU_API_URL || "https://mail.isamail.space/api/v1";
const MAILU_API_KEY = process.env.MAILU_API_KEY || "";
const MAILU_ADMIN_SECRET = process.env.MAILU_ADMIN_SECRET || "";

async function proxyRequest(
  request: NextRequest,
  method: string,
  path: string[]
) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session");

    if (!sessionCookie) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const url = `${MAILU_API_URL}/${path.join("/")}`;
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    // Add authentication for Mailu API
    if (MAILU_API_KEY) {
      headers["Authorization"] = `Bearer ${MAILU_API_KEY}`;
    } else if (MAILU_ADMIN_SECRET) {
      headers["X-Admin-Secret"] = MAILU_ADMIN_SECRET;
    }

    const options: RequestInit = {
      method,
      headers,
      cache: "no-store",
    };

    if (method !== "GET" && method !== "HEAD") {
      const body = await request.text();
      if (body) {
        options.body = body;
      }
    }

    // Add query parameters
    const searchParams = request.nextUrl.searchParams;
    const fullUrl = searchParams.toString() 
      ? `${url}?${searchParams.toString()}` 
      : url;

    const response = await fetch(fullUrl, options);
    
    // Handle different response types
    const contentType = response.headers.get("Content-Type") || "";
    let data: string | object;
    
    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    return NextResponse.json(
      typeof data === "string" ? { data } : data,
      { status: response.status }
    );
  } catch (error) {
    console.error("Mailu proxy error:", error);
    return NextResponse.json(
      { error: "Erro ao conectar com o servidor de email" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, "GET", path);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, "POST", path);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, "PUT", path);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, "DELETE", path);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, "PATCH", path);
}
