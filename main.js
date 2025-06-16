const { MongoClient, ServerApiVersion } = require("mongodb")
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

async function client_connect(action) {
    return async function () {
        try {
            await client.connect()
            console.log(this)
            return action.apply(this, arguments)
        } catch (error) {
            console.error(error)
        } finally {
            await client.close()
        }
    }
}

async function query_movie(query) {
        const database = client.db("sample_mflix")
        const movies = database.collection("movies")

        const movie = await movies.findOne(query)

    return movie
}
var query_movie_wrap = client_connect(query_movie)

async function add_movie(details) {
    const database = client.db("sample_mflix")
}

app.get("/listMovies", async (req, res) => {
    const movie = await query_movie_wrap(req.query)
    res.json(movie)
})

app.listen(port, () => {
    console.log("express webserver listening on port: ", port)
})