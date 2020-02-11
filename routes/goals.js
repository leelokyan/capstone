const express = require("express");
const router = express.Router();

/***************************
	Get Goals:
		Request - (int:userId,int:workspaceId,int:strategyId)
		Response - (bool:success,string:error,List:goals,int:percentComplete)
***************************/
router.get('/get_goals', function(req,res){

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