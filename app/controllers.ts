import express from "express";
import { pg } from "./pg";
import { QueryResult } from 'pg';
import { Status, ErrorMessage } from "./enums";
import { ResolveReject } from "./module"

abstract class AbstractController {
    askDatabase(arg: any[], query: string, errorObj: ResolveReject): Promise<ResolveReject> {
        return new Promise((resolve, reject) => {
            pg.query(query, arg, (databaseError: Error, results: QueryResult) => {
                if (databaseError)
                    return reject({status: Status.SERVERERROR, error: databaseError});
                else if (results.rows.length === 0)
                    return reject(errorObj);
                return resolve({status: Status.OK , data: results.rows[0]});
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
    checkRequestBody(request: express.Request): ResolveReject {
        if (!request.body)  {
            return { status: Status.BADREQUEST, error: ErrorMessage.emptyBody };
        } else if (!request.body.token || !request.body.amount) {
            return { status: Status.BADREQUEST, error: ErrorMessage.emptyTokenAmount };
        } else if (typeof request.body.amount !== "number") {
            return { status: Status.BADREQUEST, error: ErrorMessage.amountNotANumber };
        }
        return { status: Status.OK };
    }
    purchase(request: express.Request, response: express.Response) {
        const url: string = request.params.event;
        const check: ResolveReject = this.checkRequestBody(request);
        if(check.status === Status.OK) {
            const query: string = "SELECT url FROM event WHERE url = $1";
            const error: ResolveReject = { status: Status.NOTFOUND, error: ErrorMessage.eventNotExist };
            this.askDatabase([url], query, error).then(() => {
                const query: string = `SELECT t.id as ticketid, t.price
                                    FROM ticket t JOIN event e ON (t.eventurl = e.url) 
                                    WHERE t.available AND e.url = $1 AND t.price = $2;`;
                const error: ResolveReject = { status: Status.NOTFOUND, error: ErrorMessage.outOfTickets };
                this.askDatabase([url, request.body.amount], query, error).then((resolve) => {
                    this.charge(request.body.amount, request.body.token).then(() => {
                        const query = "UPDATE ticket SET available = FALSE WHERE id = $1";
                        pg.query(query, [resolve.data.ticketid], (datatbaseError: Error) => {
                            if (datatbaseError)
                                return response.status(Status.SERVERERROR).json({error: datatbaseError});
                            return response.status(resolve.status).json(resolve.data);
                        })
                    }).catch((promiseError) => {
                        return response.status(Status.UNAUTHORIZED).json({
                            error: promiseError.message
                        });
                    })
                }).catch((errorObj) => {
                    return response.status(error.status).json({error: errorObj.error});
                });
            }).catch((errorObj) => {
                return response.status(error.status).json({error: errorObj.error});
            })
        } else {
            return response.status(check.status).json({error: check.error});
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
        const error: ResolveReject = { status: Status.NOTFOUND, error: ErrorMessage.eventNotFound };
        this.askDatabase([url], query, error).then((resolve) => {
            return response.status(resolve.status).json(resolve.data);
        }).catch((errorObj) => {
            return response.status(errorObj.status).json({error: errorObj.error});
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
        const error: ResolveReject = { status: Status.NOTFOUND, error: ErrorMessage.eventNotFound };
        this.askDatabase([url], query, error).then((resolve) => {
            return response.status(resolve.status).json(resolve.data);
        }).catch((errorObj) => {
            return response.status(errorObj.status).json({error: errorObj.error});
        });
    }
}