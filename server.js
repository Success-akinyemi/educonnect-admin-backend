import express from "express";
import { config } from 'dotenv';
import http from 'http'; 
import { Server } from 'socket.io';
config();

import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import cors from 'cors';

//IMPORT ROUTES
import authRoute from './routes/auth.routes.js';
import AdminRoute from './routes/adminAuth.controllers.js';
import testimonialsRoutes from './routes/testimonials.routes.js';
import subscribeRoutes from './routes/suscribe.routes.js';


//EDUCONNECT
import educonnectContactUsRoutes from './routes/educonnect/contactUs.routes.js';
import educonnectFaqRoutes from './routes/educonnect/faq.routes.js';

//ACN
import acnContactUsRoutes from './routes/acn/contactUs.routes.js';
import acnFaqRoutes from './routes/acn/faq.routes.js';
import acnNewsAndUpdatesRoutes from './routes/acn/newsAndUpdates.routes.js';



// CORS setup
const allowedOrigins = [
    process.env.CLIENT_URL,
    process.env.ADMIN_URL,
    process.env.SERVER_URL,
    '*',
];

const app = express();
const server = http.createServer(app); 
const io = new Server(server, {
    cors: {
        origin: function (origin, callback) {
            console.log('URL ORIGIN', origin);
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS', 'ORIGIN>', origin));
            }
        },
        methods: ["GET", "POST"],
        credentials: true
    }
});

app.use(cookieParser());
app.use(express.json());

app.use(express.urlencoded({ extended: true })); // Parses URL-encoded data

// Set up bodyParser to parse incoming requests
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

const corsOptions = {
    origin: function (origin, callback) {
        console.log('URL ORIGIN', origin);
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS', 'ORIGIN>', origin));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};
app.use(cors(corsOptions));

//DOCs
import swaggerUI from 'swagger-ui-express';
import YAML from 'yamljs';
const swaggerJSDocs = YAML.load('./api.yaml');
app.use('/api-doc', swaggerUI.serve, swaggerUI.setup(swaggerJSDocs));

// Import DB connection
import './connection/db.js';

// ROUTES
app.get('/', (req, res) => {
    res.status(200).json('Home GET Request');
});

app.use('/api/auth', authRoute);
app.use('/api/admin', AdminRoute);
app.use('/api/suscribe', subscribeRoutes);
app.use('/api/testimony', testimonialsRoutes);


//acn
app.use('/api/educonnect/contactUs', educonnectContactUsRoutes);
app.use('/api/educonnect/faq', educonnectFaqRoutes);

//ACN
app.use('/api/acn/contactUs', acnContactUsRoutes);
app.use('/api/acn/faq', acnFaqRoutes);
app.use('/api/acn/newsAndUpdates', acnNewsAndUpdatesRoutes);



// Start server with socket
const PORT = process.env.PORT || 9000;
server.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
});