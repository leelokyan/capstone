const express = require("express");
const router = express.Router();

const db = initialize();

function initialize () {
	const admin = require('firebase-admin');
	let db = admin.firestore();
	return db;
}
const admin = require('firebase-admin');

/***************************
	Get Goals:
		Request - (String:strategyId)
		Response - (List:goals,String:error,int:percentComplete)
***************************/
router.post('/get_goals', function(req,res){
	let goal = req.body.goalId;

	let goals = [];
	let error = null;
	let response = null;

	if(!strategy){
		response = {
			goals : goals,
			error : "Null strategy id"
		}
		res.json(response);
	}else{
		let goalRef = db.collection("goals");
	}
});

/***************************
	Create Goal:
		Request - (String:strategyId,String:name,String:description)
		Response - (String:error,String:goalId)
***************************/
router.post('/create_goal', function(req,res){
	let strategy = req.body.strategyId;
	let goal = req.body.name;
	let description = req.body.description;

	//Check for empty fields
	if(!strategy || !goal || !description){
		let response = {
			error : "Strategy/goal/description is null",
			goalId : null
		};
		res.json(response);
	}else{
		//Create Goal
		let data = {
			name : goal,
			description : description,
			objectives : [],
			startDate : null,
			endDate : null
		};
		//Insert goal to db
		let goalDocRef = db.collection("goals").doc();
		let setDocRef = goalDocRef.set(data);

		//Update strategy list
		let strategyRef = db.collection("strategies");
		let s = strategyRef.doc(strategy).get()
			.then(doc => {
				if (!doc.exists) {
			    	console.log("Failure: strategy does not exist");
			    	var response = {
						error : "Failure: strategy does not exist",
						goalId : null
					};
					res.json(response);	
			    } else {
					//this below adds the current user to the array of users in the document 
					let goals = strategyRef.doc(strategy).update({
						goals: admin.firestore.FieldValue.arrayUnion(goalDocRef.id)
					});
					var response = {
						error : null,
						goalId : goalDocRef.id
					};
					res.json(response);	
			    }
			  })
			  .catch(err => {
			    console.log('Error getting document', err);
			  }
		);
	}
});


/***************************
	Update Goal:
		Request - (int:goalId,string:name)
		Response - (bool:success)
***************************/
router.post('/update_goal', function(req,res){

});
module.exports = router;