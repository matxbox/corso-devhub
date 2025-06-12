const { MongoClient, ServerApiVersion } = require("mongodb");
const env = require("./env.json")
const uri = `mongodb+srv://${env.mongodb.username}:${env.mongodb.password}@corso-dev-hub.vsmeaox.mongodb.net/?retryWrites=true&w=majority&appName=corso-dev-hub`;

const express = require("express")
const app = express()
const port = 3000

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);

app.get("/",(req,res) => {
  res.send("hello world")
})

app.post("/testpost/:restfulparam",(req,res) => {
    console.log(req.body)
    console.log(req.query) // parametri in URL /route?param1=test
    console.log(req.params) // parametri restful in url /route/provola
    console.log(req.headers)
    res.send("hai appena inviato una post")
})

app.listen(port, () => {
  console.log(`express listening on port ${port}`)
})