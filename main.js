const { MongoClient, ServerApiVersion } = require("mongodb");
const env = require("./env.json")
const uri = `mongodb+srv://${env.mongodb.username}:${env.mongodb.password}@corso-dev-hub.vsmeaox.mongodb.net/?retryWrites=true&w=majority&appName=corso-dev-hub`;

const express = require("express")
const app = express()
const port = 3000

const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

app.use(express.json())

app.use((req, res, next) => {
    if (["/login", "/addUser"].includes(req.originalUrl)) {
        return next()
    }
    try {
        const decoded_jwt = jwt.verify(req.headers.authorization.split(" ")[1], env.jwt.secret_key)
        if (decoded_jwt.user.toLowerCase() === "mattia") {
            return next()
        } else {
            res.status(403).json({ success: false, token: decoded_jwt })
        }

    } catch (error) {

        console.error(error)
        res.send(error.toString())
    }
})

app.get("/listMovies", async (req, res) => {
    try {
        await client.connect()
        const cursor = client.db("sample_mflix").collection("movies").find(req.query)
        const movies = await cursor.sort({ _id: -1 }).limit(50).toArray()
        res.status(200).json(movies)
    } catch (error) {
        console.error(error)
        res.status(500).send(error.toString())
    } finally {
        await client.close()
    }
})

app.post("/addFilm", async (req, res) => {
    try {
        required_info = ["title", "director", "year"]
        if (!required_info.every(key => key in req.body)) {
            res.status(400).send("Missing minimum required info [title, director, year] to add film")
        }
        await client.connect()
        const result = await client.db("sample_mflix").collection("movies").insertOne(req.body)
        res.status(201).json({ success: true, film_data: req.body, new_id: result.insertedId })
    } catch (error) {
        console.error(error)
        res.status(500).send(error.toString())
    } finally {
        await client.close()
    }
})

app.post("/login", async (req, res) => {
    const { user, password } = req.body
    if (user.toLowerCase() === "mattia" && password === "viaLe2ManiDalNaso!") {
        token = jwt.sign({ user: user }, env.jwt.secret_key)
        res.status(200).send(token)
    }
})

app.listen(port, () => {
    console.log("express webserver listening on port: ", port)
})