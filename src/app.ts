import "dotenv/config";
import express, { Application, NextFunction, Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import path from "node:path";
import { handleError, validateToken } from "./middleware";
import { ErrorHandler } from "./helper";
import { corsOptions } from "./config";
// import { v1 } from "./modules";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

const app: Application = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // return rate limit info in RateLimit-* headers
  legacyHeaders: false, // disable X-RateLimit-* headers
  message: { message: "Too many requests, please try again later." },
});

app
  .use(helmet())
  .use(cors(corsOptions))
  .use(
    bodyParser.urlencoded({
      limit: "100mb",
      extended: true,
      parameterLimit: 50000,
    }),
  )
  .use(bodyParser.json({ limit: "100mb" }))
  .use(cookieParser())
  .use(express.static(path.join(__dirname, "public")));

app.use(limiter);
app.use(validateToken);
// app.use("/v1", v1);
app.use((err: ErrorHandler, _req: Request, res: Response, _next: NextFunction) => {
  handleError(err, res);
});

export default app;
