import { NextResponse } from "next/server";
import { verifyToken, type AuthUser } from "@/lib/auth";

export async function requireAuth(
  request: Request,
): Promise<AuthUser | NextResponse> {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    return await verifyToken(header.slice(7));
  } catch {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }
}

export function isAuthResponse(
  value: AuthUser | NextResponse,
): value is NextResponse {
  return value instanceof NextResponse;
}
