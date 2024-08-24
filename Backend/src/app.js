import express from "express"
import rateLimit from 'express-rate-limit';
import cors from "cors"

const app = express();

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    headers: true // Include rate limit info in the response headers
});

// Apply rate limiting to all routes
app.use(apiLimiter);

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({extended:true}));

import router from "./routes/school.routes.js";

app.use('/',router)

export {app};