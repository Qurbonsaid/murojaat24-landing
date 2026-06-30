# Murojaat24 Public Landing

Standalone public-facing landing project for Murojaat24.

This project is intentionally separated from the internal ecosystem/dashboard app and contains only public routes:
- `/`
- `/murojaat-yuborish`
- `/kuzatish`
- `/baholash`
- `/statistika`

## Run locally

```bash
npm install
npm run dev
```

## Environment

- `VITE_BASE_URL` - backend API base URL (default: `http://localhost:8080`).
	Set this in `.env.development` for local work and in hosting env vars for production.

## Build

```bash
npm run build
npm run preview
```

## Deployment

Deploy the contents of the `dist/` folder to your public domain hosting.

## Notes

- No auth or role selection entry points are exposed in the public route config.
- This repository is intended for separate CI/CD and domain deployment.
