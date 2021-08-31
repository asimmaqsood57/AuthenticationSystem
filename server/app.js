const express = require("express");

const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const cookieparser = require("cookie-parser");
const app = express();

const userMod = require("./modles/users");
app.use(express.json());

app.use(cors());
app.use(cookieparser());

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

const authorization = (req, res, next) => {
  const token = req.cookies.access_token;
  if (!token) {
    return res.sendStatus(403);
  }
  try {
    const data = jwt.verify(token, "YOUR_SECRET_KEY");
    req.userId = data.id;
    req.userRole = data.role;
    return next();
  } catch {
    return res.sendStatus(403);
  }
};

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

app.get("/protected", authorization, (req, res) => {
  return res.json({ user: { id: req.userId, role: req.userRole } });
});

app.get("/logout", authorization, (req, res) => {
  return res
    .clearCookie("access_token")
    .status(200)
    .json({ message: "Successfully logged out 😏 🍀" });
});

app.post("/login", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = await userMod.findOne({ email: email });

  console.log(user);
  try {
    if (password == user.password) {
      const token = jwt.sign(
        { id: user._id, role: "captain" },
        "YOUR_SECRET_KEY"
      );
      return res
        .cookie("access_token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
        })
        .status(200)
        .json({ message: "Logged in successfully 😊 👌" });
    }
  } catch (error) {
    console.log(error);
  }
});

app.listen(3001, () => {
  console.log("server is running at port 3001");
});
