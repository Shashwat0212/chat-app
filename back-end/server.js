//Imports
import Express from "express";
import mongoose from "mongoose";
import Messages from "./dbMessages.js";
import Pusher from "pusher";
import cors from "cors";
//App config
const app = Express();
const port = 9000 || process.env.PORT;
const pusher = new Pusher({
  appId: "1415481",
  key: "97703f897669f11f8203",
  secret: "31dec7c9a5d0810a7fd9",
  cluster: "ap2",
  useTLS: true,
});

//Midleware
app.use(Express.json());
app.use(cors());

//DB Config
//password is chatapp-mern@0212 where - is replaced by %2d and @ is replaced by %40
const password = "chatapp%2dmern%400212";
const chatDB = "chatDB";
const connection_url =
  "mongodb+srv://admin:" +
  password +
  "@cluster0.465iriy.mongodb.net/" +
  chatDB +
  "?retryWrites=true&w=majority";
mongoose.connect(connection_url, {
  useNewUrlParser: true,
});
const db = mongoose.connection;
db.once("open", () => {
  console.log("connected to the database");
  const msgCollection = db.collection("messagecontents");
  const changeStream = msgCollection.watch();
  changeStream.on("change", (change) => {
    if (change.operationType === "insert") {
      const messageDetails = change.fullDocument;
      pusher.trigger("messages", "inserted", {
        name: messageDetails.name,
        message: messageDetails.message,
        timestamp: messageDetails.timestamp,
        recieved: messageDetails.recieved,
      });
    } else {
      console.log("Error occured in pusher");
    }
  });
});

//App routes
app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.get("/messages/sync", (req, res) => {
  Messages.find({}, (err, messages) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(messages);
    }
  });
});
app.post("/messages/new", (req, res) => {
  const dbMessage = req.body;
  Messages.create(dbMessage, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(201).send(data);
    }
  });
});

//Listener
app.listen(port, () => {
  console.log("Example app listening on port " + port);
});
