import { MongoClient, ServerApiVersion, ObjectId } from "mongodb"
import env from "./env.json" with {type: "json"}
import cors from 'cors'
import bodyParser from "body-parser";
import express from "express"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const app = express()
const port = 3000
const uri = `mongodb+srv://${env.mongodb.username}:${env.mongodb.password}@corso-dev-hub.vsmeaox.mongodb.net/?retryWrites=true&w=majority&appName=corso-dev-hub`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

app.use(express.json())
app.use(bodyParser.json())
app.use(cors())

app.use(async (req, res, next) => {
    if (["/login", "/addUser"].includes(req.originalUrl)) {
        return next()
    }

    if (req.headers.authorization != null) {
        try {
            await client.connect()
            const decoded_jwt = jwt.verify(req.headers.authorization.split(" ")[1], env.jwt.secret_key)
            const user_match = await client.db("sample_mflix").collection("users").findOne({ _id: ObjectId.createFromHexString(decoded_jwt.user_id) })
            if (user_match != null) {
                return next()
            } else {
                throw new jwt.JsonWebTokenError("Invalid user");
            }
        } catch (error) {
            console.error(error)
            res.status(401).json({ success: false, message: error.toString() })
        } finally {
            client.close()
        }
    } else {
        res.status(401).json({ success: false, message: "Missing authentication" })
    }

})

app.post("/login", async (req, res) => {
    const { username, password } = req.body
    if (username !== undefined && password !== undefined) {
        try {
            await client.connect()
            const user_match = await client.db("sample_mflix").collection("users").findOne({ name: username })
            if (user_match != null) {
                const password_match = await bcrypt.compare(password, user_match.password)
                if (password_match) {
                    const token_content = { username: user_match.name, email: user_match.email, user_id: user_match._id }
                    const token = jwt.sign(token_content, env.jwt.secret_key, { expiresIn: "1h" })
                    res.status(200).json({ success: true, message: "Login successful", data: { token } })
                } else {
                    res.status(403).json({ success: false, message: "Wrong username or password" })
                }
            } else {
                res.status(403).json({ success: false, message: "Wrong username or password" })
            }
        } catch (error) {
            console.error(error)
            res.status(500).json({ success: false, message: error.toString() })
        } finally {
            await client.close()
        }
    } else {
        res.status(400).json({ success: false, message: "Request does not contain mandatory login information" })
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
                res.status(201).json({ success: true, message: "User added", data: { user_data: { username, email }, new_id: result.insertedId } })
            } else {
                res.status(401).json({ success: false, message: "user/email already registered" })
            }
        } catch (error) {
            res.status(500).json({ success: false, message: error.toString() })
        } finally {
            await client.close()
        }
    } else {
        res.status(400).json({ success: false, message: "Request does not contain mandatory information: username, password, email" })
    }
})

app.get("/listMovies", async (req, res) => {
    try {
        await client.connect()
        const query = {}
        for (const key in req.query) {
            if (req.query[key]) {
                query[key] = { $regex: req.query[key], $options: "i" }
            }
        }
        const cursor = client.db("sample_mflix").collection("movies").find(query)
        const movies = await cursor.sort({ _id: -1 }).limit(50).toArray()
        res.status(200).json({ success: true, message: "Movies found", data: { movies } })
    } catch (error) {
        console.error(error)
        res.status(500).json({ success: false, message: error.toString() })
    } finally {
        await client.close()
    }
})

app.post("/addFilm", async (req, res) => {
    try {
        const required_info = ["title", "directors", "year"]
        if (!required_info.every(key => key in req.body)) {
            res.status(400).json({ success: false, message: "Missing minimum required info [title, directors, year] to add film" })
        }
        await client.connect()
        const result = await client.db("sample_mflix").collection("movies").insertOne(req.body)
        res.status(201).json({ success: true, message: "Movie created", data: { film_data: req.body, new_id: result.insertedId } })
    } catch (error) {
        console.error(error)
        res.status(500).json({ success: false, message: error.toString() })
    } finally {
        await client.close()
    }
})

app.listen(port, () => {
    console.log("express webserver listening on port:", port)
})