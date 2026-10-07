# Netlify deployment

Create a Netlify site from this repository and set the base directory to
`rostrix-frontend` if the repository also contains the backend. The included
`netlify.toml` builds the Create React App frontend and rewrites client-side
routes to `index.html`.

Set these variables in Netlify's site build settings before deploying:

| Variable | Value |
| --- | --- |
| `REACT_APP_ENV` | `PROD` |
| `REACT_APP_BASE_URL` | The deployed Render backend URL, including a trailing slash |
| `REACT_APP_AUTHORITY_URL` | Identity-provider authorization base URL |
| `REACT_APP_FEDID_CLIENTID` | OAuth client ID registered for this site |
| `REACT_APP_FEDID_RESPONSE_TYPE` | `code` |
| `REACT_APP_FEDID_REDIRECT_URI` | This Netlify site's callback/redirect URL |
| `REACT_APP_FIREBASE_API_KEY`, `REACT_APP_FIREBASE_AUTH_DOMAIN`, `REACT_APP_FIREBASE_PROJECT_ID`, `REACT_APP_FIREBASE_STORAGE_BUCKET`, `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`, `REACT_APP_FIREBASE_APP_ID`, `REACT_APP_FIREBASE_MESSAGING_VAPID_KEY` | Firebase web-app settings, if Firebase features are used |
| `REACT_APP_GRAVITEE_API_KEY` | Gravitée API key, if those API calls are used |

`REACT_APP_*` values are embedded in the browser bundle at build time; never
put server-side secrets in them. Register the Netlify redirect URI with the
identity provider and configure the same Netlify URL as `BASE_PATH` on Render.
