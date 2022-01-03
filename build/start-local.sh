#!/bin/bash
set -e

# Builds and starts the app locally for integration tests in CI

cp .env.example .env

docker compose build
docker compose up --no-build -d

npx wait-on http://localhost:3002

docker compose exec api npx knex migrate:latest
