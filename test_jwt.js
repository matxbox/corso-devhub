const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const express = require("express")

const env = require("./env.json")

const app = express()
const port = 3000

app.use((req, res, next) => {
    if (req.originalUrl === '/generateToken') {
        return next()
    }
    try {
        const token = req.headers.authorization.split(" ")[1]

        const verified = jwt.verify(token, env.jwt.secret_key)
        if (verified) {
            console.log("token verified")
            return next()
        } else {
            return res.status(401).send("invalid token")
        }
    } catch (error) {
        console.error(error)
        res.status(500).send(error.toString())
    }
})

app.post("/generateToken", (req, res) => {
    const payload = {
        time: Date(),
        userId: 12
    }
    const token = jwt.sign(payload, env.jwt.secret_key)
    res.send(token)
})

app.get("/ciao", (req, res) => {
    console.log(req.headers.authorization)
    res.status(200).send("ciao")
})

app.listen(port, () => {
    console.log(`listening on port ${port}`)
})