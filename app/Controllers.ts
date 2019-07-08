import express = require('express');
import { pool } from "./DatabaseConnector";

abstract class AbstractController {
    askDatabase(arg: any[], query: string) {
        return new Promise((resolve, reject) => {
            pool.query(query, arg, (error: any, results: any) => {
                if (error)
                    throw error;
                else if (results.rows.length === 0)
                    reject({error: "not found"});
                /* In every case we need only one row:
                 * - in getEvent we know there is only one event, as url is a primary key
                 * - in getAvailableTicketsForEvent there is a count aggregate function, so there will be only one result
                 * - in purchase:
                 *   - checking event existence is basically getEvent case
                 *   - when purchasing the ticket we want first available one, order doesn't matter
                 */
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
    /* Payment adapter, which "charges" account, accepting every token, except 'card_error' and 'payment_error'*/
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
    /* Checks, if there are available tickets for that event with provided price, if yes, purchases the ticket */
    purchase(request: express.Request, response: express.Response): void {
        let url: string = request.originalUrl.replace(/purchase|\//g, '');
        /* checks, if request format is correct */
        if (request.body === undefined || request.body === null)  {
            response.status(400).json({error: "Body is empty"});
        } else if (request.body.token === undefined || request.body === null ||
            request.body.amount === undefined || request.body === null) {
            response.status(400).json({error: "Token or amount field is empty"});
        } else if (typeof request.body.amount !== "number") {
            response.status(400).json({error: "Amount is not a number"});
        }
        /* checks, if url is correct and event exists */
        let query = "SELECT url FROM event WHERE url = $1";
        this.askDatabase([url], query).then(() => {
            /* checks, if there are available tickets for that event with that price - we suppose that 
             there can be tickets with different prices. If there are - returns first in row, 
             ticketid is uuid identifier */
            let query: string = `SELECT t.id as ticketid, t.price
                                FROM ticket t JOIN event e ON (t.eventurl = e.url) 
                                WHERE t.available AND e.url = $1 AND t.price = $2;`;
            this.askDatabase([url, request.body.amount], query).then((resolve) => {
                /* charges the account */
                this.charge(request.body.amount, request.body.token).then(() => {
                    /* mark ticket as "unavailable" */
                    let query = "UPDATE ticket SET available = FALSE WHERE id = $1";
                    pool.query(query, [resolve.ticketid], (error: any, results: any) => {
                        if (error)
                            throw error;
                        response.status(200).json(resolve);
                    })
                }).catch((promiseError) => {
                    response.status(401).json({error: promiseError.message});
                })
            }).catch(() => {
                response.status(404).json({error: "Out of tickets for that event in that price"});
            });
        }).catch(() => {
            response.status(404).json({error: "Event does not exist"});
        })
    }
}

export class eventController extends AbstractController {
    constructor() { 
        super();
        this.getEvent = this.getEvent.bind(this);
    }
    /* returns info about the event - event name and timestamp */
    getEvent(request: express.Request, response: express.Response): void {
        let url: string = request.originalUrl.replace(/\//g, '');
        let query: string = "SELECT name, timestamp FROM event WHERE url = $1;";
        this.askDatabase([url], query).then((resolve) => {
            response.status(200).json(resolve);
        }).catch(() => {
            response.status(404).json({error: "Event not found"});
        });
    }
}

export class TicketController extends AbstractController {
    constructor() { 
        super();
        this.getAvailableTicketsForEvent = this.getAvailableTicketsForEvent.bind(this);
    }
    /* returns amount of tickets available for a particular event */
    getAvailableTicketsForEvent(request: express.Request, response: express.Response): void {
        let url: string = request.originalUrl.replace(/available-tickets|\//g, '');
        let query: string = `SELECT count(t.id) AS available 
                            FROM ticket t JOIN event e ON (t.eventurl = e.url) 
                            WHERE t.available AND e.url = $1
                            GROUP BY available;`;
        this.askDatabase([url], query).then((resolve) => {
            response.status(200).json(resolve);
        }).catch(() => {
            response.status(404).json({error: "Event not found"});
        });
    }
}