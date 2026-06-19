import { NextResponse } from "next/server";
import { z } from "zod";
import { query } from "@/lib/db";
import { signToken, verifyPassword } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { errors: result.error.issues },
        { status: 400 },
      );
    }

    const { email, password } = result.data;
    const [user] = await query<{
      id: string;
      email: string;
      name: string;
      bio: string;
      password_hash: string;
      avatar_url: string | null;
    }>(
      "SELECT id, email, name, bio, password_hash, avatar_url FROM users WHERE email = $1",
      [email.toLowerCase()],
    );

    if (!user || !(await verifyPassword(password, user.password_hash))) {
      return NextResponse.json(
        { error: "Credenciales incorrectas" },
        { status: 401 },
      );
    }

    const token = await signToken({ userId: user.id, email: user.email });

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        bio: user.bio ?? "",
        avatarUrl: user.avatar_url,
      },
    });
  } catch (error) {
    console.error("[auth/login]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
