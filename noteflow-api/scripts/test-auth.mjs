const BASE = "http://localhost:3000/api";
const email = `test-${Date.now()}@example.com`;

async function req(method, path, body, token) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text;
  }
  return { status: res.status, body: json };
}

const register = await req("POST", "/auth/register", {
  name: "Test User",
  email,
  password: "secret12",
});
console.log("register", register.status);

const token = register.body?.token;
const notesUnauthorized = await req("GET", "/notes");
console.log("notes without token", notesUnauthorized.status);

const notes = await req("GET", "/notes", null, token);
console.log("notes with token", notes.status, Array.isArray(notes.body) ? notes.body.length : notes.body);

const create = await req(
  "POST",
  "/notes",
  { title: "Nota autenticada", type: "note", content: "Hola auth" },
  token,
);
console.log("create note", create.status, create.body?.id);
