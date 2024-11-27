#!/bin/bash

if [ "$ENV" = 'development' ]; then
  npm run dev --development
else
  npm run build && npm run start
fi
