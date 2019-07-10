import express from "express";
import { pg } from "./pg";
import { QueryResult } from 'pg';
import { Status, ErrorMessage } from "./enums";

abstract class AbstractController {
    askDatabase(arg: any[], query: string) {
        return new Promise((resolve, reject) => {
            pg.query(query, arg, (error: Error, results: QueryResult) => {
                if (error)
                    throw error;
                else if (results.rows.length === 0)
                    reject({error: ErrorMessage.notFound});
                resolve(results.rows[0]);
            })
        })
    }
}

export class PaymentController extends AbstractController {
    constructor() {
        super();
        this.purchase = this.purchase.bind(this);
    }
    charge(amount: number, token: string, currency: string = 'EUR') {
        return new Promise((resolve, reject) => {
            switch (token) {
                case 'card_error':
                    return reject(new Error('Your card has been declined.'));
                case 'payment_error':
                    return reject(new Error('Something went wrong with your transaction.'));
                default:
                    resolve({ amount, currency });
            }
        })
    }
    checkRequestBody(request: express.Request, response: express.Response, body: RequestBody): boolean {
        if (!request.body)  {
            response.status(Status.BADREQUEST).json({error: ErrorMessage.emptyBody});
            return false;
        } else if (!request.body.token || !request.body.amount) {
            response.status(Status.BADREQUEST).json({error: ErrorMessage.emptyTokenAmount});
            return false;
        } else if (typeof request.body.amount !== "number") {
            response.status(Status.BADREQUEST).json({error: ErrorMessage.amountNotANumber});
            throw ErrorMessage.amountNotANumber;
        }
        body.token = request.body.token;
        body.amount = request.body.amount;
        return true;
    }
    purchase(request: express.Request, response: express.Response): void {
        const url: string = request.params.event;
        const body = {} as RequestBody;
        if(this.checkRequestBody(request, response, body)) {
            const query = "SELECT url FROM event WHERE url = $1";
            this.askDatabase([url], query).then(() => {
                const query: string = `SELECT t.id as ticketid, t.price
                                    FROM ticket t JOIN event e ON (t.eventurl = e.url) 
                                    WHERE t.available AND e.url = $1 AND t.price = $2;`;
                this.askDatabase([url, body.amount], query).then((resolve) => {
                    const ticket: Ticket = <Ticket>resolve;
                    this.charge(body.amount, body.token).then(() => {
                        const query = "UPDATE ticket SET available = FALSE WHERE id = $1";
                        pg.query(query, [ticket.ticketid], (error: Error, results: QueryResult) => {
                            if (error)
                                throw error;
                            response.status(Status.OK).json(ticket);
                        })
                    }).catch((promiseError) => {
                        response.status(Status.UNAUTHORIZED).json({error: promiseError.message});
                    })
                }).catch(() => {
                    response.status(Status.NOTFOUND).json({error: ErrorMessage.outOfTickets});
                });
            }).catch(() => {
                response.status(Status.NOTFOUND).json({error: ErrorMessage.eventNotExist});
            })
        }
    }
}

export class EventController extends AbstractController {
    constructor() { 
        super();
        this.getEvent = this.getEvent.bind(this);
    }
    getEvent(request: express.Request, response: express.Response): void {
        const url: string = request.params.event;
        const query: string = "SELECT name, timestamp FROM event WHERE url = $1;";
        this.askDatabase([url], query).then((resolve) => {
            response.status(Status.OK).json(<Event>resolve);
        }).catch(() => {
            response.status(Status.NOTFOUND).json({error: ErrorMessage.eventNotFound});
        });
    }
}

export class TicketController extends AbstractController {
    constructor() { 
        super();
        this.getAvailableTicketsForEvent = this.getAvailableTicketsForEvent.bind(this);
    }
    getAvailableTicketsForEvent(request: express.Request, response: express.Response): void {
        const url: string = request.params.event;
        const query: string = `SELECT count(t.id) AS available 
                            FROM ticket t JOIN event e ON (t.eventurl = e.url) 
                            WHERE t.available AND e.url = $1
                            GROUP BY available;`;
        this.askDatabase([url], query).then((resolve) => {
            response.status(Status.OK).json(<Available>resolve);
        }).catch(() => {
            response.status(Status.NOTFOUND).json({error: ErrorMessage.eventNotFound});
        });
    }
}