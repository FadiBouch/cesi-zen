#!/bin/sh

if [ "$NODE_ENV" = "development" ]; then
    npm install
fi

exec "$@"