import "dotenv/config";
import "reflect-metadata";
import { createConnection, getConnection } from "typeorm";
import express from "express";
import bcryptjs from "bcryptjs";
import session from "express-session";
import MongoStore from "connect-mongo";
import { User } from "./entity/User";

(async () => {
  try {
    console.log("Connecting");
    await createConnection();
    const app = express();
    app.use(express.json());

    let mgStore = MongoStore.create({
      mongoUrl:
        "mongodb+srv://philemonBrain:c6ariWana9RftT5c@mycluster.vuxlq.mongodb.net/testDb?retryWrites=true&w=majority",
    });

    app.use(
      session({
        secret: "wfif98493ufu4f4928",
        resave: false,
        saveUninitialized: true,
        cookie: {
          secure: true,
          maxAge: 1200000,
        },
        store: mgStore,
      })
    );

    app.get("/", async (req, res) => {
      res.send(`cookie object`);
    });

    app.post("/register", async (req, res) => {
      try {
        const { email, password } = req.body;
        const user = await getConnection()
          .getRepository(User)
          .findOne({ email });
        if (user)
          return res.status(204).json({ error: "Email already exists" });
        const encPassword = await bcryptjs.hash(password, 12);
        await new User(email, encPassword).save();
        return res.status(201).json({
          message: "User has been created successfully",
        });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Unexpected Error Occured" });
      }
    });

    app.post("/change_password", async (req, res) => {
      try {
        const con = await getConnection().getMongoRepository(User);
        // if (!req.session || !req.session.userID)
        //   return res.status(400).json({ error: "Login Required" });
        const { email, oldpassword, newPassword } = req.body;
        const user = await con.findOne({email});
        console.log(user)
        if (!user) return res.status(204).json({ error: "Invalid User" });

        let isCorrectPassword = await bcryptjs.compare(
          oldpassword,
          user.password
        );
        if (!isCorrectPassword)
          return res.status(400).json({ message: "Incorrect Password" });

        const encPassword = await bcryptjs.hash(newPassword, 12);
        user.password = encPassword

        //delete destroy all other sections in the db
        user.sessionIds
          .filter((id) => id != req.sessionID)
          .forEach((id) => {
            console.log(`destroying id ${id}`);
            mgStore.destroy(id);
          });

        // await con.findOneAndUpdate(user, {sessionIds: [req.sessionID]});
        user.sessionIds = [req.sessionID]
        user.save()
        // await User.update(user, { sessionIds: [req.sessionID] });
        console.log(user.sessionIds.length);

        return res.status(200).json({ message: "Password Change Successful" });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Unexpected Error Occured" });
      }
    });

    app.post("/terminate", (req, res) => {
      try {
        //In a client-server scenario, the req.session and req.session.userID will be a part of the request and wil be used to auth the user
        // if (!req.session || !req.session.userID)
        //   return res.status(400).json({ error: "Login Required" });

        //destroy the sessionID
        const sessionId = req.body.sessionID;
        mgStore.destroy(sessionId);

        return res
          .status(200)
          .json({ message: "Sessino has been terminated successfully" });
      } catch (error) {
        return res
          .status(500)
          .json({ error: "Erroe while terminating the session Id" });
      }
    });

    app.post("/login", async (req, res) => {
      try {
        const { email: reqEmail, password: reqPassword } = req.body;
        const user = await User.findOne({ email: reqEmail });

        if (!user.email)
          return res
            .status(400)
            .json({ message: "Incorrect Email or Password" });

        let isCorrectPassword = await bcryptjs.compare(
          reqPassword,
          user.password
        );
        if (!isCorrectPassword)
          return res
            .status(400)
            .json({ message: "Incorrect Email or Password" });

        req.session.userID = user.id;
        await User.update(user, {
          sessionIds: [...user.sessionIds, req.sessionID],
        });

        return res.status(202).json({
          message: "Login Successful",
        });
      } catch (error) {
        return res.status(500).json();
      }
    });

    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`server listening at port ${port}`));

    console.log(
      "Express server has started on port 3000. Open http://localhost:3000/users to see results"
    );
  } catch (error) {
    console.error(error);
  }
})();
