# PJBL "Complete Architecture": audit v2 (ConectaCampus)

Audit date: 2026-11-07. Read-only. Statuses: DONE / PARTIAL / MISSING / UNVERIFIED.

> **Correction to v1.** The first audit looked only at local `master` and found almost nothing. After `git fetch`, the remote branch `origin/feat/pjbl-distributed-architecture` (commits 87050ee, 82f0cac by Otávio, 2026-10-26; open **draft PR #2**) turned out to implement most of the architecture. This version audits that branch. The v1 conclusions and plan (build BFF/MS2/Function from scratch) are obsolete.
>
> I exported the branch to a scratchpad folder and read it there. I did **not** run its tests locally (that needs `npm ci`). Test status comes from the GitHub Actions run below.

## 0. Update 2026-11-07 (after Azure deploy)

Everything runs on Azure and the cloud smoke test passed (`node scripts/smoke.mjs https://apim-campus-7e6589.azure-api.net`). Decision: one public monorepo with the five components in folders (professor's rule: publish everything in public repositories).

| ID | Now | Evidence |
|---|---|---|
| C1-C6, C8, F1 | DONE | cloud smoke test; browser check: the SPA only calls `apim-campus-7e6589.azure-api.net` |
| C7 | DONE | Azure API Management (Consumption): routing, CORS for the SPA, `x-gateway-secret` injection; BFF answers 401 without it. No rate limiting (not supported on Consumption) |
| F2 | DONE | frontend `happy-pebble-0ff30c50f.3.azurestaticapps.net`, gateway `apim-campus-7e6589.azure-api.net/api` |
| D1, D2 | DONE | 6 images public at `leosmkk/conectacampus-*:v1` (name format `user/repo:tag`; confirm with professor) |
| G1 | DONE (monorepo) | https://github.com/leosmkk/conectacampus, public |
| G2, P1, P2, P3, P4 | DONE | README, `docs/arc42.md`, `docs/c4.md`, `docs/canvas.md`, cloud screenshots in `docs/evidence/*-cloud.jpg`, PDF regenerated |
| P5 | DONE | video published on YouTube (unlisted): https://youtu.be/0Q4IWo1clfI |

SQL: the free serverless database ran out of its monthly quota (poller every 3 s kept it awake); converted in place to **Basic 5 DTU** (about US$5/month of student credit) and the outbox poll is now 30 s (`OUTBOX_POLL_MS`, image `leosmkk/conectacampus-certificados:v2`). APIM CORS now also allows the gateway's own origin (Swagger UI POST fix, Laura's commit c3bbd9e).

CI fix: `mongo:8.0` does not start on Linux kernels 6.19+ (SERVER-121912); `compose.yaml` pins `mongo:7.0`. `PJBL validation` and the Static Web Apps deploy are green.

Open: video + YouTube link in `docs/links.json`; professor's answers (Canvas, Docker Hub naming, Azure SQL free offer vs "1 DTU"); rotate the Atlas password after delivery. The tables below are the earlier audit, kept for history.

## 1. Inventory

Monorepo `git@github.com:leosmkk/conectacampus.git` (**public**, API reports `"visibility": "public"`).

| Project | Path on feat branch | Stack | README | Dockerfile | Tests |
|---|---|---|---|---|---|
| Microfrontend | `frontend/` | React 18 + Vite 8, calls `/api` only | yes | yes | arch + domain |
| BFF | `bff/` | Node 22, Express 5, OpenAPI | yes | yes | arch + domain |
| Microservice 1 (Eventos) | `services/eventos/` | Express, MongoDB, slices `GetEvent/ListEvents/UpdateEvent/...`, OpenAPI | yes | yes | arch + domain |
| Microservice 2 (Certificados) | `services/certificados/` | Express, SQL Server / Azure SQL, outbox in the same transaction, OpenAPI | yes | yes | arch + domain |
| Azure Function | `azure-function/` | Functions v4: HTTP `enrich`, queue trigger `events`, `campusEvents`; Table Storage ledger | yes | yes | arch + domain |
| Gateway | `gateway/` | **Nginx** (rate limit, payload size, allowed methods), not a cloud API Gateway | n/a | yes | n/a |
| Infra | `compose.yaml`, `infra/main.bicep`, `infra/container-app.bicep` | Docker Compose; Bicep for Azure Container Apps | n/a | n/a | n/a |
| Docs | `docs/arc42.md`, `c4.md`, `canvas.md`, `asyncapi.yaml`, `deploy.md`, `video.md`, `links.json`, `ConectaCampus-Entrega-3.pdf`, `docs/evidence/*.png` | | | | |
| Scripts | `scripts/publish-images.mjs`, `publish-repositories.mjs`, `smoke.mjs`, `build-delivery-pdf.py`, ... | | | | |

- **Branches.** `master` (local) is behind `origin/master` (49acb8f, docs by annaquezia, 2026-10-26) and also has 4 commits not on origin (e6e2dd1, 221cf5c, 60c126e, d54127b). The two have diverged; the local push was rejected as non-fast-forward. `refactor/vertical-slice-clean-architecture` is still unmerged into master; the feat branch supersedes it.
- **CI.** `.github/workflows/pjbl.yml`. Run 40413543638 on the feat branch: **completed / success** (unit, architecture, real MongoDB + SQL Server + Azurite + Functions Host smoke).
- **Secrets.** Local secrets are generated into `.env` and `.local/` (gitignored). `compose.yaml` takes secrets from env. Docs say not to commit credentials. I printed no values.
- **Live checks.** Old SWA site `https://happy-pebble-0ff30c50f.3.azurestaticapps.net/` returned 200, but README says it is the **old** version and proves nothing about the new architecture.

## 2. Checklist (against `feat/pjbl-distributed-architecture`)

| ID | Status | Evidence | Missing |
|---|---|---|---|
| C1 | DONE (code) | `frontend/src/services/api.js` uses `'/api'`; `tests/architecture.test.js` forbids DB SDKs and service URLs in frontend | the deployed SWA is still the old frontend |
| C2 | DONE (code) | `bff/` Express 5, proxies Eventos, Certificados and Function | not deployed |
| C3 | DONE (code) | README: `GET /api/aggregated-data` (BFF also `/aggregated-data`); covered by `tests/api.test.js` and the CI smoke | not run against a cloud URL |
| C4 | DONE (code) | `services/eventos` Mongo, full CRUD, `src/api/openapi.js` | Atlas cluster not verified |
| C5 | DONE (code) | `services/certificados` SQL Server, CRUD, `openapi.js` | no Azure SQL database verified; `deploy.md` itself says the "Free 1 DTU" offer does not exist as such |
| C6 | DONE (code) | `azure-function` HTTP `enrich` computes indicators | not published to Azure |
| C7 | PARTIAL | `gateway/` is Nginx on Container Apps (ARC42 ADR 05: "AWS Gateway era uma opção") | no cloud API Gateway product; confirm with the professor whether Nginx counts. Not deployed |
| C8 | DONE (code) | Azure Queue + outbox, queue trigger, poison queue, `docs/asyncapi.yaml`, event spec served at `/api/docs/?url=/api/specs/certificados` | not deployed |
| F1 | DONE (local/CI) | smoke in CI exercises the whole path | |
| F2 | MISSING | `docs/links.json`: `frontend`, `gateway`, `swagger*`, `dockerHub` all `null`; `"cloud": "pending accounts and resources"` | all cloud URLs |
| D1 | DONE | Dockerfiles in `frontend`, `bff`, `services/eventos`, `services/certificados`, `azure-function`, `gateway`; built by `compose.yaml` in CI | |
| D2 | PARTIAL | `scripts/publish-images.mjs <user> v1 --push` exists; `dockerHub: null` | images not pushed (UNVERIFIED). Hub only allows `user/repo:tag`, as `deploy.md` notes |
| Q1 | DONE | each service has `domain/ application/ infrastructure/ api/` | |
| Q2 | DONE | e.g. `services/eventos/src/application/{GetEvent,ListEvents,UpdateEvent,...}/` | |
| Q3 | DONE (per CI) | `tests/domain.test.js` in every project plus `tests/api.test.js`, `ledger.test.js`; CI green | I did not re-run locally |
| Q4 | DONE | `tests/architecture.test.js` and one per project (hand-written import checks: domain pure, application not importing adapters, no cross-service imports) | |
| G1 | UNVERIFIED | `links.json` lists 5 repos under `otavioaugustosw/conectacampus-*` | GitHub API returns **404** for all 5 without auth: not created or private. Everything is still in the monorepo |
| G2 | PARTIAL | READMEs exist in all 5 components and mention a student name (checked `Smijtink`) | confirm each has architecture, tech, run steps and all 4 names; the video must show cloud URLs |
| P1 | PARTIAL | `docs/arc42.md` (12 sections) and PDF exist | links in it are placeholders: Docker Hub, Swagger, frontend, gateway, YouTube are all `null` |
| P2 | DONE | `docs/c4.md` has Level 1, 2 and 3 (Mermaid) | not re-checked against the final cloud layout |
| P3 | PARTIAL | `docs/canvas.md` exists ("Architecture Canvas") | which canvas the course expects is still unconfirmed |
| P4 | PARTIAL | `docs/evidence/`: Swagger BFF, eventos, certificados, frontend, mobile (all `*-local.png`) | screenshots are **localhost**; gateway screenshot absent; cloud ones needed |
| P5 | MISSING | `docs/video.md` is only a script, "Publicação pendente" | recording and YouTube link |

## 3. Mismatches / issues

1. **Git history: RESOLVED (2026-11-07).** `master` now contains local work, `origin/master` and the feat branch (merge c45cac5, then 763423c). Pushed to origin; PR #2 shows as merged. Local backup branches: `backup/master-pre-reconcile`, `backup/refactor-pre-reconcile`. The old refactor branch is superseded and not merged. After the merge: root `npm test` 18/18, workspace tests 13/13, frontend build OK, PHP demo OK. Static Web Apps auto-deploy is **paused** (`workflow_dispatch` only) because the new frontend needs a gateway; re-enable once `VITE_API_URL` points to the Azure gateway (note `frontend/.env.production` still holds the old Function URL).
2. **Repos not found.** The five `otavioaugustosw/conectacampus-*` repos return 404, so "five public repos" (G1) is not met.
3. **Gateway is Nginx.** Requirement C7 gives AWS API Gateway as an example; the team chose Nginx and documented the reason. Needs the professor's approval.
4. **Docker Hub naming.** The spec's `<user>/pjbl/<image>` is not valid on Docker Hub; the branch uses `user/repo:tag`.
5. **Azure SQL "1 DTU".** Documented as not matching the current free offer.
6. **Everything is local.** `links.json`: `"cloud": "pending accounts and resources"`. No cloud URL exists, so F2, P1, P4 (cloud shots) and P5 are blocked.
7. **Leftovers.** `design-patterns/` (PHP) and `legacy/` on master are unrelated to PJBL.

## 4. Summary

Counts (23 rows): **DONE 14 · PARTIAL 6 (C7, D2, G2, P1, P3, P4) · MISSING 2 (F2, P5) · UNVERIFIED 1 (G1)**.

"DONE" for C1-C6, C8 and F1 means working code verified by CI, not a cloud deployment.

Top 5 risks:

1. No cloud deployment exists; Azure, Atlas, Docker Hub and YouTube all depend on accounts and recordings by the group.
2. Nginx instead of a real API Gateway may not satisfy "mandatory at delivery".
3. Five component repos are not publicly visible, so G1 fails as it stands.
4. Draft PR #2 is not merged and `master` has diverged; an uncoordinated merge can lose work.
5. Container Apps with minimum replicas and the outbox poller can burn free credit; Azure SQL free tier pauses (slow first query).

## 5. Open questions for the professor

1. Is Nginx on Container Apps acceptable as the API Gateway, or must it be AWS API Gateway / Azure APIM?
2. Which Canvas does the course expect (P3)?
3. Is `user/repo:tag` acceptable instead of `<user>/pjbl/<image>` (D2)?
4. Is the Azure SQL free serverless offer acceptable instead of "1 DTU"?
