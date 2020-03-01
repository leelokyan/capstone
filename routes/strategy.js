const express = require("express");
const router = express.Router();

const db = initialize();

function initialize () {
	const admin = require('firebase-admin');
	let db = admin.firestore();
	return db;
}

/***************************
	Get Strategies:
		Request - (int:userId,int:workspaceId)
		Response - (bool:success,string:error,List:Strategies)
***************************/
router.post('/get_strategies', function(req,res){

});

/***************************
	Create Strategy:
		Request - (String:workspaceId,String:name,String:description,String:color)
		Response - (int:strategyId,string:error)
***************************/
router.post('/create_strategy', function(req,res){
	let workspaceId = req.body.workspaceId;
	let name = req.body.name;
	let description = req.body.description;
	let color = req.body.color;

	let strategyId;
	let error;

	if(!workspaceId || !name || !description ||  !color){
		strategyId = -1;
		error = 'Create strategy error';
	}else{
		//Database call
	}

	var response = {
		strategyId : strategyId,
		error : error
	};
	res.json(response);

});

/***************************
	Update Strategy:
		Request - (string:name,string:description)
		Response - (bool:success)
***************************/
router.post('/update_strategy', function(req,res){

});

module.exports = router;