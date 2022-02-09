const express = require("express");
const app = express();
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const { MongoClient } = require("mongodb");

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.s3raz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

console.log(uri);

async function run() {
  try {
    await client.connect();
    console.log("connected");
    const database = client.db("yooda-hostel");
    const foodsCollection = database.collection("foods");
    const studentsCollection = database.collection("students");

    // post api
    app.post("/foods", async (req, res) => {
      const newFood = req.body;
      console.log(req.body);
      const result = await foodsCollection.insertOne(newFood);
      console.log("hitting the Post", req.body);
      console.log("added Food", result);
      res.json(result);
    });

    app.post("/students", async (req, res) => {
      const newStudent = req.body;
      console.log(req.body);
      const result = await studentsCollection.insertOne(newStudent);
      console.log("hitting the Post", req.body);
      console.log("added student", result);
      res.json(result);
    });

    // get api
    app.get("/allFoods", async (req, res) => {
      const cursor = foodsCollection.find({});
      const foods = await cursor.toArray();
      res.send(foods);
    });

    app.get("/students", async (req, res) => {
      const cursor = studentsCollection.find({});
      const students = await cursor.toArray();
      res.send(students);
    });

    app.get("/food", async (req, res) => {
      const cursor = foodsCollection.find({});
      console.log(req.query);
      const page = req.query.page;
      const size = parseInt(req.query.size);

      let foods;
      const count = await cursor.count();
      if (page) {
        foods = await cursor
          .skip(page * size)
          .limit(size)
          .toArray();
      } else {
        foods = await cursor.toArray();
      }
      res.send({ count, foods: foods });
    });

    app.get("/student", async (req, res) => {
      const cursor = studentsCollection.find({});
      console.log(req.query);
      const page = req.query.page;
      const size = parseInt(req.query.size);

      let students;
      const count = await cursor.count();
      if (page) {
        students = await cursor
          .skip(page * size)
          .limit(size)
          .toArray();
      } else {
        students = await cursor.toArray();
      }
      res.send({ count, students: students });
    });

    app.get("/allFoods/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const food = await foodsCollection.findOne(query);
      console.log("load food with id:", id);
      res.send(food);
    });

    // Update api
    app.put("/allFoods/:id", async (req, res) => {
      const id = req.params.id;
      const updatedFood = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          name: updatedFood.name,
          price: updatedFood.price,
        },
      };
      const result = await foodsCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      console.log("updating food", req);
      res.json(result);
    });

    // DELETE api
    app.delete("/allFoods/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await foodsCollection.deleteOne(query);
      // console.log()
      console.log("deleting user with id", result);

      res.json(result);
    });
  } finally {
    //   await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello Yooda Hostel!");
});

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
