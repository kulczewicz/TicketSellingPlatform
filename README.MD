# Ticket Selling Platform
First of all, you need to create test user, create database and fill it with data, in order to do that please type
```sh
make
```
to drop database and delete user, type
```sh
make clean
```
To start the development environment:
```sh
npm run dev
```
To run the server in production mode:
```sh
npm run prod
```
Application is running on port 3000.

There are basically three endpoints:
 #### GET localhost:3000/[event-name]
 > returns information about event, namely event name and timestamp
 #### GET localhost:3000/[event-name]/available-tickets
 > returns information about amount of tickets available for that particular event
 #### POST localhost:3000/[event-name]/purchase
 > Checks, if there are available tickets for that event with provided price, if yes, purchases the ticket
 > Please provide a body in a following format:
```sh
{
	"token": "pass",
	"amount": 5000
}
```
> "token" is valid for every string, except 'card_error' and 'payment_error'
> "amount" is a ticket price in Eurocents, should be an integer. 50 Euros (5000 eurocents) is a default price
> of all tickets in the database

[event-name] can have those values:
 - primavera-2019
 - rock-am-ring-2019
 - glastonbury-2019
 - roskilde-2019
 - opener-2019
