# Deploy guide: ConectaCampus on Azure (with Azure API Management as the gateway)

Target layout (everything on Azure except MongoDB Atlas, which the assignment requires):

```
Browser -> Static Web Apps (React)
        -> Azure API Management (Consumption)  == the API Gateway
        -> Container App: BFF  -> Container App: eventos      -> MongoDB Atlas
                               -> Container App: certificados -> Azure SQL (+ outbox) -> Storage Queue
                               -> Azure Function (HTTP enrich) <- Queue trigger (events) -> Table ledger
```

Notes on commands: the `az` flags below were written from knowledge of the CLI and **not yet run** in this session (your login had expired). If a flag is rejected, run the command with `--help`. Never paste secrets into chat or commit them. Everything under `.local/` is gitignored (verify with `git check-ignore .local/azure.env`).

Steps marked **[ME]** are code/infra changes I prepare once you say go. Steps marked **[YOU]** need your accounts.

---

## 0. Log in and check what the student subscription allows [YOU]

```bash
az login --tenant 8a1ef6c3-8324-4103-bf4a-1328c5dc3653     # your MFA expired; opens a browser
az account show --query "{name:name,state:state}" -o table  # expect: Azure for Students, Enabled
# Student subscriptions often restrict regions. See which are allowed:
az policy assignment list --query "[].{name:displayName,params:parameters}" -o json | grep -i -A8 location
# Register the resource providers once:
for p in Microsoft.App Microsoft.OperationalInsights Microsoft.ApiManagement Microsoft.Sql Microsoft.Web Microsoft.Storage; do az provider register -n $p --wait; done
```

Pick a region that appears in the allowed list (the old Function runs in `brazilsouth`).

## 1. Names and secrets file [YOU]

```bash
mkdir -p .local && umask 077
SUF=$(openssl rand -hex 3)
cat > .local/azure.env <<EOF
export SUF=$SUF
export RG=rg-conectacampus
export LOC=brazilsouth
export STORAGE=stcampus$SUF
export SQLSRV=sql-campus-$SUF
export SQLUSER=campusadmin
export SQLPASS='$(openssl rand -base64 24 | tr -d '/+=')Aa1!'
export FUNC=func-campus-$SUF
export APIM=apim-campus-$SUF
export SERVICE_TOKEN=$(openssl rand -hex 32)
export GATEWAY_SECRET=$(openssl rand -hex 32)
export DOCKERUSER=leosmkk
EOF
source .local/azure.env
az group create -n $RG -l $LOC
```

## 2. Storage account (queue + table) [YOU]

```bash
az storage account create -n $STORAGE -g $RG -l $LOC --sku Standard_LRS --kind StorageV2
echo "export STORAGE_CONN='$(az storage account show-connection-string -n $STORAGE -g $RG --query connectionString -o tsv)'" >> .local/azure.env
source .local/azure.env
```

The queue `campus-events` is created by the certificados service and the ledger table by the Function.

## 3. Azure SQL [YOU]

```bash
az sql server create -g $RG -n $SQLSRV -l $LOC -u $SQLUSER -p "$SQLPASS"
az sql db create -g $RG -s $SQLSRV -n conectacampus --use-free-limit --free-limit-exhaustion-behavior AutoPause
az sql server firewall-rule create -g $RG -s $SQLSRV -n AllowAzureServices --start-ip-address 0.0.0.0 --end-ip-address 0.0.0.0
```

- "Free 1 DTU" does not exist; this is the current free serverless offer (auto-pauses, first query can take 30-60 s).
- If the free offer is rejected for your subscription, create a paid Basic database instead: `az sql db create -g $RG -s $SQLSRV -n conectacampus --edition Basic` (about US$5/month).
- The certificados service creates its tables on first start (see `docs/deploy.md`).

## 4. MongoDB Atlas (web console) [YOU]

1. Create a free **M0** cluster, ideally in an Azure region near `$LOC`.
2. Database Access: create a user with read/write on database `conectacampus` only.
3. Network Access: for the demo allow `0.0.0.0/0` (tighten later to the Container Apps outbound IPs).
4. Copy the `mongodb+srv://...` connection string and add it to the secrets file by hand: `echo "export MONGO_URI='...'" >> .local/azure.env`
5. Seed the data if you want the sample events: `mongodb-seed/eventos.json`.

## 5. Azure Function [YOU]

```bash
source .local/azure.env
az functionapp create -g $RG -n $FUNC -s $STORAGE --consumption-plan-location $LOC \
  --runtime node --runtime-version 22 --functions-version 4 --os-type Linux
(cd azure-function && func azure functionapp publish $FUNC --build remote)
az functionapp function list -g $RG -n $FUNC --query "[].name" -o tsv     # expect: enrich, events, campusEvents
echo "export FUNCTION_KEY='$(az functionapp keys list -g $RG -n $FUNC --query functionKeys.default -o tsv)'" >> .local/azure.env
```

