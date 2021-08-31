const express = require("express");

const mongoose = require("mongoose");

const cors = require("cors");

const app = express();

const userMod = require("./modles/users");
app.use(express.json());

app.use(cors());

app.get("/", (req, res) => {
  res.send("welcome to homepage");
});

mongoose
  .connect(
    "mongodb+srv://asim:asim@cluster0.uocez.mongodb.net/practice?retryWrites=true&w=majority",
    {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    }
  )
  .then(() => {
    console.log("your are connected to database");
  })
  .catch((err) => {
    console.log("Something went wrong", err);
  });

app.post("/register", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = new userMod({
    email: email,
    password: password,
  });

  try {
    await user.save().then((result) => {
      console.log(result);
      res.send("record inserted");
    });
  } catch (error) {
    console.log(error);
  }
});
app.post("/login", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = await userMod.findOne({ email: email });

  console.log(user);
  try {
    if (password == user.password) {
      console.log("you are signed in");
      res.send("You are  signed in successfully");
    }
  } catch (error) {
    console.log(error);
  }
});

app.listen(3001, () => {
  console.log("server is running at port 3001");
});
