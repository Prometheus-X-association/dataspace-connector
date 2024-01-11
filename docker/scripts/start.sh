#!/bin/bash

if [ "$ENV" = 'development' ]; then
  npm run build && npm run start
else
  npm run build && npm run start
fi