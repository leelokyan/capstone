const express = require("express");
const router = express.Router();
const admin = require('firebase-admin');

/***************************
	Add User:
		Request - (String:name, String email)
		Response - (int : userId)
***************************/
router.post('/add_user',function(req,res){
	let name = req.body.name;
	let email = req.body.email;
	let userId = null;

	console.log("Add User");
	if(!name || !email){
		userId = -1;
	}else{
		//Database call
		userId = 1;
	}
	let response = {
		'userId' : userId
	};
	res.json(response);
});


/***************************
	Edit User: TDB
		Request - ()
		Response - ()
***************************/

function initialize () {

	const admin = require('firebase-admin');

	let serviceAccount = require('../firebase-key.json');

	admin.initializeApp({
	  credential: admin.credential.cert(serviceAccount)
	});

	let db = admin.firestore();

	return db;
}

exports.getUsers = function(db) {
	db.collection('users').get()
	  .then((snapshot) => {
	    snapshot.forEach((doc) => {
	      console.log(doc.id, '=>', doc.data());
	    });
	  })
	  .catch((err) => {
	    console.log('Error getting documents', err);
	});
};