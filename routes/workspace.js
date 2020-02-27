const express = require("express");
const router = express.Router();
const admin = require('firebase-admin');

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

/***************************
	Create Workspace:
		Request - (string:workspaceName,string:authCode)
		Response - (int:workspaceId)
***************************/
router.post('/create_workspace', function(req,res){
	console.log("create_workspace");
	//Parse Request Body
	var workspaceName = req.body.workspaceName;
	var authCode = req.body.authCode;

	//Check with frontend team degree of backend validation necessary
	if(!workspaceName || !authCode){	
		workspaceId = -1;
	}else{
		console.log("Workspace Name: " + workspaceName);
		console.log("AuthCode: " + authCode);
		/***
		* Insert Database API Call
		*/
		workspaceId = 1;
	}	
	var response = {
		'workspaceId' : workspaceId
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
