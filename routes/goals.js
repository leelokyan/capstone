const express = require("express");
const router = express.Router();

const db = initialize();

function initialize () {

	const admin = require('firebase-admin');

	let serviceAccount = require('../firebase-key.json');

	admin.initializeApp({
	  credential: admin.credential.cert(serviceAccount)
	});

	let db = admin.firestore();

	return db;
}

/***************************
	Get Goals:
		Request - (int:userId,int:workspaceId,int:strategyId)
		Response - (bool:success,string:error,List:goals,int:percentComplete)
***************************/
router.get('/get_goals', function(req,res){
	// var userId = req.param(userId);
	// var workspaceId = req.params.workspaceId;
	// var strategyId = req.params.strategyId;

	console.log(req.body);
});

/***************************
	Create Goal:
		Request - (int:workplaceId,int:strategyId,int:name)
		Response - (bool:success,string:error,int:goalId)
***************************/
router.get('/create_goal', function(req,res){

});

/***************************
	Update Goal:
		Request - (int:goalId,string:name)
		Response - (bool:success)
***************************/
router.get('/update_goal', function(req,res){

});
module.exports = router;