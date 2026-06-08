# Noteflow API

REST API for the Noteflow app. Built with **Node.js**, **Express**, and **TypeScript**.

## Quick start

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

API base URL: `http://localhost:3001/api`

## Endpoints

### Health
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Service status |

### All data
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api` | Notes, ideas, checklists, color labels |

### Notes
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/notes` | List notes |
| GET | `/api/notes/:id` | Get one note |
| POST | `/api/notes` | Create note |
| PUT | `/api/notes/:id` | Update note |
| PATCH | `/api/notes/:id/favorite` | Toggle favorite |
| DELETE | `/api/notes/:id` | Delete note |

### Ideas
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/ideas` | List ideas |
| GET | `/api/ideas/:id` | Get one idea |
| POST | `/api/ideas` | Create idea |
| PUT | `/api/ideas/:id` | Update idea |
| PATCH | `/api/ideas/:id/favorite` | Toggle favorite |
| DELETE | `/api/ideas/:id` | Delete idea |

### Checklists
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/checklists` | List checklists |
| GET | `/api/checklists/:id` | Get one checklist |
| POST | `/api/checklists` | Create checklist |
| PUT | `/api/checklists/:id` | Update checklist |
| PATCH | `/api/checklists/:id/favorite` | Toggle favorite |
| PATCH | `/api/checklists/:id/items/:itemId/toggle` | Toggle task |
| DELETE | `/api/checklists/:id` | Delete checklist |

## Example

```bash
curl http://localhost:3001/api/health
curl http://localhost:3001/api/notes
curl -X POST http://localhost:3001/api/notes \
  -H "Content-Type: application/json" \
  -d '{"title":"My note","content":"Hello"}'
```

## Data storage

Data is persisted in `server/data/db.json`. A seed file is created on first run.
