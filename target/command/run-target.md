# Run `lamteknik-webapp`

The VM `.41` application layer is one Portainer stack with four services:

| Service | Container | Host port |
|---|---|---:|
| Next.js | `lamteknik-webapp-frontend` | `3002` |
| NestJS | `lamteknik-webapp-backend` | `3001` |
| MySQL | `lamteknik-webapp-mysql` | `3307` |
| Redis | `lamteknik-webapp-redis` | `6379` |

The stack reuses the external Docker volume `target_lamteknik-mysql-data`.
Never delete that volume during a redeploy.

## Build the local application images

Run on VM `.41`:

```bash
cd target
docker compose build backend frontend
```

This creates:

- `lamteknik-webapp-backend:local`
- `lamteknik-webapp-frontend:local`

## First Portainer deployment

1. Select the VM `.41` Docker endpoint in Portainer.
2. Stop/remove the legacy `lamteknik-target-*` containers, without removing volumes.
3. Create a stack named `lamteknik-webapp`.
4. Paste [`../portainer-stack.yml`](../portainer-stack.yml) into the Portainer web editor.
5. Deploy the stack. The two application images use `pull_policy: never` and must already exist on VM `.41`.

Startup is health-gated: MySQL and Redis start first, then NestJS, then Next.js.

## URLs and login

- Frontend: `http://10.9.23.41:3002`
- Backend health: `http://10.9.23.41:3001/api/v1/health`
- Frontend-proxied health: `http://10.9.23.41:3002/api/v1/health`
- Login: `admin@lamtek.ac.id` / `password123`

## CDC compatibility

MySQL remains published on `10.9.23.41:3307` with `log_bin=ON`, `binlog_format=ROW`, and `binlog_row_image=FULL`. The existing `cdc_user` retains its replication grants. Configure Debezium with:

```env
DB_HOST=10.9.23.41
DB_PORT=3307
DB_USER=cdc_user
DB_PASSWORD=cdc_pass
DB_NAME=lamtek_db
```

Kafka/Debezium remain in their existing stack. The separate `consumer` stack is added later and will send CDC records to `http://10.9.23.40:4100`.

## Safety

- Do not run `docker compose down -v`.
- Do not enable `LOAD_SQL_SEEDS` for the one-event CDC test.
- NestJS uses `BLOCKCHAIN_ENABLED=false`; blockchain writes belong to the CDC consumer and `.40` gateway.
