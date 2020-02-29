const express = require('express');
const admin = require('firebase-admin');
const app = express();
const bodyParser = require('body-parser');
const port = 4000;


const db = initialize();

function initialize () {

	let serviceAccount = require('./firebase-key.json');

	admin.initializeApp({
	  credential: admin.credential.cert(serviceAccount)
	});

	let db = admin.firestore();

	return db;
}

//Initialize Body-Parser (Must Initialize before routes)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

//Test Database Connection
const workspace = require('./routes/workspace.js');
const goals = require('./routes/goals.js');
const strategy = require('./routes/strategy.js');
const objective = require('./routes/objective.js');
// const users = require('./routes/users.js');

app.use(workspace);
app.use(goals);
app.use(strategy);
app.use(objective);
// app.use(users);

/***
* !!!!!Replace 'website.html' with actual home page!!!!
*/
// app.get('/', (req, res) => res.send("Welcome to Capstone"));
app.get('/', (req, res) => res.sendFile(__dirname +"/sample.html"));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));