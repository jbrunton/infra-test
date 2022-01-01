#!/bin/sh

set -e

npx react-inject-env set && npx http-server -p 3000 build
