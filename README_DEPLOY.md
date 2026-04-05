# Production Deployment Guide (Docker + Nginx)

This guide provides the necessary files and instructions to host the Nearmee Next.js application using Docker with an Nginx reverse proxy.

## Project Structure for Deployment
To host this website, you need the following files in your root directory:
- `Dockerfile`: Multi-stage, standalone production build.
- `docker-compose.yml`: Orchestrates the Next.js app and Nginx.
- `nginx.conf`: Nginx reverse proxy configuration.
- `.dockerignore`: Optimizes build by excluding unnecessary files.

## Prerequisites
- Docker and Docker Compose installed on the hosting server.
- The `.env.local` file (or provide environment variables to the container).

## Deployment Steps

### 1. Configure Backend API
Ensure the `NEXT_PUBLIC_API_BASE_URL` is correctly set in your environment or a `.env` file in the root directory.

### 2. Build and Start the Containers
Run the following command in the project root:
```bash
docker-compose up --build -d
```
This will:
1. Build the Next.js standalone image (optimized).
2. Start the `nextjs-app` container on its internal network.
3. Start the `nginx` container, exposing it on port 80 and proxying requests to the Next.js app.

### 3. Verify
Access the website via `http://<your-server-ip>`.

---

## Standalone Optimization
This project uses Next.js **Output Standalone** mode (`output: 'standalone'`). This means the build result in `.next/standalone` is a minimal, self-contained Node.js server that doesn't require `node_modules` from the root, significantly reducing the Docker image size.
