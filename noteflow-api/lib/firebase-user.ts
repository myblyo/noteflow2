import { randomUUID } from "node:crypto";
import { hashPassword } from "@/lib/auth";
import { query } from "@/lib/db";

type FirebaseIdentity = {
  uid: string;
  email?: string;
  name?: string;
};

/** Enlaza Firebase Auth con un usuario de Neon (crea uno si no existe). */
export async function resolveNeonUserId(
  identity: FirebaseIdentity,
): Promise<{ userId: string; email: string }> {
  const byUid = await query<{ id: string; email: string }>(
    "SELECT id, email FROM users WHERE firebase_uid = $1",
    [identity.uid],
  );
  if (byUid[0]) {
    return { userId: byUid[0].id, email: byUid[0].email };
  }

  const email = identity.email?.toLowerCase().trim();
  if (email) {
    const byEmail = await query<{ id: string; email: string }>(
      "SELECT id, email FROM users WHERE email = $1",
      [email],
    );
    if (byEmail[0]) {
      await query("UPDATE users SET firebase_uid = $1 WHERE id = $2", [
        identity.uid,
        byEmail[0].id,
      ]);
      return { userId: byEmail[0].id, email: byEmail[0].email };
    }
  }

  const placeholderEmail =
    email ?? `${identity.uid}@firebase.noteflow.local`;
  const name = identity.name?.trim() || email?.split("@")[0] || "Usuario";
  const passwordHash = await hashPassword(`firebase:${randomUUID()}`);

  const [created] = await query<{ id: string; email: string }>(
    `INSERT INTO users (email, password_hash, name, firebase_uid)
     VALUES ($1, $2, $3, $4)
     RETURNING id, email`,
    [placeholderEmail, passwordHash, name, identity.uid],
  );

  return { userId: created.id, email: created.email };
}
