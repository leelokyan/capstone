const express = require('express');
const app = express();
const port = 3000;

const admin = require('firebase-admin');

let serviceAccount = require('../firebase-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

let db = admin.firestore();

app.get('/', (req, res) => res.send('Capstone Server!'));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));