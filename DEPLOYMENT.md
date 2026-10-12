# Netlify deployment

Create a Netlify site from this repository and set the base directory to
`rostrix-frontend` if the repository also contains the backend. The included
`netlify.toml` builds the Create React App frontend and rewrites client-side
routes to `index.html`.

Set these variables in Netlify's site build settings before deploying:

| Variable | Value |
| --- | --- |
| `REACT_APP_ENV` | `PROD` |
| `REACT_APP_BASE_URL` | `https://rostrix-backend.onrender.com/` (keep the trailing slash) |
| `REACT_APP_AUTHORITY_URL` | `https://preprod.idpdecathlon.oxylane.com/` only when using the matching preprod OAuth client; production value must come from the identity-provider admin |
| `REACT_APP_FEDID_CLIENTID` | OAuth client ID registered for this site |
| `REACT_APP_FEDID_RESPONSE_TYPE` | `code` |
| `REACT_APP_FEDID_REDIRECT_URI` | `https://crewflow.netlify.app/` (if this is still the site's URL; register this exact URL with the identity provider) |
| `REACT_APP_GRAVITEE_API_KEY` | Gravitée API key, if those API calls are used |

Firebase web-push messaging is currently disabled in the frontend, so its
`REACT_APP_FIREBASE_*` variables can be omitted. To re-enable it later, set
the values from the Firebase Console web-app configuration and Cloud
Messaging settings, then enable messaging in `src/firebase/firebase.ts`.
`REACT_APP_GRAVITEE_API_KEY` is sent by the frontend with API
requests; get the correct key from the API gateway/Gravitee administrator.
Do not use placeholder text as a value. If the Gravitee integration is not
used, verify API access before omitting its key.

`REACT_APP_*` values are embedded in the browser bundle at build time; never
put server-side secrets in them. Register the Netlify redirect URI with the
identity provider and configure the same Netlify URL as `BASE_PATH` on Render.
For the current site, set Render's `BASE_PATH` to
`https://crewflow.netlify.app/`. In Netlify, open **Site configuration →
Environment variables**, add the values above, save, then trigger a new
deploy so the frontend is rebuilt with the Render backend URL. Do not put the
backend URL in Netlify's Base directory setting.

For reference, the current Netlify environment variable list is:

```text
REACT_APP_ENV=PROD
REACT_APP_BASE_URL=https://rostrix-backend.onrender.com/
REACT_APP_AUTHORITY_URL=https://preprod.idpdecathlon.oxylane.com/
REACT_APP_FEDID_CLIENTID=<client ID from the matching identity-provider environment>
REACT_APP_FEDID_RESPONSE_TYPE=code
REACT_APP_FEDID_REDIRECT_URI=https://crewflow.netlify.app/
REACT_APP_GRAVITEE_API_KEY=<from API gateway/Gravitee administrator>
```

The preprod authority URL is valid only with a matching preprod OAuth client
and backend OAuth configuration. Use the production authority URL and client
ID for production; obtain them from the identity-provider administrator.
Replace placeholders with real values; never expose server-side secrets in
Netlify variables.
