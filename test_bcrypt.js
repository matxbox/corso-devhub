const bcrypt = require("bcrypt")
const express = require("express")

const app = express()




async function main(prova) {
    const prova_crypt = await bcrypt.hash("provolona", 12)
    console.log(`encrypted provolona:\n${prova_crypt}`)
    return await bcrypt.compare(prova, prova_crypt)
}

app.get("/test", async (req, res) => {
    try {
        const test_compare = await main(req.query.prova)
        res.send(test_compare)
    } catch (error) {
        console.error(error)
    }
})

app.listen(3000, () => {
    console.log("listening on port 3000")
})