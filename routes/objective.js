const express = require("express");
const router = express.Router();

const db = initialize();

function initialize () {
	const admin = require('firebase-admin');
	let db = admin.firestore();
	return db;
}

/***************************
	Get My Objectives:
		Request - (string:userId)
		Response - (array of objects:Objectives)
***************************/
router.post('/get_my_objectives', function(req,res){

});

/***************************
	Get Objectives of Goal:
		Request - (string:goalId)
		Response - (bool:success,string:error,List:goals)
***************************/
router.post('/get_objectives', function(req,res){

});

/***************************
	Create Objective:
		Request - (string:goalId,array of strings:tags,string:userId,string:startDate,string:endDate)
		Response - (string:objectiveId,bool:success,string:error)
***************************/
router.post('/create_objective', function(req,res){

});

/***************************
	Update Objective:
		Request - (string:objectiveId, string [] :tags,string []:assignedUsers,string:startDate,string:endDate,int:status)
		Response - (bool:success,string:error)
***************************/
router.post('/update_objective', function(req,res){

});

/***************************
	Update Objective Status:
		Request - (int:status,string:objectiveId)
		Response - (bool:success)
***************************/
router.post('/update_objective_status', function(req,res){

});

/***************************
	Add Tag:
		Request - (string:tagName)
		Response - (bool:success)
***************************/
router.post('/add_tag', function(req,res){

});


/***************************
	Assign Tag:
		Request - (string:tagName, string objectiveId)
		Response - (bool:success)
***************************/
router.post('/assign_tag', function(req,res){

});

/***************************
	Assign User:
		Request - (string:userId, string: objectiveId)
		Response - (bool:success)
***************************/
router.post('/assign_user', function(req,res) {

});


/***************************
	Delete Objective:
		Request - (string:objectiveId)
		Response - (bool:success)
***************************/
router.post('/delete_objective', function(req,res) {

});


module.exports = router;

