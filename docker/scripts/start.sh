#!/usr/bin/env bash

set -e
trap 'echo "Caught stop signal! Exiting..."; exit 0;' INT TERM
trap 'echo "Caught error! Exiting..."; exit 1;' ERR

if [ "$ENV" = 'development' ]; then
  npm run dev --development &
else
  npm run build && npm run start &
fi

wait ${!}
