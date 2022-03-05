#!/bin/sh

set -e

npx react-inject-env set && npx http-server -p ${WEB_PORT:-3000} build
