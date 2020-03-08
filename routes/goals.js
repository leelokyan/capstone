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
	let strategyId = req.body.strategyId;

	let goals = [];
	let error = null;
	let response = null;

	if(!strategyId){
		response = {
			success : false,
			error : "Null strategy id",
			goals : goals
		}
		res.json(response);
	}else{
		let goalRef = db.collection("goals");
		let queryRef = goalRef.where('strategy','==',strategyId).get()
		.then(snapshot =>{
			if(snapshot.empty){
				console.log("empty");
			}else{
				snapshot.forEach(doc => {
					goals.push(doc.data());
				});	
				response = {
					success : true,
					error : "",
					goals : goals
				};
				res.json(response);
			}
		})
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
			strategy : strategy,
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
		Request - (int:goalId, string:name, string:strategyId,string:description)
		Response - (bool:success, string: error)
***************************/
router.post('/update_goal', function(req,res){
	let goalId = req.body.goalId;
	let name = req.body.name;
	let strategyId = req.body.strategyId;
	let description = req.body.description;

	if(!goalId){
		let request = {
			success : false,
			error : "Null goal id"
		}
		res.json(request);
	}
	// else{
	// 	let goalRef = db.collection("goals");
	// 	let queryRef = goalRef.doc(goalId).get()
	// 		.then(doc => {
	// 			if(doc.exists){
					
	// 			}else{
	// 				console.log("Not found");
	// 			}
	// 		})
	// }
	
});
module.exports = router;