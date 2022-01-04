const express = require('express')
var MongoClient = require('mongodb').MongoClient;
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config()

const app = express()
const port = process.env.PORT || 5000

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0-shard-00-00.u39pp.mongodb.net:27017,cluster0-shard-00-01.u39pp.mongodb.net:27017,cluster0-shard-00-02.u39pp.mongodb.net:27017/coffee-time?ssl=true&replicaSet=atlas-8558zv-shard-0&authSource=admin&retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
  try {
    await client.connect();
    const database = client.db("coffee-time");
    const products = database.collection("products");
    const orders = database.collection("orders");
    const reviews = database.collection("reviews");
    const users = database.collection("users");

    // get products
    app.get('/products', async (req, res) => {
      const result = await products.find({}).toArray();
      res.send(result);
    })


    // get single products using query
    app.get('/singleproduct/:id', async (req, res) => {
      const result = await products.findOne({ _id: ObjectId(req.params.id) });
      res.send(result);
    })

    // post order data
    app.post('/orders', async (req, res) => {
      const data = req.body;
      const result = await orders.insertOne(data);
      res.send(result);
      console.log('posted data');
    })

    //get order data
    app.get('/orders', async (req, res) => {
      const result = await orders.find({}).toArray();
      res.send(result);
    })

    // delete order
    app.delete('/deleteOrder/:id', async (req, res) => {
      const result = await orders.deleteOne({ _id: ObjectId(req.params.id) })
      res.send(result);
    })

    // get review
    app.get('/reviews', async (req, res) => {
      const result = await reviews.find({}).toArray();
      res.send(result);
    })



    // add user to database
    app.post('/users', async (req, res) => {
      const data = req.body;
      const result = await users.insertOne(data);
      res.send(result);
      console.log('insert users');
    })

    //get user 
    app.get('/users/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await users.findOne(query);
      let isAdmin = false;
      if (user?.role === 'admin') {
        isAdmin = true;
      }
      res.send({ admin: isAdmin });
    })

     // make admin
     app.put('/users/admin', async(req, res) => {
      const user = req.body;
      const filter = {email: user.email};
      const update = {$set: {role: 'admin'}};
      const result = await users.updateOne(filter, update);
      res.send(result)
    })

  }
  finally {
    //await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello coffe time team work!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})