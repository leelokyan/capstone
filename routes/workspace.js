const express = require("express");
const router = express.Router();

const db = initialize();

function initialize () {

	const admin = require('firebase-admin');

	let db = admin.firestore();

	return db;
}

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
		Request - (string:workspaceName,string:authCode)
		Response - (string:workspaceId)
***************************/
router.post('/create_workspace', function(req,res){
	console.log("create_workspace");
	//Parse Request Body
	console.log(req);
	var workspaceName = req.body.workspaceName;
	var authCode = req.body.authCode;
	let error = "";
	console.log(workspaceName + " "  + authCode);
	//Check with frontend team degree of backend validation necessary
	if(!workspaceName || !authCode){	
		workspaceId = "";
		error = "No workspace name or authentication code given";
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
			let data = {
				workspaceName : workspaceName,
				authCode : authCode
			}

			let setDoc = workspaceDocRef.set(data);
		}
	}	
	var response = {
		error : error, 
		workspaceId : workspaceDocRef.id //this string will be empty if there's an error

	};
	res.json(response);
});

/***************************
	Join Workspace:
		Request - (int:userId,int:workspaceId,string:authCode)
		Response - (bool:joinSuccess)
***************************/
router.post('/join_workspace', function(req,res){
	console.log("join_workspace");
	//Parse Request Body
	var userId = req.body.userId;
	var workspaceId = req.body.workspaceId;
	var authCode = req.body.authCode;
	var joinSuccess;

	//Note: check desired security measures for passing authCode, can encrypt
	if(!userId || !workspaceId || !authCode){
		joinSuccess = false;
	}else{
		console.log("User Id: " + userId);
		console.log("Workspace Id: " + workspaceId);
		console.log("AuthCode: " + authCode);
		/***
		* Insert Database API Call
		*/
		joinSuccess = true;
	}
	var response = {
		'joinSuccess' : joinSuccess
	};
	res.json(response);
});

/***************************
	Get My Workspace:
		Request - (int:userId)
		Response - (Object [] : myWorkspaceList (or empty list)
					- int : workspaceId
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
		w1 = {
			workspaceId : 1,
			workspaceName : 'Krusty Crab',
		};
		w2 = {
			workspaceId : 2,
			workspaceName : 'Chum Bucket',
		};
		myWorkspaceList = [w1,w2];
	}
	var response = {
		'myWorkspaceList' : myWorkspaceList
	};
	res.json(response);
});

module.exports = router;
