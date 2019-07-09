interface Ticket {
    ticketid: string;
    price: number;
}

interface Event {
    name: string;
    timestamp: Date;
}

interface RequestBody {
    token: string;
    amount: number;
}

interface Available {
    available: number;
}