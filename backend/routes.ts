import { Router, Request, Response } from "express";
import { Pool } from 'pg'
import 'dotenv/config'

const router = Router()

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT)
})

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
    console.log
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

router.post('/events', createEvent)

export default router