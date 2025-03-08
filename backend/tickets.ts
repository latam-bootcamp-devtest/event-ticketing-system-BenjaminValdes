import { Request, Response } from 'express';
import { pool } from './pool'
import EventsFunctions from './events'

interface Ticket {
  ticketId: number,
  userId: number,
  eventId: number,
}

const createTicket = async (request: Request, response: Response): Promise<void> => {
  const { userId, eventId } = request.body
  const event = await EventsFunctions.getEventById(eventId)
  
  if (!event) {
    response.status(404).json({error: 'The event has not been found.'})
  }

  if (eventId.available_seats <= 0) {
    response.status(409).json({error: 'There are no more seats available.'})
  }

  try {
    const result = await pool.query('INSERT INTO ticket (user_id, event_id) VALUES ($1, $2) RETURNING id', [userId, eventId])
    const ticketId = result.rows[0].id
    EventsFunctions.reduceAvailableSeats(eventId)
    response.status(201).json({
      ticketId,
      userId,
      eventId
    })
  } catch (error) {
    console.error(error)
    response.status(500).json({ error: 'Error creating ticket.' })
  }
}

const getTicketById = async (eventId: number): Promise<Ticket> => {
  try {
    const result = await pool.query('SELECT * FROM ticket WHERE id = $1', [eventId])
    const ticket = result.rows[0]
    return {
      ticketId: ticket.id,
      userId: ticket.user_id,
      eventId: ticket.event_id
    }
  } catch (error) {
    console.error(error)
  }
}

const deleteTicket = async (request: Request, response: Response): Promise<void> => {
  const id = parseInt(request.params.id)

  const ticket = await getTicketById(id)
  const event = await EventsFunctions.getEventById(id)
  
  if (!ticket) {
    response.status(404).json({error: 'The ticket has not been found.'})
  }

  if (new Date(event.date).getTime() < Date.now()) {
    response.status(400).json({error: 'Can not cancel past events.'})
  }

  try {
    const result = await pool.query('DELETE FROM ticket WHERE id = $1', [id])
    EventsFunctions.increaseAvailableSeats(id)
    response.status(204).json('')
  } catch (error) {
    console.error(error)
    response.status(404).json({ error: `Error when deleting the ticket with id: ${id}.` })
  }

}

export default {
  createTicket,
  deleteTicket
}