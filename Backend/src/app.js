import express from "express"
import cors from "cors"

const app = express();

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({extended:true}));

import router from "./routes/school.routes.js";

app.use('/',router)

export {app};