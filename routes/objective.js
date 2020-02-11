const express = require("express");
const router = express.Router();

/***************************
	Get My Objectives:
		Request - (int:userId,int:goalId)
		Response - (List:Objectives)
***************************/
router.get('/get_my_objectives', function(req,res){

});

/***************************
	Get All Objectives:
		Request - (int:goalId)
		Response - (bool:success,string:error,List:goals,int:percentComplete)
***************************/
router.get('/get_objectives', function(req,res){

});

/***************************
	Create Objective:
		Request - (int:goalId,int:strategyId,List:tags,int:userId,date:startDate,date:endDate)
		Response - (int:objectiveId,bool:success,string:error)
***************************/
router.post('/create_objective', function(req,res){

});

/***************************
	Update Objective:
		Request - (int:goalId,int strategyId,List:tags,int:userId,date:startDate,date:endDate,int:status)
		Response - (int:objectiveId,bool:success,string:error)
***************************/
router.post('/update_objective', function(req,res){

});

/***************************
	Update Objective Status:
		Request - (int:newStatus,int:objectiveId)
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


