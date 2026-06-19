import { NextResponse } from "next/server";
import { z } from "zod";
import { query } from "@/lib/db";
import { isAuthResponse, requireAuth } from "@/lib/require-auth";

type UserRow = {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
};

function mapUser(row: UserRow) {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    avatarUrl: row.avatar_url,
  };
}

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (isAuthResponse(auth)) return auth;

  try {
    const [user] = await query<UserRow>(
      "SELECT id, email, name, avatar_url FROM users WHERE id = $1",
      [auth.userId],
    );
    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ user: mapUser(user) });
  } catch (error) {
    console.error("[auth/me GET]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

const patchSchema = z.object({
  avatarUrl: z.string().url(),
});

export async function PATCH(request: Request) {
  const auth = await requireAuth(request);
  if (isAuthResponse(auth)) return auth;

  try {
    const body = await request.json();
    const result = patchSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { errors: result.error.issues },
        { status: 400 },
      );
    }

    const [user] = await query<UserRow>(
      `UPDATE users SET avatar_url = $1 WHERE id = $2
       RETURNING id, email, name, avatar_url`,
      [result.data.avatarUrl, auth.userId],
    );

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ user: mapUser(user) });
  } catch (error) {
    console.error("[auth/me PATCH]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
