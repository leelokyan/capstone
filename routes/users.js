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
		Response - (Boolean: success, String : error)
***************************/
router.post('/add_user',function(req,res){
	let email = req.body.email;
	let password = req.body.workspacePassword;

	console.log("Add User");

	if(!email || !password){
		let response = {
			success : false,
			error : 'Either email or password is null'
		};
		res.json(response);
	}else{
		db.collection('workspaces').doc('access').get()
		  .then(doc => {
		    if (doc.exists) {
		    	let hash = doc.data().authCode;

		    	//Verify password
		    	bcrypt.compare(password, hash, function(err, result) {
					if(result){
					    //Add User
						db.collection('users').where('email','==',email).get()
						  .then(snapshot => {
						  	if(snapshot.empty){
						  		let data = {
									email : email,
									fname : req.body.fname,
									lname : req.body.lname
								}

								db.collection("users").doc(email).set(data);
								let response = {
									success : true,
									error : ""
								};
								res.json(response);
						  	}else{
								let response = {
									success : false,
									error : 'Failure: User exists'
								};
								res.json(response);
						  	}
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
		    else {
		    	let response = {
					success : false,
					error : "!!! ERROR: Failed to retrieve workspace password"
				};
				res.json(response);
		    }
		  })
		  .catch(err => {
		    console.log('Error getting document', err);
		  });
	}
});
/***************************
	Get User:
		Request - (String email)
		Response - (String: fname, String: lname, String: email, Boolean: success, String: error)
***************************/
router.post('/get_user',function(req,res){
	let email = req.body.email;
	if(!email){
		let response = {
			fname : null,
			lname : null,
			email : null,
			success : false,
			error : "No email sent"
		};
		res.json(response);
	}else{
		let usersRef = db.collection('users').where('email','==',email).get()
		.then(snapshot =>{
			if(snapshot.empty){
				response = {
					fname : null,
					lname : null,
					email : null,
					success : false,
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
					success : true,
					error : ""
				};
				res.json(response);
			}
		})
	}
});

/***************************
	Delete User:
		Request - (String email)
		Response - (bool: success, String error)
***************************/
router.post('/delete_user', function(req,res){
	let email = req.body.email;
	let FieldValue = require('firebase-admin').firestore.FieldValue;

	let userRef = db.collection('users').doc(email);
	userRef.get().then(doc =>{
		if(doc.exists){
			//Clear assigned user
			let objRef = db.collection('objectives').where('assignedUser','==',email).get().then(snapshot => {
				if(!snapshot.empty){
					snapshot.forEach(doc => {
						let objId = doc.id;
						db.collection('objectives').doc(objId).update({assignedUser:''});
					});
				}else{
					console.log("snapshot empty");
				}
			});
			//Delete User
			userRef.delete();
			let response = {
				success : true,
				error: ""
			}
			res.json(response);
		}else{
			let response = {
				success : false,
				error: "No matching email"
			}
			res.json(response);
		}
	})
});

module.exports = router;
