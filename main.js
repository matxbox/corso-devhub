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
        if (req.headers.authorization != null) {
            const decoded_jwt = jwt.verify(req.headers.authorization.split(" ")[1], env.jwt.secret_key)
            if (decoded_jwt.user.toLowerCase() === "mattia") {
                return next()
            } else {
                res.status(403).json({ success: false, token: decoded_jwt })
            }
        } else {
            res.status(401).send("Missing authentication")
        }
    } catch (error) {

        console.error(error)
        res.status(400).send(error.toString())
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
    const { username, password } = req.body
    //password = decodeURIComponent(password)
    if (username !== undefined && password !== undefined) {
        try {
            await client.connect()
            const user_match = await client.db("sample_mflix").collection("users").findOne({ name: username })
            if (user_match != null) {
                const test = await bcrypt.compare(password, user_match.password) // provolona
                if (test) {
                    const token = jwt.sign({ user: username }, env.jwt.secret_key, { expiresIn: "1h" })
                    res.status(200).send({ token: token, match: user_match })
                } else {
                    res.status(403).send("Wrong username or password")
                }
            } else {
                res.status(403).send("Wrong username or password")
            }
        } catch (error) {
            console.error(error)
            res.status(500).send(error.toString())
        } finally {
            await client.close()
        }
    } else {
        res.status(400).send("Request does not contain mandatory login information")
    }
})

app.put("/addUser", async (req, res) => {
    const { username, password, email } = req.body
    if (username !== undefined && password !== undefined && email !== undefined) {
        try {
            await client.connect()
            const user_match = await client.db("sample_mflix").collection("users").findOne({ $or: [{ name: username }, { email: email }] })
            if (user_match == null) {
                const pass_crypt = await bcrypt.hash(password, 12)
                const result = await client.db("sample_mflix").collection("users").insertOne({ name: username, email: email, password: pass_crypt })
                res.status(201).json({ success: true, film_data: req.body, new_id: result.insertedId })
            } else {
                res.status(401).send("user/email already registered")
            }
        } catch (error) {
            res.status(500).send(error.toString())
        } finally {
            await client.close()
        }
    } else {
        res.status(400).send("Request does not contain mandatory information: username, password, email")
    }
})

app.listen(port, () => {
    console.log("express webserver listening on port: ", port)
})