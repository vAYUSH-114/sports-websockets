import express from 'express';
const app = express();
const port = 8000;
import { matchRouter } from './routes/matches.js'

app.use(express.json());

app.get('/', (req, res) => {
    res.send('helo');
})

app.use("/matches", matchRouter)

app.listen(port, () => (console.log(`server starts running on port: 8000`)))