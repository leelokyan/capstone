const express = require("express");
const router = express.Router();

/***************************
	Get Strategies:
		Request - (int:userId,int:workspaceId)
		Response - (bool:success,string:error,List:Strategies)
***************************/
router.get('/get_strategies', function(req,res){

});

/***************************
	Create Strategy:
		Request - (int:workplaceId,string:name,string:description,string:color)
		Response - (int:strategyId,bool:success,string:error)
***************************/
router.post('/create_strategy', function(req,res){

});

/***************************
	Update Strategy:
		Request - (string:name,string:description)
		Response - (bool:success)
***************************/
router.post('/update_strategy', function(req,res){

});
