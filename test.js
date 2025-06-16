const { MongoClient, ServerApiVersion } = require("mongodb")
const env = require("./env.json")
const uri = `mongodb+srv://${env.mongodb.username}:${env.mongodb.password}@corso-dev-hub.vsmeaox.mongodb.net/?retryWrites=true&w=majority&appName=corso-dev-hub`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function list_db() {
    all_dbs = await client.db().admin().listDatabases()
    console.log("Databases:")

    all_dbs.databases.forEach(db => {
        console.log(`- ${db.name}`)
    });
}


async function main() {
    try {
        await client.connect()
        await list_db(client)
    } catch (error) {
        console.error(error)
    } finally {
        await client.close()
    }
}

main().catch(console.error)