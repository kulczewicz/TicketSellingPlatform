# Ticket Selling Platform
This is a simple ticket selling platform API, written in node.js with express and typescript, using PostgreSQL database.
Please ensure you have installed relatively new node.js, npm and Postgres.

To install all the packages, run:
```sh
npm install
```
You need to create test user, create database and fill it with data. In order to do that please type:
```sh
npm run setupdb
```
In order to drop database and delete user, type:
```sh
npm run cleandb
```
Run the server in development mode with:
```sh
npm run dev
```
Run the server in production mode with:
```sh
npm run prod
```

There are three endpoints:
 #### GET localhost:3000/[event-name]
 > returns information about event, namely event name and timestamp
 #### GET localhost:3000/[event-name]/available-tickets
 > returns information about amount of tickets available for [event-name]
 #### POST localhost:3000/[event-name]/purchase
 > Checks, if there are available tickets for [event-name] with provided price, if yes, purchases the ticket.
 > Please provide a body in a following format:
```sh
{
	"token": "pass",
	"amount": 5000
}
```
> "token" is valid for every string, except 'card_error' and 'payment_error'.
> "amount" is a ticket price in Eurocents, should be an integer. 50 Euros (5000 eurocents) is a default price
> of all tickets in the test database. It can be changed in db/setup.sql

[event-name] can have those values:
 - primavera-2019
 - rock-am-ring-2019
 - glastonbury-2019
 - roskilde-2019
 - opener-2019

App is divided into several files:
- app.ts - rooting and listening of requests
- controllers.ts - contains AbstractController class and three classes, corresponding with three endpoints, which inherit after that one abstract class
- module.d.ts - definitions of types
- enums.ts - enums, used in app.ts and controller.ts
- databaseConnector.ts - module, where Pool object is created, which is used in controllers.ts to connect with database

## controllers.ts classes
### AbstractController:
#### askDatabase
Returns Promise, which handles database queries. 
Throws error in case of database error;
rejects, if results is emtpty;
resolves, if result exists, returning first row;
In every case we need only first row:
 - in getEvent we know there is only one event, as url is a primary key
 - in getAvailableTicketsForEvent there is a count aggregate function, so there will be only one result
 - in purchase checking event existence is basically getEvent case
 - when purchasing the ticket we want first available one, order doesn't matter
### PaymentController:
#### charge
Provided payment adapter, which "charges" account, accepting every token, except 'card_error' and 'payment_error'. Is used in purchase method of the same class.
#### checkRequestBody
Checks, if request format is correct. If request body and token and amount are not empty, returns requestBody object, otherwise sends a Bad Request (400) response. Is used in purchase method of the same class.
#### purchase
Endpoint, responsible for purchasing the ticket. Checks, if there are available tickets for that event with provided price. If yes, checks, if there are available tickets for that event with that price - we suppose that there could be tickets with different prices. If there are - charges the account, returns first in row (ticketid is a unique uuid identifier):
```sh
{
    "ticketid": "4ca08c07-e827-4e95-9930-aa5f1fa63a40",
    "price": 5000
}
```
Then marks ticket as unavailable (sold). In case of fault on any stage, responds with correspoding error status and error message.
### EventController:
#### getEvent
Endpoint, which sends information about the event: event name and timestamp.
### TicketController:
#### getAvailableTicketsForEvent
Endpoint, which sends amount of tickets available for a particular event.

## Front End
This app can be represented on frontend as a set of pages of different events. Each of them should have information about name and time of event and available tickets for that event. If there are available tickets, a window with option to purchase should be displayed, otherwise information that there are no available tickets should be displayed.