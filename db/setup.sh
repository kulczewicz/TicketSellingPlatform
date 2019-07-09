#!/bin/bash
source .env
psql -c "CREATE ROLE $ROLE WITH LOGIN PASSWORD '$PASSWORD';"
psql -c "ALTER ROLE $ROLE CREATEDB;"
psql -c "CREATE DATABASE $DATABASE;" -U $ROLE postgres
psql -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";" $DATABASE
psql -f db/setup.sql -U $ROLE $DATABASE