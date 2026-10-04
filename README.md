# NestJS IDOR Security Lab

> ⚠️ **Intentionally vulnerable software for a local, isolated university lab only.**
> Do not deploy this anywhere public. Run it only between two VMs on an isolated network.

## Purpose

This project demonstrates **Broken Access Control**, specifically an **IDOR**
(Insecure Direct Object Reference) vulnerability.

The vulnerable endpoint (`GET /orders/:id`) **authenticates** the user correctly
(a valid JWT is required) but **fails to verify ownership** of the requested
resource. Because the object is looked up by its ID alone, any logged-in user can
read another user's private order simply by changing the ID in the URL.

This is the classic shape of the bug:

**authentication success + authorization failure**

## Environment

```
Kali Linux VM
    |
    | HTTP
    v
Ubuntu Server VM
    |
    NestJS API :3000
```

- The NestJS API runs on the **Ubuntu** VM and listens on `0.0.0.0:3000`.
- The **Kali** VM acts as the attacker/client and calls the API over HTTP.

## Requirements

- Node.js 22+
- npm
- Git

## Installation

```bash
npm install
cp .env.example .env
npm run start:dev
```

The SQLite database (`data/idor-lab.sqlite`) and demo data are created
automatically on first start.

## Demo users

**Ali:**

```
username: ali
password: ali123
```

**Reza:**

```
username: reza
password: reza123
```

## Login example

Using localhost (on the Ubuntu VM itself):

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"ali","password":"ali123"}'
```

From the Kali VM, replace the host with the Ubuntu VM's IP:

```bash
curl -X POST http://<UBUNTU_VM_IP>:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"ali","password":"ali123"}'
```

The response looks like:

```json
{ "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
```

## Normal usage

1. Login as Ali.
2. Receive a JWT.
3. Call `GET /orders`.
4. Ali sees **only his own orders**.

`GET /orders` is secure on **every** branch — it always filters by the
authenticated user.

## IDOR demonstration

Run this against the **`vulnerable-idor`** branch:

1. Login as `ali`.
2. Copy Ali's JWT token.
3. Request Ali's own order: `GET /orders/1` (works, it is his).
4. Change the order ID from `1` to `2`.
5. Send `GET /orders/2` using **Ali's** token.
6. The vulnerable branch **incorrectly returns Reza's private order**.

This proves the vulnerability: Ali authenticated as himself, yet accessed a
resource he does not own. Again — **authentication success + authorization
failure**.

## Fixed demonstration

1. Switch to the `fixed-idor` branch.
2. Restart NestJS.
3. Login as Ali.
4. Request `GET /orders/2` again with Ali's token.
5. The API returns **404 Not Found**.
6. Ownership is now verified: the order is looked up by **both** its ID and the
   authenticated owner's ID, so a non-owner gets nothing back.

(We prefer `404` over `403` here so the API does not even confirm that order 2
exists for a user who does not own it.)

## Branch switching

```bash
git checkout vulnerable-idor   # intentionally vulnerable version
git checkout fixed-idor        # corrected version
```

After switching branches, restart the server (`npm run start:dev`).

## Classroom demo flow

1. Start NestJS on the Ubuntu VM.
2. Confirm the Ubuntu VM IP (`ip a`).
3. From Kali, call the NestJS API.
4. Login as `ali`.
5. Obtain the JWT.
6. `GET /orders`.
7. Show that Ali only sees his own order.
8. Send `GET /orders/2`.
9. On `vulnerable-idor`, show Reza's private order.
10. Explain the IDOR vulnerability.
11. Show the vulnerable code (`src/orders/orders.service.ts`).
12. Switch to `fixed-idor`.
13. Restart NestJS.
14. Repeat `GET /orders/2`.
15. Show the `404`.
16. Show the secure code.
17. Explain resource-ownership authorization.

## Curl commands

Set a host variable to keep the examples short. On the Ubuntu VM use
`localhost`; from Kali use the Ubuntu VM IP.

```bash
# On the Ubuntu VM:
HOST=http://localhost:3000

# From the Kali VM (replace with the real IP):
HOST=http://<UBUNTU_VM_IP>:3000
```

### Login as Ali

```bash
curl -X POST $HOST/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"ali","password":"ali123"}'
```

### Login as Reza

```bash
curl -X POST $HOST/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"reza","password":"reza123"}'
```

### Save a token for reuse

```bash
TOKEN=$(curl -s -X POST $HOST/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"ali","password":"ali123"}' | \
  python3 -c "import sys,json;print(json.load(sys.stdin)['accessToken'])")
```

### Retrieve the current user

```bash
curl $HOST/users/me -H "Authorization: Bearer $TOKEN"
```

### Retrieve your orders

```bash
curl $HOST/orders -H "Authorization: Bearer $TOKEN"
```

### Retrieve order 1 (Ali's own order)

```bash
curl $HOST/orders/1 -H "Authorization: Bearer $TOKEN"
```

### Retrieve order 2 (Reza's order — the IDOR target)

```bash
curl $HOST/orders/2 -H "Authorization: Bearer $TOKEN"
```

- On `vulnerable-idor`: returns Reza's order (the bug).
- On `fixed-idor`: returns `404 Not Found`.

### Create an order (owner is taken from the token, not the body)

```bash
curl -X POST $HOST/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"New Order","description":"Test order","amount":500}'
```

## Endpoints

| Method | Path          | Auth | Description                                  |
| ------ | ------------- | ---- | -------------------------------------------- |
| POST   | `/auth/login` | No   | Login, returns `{ accessToken }`             |
| GET    | `/users/me`   | Yes  | Current user (no password hash)              |
| GET    | `/orders`     | Yes  | Only the authenticated user's orders         |
| GET    | `/orders/:id` | Yes  | One order (vulnerable or secured per branch) |
| POST   | `/orders`     | Yes  | Create an order owned by the current user    |

## Error behavior

- Missing/invalid token → `401 Unauthorized`
- Order not found or not owned (fixed branch) → `404 Not Found`

Password hashes are never returned, and stack traces are not exposed.

## Branches

- **`main`** — clean base project (NestJS, SQLite, TypeORM, users, auth, orders,
  seed data). `GET /orders/:id` is secure here.
- **`vulnerable-idor`** — intentionally vulnerable `GET /orders/:id`.
- **`fixed-idor`** — corrected `GET /orders/:id`.

## Code map

```
controller → service → TypeORM repository → SQLite
```

Everything is deliberately small so a student can trace a request end to end.