Check the app responds: `curl -i https://$FUNC.azurewebsites.net/api/enrich` should answer 401 without the key (that proves it is live and protected).

## 6. Publish the images to Docker Hub [YOU]

You are already logged in as `leosmkk` (checked with `docker info`).

```bash
source .local/azure.env
node scripts/publish-images.mjs $DOCKERUSER v1 --push
for i in bff eventos certificados; do curl -s -o /dev/null -w "$i: %{http_code}\n" https://hub.docker.com/v2/repositories/$DOCKERUSER/conectacampus-$i/; done   # expect 200 = public
```

Image names are `leosmkk/conectacampus-<service>:v1`. Docker Hub does not support the `user/pjbl/image` form; ask the professor to accept this.

## 7. Code and infra changes for API Management [ME, needs your go]

1. **BFF**: reject requests that lack the header `x-gateway-secret` (value from `GATEWAY_SECRET`), except `/health`, so only the gateway can reach it. Today the BFF has no inbound check and no CORS.
2. **Bicep** (`infra/main.bicep`):
   - BFF Container App gets external ingress plus the `GATEWAY_SECRET` secret.
   - New API Management module (Consumption SKU) with an API at `/api`, backend = the BFF URL, and a policy that: sets CORS for the Static Web Apps origin, rate-limits per client IP, and injects `x-gateway-secret`.
   - Drop the Nginx `gateway` and `frontend` container apps (the frontend moves to Static Web Apps); keep them in compose for local use.
   - New parameters: `gatewaySecret`, `apimName`, `apimPublisherName`, `apimPublisherEmail`, `allowedOrigin`.
3. **Frontend**: `frontend/.env.production` -> `VITE_API_URL=https://<apim>.azure-api.net/api`.
4. **CI**: re-enable the Static Web Apps workflow triggers.
5. Update `docs/arc42.md` (ADR 05 now says Nginx), `docs/c4.md` and `docs/links.json`.

**Decision for you:** the APIM publisher email is required by Azure and visible to the portal; tell me which address to use.

## 8. Deploy the containers and APIM [YOU]

```bash
source .local/azure.env
cat > .local/cloud.parameters.json <<EOF
{ "\$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentParameters.json#",
  "contentVersion": "1.0.0.0",
  "parameters": {
    "dockerHubUser":      {"value": "$DOCKERUSER"},
    "tag":                {"value": "v1"},
    "functionUrl":        {"value": "https://$FUNC.azurewebsites.net"},
    "functionKey":        {"value": "$FUNCTION_KEY"},
    "mongoUri":           {"value": "$MONGO_URI"},
    "serviceToken":       {"value": "$SERVICE_TOKEN"},
    "sqlServer":          {"value": "$SQLSRV.database.windows.net"},
    "sqlUser":            {"value": "$SQLUSER"},
    "sqlPassword":        {"value": "$SQLPASS"},
    "storageConnection":  {"value": "$STORAGE_CONN"},
    "gatewaySecret":      {"value": "$GATEWAY_SECRET"},
    "apimName":           {"value": "$APIM"}
  } }
EOF
az bicep build --file infra/main.bicep
az deployment group what-if -g $RG --template-file infra/main.bicep --parameters @.local/cloud.parameters.json
az deployment group create  -g $RG --template-file infra/main.bicep --parameters @.local/cloud.parameters.json
```

Add the remaining APIM parameters (publisher name/email, allowed origin) once step 7 is done. Consumption-tier APIM provisions in several minutes. If the Container Apps pull from Docker Hub fails with a rate-limit error, retry later or add Docker Hub credentials to the apps.

## 9. Smoke test on the cloud URL [YOU or ME]

```bash
node scripts/smoke.mjs https://$APIM.azure-api.net
curl -s -o /dev/null -w "%{http_code}\n" https://<bff-fqdn>/api/eventos      # expect 401/403: BFF is not reachable without the gateway secret
```

The smoke script prefixes `/api` itself, so pass the APIM host without `/api`. It creates and deletes test data and checks the outbox event reaching the Function ledger.

## 10. Static Web Apps frontend [YOU]

Trigger the (re-enabled) workflow, then open `https://happy-pebble-0ff30c50f.3.azurestaticapps.net/` with the browser Network tab open: every request must go to `*.azure-api.net`, none to the Function or the containers.

## 11. Evidence for the delivery [YOU]

- Screenshots with the URL bar visible: Swagger BFF (`/api/docs/`), Swagger eventos and certificados (`/api/docs/?url=/api/specs/eventos`, `.../certificados`), the frontend, and the APIM overview/API page in the Azure portal.
- Fill `docs/links.json` (frontend, gateway, Swagger URLs, Docker Hub, YouTube), then regenerate the PDF with `scripts/build-delivery-pdf.py`.
- Record the video using `docs/video.md`; show only cloud URLs, no secrets.

## 12. When finished or when credit runs low

`az group delete -n $RG --yes --no-wait` removes everything in the resource group. Container Apps with one replica always on, the Function and APIM Consumption use credit continuously or per call.
