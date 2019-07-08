import express = require('express');
import bodyParser = require('body-parser')
import { PaymentController, eventController, TicketController } from './Controllers';

const app: express.Application = express();
const port: number = 3000

app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

const event = new eventController();
const ticket = new TicketController();
const payment = new PaymentController();

app.get(/.*\/available-tickets$/, ticket.getAvailableTicketsForEvent);
app.post(/.*\/purchase$/, payment.purchase);
app.get('*', event.getEvent);

app.listen(port, () => {
    console.log(`App running on port ${port}.`)
})