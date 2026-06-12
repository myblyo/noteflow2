import { NextResponse } from "next/server";
import { verifyToken, type AuthUser } from "@/lib/auth";
import { verifyFirebaseIdToken } from "@/lib/firebase-admin";
import { resolveNeonUserId } from "@/lib/firebase-user";

export async function requireAuth(
  request: Request,
): Promise<AuthUser | NextResponse> {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const token = header.slice(7);

  try {
    return await verifyToken(token);
  } catch {
    try {
      const firebase = await verifyFirebaseIdToken(token);
      const neon = await resolveNeonUserId({
        uid: firebase.uid,
        email: firebase.email,
      });
      return { userId: neon.userId, email: neon.email };
    } catch {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }
  }
}

export function isAuthResponse(
  value: AuthUser | NextResponse,
): value is NextResponse {
  return value instanceof NextResponse;
}
