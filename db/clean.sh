#!/bin/bash
source .env
sudo psql -U postgres -c "DROP DATABASE IF EXISTS $DATABASE;"
sudo psql -U postgres -c "DROP ROLE IF EXISTS $ROLE;"