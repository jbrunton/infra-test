#!/bin/sh

set -e

export COMPOSE_FILE=docker-compose.yml

CONFIG_DIR=build/config
ENV_FILE=$CONFIG_DIR/.env

rm -f $ENV_FILE

cat <<END >> $ENV_FILE
TAG=${TAG?}
POSTGRES_LOCAL_PORT=5678
END

# Build images
docker compose --env-file $ENV_FILE build
docker compose --env-file $ENV_FILE push

# Remove build contexts from compose file, so that we can run the app without worrying about
# directory structure
cat docker-compose.yml | ytt -f - -f build/rm-contexts.yml > $CONFIG_DIR/docker-compose.yml

# Generate ImagesLock configuration
docker compose --env-file $ENV_FILE config | kbld -f - --imgpkg-lock-output $CONFIG_DIR/.imgpkg/images.yml

imgpkg push -b jbrunton/infra-test_config:$TAG -f $CONFIG_DIR
