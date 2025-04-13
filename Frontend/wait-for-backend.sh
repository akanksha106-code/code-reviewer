#!/bin/sh
set -e

host="$1"
shift
cmd="$@"

until wget -q --spider http://$host:3000/test; do
  echo "Backend is unavailable - sleeping"
  sleep 2
done

echo "Backend is up - executing command"
exec $cmd
