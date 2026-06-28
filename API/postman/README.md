# LamTeknik API - Postman setup

Importable Postman collection + environment for [API/server-lamteknik.js](../server-lamteknik.js).

Files in this folder:

- `LamTeknik.postman_collection.json` - 3 diagnostic requests + 8 entity-templated requests
- `LamTeknik.postman_environment.json` - environment variables (`baseUrl`, `entity`, `recordId`, ...)

## Import (3 steps)

1. Open Postman -> **File** -> **Import** -> drag both JSON files from `API/postman/`.
2. Top-right environment switcher -> select **`LamTeknik (local)`**.
3. Edit the `entity` and `recordId` env variables to target a specific contract / row, then run any request.

That's it. The same 8 entity requests work for every LamTeknik contract because they use `{{entity}}` from the environment.

## Start the server first

```bash
cd API
npm run deploy:lamteknik   # if not already deployed
npm run start              # http://localhost:4100
```

Then in Postman, run **Diagnostics -> GET /health** to confirm connectivity.

## Valid entity slugs

Set the `entity` env variable to any of these (matches `loadEntities()` in the server):

```
akreditasi, asesmen-kecukupan, asesmen-lapangan, asesor, bank,
institusi, jenjang, keputusan-ma, klaster-ilmu, klaster-prodi,
klaster-profesi, komite-evaluasi, laporan-asesmen, majelis-akreditasi,
pembayaran, penawaran-asesor, pengesahan-ak, pengesahan-al, prodi,
provinsi, respon-asesor, sekretariat, tenant, upps, user, validator
```

## About `privateKey`

Optional. Leave the env variable empty to let the collection's pre-request script strip it from the POST body so the server signs with `DEPLOYER_PRIVATE_KEY` / `DEFAULT_PRIVATE_KEY` from `API/.env`. Set it explicitly if you want to sign as a different account per request.

## About `allData`

Stored in the env as plain JSON like `{"id":42,...}`. The collection's pre-request script wraps it with `JSON.stringify` before injecting it into the POST body, so the server receives it as the JSON-escaped **string** that `store<Entity>(...)` expects.

## Requests included

Diagnostics:

- `GET /health`
- `GET /lamteknik` (list all entities)
- `GET /contracts`

Entity (templated by `{{entity}}`):

- `GET /lamteknik/{{entity}}` -> `retrieve()`
- `GET /lamteknik/{{entity}}/count`
- `GET /lamteknik/{{entity}}/ids`
- `GET /lamteknik/{{entity}}/index/{{index}}`
- `GET /lamteknik/{{entity}}/{{recordId}}`
- `GET /lamteknik/{{entity}}/{{recordId}}/metadata`
- `GET /lamteknik/{{entity}}/{{recordId}}/exists`
- `POST /lamteknik/{{entity}}` (writes a CDC envelope row)

The successful POST response's `transactionHash` is captured into the collection variable `txHash` for chaining.
