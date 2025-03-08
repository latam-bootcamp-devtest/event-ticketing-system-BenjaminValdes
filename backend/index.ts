import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import 'dotenv';
import router from './routes';

const app = express();
const port = process.env.PORT ?? 3000;
app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

app.get('/', (request: Request, response: Response) => {
  response.send('Hello World');
})

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
})

app.use('/api', router)