-- Notas con items y tags agregados en una sola consulta (LEFT JOIN + json_agg).
-- Útil para listar el dashboard sin N+1 queries.

SELECT
  -- n.*: todas las columnas de la tabla izquierda (notes).
  n.*,

  -- json_agg(ci.*): agrupa las filas hijas de checklist_items en un array JSON.
  -- FILTER (WHERE ci.id IS NOT NULL): excluye el NULL que produce el LEFT JOIN
  -- cuando la nota no tiene items; sin FILTER, json_agg devolvería [null].
  json_agg(ci.*) FILTER (WHERE ci.id IS NOT NULL) AS items,

  -- json_agg(nt.tag): agrupa solo el texto de cada etiqueta (no toda la fila).
  -- Mismo FILTER para notas sin tags.
  json_agg(nt.tag) FILTER (WHERE nt.id IS NOT NULL) AS tags

FROM notes n

-- LEFT JOIN: conserva TODAS las notas aunque no tengan items asociados.
-- Si no hay coincidencia en checklist_items, las columnas ci.* valen NULL.
LEFT JOIN checklist_items ci ON n.id = ci.note_id

-- LEFT JOIN: igual para etiquetas; una nota sin tags sigue apareciendo.
LEFT JOIN note_tags nt ON n.id = nt.note_id

-- GROUP BY n.id: obligatorio al usar agregados (json_agg) con columnas de n.
GROUP BY n.id

-- ORDER BY: notas más recientes primero.
ORDER BY n.created_at DESC;
