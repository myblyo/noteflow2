const BASE = "http://localhost:3000/api/notes";

async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text || null;
  }
  return { status: res.status, body: json };
}

const results = {};

results.getList = await request("GET", "");
results.postCreate = await request("POST", "", {
  title: "Checklist de prueba API",
  type: "checklist",
  content: "Tareas del sprint",
  color: "#6366F1",
  tags: ["backend", "api"],
  items: [
    { task: "Implementar GET por id", is_completed: true },
    { task: "Documentar respuestas", is_completed: false },
  ],
});

const noteId = results.postCreate.body?.id;
if (!noteId) {
  console.error("POST failed", results.postCreate);
  process.exit(1);
}

results.getById = await request("GET", `/${noteId}`);
results.patchUpdate = await request("PATCH", `/${noteId}`, {
  title: "Checklist actualizada",
  is_favorite: true,
  tags: ["backend", "docs"],
  items: [
    { task: "Implementar GET por id", is_completed: true },
    { task: "Documentar respuestas", is_completed: true },
  ],
});
results.deleteNote = await request("DELETE", `/${noteId}`);
results.getAfterDelete = await request("GET", `/${noteId}`);
results.getNotFound = await request(
  "GET",
  "/00000000-0000-0000-0000-000000000000",
);
results.postValidation = await request("POST", "", { title: "ab" });

console.log(JSON.stringify(results, null, 2));
