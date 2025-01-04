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
import newsLetterRoutes from './routes/newsLetter.routes.js';
import notificationRoutes from './routes/notification.routes.js';




//EDUCONNECT
import educonnectContactUsRoutes from './routes/educonnect/contactUs.routes.js';
import educonnectFaqRoutes from './routes/educonnect/faq.routes.js';
import educonnectTeamMembersRoutes from './routes/educonnect/team.routes.js';

//ACN
import acnContactUsRoutes from './routes/acn/contactUs.routes.js';
import acnFaqRoutes from './routes/acn/faq.routes.js';
import acnNewsAndUpdatesRoutes from './routes/acn/newsAndUpdates.routes.js';
import acnTeamMembersRoutes from './routes/acn/team.routes.js';
import acnAmbassdorRoutes from './routes/acn/ambassadors.routes.js';
import acnDonationsRoutes from './routes/acn/donation.routes.js';
import acnStroiesRoutes from './routes/acn/stories.routes.js';


//AREWA HUB
import arewaProductRoutes from './routes/arewahub/product.route.js'
import arewaOrdersRoutes from './routes/arewahub/orders.routes.js'
import arewaEventsRoutes from './routes/arewahub/event.routes.js'
import arewaFaqRoutes from './routes/arewahub/faq.routes.js';
import arewaContactUsRoutes from './routes/arewahub/contactUs.routes.js';
import arewaTeamMembersRoutes from './routes/arewahub/team.routes.js';


//EDUCONNECT
import eduafricaContactUsRoutes from './routes/eduafrica/contactUs.routes.js';
import eduafricaTeamMembersRoutes from './routes/eduafrica/team.routes.js';



// CORS setup
const allowedOrigins = [
    process.env.CLIENT_URL,
    process.env.ADMIN_URL,
    process.env.SERVER_URL,
    process.env.ADMIN_FALLBACK_URL,
    process.env.DEV_URL,
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
app.set('trust proxy', true);

app.use(cookieParser());
app.use(express.json());

app.use(express.urlencoded({ extended: true })); // Parses URL-encoded data

app.use(express.json({ limit: '500mb' })); // Adjust the limit as needed
app.use(express.urlencoded({ limit: '500mb', extended: true }));


// Set up bodyParser to parse incoming requests
app.use(bodyParser.json({ limit: '500mb' }));
app.use(bodyParser.urlencoded({ limit: '500mb', extended: true }));

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
app.use('/api/newsLetter', newsLetterRoutes);
app.use('/api/notification', notificationRoutes);



//EDUCONNECT
app.use('/api/educonnect/contactUs', educonnectContactUsRoutes);
app.use('/api/educonnect/faq', educonnectFaqRoutes);
app.use('/api/educonnect/team', educonnectTeamMembersRoutes)

//ACN
app.use('/api/acn/contactUs', acnContactUsRoutes);
app.use('/api/acn/faq', acnFaqRoutes);
app.use('/api/acn/newsAndUpdates', acnNewsAndUpdatesRoutes);
app.use('/api/acn/story', acnStroiesRoutes)
app.use('/api/acn/team', acnTeamMembersRoutes)
app.use('/api/acn/ambassdor', acnAmbassdorRoutes)
app.use('/api/acn/donation', acnDonationsRoutes)


//AREWA HUB
app.use('/api/arewahub/product', arewaProductRoutes)
app.use('/api/arewahub/orders', arewaOrdersRoutes)
app.use('/api/arewahub/events', arewaEventsRoutes)
app.use('/api/arewahub/faq', arewaFaqRoutes)
app.use('/api/arewahub/contactUs', arewaContactUsRoutes)
app.use('/api/arewahub/team', arewaTeamMembersRoutes)


//EDU AFRICA
app.use('/api/eduafrica/contactUs', eduafricaContactUsRoutes);
app.use('/api/eduafrica/team', eduafricaTeamMembersRoutes)


// Start server with socket
const PORT = process.env.PORT || 9000;
server.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
});