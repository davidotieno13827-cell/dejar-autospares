Postgres Deployment & Vercel setup

This document explains how to make the site work on a managed Postgres database (production) and how to deploy to Vercel.

1) Prepare managed Postgres
- Create a Postgres database using a provider (Supabase, Neon, Railway, Render, AWS RDS, Google Cloud SQL).
- Note the connection string. Prefer this explicit SQLAlchemy format:
  postgresql+psycopg2://<user>:<password>@<host>:<port>/<dbname>

2) Local test and migrations
- Install dependencies:

```bash
python -m pip install -r requirements.txt
```

- Set environment variable for local testing (PowerShell example):

```powershell
$env:DATABASE_URL = 'postgresql+psycopg2://user:pass@host:5432/deejar_auto_db'
$env:FLASK_APP = 'migrate.py'  # use migrate.py for Flask-Migrate commands
```

Initialize migrations (one-time, locally or in CI):

```bash
# Using Flask CLI (FLASK_APP=migrate.py)
flask db init
flask db migrate -m "Initial migration"
flask db upgrade

# Or run the helper script which will init/migrate/upgrade programmatically
python run_migrations.py
```

Notes:
- `flask db init` creates the `migrations/` folder. Commit that folder to your repo to enable CI/automated upgrades.
- If you prefer not to use migrations immediately, you can run the app with a local SQLite for development — the code will auto-create tables for `sqlite:` URIs.

3) Vercel configuration
- In your Vercel project settings -> Environment Variables, set the following variables for the `Production` environment:
  - `DATABASE_URL` = your Postgres connection string
  - `SECRET_KEY` = a secure random string
  - `FLASK_DEBUG` = `0`
  - `SMTP_SERVER`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `NOTIFICATION_EMAIL` as needed
  - `AUTHORIZED_ADMIN_EMAILS` if you use the admin endpoints
  - `GOOGLE_CLIENT_ID` for admin OAuth

4) Applying migrations in production
- Recommended: use a CI step or a small admin script to run `flask db upgrade` after deploy.
- Alternatively, run the migrations locally against the production DB (with care).

5) Troubleshooting
- If you see `FUNCTION_INVOCATION_FAILED` or 500s on Vercel, check logs → the likely causes are:
  - The function tried to write to local disk (SQLite) — use a managed DB instead.
  - Import-time exceptions — make sure `DATABASE_URL` is set and reachable.
  - Missing Python packages — ensure `requirements.txt` is up-to-date and Vercel has installed them.

6) Quick test run locally (sqlite fallback)

```bash
# run with sqlite (no external DB)
python app.py
# then browse http://localhost:5000/api/health
```


If you'd like, I can add an Alembic `migrations/` folder and an initial migration, but to apply it I will need access to a Postgres instance or you can run the commands locally and commit the generated `migrations/` files and push them.
