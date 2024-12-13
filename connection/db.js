import mongoose from "mongoose";
import { config } from 'dotenv';
config();

mongoose.connect(`${process.env.MONGODB_URI}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Connected to DB'))
.catch((err) => console.log(err));