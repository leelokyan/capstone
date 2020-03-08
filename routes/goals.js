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
	Delete Goal:
		Request - (int:goalId)
		Response - (bool:success, string: error)
***************************/
router.post('/delete_goal', function(req,res){
	let goalId = req.body.goalId;
	let response = null;
	if(!goalId){
		response = {
			success : false,
			error : "Goal id is null"			
		};
		res.json(response);
	}
	else{
		goalRef = db.collection('goals').doc(goalId);
		goalRef.get().then(doc => {
			if(doc.exists){
				let strategy = doc.data().strategy;
				db.collection('strategies').doc(strategy).update({
					goals : admin.firestore.FieldValue.arrayRemove(goalId)
				});
				goalRef.delete();
				response = {
					success : true,
					error : ""			
				};
				res.json(response);
			}else{
				response = {
					success : false,
					error : "Goal id does not exist"			
				};
				res.json(response);
			}
		});
	}
});

/***************************
	Update Goal:
		Request - (int:goalId, string:name, string:strategyId,string:description)
		Response - (bool:success, string: error)
***************************/
router.post('/update_goal', function(req,res){
	let goalId = req.body.goalId;
	let newName = req.body.name;
	let newStrategyId = req.body.strategyId;
	let newDescription = req.body.description;

	let response = null;

	if(!goalId){
		let response = {
			success : false,
			error : "Null goal id"
		}
		res.json(response);
	}
	else{
		let goalRef = db.collection("goals").doc(goalId);
		goalRef.get().then(doc => {
			if(doc.exists){
				let update = {
					name : newName,
					strategy : newStrategyId,
					description : newDescription
				};
				let oldStrategyId = doc.data().strategy;
				if(!newName) update.name = doc.data().name;
				if(!newStrategyId) update.strategy = doc.data().strategy;
				if(!newDescription) update.description = doc.data().description;

				goalRef.update(update);

				if(newStrategyId){
					let strategyRef = db.collection("strategies");
					strategyRef.doc(newStrategyId).get()
						.then(doc =>{
							if(doc.exists){
								//Add to new strategy
								strategyRef.doc(newStrategyId).update({
									goals : admin.firestore.FieldValue.arrayUnion(goalId)
								});
								//Remove from old strategy
								strategyRef.doc(oldStrategyId).update({
									goals: admin.firestore.FieldValue.arrayRemove(goalId)
								});
							}else{
								let response = {
									success : false,
									error : "New strategy does not exists"
								}
								res.json(response);
							}
						});
				}
				let response = {
					success : true,
					error : ""
				}
				res.json(response);
			}else{
				response = {
					success : false,
					error : "goal id does not exist"
				}
				res.json(response);
			}
		});
	}
	
});
module.exports = router;