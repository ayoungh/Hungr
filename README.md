Hungr
=====

A Node web app for sharing what food you enjoy with friends and family.

## 2025 update

Dependencies and server configuration have been refreshed to work with modern
versions of Node.js (tested with Node 20) and MongoDB. See `package.json` for
the updated dependency list. Mongoose no longer requires the deprecated
`useNewUrlParser` and `useUnifiedTopology` options, so the server connects using
the defaults to avoid driver warnings.

The idea of this is to learn node.js and angular.js by creating an app to share food with friends and family. I love food and like trying new foods, but want to be able to share these new foods with friends and family without the usual instagram upload.

Plan so far:

Create a node.js server that will handle all of the data

###Routes
	/api
	/api/foods
	/api/foods/food_id
	/api/users
	/api/users/user_id

Create a frontend (single page app) with angular.js 


## TODO

- [x] Basic rest routes created
- [x] Document setup and environment config
- [x] Add API logging mode for debugging
- [x] Get Authentication of users working
- [x] Add auth checking to food items
- [ ] Start coding the basic structure of the frontend app

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the example environment file and adjust values as needed:

   ```bash
   cp .env.example .env.local
   ```

   The server loads `.env.local` first, then `.env`, to read `DB`, `PORT`, `API_LOGGING`, `TOKEN_SECRET`, and `SESSION_SECRET`.

3. Start MongoDB locally (or point `db` at a remote instance):

   ```bash
   mongod --dbpath /path/to/your/db
   ```

4. (Optional) Enable API logging for debugging:

   ```bash
   API_LOGGING=true npm run start
   ```

5. Set secrets (required in production):

   ```bash
   TOKEN_SECRET=replace_me
   SESSION_SECRET=replace_me
   ```

6. Start the server:

   ```bash
   npm run start
   ```

The server listens on `port` (defaults to `3000`).

## Authentication

Create a user with `POST /api/users`, then log in with `POST /api/login` to
receive a JSON Web Token (JWT).

Example login using `curl`:

```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"secret"}'
```

Use the returned token in the `Authorization` header (as `Bearer <token>`) when
calling protected API routes. For instance, to fetch all foods:

```bash
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/foods
```

Include the same header when creating or updating food items.

## API Docs

Swagger UI is available at `http://localhost:3000/api/docs`.
The raw OpenAPI JSON is at `http://localhost:3000/api/docs.json`.

## API Client

Generate the API client from the Swagger spec:

```bash
npm run api:fetch
npm run api:generate
```

This writes the generated Axios client to `client/src/api/index.ts`.

## Frontend

The Next.js app lives in `client/`.

```bash
cd client
npm run dev
```

## Health Check

`GET /healthz` returns the server status and MongoDB connection state.

## Using MongoDB

The server connects to MongoDB using the connection string defined in
`server/config.js`. By default this is
`mongodb://localhost:27017/hungrdb`.

Optionally set the `DB` environment variable if you want to use a different
connection string:

```bash
DB="mongodb://username:password@host:port/dbname" npm run start
```

Ensure MongoDB is running before launching the server.

When the server starts you should see log messages indicating the connection
string and whether the connection succeeded or failed.
