import { NextResponse } from "next/server";
import { z } from "zod";
import { query } from "@/lib/db";
import { isAuthResponse, requireAuth } from "@/lib/require-auth";

type UserRow = {
  id: string;
  email: string;
  name: string;
  bio: string;
  avatar_url: string | null;
};

function mapUser(row: UserRow) {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    bio: row.bio ?? "",
    avatarUrl: row.avatar_url,
  };
}

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (isAuthResponse(auth)) return auth;

  try {
    const [user] = await query<UserRow>(
      "SELECT id, email, name, bio, avatar_url FROM users WHERE id = $1",
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

const patchSchema = z
  .object({
    avatarUrl: z.string().min(1).optional(),
    bio: z.string().max(500).optional(),
  })
  .refine((data) => data.avatarUrl !== undefined || data.bio !== undefined, {
    message: "Indica avatarUrl o bio para actualizar",
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

    const sets: string[] = [];
    const params: unknown[] = [];
    if (result.data.avatarUrl !== undefined) {
      params.push(result.data.avatarUrl);
      sets.push(`avatar_url = $${params.length}`);
    }
    if (result.data.bio !== undefined) {
      params.push(result.data.bio);
      sets.push(`bio = $${params.length}`);
    }
    params.push(auth.userId);

    const [user] = await query<UserRow>(
      `UPDATE users SET ${sets.join(", ")} WHERE id = $${params.length}
       RETURNING id, email, name, bio, avatar_url`,
      params,
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
