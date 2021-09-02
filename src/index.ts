import "dotenv/config";
import "reflect-metadata";
import { createConnection, getConnection } from "typeorm";
import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";


export const createServer = async () => {
  try {
    await createConnection();
    const app = express();
    app.disable("x-powered-by");
    app.set("trust proxy", 1);
    app.use(express.json());

    let mgStore = MongoStore.create({
      mongoUrl: process.env.TYPEORM_URL,
    });

    app.use(
      session({
        name: "Edvora_Session",
        secret: "wfif98493ufu4f4928",
        resave: false,
        saveUninitialized: true,
        cookie: {
          secure: true,
          maxAge: 1200000,
          httpOnly: true,
        },
        store: mgStore,
      })
    );

    const v1Route = express.Router();
    app.use("/api/v1", v1Route);

    return {app, mgStore, v1Route};
  } catch (error) {
    console.error(error);
  }
};
