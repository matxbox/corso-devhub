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

async function moviequery(query) {
    try {
        await client.connect()
        const database = client.db("sample_mflix")
        const movies = database.collection("movies")

        const movie = await movies.findOne(query)

        return movie
    } finally {
        await client.close()
    }
}

app.get("/listMovies", async (req, res) => {
    const movie = await moviequery(req.query)
    res.json(movie)
})

app.listen(port, () => {
    console.log("express webserver listening on port: ", port)
})