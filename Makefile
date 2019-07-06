all:
	@psql -c "CREATE ROLE ticketadmin WITH LOGIN PASSWORD 'TicketPlatform';"
	@psql -c "ALTER ROLE ticketadmin CREATEDB;"
	@psql -c "CREATE DATABASE ticketapi;" -U ticketadmin postgres
	@psql -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";" ticketapi
	@psql -f setup.sql -U ticketadmin ticketapi
clean:
	@sudo psql -U postgres -c "DROP DATABASE IF EXISTS ticketapi;"
	@sudo psql -U postgres -c "DROP USER IF EXISTS ticketadmin;"