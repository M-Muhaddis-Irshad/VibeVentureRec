# Vibeventure — Server

Express + Prisma + PostgreSQL API for the Vibeventure travel journal.

## Local setup

```bash
cd server
npm install
cp .env.example .env   # fill in DATABASE_URL, S3_BUCKET_NAME, AWS_REGION

npx prisma migrate dev --name init
npm run dev
```

API runs on `http://localhost:5000`. Health check: `GET /health`.

## Local PostgreSQL quickstart (Docker)

```bash
docker run --name vibeventure-pg -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=vibeventure -p 5432:5432 -d postgres:16
```

Then set `DATABASE_URL="postgresql://postgres:password@localhost:5432/vibeventure?schema=public"`
in `.env`.

## Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Health check (used by ALB) |
| GET | `/api/posts?page=&pageSize=&search=` | List posts, paginated + searchable |
| GET | `/api/posts/:id` | Get a single post |
| POST | `/api/posts` | Create a post |
| PUT | `/api/posts/:id` | Update a post |
| DELETE | `/api/posts/:id` | Delete a post |
| POST | `/api/upload` | Upload a cover image (multipart, field `image`) -> S3 URL |

## Scripts

- `npm run dev` — nodemon dev server
- `npm run prisma:migrate` — run/create a migration
- `npm run prisma:studio` — open Prisma Studio (visual DB browser)
