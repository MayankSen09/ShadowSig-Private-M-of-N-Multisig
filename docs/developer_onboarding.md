# Developer Onboarding & Local Setup Guide

Welcome to **ShadowSig**! This guide is designed to help you set up your local development environment and understand the codebase architecture.

## Prerequisites

Before beginning, make sure you have the following installed on your machine:

- **Node.js**: Version 20.x or higher (recommended: LTS)
- **Bun**: Version 1.1.x or higher (fast JS/TS package manager)
- **Rust**: Version 1.82+ (via `rustup`)
- **Docker & Docker Compose**: For running local databases (PostgreSQL 16) and services.

---

## Workspace Layout

Our project is a monorepo organized as follows:
- `/apps/web`: Next.js 16 frontend interface.
- `/apps/api`: Axum (Rust) API gateway routing and orchestrator.
- `/packages/crypto`: Client-side cryptography tools for Merkle tree paths and commitments.
- `/docs`: Technical specifications, architecture, and threat models.
- `/scripts`: Utility scripts for seeding, local validators, and demos.

---

## Local Setup Instructions

### 1. Database & Middleware
Spin up PostgreSQL, Redis, and NATS using Docker Compose:
```bash
docker compose -f infrastructure/docker/docker-compose.yml up -d postgres redis nats
```

### 2. Frontend Development
Install JS dependencies and launch the Next.js development server:
```bash
cd apps/web
bun install
bun run dev
```
The frontend is available at `http://localhost:3000`.

### 3. Backend Development
Run the API Gateway server:
```bash
cd apps/api
cargo run
```
The API is available at `http://localhost:8080`.

---

## Troubleshooting Guide (Windows Users)

### Rust Compilers & Toolchains
If you receive compilation errors such as `linker link.exe not found` or `failed to find tool gcc.exe`:
1. **MSVC Linker Missing**: Install "Build Tools for Visual Studio" with the "Desktop development with C++" workload. This installs `link.exe`.
2. **GNU Toolchain Override**: If you prefer MinGW/GCC, set your default rustup toolchain to GNU:
   ```powershell
   rustup default stable-x86_64-pc-windows-gnu
   ```
   Ensure `gcc.exe` and `mingw` binaries are in your environment's `PATH`.
