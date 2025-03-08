import express, { Request, Response } from 'express'
import 'dotenv'

const app = express();
const port = process.env.PORT ?? 3000;

app.get('/', (request: Request, response: Response) => {
  response.send('Hello World');
})

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
})