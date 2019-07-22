import { Status, ErrorMessage } from "./enums";

interface ResolveReject {
    status: Status;
    data?: any;
    error?: ErrorMessage | Error;
}