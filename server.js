const express = require('express');
const admin = require('firebase-admin');
const app = express();
const port = 3000;

let serviceAccount = require('./firebase-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

let db = admin.firestore();

//Test Database Connection
const workspace = require('./routes/workspace.js');
workspace.getUsers(db);

app.get('/', (req, res) => res.send('Capstone Server!'));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));