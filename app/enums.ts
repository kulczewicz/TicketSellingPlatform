export enum Status {
    OK = 200,
    BADREQUEST = 400,
    UNAUTHORIZED = 401,
    NOTFOUND = 404
}

export enum ErrorMessage {
    notFound = "Not Found",
    emptyBody = "Body is empty",
    emptyTokenAmount = "Token or amount field is empty",
    amountNotANumber = "Amount is not a number",
    outOfTickets = "Out of tickets for that event in that price",
    eventNotExist = "Event does not exist",
    eventNotFound = "Event not found"
}

export enum Roots {
    getEvent = ".*",
    availableTickets = ".*\/available-tickets$",
    purchase = ".*\/purchase$",
    filterGetEvent = "\/",
    filterAvailableTickets = "available-tickets|\/",
    filterPurchase = "purchase|\/"
}