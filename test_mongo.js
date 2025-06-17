const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb")
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

async function add_movie(new_movie) {
    const result = await client.db("sample_mflix").collection("movies").insertOne(new_movie)
    console.log(`New movie added with _id: ${result.insertedId}`)
}

async function query_movie(query) {

    const movies = client.db("sample_mflix").collection("movies")
    return movies.find(query)
}


const dnd_movie = {
    plot: "A charming thief and a band of unlikely adventurers embark on an epic quest to retrieve a lost relic, but things go dangerously awry when they run afoul of the wrong people.",
    genres: [
        "Action",
        "Adventure",
        "Comedy",
        "Fantasy"
    ],
    runtime: 134,
    metacritic: 72,
    rated: "PG-13",
    cast: [
        "Chris Pine",
        "Michelle Rodriguez",
        "Hugh Grant",
        "Regé-Jean Page"
    ],
    poster: "https://upload.wikimedia.org/wikipedia/en/0/03/Theatrical_poster_for_Dungeons_and_Dragons%2C_Honor_Among_Thieves.jpg",
    title: "Dungeons & Dragons: Honor Among Thieves",
    fullplot: "Edgin Darvis, a former member of the Harpers (a peacekeeping group), turns to a life of theft after his wife is killed by disciples of a Red Wizard. Along with his partner, Holga Kilgore, he tries to raise his daughter Kira, but they get caught while trying to steal a magical tablet to resurrect his wife. After two years in prison, they escape and learn that their former ally, Forge Fitzwilliam, has become the Lord of Neverwinter and has been caring for Kira, manipulating her into thinking Edgin's arrest was due to his greed. It's revealed that Forge, along with Sofina (a Red Wizard), orchestrated their capture. Edgin and Holga team up with Simon Aumar (an amateur sorcerer), Doric (a druid), and Xenk Yandar (a paladin) to steal back the tablet, clear their names, and rescue Kira. They face numerous challenges, including magical traps, a red dragon, and Thayan assassins. They eventually discover that Sofina plans to use the High Sun Games to raise an undead army. The group manages to thwart Sofina's plan, and Edgin uses the Tablet of Reawakening to bring Holga back to life after she's fatally injured. In the end, they defeat Sofina, save Kira, and restore peace to Neverwinter. Forge is sent back to prison, and the group is hailed as heroes.",
    languages: [
        "English"
    ],
    released: {
        $date: "2023-03-31T00:00:00.000Z"
    },
    directors: [
        "Jonathan Goldstein",
        "John Francis Daley"
    ],
    writers: [
        "Chris McKay",
        "Michael Gilio"
    ],
}
const query = {
    _id: new ObjectId("685039540280f571ae7cc7c7")
}

async function test_db() {
    try {
        await client.connect()
        cursor = await query_movie(query)
        console.log(await cursor.project({
            //_id: 0,
            title: 1,
            released: 1
        }).toArray())

    } catch (error) {
        console.error(error)
    } finally {
        await client.close()
    }
}

