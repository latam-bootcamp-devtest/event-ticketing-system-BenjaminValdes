import { Router, Request, Response } from "express";
import EventsFunctions from './events'
import TicketsFunctions from './tickets'
import 'dotenv/config'

const router = Router()

router.get('/events/:page/:pagesize', EventsFunctions.getAllEvents)
router.post('/events', EventsFunctions.createEvent)
router.post('/tickets', TicketsFunctions.createTicket)
router.delete('/tickets/:id', TicketsFunctions.deleteTicket)

export default router