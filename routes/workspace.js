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
		Request - (string:name,string:authCode)
		Response - (bool:success)
***************************/
router.post('/create_workspace', function(req,res){

});

/***************************
	Join Workspace:
		Request - (int:workspaceId,string:authCode)
		Response - (bool:success)
***************************/
router.post('/join_workspace', function(req,res){

});

