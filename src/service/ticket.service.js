import TicketModel from '../models/ticket.model.js';
import { v4 as uuidv4 } from 'uuid';

class TicketService {
    async createTicket(purchaseData) {
        const ticketData = {
            code: uuidv4(),
            purchase_datetime: new Date(),
            amount: purchaseData.amount,
            purchaser: purchaseData.purchaser,
        };

        const newTicket = new TicketModel(ticketData);
        return await newTicket.save();
    }

    async getTickets() {
        return await TicketModel.find();
    }

    async getTicketById(id) {
        return await TicketModel.findById(id);
    }
}

export default TicketService;