import { Request, Response } from 'express';
import { pool } from './pool'

interface Event{
  eventId: number,
  name: string,
  date: string,
  availableSeats: number  
}

const getAllEvents = async (request: Request, response: Response): Promise<void> => {
  const page = parseInt(request.params.page) || 1
  const pageSize = parseFloat(request.params.pagesize)

  try {
    const result =  await pool.query('SELECT * FROM event WHERE date > NOW() ORDER BY date ASC')
    const allEvents = result.rows
    const totalEvents = allEvents.length

    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize - 1
    const paginatedEvents = allEvents.slice(startIndex, endIndex)
    const totalPages = Math.ceil(totalEvents / pageSize)

    response.status(200).json({
      currentPage: page,
      pageSize,
      totalPages,
      events: paginatedEvents,
    })
  } catch (error) {
    console.error(error)
    response.status(500).json({ error: 'Error fetching events' })
  }
}

const getEventById = async (eventId: number): Promise<Event> => {
  try {
    const result = await pool.query('SELECT * FROM event WHERE id = $1', [eventId])
    const event = result.rows[0]
    return {
      eventId: event.id,
      name: event.name,
      date: event.date,
      availableSeats: event.available_seats
    }
  } catch (error) {
    console.error(error)
  }
}

const createEvent = async (request: Request, response: Response): Promise<void> => {
  const { name, date, availableSeats } = request.body

  if (new Date(date).getTime() < Date.now()) {
    response.status(400).json({error: 'The event cannot have a past date.'})
  }

  if (availableSeats <= 0) {
    response.status(400).json({error: 'The available seats must be greater than zero.'})
  }

  try {
    const result = await pool.query('INSERT INTO event (name, date, available_seats) VALUES ($1, $2, $3) RETURNING id', [name, date, availableSeats])
    const eventId = result.rows[0].id
    response.status(201).json({
      eventId,
      name,
      date,
      availableSeats
    })
  } catch (error) {
    console.error(error)
    response.status(500).json({ error: 'Error creating event' })
  }
}

const reduceAvailableSeats = async (eventId: number): Promise<void> => {
  try {
    const event = await getEventById(eventId)
    const availableSeats = event.availableSeats
    const newAvailableSeats = availableSeats - 1

    const result = await pool.query('UPDATE event SET available_seats = $1 WHERE id = $2', [newAvailableSeats, eventId])
  } catch (error) {
    console.error(error)
  }
}

const increaseAvailableSeats = async (eventId: number): Promise<void> => {
  try {
    const event = await getEventById(eventId)
    const availableSeats = event.availableSeats
    const newAvailableSeats = availableSeats + 1

    const result = await pool.query('UPDATE event SET available_seats = $1 WHERE id = $2', [newAvailableSeats, eventId])
  } catch (error) {
    console.error(error)
  }
}

export default {
  getAllEvents,
  getEventById,
  createEvent,
  reduceAvailableSeats,
  increaseAvailableSeats
}