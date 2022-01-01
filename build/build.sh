#!/bin/sh

export COMPOSE_FILE=docker-compose.yml

CONFIG_DIR=build/config
ENV_FILE=$CONFIG_DIR/.env

rm -f $ENV_FILE

cat <<END >> $ENV_FILE
TAG=${ENV_NAME?}
API_ADDRESS=http://test-droplet-${ENV_NAME}.infra-test.jbrunton-aws.com/api
POSTGRES_LOCAL_PORT=5678
END

# Build images
docker compose --env-file $ENV_FILE build
docker compose --env-file $ENV_FILE push

# Generate 'standalone' compose config (with interpolated vars and without build contexts)
docker compose --env-file $ENV_FILE config | \
  ytt -f - -f build/rm-contexts.yml > $CONFIG_DIR/docker-compose.yml

# Generate ImagesLock configuration
kbld -f $CONFIG_DIR/docker-compose.yml --imgpkg-lock-output $CONFIG_DIR/.imgpkg/images.yml

imgpkg push -b jbrunton/infra-test_config:$ENV_NAME -f $CONFIG_DIR
