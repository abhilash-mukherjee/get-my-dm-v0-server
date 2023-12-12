import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import bodyParser from 'body-parser';
import { influencerRouter } from './routes/influencer';
require('dotenv').config();
const app = express()
const port = process.env.PORT || 3000

app.use(cors());
app.use(bodyParser.json());
app.use('/influencer',influencerRouter);
app.get('/', (req, res) => { res.json({ message: 'Hello World!!!' })});
app.listen(port, () => { console.log(`Example app listening on port ${port}`)});

if (process.env.MONGODB_URL) {
  mongoose.connect(process.env.MONGODB_URL).then(() => console.log('connected to DB'));
}
else {
  throw new Error('MONGODB_URL is not set');
}