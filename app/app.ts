import express from "express";
import bodyParser from "body-parser";
const dotenv = require('dotenv').config();
import { PaymentController, EventController, TicketController } from './controllers';
import { Roots } from "./enums";

const app: express.Application = express();

if(dotenv.error) {
  throw dotenv.error;
}

app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

const event = new EventController();
const ticket = new TicketController();
const payment = new PaymentController();

app.get(new RegExp(Roots.availableTickets), ticket.getAvailableTicketsForEvent);
app.post(new RegExp(Roots.purchase), payment.purchase);
app.get(new RegExp(Roots.getEvent), event.getEvent);

app.listen(process.env.PORTAPP, () => {
    console.log(`App is running on port ${process.env.PORTAPP}.`)
})