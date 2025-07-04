import express from "express";
import cors from "cors";
import routes from "./router/index.route.js";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

app.use(routes); 
export default app;
