const express = require("express");
const app = express();
require('dotenv').config();
const cors = require("cors");
const { MongoClient } = require('mongodb');
const PORT = process.env.PORT || 5000;


// middleware
app.use(express.json());
app.use(cors());

//server running
app.get("/", (req, res) => {
    res.send("TimeKeeper server running..");
});

// server connect
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.oonxx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('timekeeper_shop');
        const watchCollection = database.collection('watch');
        const userCollection = database.collection('user');
        
        //product All loop API
        app.get('/products', async (req, res) => {
            const products = await watchCollection.find({}).toArray();
            res.json(products);
        });

        //product All loop API but limit
        app.get('/products/limit', async (req, res) => {
            const products = await watchCollection.find({}).limit(6).toArray();
            res.json(products);
        });

        //save user api
        app.post("/user", async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
            res.json(result);
        });

        //user role update admin API
        app.put("/user/admin", async (req, res) => {
            const user = req.body;
            console.log(user);
            const filter = { email: user.email };
            const updateDoc = { $set: { role: "admin" } };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.json(result);
        })

        // get the user admin role API
        app.get('/user/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === "admin") {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });   
        })



    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

//server listen
app.listen(PORT, () => {
    console.log(`TimeKeeper server running PORT: ${PORT}`);
});