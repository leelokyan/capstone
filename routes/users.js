const express = require("express");
const router = express.Router();

const db = initialize();

function initialize () {

	const admin = require('firebase-admin');

	let db = admin.firestore();

	return db;
}

function addUser (){
	db.collection('users').get()
	  .then((snapshot) => {
	    snapshot.forEach((doc) => {
	      console.log(doc.id, '=>', doc.data());
	    });
	  })
	  .catch((err) => {
	    console.log('Error getting documents', err);
	});
}

/***************************
	Add User:
		Request - (String:name, String email)
		Response - (String : userId)
***************************/
router.post('/add_user',function(req,res){
	let name = req.body.name;
	let email = req.body.email;

	let userId = null;
	let error = null;

	console.log("Add User");
	if(!name || !email){
		userId = -1;
		error = "Invalid username or email";
	}else{
		//Database call
		addUser();
		userId = 1;
	}
	let response = {
		userId : userId,
		error : error
	};
	res.json(response);
});


module.exports = router;
