const express = require("express");
const router = express.Router();

const db = initialize();

function initialize () {
	const admin = require('firebase-admin');
	let db = admin.firestore();
	return db;
}

function userExists (email,addUser){
	let usersRef = db.collection('users');

	let queryRef = usersRef.where('email','==',email).get()
	  .then(snapshot => {
	  	if(snapshot.empty){
	  		console.log('No matching user');
	  	}else{
	  		console.log('matching user found');
	  		return true;
	  	}
	  })
	  .catch((err) => {
	    console.log('Error getting documents', err);
	});
}

/***************************
	Add User:
		Request - (String: fname, String: lname, String email)
		Response - (String : userId)
***************************/
router.post('/add_user',function(req,res){
	let fname = req.body.fname;
	let lname = req.body.lname;
	let email = req.body.email;

	console.log("Add User");

	if(!email|| !fname || !lname){
		userId = '-1';
		error = "Invalid username or email";
		response = {
			userId : null,
			error : 'invalid name or email'
		};
		res.json(response);
	}else{
		let usersRef = db.collection('users');
		let response = null;
		let queryRef = usersRef.where('email','==',email).get()
		  .then(snapshot => {
		  	if(snapshot.empty){
		  		console.log('Adding user: ' + email);
				userDocRef = db.collection("users").doc();
				console.log("id" + userDocRef.id);
				let data = {
					email : email,
					fname : fname,
					lname : lname
				}
				let setDoc = userDocRef.set(data);
				response = {
					userId : email,
					error : null
				};
		  	}else{
		  		console.log('Error, user exists');
				response = {
					userId : null,
					error : 'User exists'
				};
		  	}
		  	res.json(response);
		  })
		  .catch((err) => {
		    console.log('Error getting documents', err);
		});
	}
});
/***************************
	Get User Info:
		Request - (String email)
		Response - (String: fname, String: lname, String email, String error)
***************************/
router.post('/get_user',function(req,res){
	let email = req.body.email;
	let response = null;
	if(!email){
		response = {
			fname : null,
			lname : null,
			email : null,
			error : "No email sent"
		};
		res.json(response);
	}else{
		let usersRef = db.collection('users');
		let queryRef = usersRef.where('email','==',email).get()
		.then(snapshot =>{
			if(snapshot.empty){
				response = {
					fname : null,
					lname : null,
					email : null,
					error : "No matching email"
				};
				res.json(response);
			}else{
				let fname = null;
				let lname = null;
				snapshot.forEach(doc => {
					fname = doc.data().fname;
					lname = doc.data().lname;
			    });
				response = {
					fname : fname,
					lname : lname,
					email : email,
					error : null
				};
				res.json(response);
			}
		})
	}
});


module.exports = router;
