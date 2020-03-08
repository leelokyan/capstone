const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');
const saltRounds = 10;	//Check about this

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

function updatePassword(password){
	let authCode = null;
	bcrypt.genSalt(saltRounds, function(err, salt) {
	    bcrypt.hash(password, salt, function(err, hash) {
	        authCode = hash;
	        let data = {
				authCode : authCode
			};
			let setDoc = db.collection('workspaces').doc('access').set(data);
	    });
	});	
}

router.post('/update_password',function(req,res){
	let password = req.body.password;
	updatePassword(password);
	let response = {
		success : true
	}
	res.json(response);
});
/***************************
	Add User:
		Request - (String: fname, String: lname, String email, String workspacePassword)
		Response - (String : userId)
***************************/
router.post('/add_user',function(req,res){
	let fname = req.body.fname;
	let lname = req.body.lname;
	let email = req.body.email;
	let password = req.body.workspacePassword;

	console.log("Add User");

	if(!email|| !fname || !lname || !password){
		userId = '-1';
		error = "Invalid username or email";
		response = {
			sucess : false,
			error : 'invalid name or email'
		};
		res.json(response);
	}else{
		let hash = null;
		let workspaceRef = db.collection('workspaces').doc('access');
		let getDoc = workspaceRef.get()
		  .then(doc => {
		    if (!doc.exists) {
		      console.log('No such document!');
		    } else {
		      hash = doc.data().authCode;
		      //Verify password
				bcrypt.compare(password, hash, function(err, result) {
					if(result){
						console.log('password comparision success');
					    //Add User
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
									success : true,
									error : null
								};
						  	}else{
						  		console.log('Error, user exists');
								response = {
									sucess : false,
									error : 'User exists'
								};
						  	}
						  	res.json(response);
						  })
						  .catch((err) => {
						    console.log('Error getting documents', err);
						});
					}else{
						let response = {
						success : false,
						error : "invalid password"
					};
					res.json(response);
					}
				});
		    }
		  })
		  .catch(err => {
		    console.log('Error getting document', err);
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
