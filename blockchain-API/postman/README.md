# LamTeknik API - Postman setup

Importable Postman collection + environment for [API/server-blockchain-api.js](../server-blockchain-api.js).

Files in this folder:

- `LamTeknik.postman_collection.json` - separate Besu and Go Ethereum diagnostic/entity folders
- `LamTeknik.postman_environment.json` - shared payload values plus explicit `besuPath` and `gethPath` namespaces

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

Then run **Blockchain Go Ethereum -> Diagnostics -> GET Go Ethereum health** to confirm the active Geth target. Besu requests remain available but report unhealthy while Besu is stopped.

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

Optional. Leave the env variable empty. Besu then uses its configured gateway key; Go Ethereum uses its local node-managed developer account. Set it explicitly only for a funded account on the selected target.

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
