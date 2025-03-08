import { Request, Response } from 'express';
import { pool } from './pool'
import EventsFunctions from './events'

interface Ticket{
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

export default {
  createTicket,
}