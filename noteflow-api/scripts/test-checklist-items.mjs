const BASE = "http://localhost:3000/api";

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

const postNote = await request("POST", "/notes", {
  title: "Nota para checklist items",
  type: "checklist",
  content: "Prueba JOIN",
});
const noteId = postNote.body?.id;
if (!noteId) {
  console.error("POST note failed", postNote);
  process.exit(1);
}

const results = {
  postItem: await request("POST", `/notes/${noteId}/checklist-items`, {
    task: "Primera tarea",
  }),
  getItems: await request("GET", `/notes/${noteId}/checklist-items`),
};

const itemId = results.postItem.body?.id;
results.patchToggle = await request("PATCH", `/checklist-items/${itemId}`, {});
results.patchSet = await request("PATCH", `/checklist-items/${itemId}`, {
  is_completed: false,
});
results.deleteItem = await request("DELETE", `/checklist-items/${itemId}`);
results.getAfterDelete = await request(
  "GET",
  `/notes/${noteId}/checklist-items`,
);

console.log(JSON.stringify(results, null, 2));
