import express from "express";
import { createServer } from ".";
import { User } from "./entity/User";
import { signupLoginValidation } from "./validator";
import bcryptjs from "bcryptjs";

(async () => {
  const { app, mgStore } = await createServer();

  const v1Route = express.Router();
  app.use("/api/v1", v1Route);

  v1Route.get("/", async (req, res) => {
    res.send(`Welcome to the `);
  });

  v1Route.post("/register", signupLoginValidation(), async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (user) return res.status(400).json({ error: "Email already exists" });

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

  v1Route.post("/change_password", async (req, res) => {
    try {
      //In a client-server scenario, the req.session and req.session.userID will be a part of the request and wil be used to auth the user
      // if (!req.session || !req.session.userID)
      //   return res.status(400).json({ error: "Login Required" });

      const { email, oldpassword, newPassword } = req.body;
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ error: "Invalid User" });

      let isCorrectPassword = await bcryptjs.compare(
        oldpassword,
        user.password
      );
      if (!isCorrectPassword)
        return res.status(400).json({ message: "Incorrect Password" });

      const encPassword = await bcryptjs.hash(newPassword, 12);
      user.password = encPassword;

      //delete destroy all other sections in the db
      user.sessionIds
        .filter((id) => id != req.sessionID)
        .forEach((id) => {
          mgStore.destroy(id);
        });

      user.sessionIds = [req.sessionID];
      user.save();

      return res.status(200).json({ message: "Password Change Successful" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Unexpected Error Occured" });
    }
  });

  v1Route.post("/terminate", (req, res) => {
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

  v1Route.post("/login", signupLoginValidation(), async (req, res) => {
    try {
      //In a client-server scenario, the req.session and req.session.userID will be a part of the request, return early
      // if (!req.session || !req.session.userID)
      //   return res.status(200).json({ error: "You are already Logged In" });
      const { email: reqEmail, password: reqPassword } = req.body;
      const user = await User.findOne({ email: reqEmail });

      if (!user.email)
        return res.status(400).json({ error: "Incorrect Email or Password" });

      let isCorrectPassword = await bcryptjs.compare(
        reqPassword,
        user.password
      );
      if (!isCorrectPassword)
        return res.status(400).json({ error: "Incorrect Email or Password" });

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

  console.log("Express server has started");
})();
