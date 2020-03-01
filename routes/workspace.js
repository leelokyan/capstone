const express = require("express");
const router = express.Router();

const db = initialize();

function initialize () {

	const admin = require('firebase-admin');
	let db = admin.firestore();

	return db;
}

const admin = require('firebase-admin');


exports.getUsers = function() {
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

//helper
function workspaceExists(workspaceName) {
	// Create a reference to the cities collection
	let workspaceRef = db.collection('workspaces');

	// Create a query against the collection
	let queryRef = workspaceRef.where('workspaceName', '==', workspaceName).get()
	  .then(snapshot => {
	    if (snapshot.empty) {
			console.log('No matching documents.');
			return false;
	    }  
	    else {
	    	return true;
	    }

	  })
	  .catch(err => {
	    console.log('Error getting documents', err);
	  });
}

/***************************
	Create Workspace:
		Request - (string:workspaceName,string:userId,string:authCode)
		Response - (string:error, string:workspaceId)
***************************/
router.post('/create_workspace', function(req,res){
	console.log("create_workspace");
	//Parse Request Body
	console.log(req);
	var workspaceName = req.body.workspaceName;
	var authCode = req.body.authCode;
	var userId = req.body.userId;
	let error = "";
	console.log(workspaceName + " "  + authCode);
	let workspaceDocRef;
	//Check with frontend team degree of backend validation necessary
	if(!workspaceName || !authCode || !userId){	
		workspaceId = "";
		error = "No workspace name, authentication code, or userId given";
	}else{
		console.log("Workspace Name: " + workspaceName);
		console.log("AuthCode: " + authCode);
		/***
		* Insert Database API Call
		*/
		//check if workspace name already exists, if so, give -1 to indicate error
		if (workspaceExists(workspaceName)) {
			workspaceId = "";
			error = "Workspace already exists";
		}
		else {
			workspaceDocRef = db.collection("workspaces").doc();
			console.log("id" + workspaceDocRef.id);
			workspaceId = workspaceDocRef.id;
			let data = {
				workspaceName : workspaceName,
				authCode : authCode,
				users : [ userId ]
			}

			let setDoc = workspaceDocRef.set(data);
		}
	}	
	var response = {
		error : error, 
		workspaceId : workspaceId //this string will be empty if there's an error

	};
	res.json(response);
});

/***************************
	Join Workspace:
		Request - (string:userId,string:workspaceId,string:authCode)
		Response - (string:error, bool:joinSuccess)
***************************/
router.post('/join_workspace', function(req,res){
	console.log("join_workspace");
	//Parse Request Body
	var userId = req.body.userId;
	var workspaceId = req.body.workspaceId;
	var authCode = req.body.authCode;
	var joinSuccess = "true";
	let error = "";

	let workspaceRef = db.collection('workspaces');

	//Note: check desired security measures for passing authCode, can encrypt
	if(!userId || !workspaceId){
		joinSuccess = "false";
		error = "No userID or workspaceID provided";
		var response = {
			error: error,
			joinSuccess : joinSuccess
		};
		res.json(response);
	}else{
		console.log("User Id: " + userId);
		console.log("Workspace Id: " + workspaceId);
		console.log("AuthCode: " + authCode);
		/***
		* Insert Database API Call
		*/
		//check authcode
	// Create a query against the collection
		let workspaceAuthCode = "";
		let workspace = workspaceRef.doc(workspaceId).get()
			.then(doc => {
				if (!doc.exists) {
			      joinSuccess = "false";
			      error = "No workspace with that ID";
			    } else {
					workspaceAuthCode = doc.get("authCode");
					if (workspaceAuthCode == authCode) {
						joinSuccess = "true";
						//this below adds the current user to the array of users in the document 
						let users = workspaceRef.doc(workspaceId).update({
							users: admin.firestore.FieldValue.arrayUnion(userId)
						});

						let userRef = db.collection("users").doc(userId).update({
							workspaces : admin.firestore.FieldValue.arrayUnion(workspaceId)
						})
						
					}
					else {
						joinSuccess = "false";
						error = "Authorization code is incorrect";
						
					}
					var response = {
						error: error,
						joinSuccess : joinSuccess
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
	Get My Workspaces:
		Request - (string:userId)
		Response - (Object [] : myWorkspaceList (or empty list)
					- string : workspaceId
					- String : workspaceName)
***************************/
router.post('/get_my_workspace', function(req,res){
	console.log("get_my_workspace");
	//Parse Request Body
	var userId = req.body.userId;
	var myWorkspaceList;

	if(!userId){
		myWorkspaceList = [];
	}else{
		console.log("User Id: " + userId);
		/***
		* Insert Database API Call
		*/
		
		let userRef = db.collection("users").doc(userId);
		userRef.get().then(
			function (doc) {
				myWorkspaceList = doc.get("workspaces");
				var response = {
					myWorkspaceList : myWorkspaceList
				};
				res.json(response);
			}
		);
	}
	
});

module.exports = router;
