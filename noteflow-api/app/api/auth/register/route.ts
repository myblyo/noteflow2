import { NextResponse } from "next/server";
import { z } from "zod";
import { query } from "@/lib/db";
import { hashPassword, signToken } from "@/lib/auth";

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { errors: result.error.issues },
        { status: 400 },
      );
    }

    const { name, email, password } = result.data;
    const existing = await query<{ id: string }>(
      "SELECT id FROM users WHERE email = $1",
      [email.toLowerCase()],
    );
    if (existing.length) {
      return NextResponse.json(
        { error: "El email ya está registrado" },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(password);
    const [user] = await query<{
      id: string;
      email: string;
      name: string;
      bio: string;
      avatar_url: string | null;
    }>(
      `INSERT INTO users (email, password_hash, name)
       VALUES ($1, $2, $3)
       RETURNING id, email, name, bio, avatar_url`,
      [email.toLowerCase(), passwordHash, name],
    );

    const token = await signToken({ userId: user.id, email: user.email });

    return NextResponse.json(
      {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          bio: user.bio ?? "",
          avatarUrl: user.avatar_url,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[auth/register]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
