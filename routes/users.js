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
									lname : req.body.lname,
									valid : true
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
						    let response = {
								success : false,
								error : "Error getting user documents"
							};
							res.json(response);
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
		    let response = {
		    	success : false,
		    	error : "Error: error getting document"
		    };
		    res.json(response);
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
				snapshot.forEach(doc => {
					if(doc.get('valid')){
						response = {
							fname : doc.data().fname,
							lname : doc.data().lname,
							email : email,
							success : true,
							error : ""
						};
						res.json(response);
					}else{
						response = {
							fname : null,
							lname : null,
							email : null,
							success : false,
							error : "Email is no longer valid user"
						};
						res.json(response);
					}
			    });
			}
		}).catch(err =>{
			console.log(err);
			let response = {
					fname : null,
					lname : null,
					email : null,
					success : false,
					error : "Error getting users ref"
			};
			res.json(response);
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
						// db.collection('objectives').doc(objId).update({assignedUser:''});
						db.collection('objectives').doc(objId).update({
							objectives : admin.firestore.FieldValue.arrayRemove(email)
						});
					});
				}else{
					console.log("snapshot empty");
				}
			});
			//Delete User
			userRef.update({valid: false});
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

/***************************
	Get All Users:
		Request - 
		Response - (bool: success, String error, User[] users)
***************************/
router.post('/get_all_users', function(req,res){
	let result = [];
	let userRef = db.collection('users').get()
		.then(snapshot => {
			snapshot.forEach(doc => {
				if(doc.get('valid')){
					let userData = {
						email : doc.get('email'),
						fname : doc.get('fname'),
						lname : doc.get('lname')
					}
					result.push(userData);
				}
			})
			let response = {
				users : result,
				error : "",
				success : true
			};
			res.json(response);
		}).catch(err => {
			let response = {
				users : result,
				error : "Error getting users",
				success : false
			}
			res.json(response);
		});
});


module.exports = router;
