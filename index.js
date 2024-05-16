const express = require("express");
const cors = require("cors");

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;
const app = express();

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://hotel-bluemoon.web.app",
  ],
  Credentials: true,
  optionSuccessStatus: 200,
};
// middleware
app.use(cors(corsOptions));
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ggulbwq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    const roomsCollection = client.db("hotels").collection("rooms");
    const reviewsCollection = client.db("hotels").collection("reviews");
    const bookingsCollection = client.db("hotels").collection("bookings");

    // get  all room data
    app.get("/rooms", async (req, res) => {
      const result = await roomsCollection.find().toArray();
      res.send(result);
    });

    // Get a single room data from db using room id
    app.get("/room/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await roomsCollection.findOne(query);
      res.send(result);
    });

    //REVIEW-  Post a room review
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewsCollection.insertOne(review);
      res.send(result);
    });

    // REVIEW- GET ALL REVIEW DATA

    app.get("/reviews", async (req, res) => {
      const result = await reviewsCollection.find().toArray();
      res.send(result);
    });

    // REVIEW-  Get a room review
    app.get("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await reviewsCollection.findOne(query);
      const reviewCount = await reviewsCollection.countDocuments();
      // res.send(result);
      res.send({ review: result, totalCount: reviewCount });
    });

    // post booking room
    app.post("/bookings", async (req, res) => {
      const book = req.body;

      const result = await bookingsCollection.insertOne(book);

      res.send(result);
    });
    // all bookings data
    app.get("/bookings", async (req, res) => {
      const result = await bookingsCollection.find().toArray();
      res.send(result);
    });
    // Get user booking by email:

    app.get("/bookings/:email", async (req, res) => {
      const email = req.params.email;
      const result = await bookingsCollection
        .find({ userEmail: email })
        .toArray();
      res.send(result);
    });

    // delete operation--
    app.delete("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const query = { roomId: id };
      const result = await bookingsCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);
app.get("/", (req, res) => {
  res.send("SoloSphere server is running ....");
});
app.listen(port, () => console.log("Server is running on: ", port));
