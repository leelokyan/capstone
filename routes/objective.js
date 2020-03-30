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
	Get My Objectives:
		Request - (string:userId)
		Response - (array of objects:Objectives; string: error; bool: success)
***************************/
router.post('/get_my_objectives', function(req,res){
	let userId = req.body.userId;

	let objectivesRef = db.collection("objectives");
	let result = [];
	let allObjectives = objectivesRef.where("assignedUsers", "array-contains", userId).get()
		.then(snapshot => {
			snapshot.forEach(doc => {
				//string: objectiveID
				// string: name
				// string: startDate
				// string: endDate
				// string []: tags
				// string []: assignedUsers
				// string: description
				// string: goalId (parent goal)
				// bool : complete 
		
					let objectiveData = {
						objectiveId : doc.id,
						name : doc.get("name"),
						startDate : doc.get("startDate"),
						endDate : doc.get("endDate"),
						tags : doc.get("tags"),
						assignedUsers : doc.get("assignedUsers"),
						description : doc.get("description"),
						goalId : doc.get("goalId"),
						status : doc.get("status")
					};

					
				});

				
			

			var response = {
				objectives : result,
				error : "",
				success : true
			};
			res.json(response);
		})
		.catch(err => {
			var response = {
				objectives : [],
				error : "Error getting objectives",
				success : false
			};
			res.json(response);
		});

	
});

/***************************
	Get Objectives of Goal:
		Request - (string:goalId)
		Response - (bool:success,string:error,array of objectives objects:objectives)
***************************/
router.post('/get_objectives', function(req,res){
	let goalId = req.body.goalId;

	let objectivesRef = db.collection("objectives");
	let result = [];
	let goal = ""; //goal name
	let strategy = ""; //strategy name
	let allObjectives = objectivesRef.get()
		.then(snapshot => {
			snapshot.forEach(doc => {
				//string: objectiveID
				// string: name
				// string: startDate
				// string: endDate
				// string []: tags
				// string []: assignedUsers
				// string: description
				// string: goalId (parent goal)
				// bool : complete 
				let tempGoalId = doc.get("goalId");
				if (tempGoalId == goalId && doc.get("valid")) {
					let objectiveData = {
						objectiveId : doc.id,
						name : doc.get("name"),
						startDate : doc.get("startDate"),
						endDate : doc.get("endDate"),
						tags : doc.get("tags"),
						assignedUsers : doc.get("assignedUsers"),
						description : doc.get("description"),
						goalId : doc.get("goalId"),
						status : doc.get("status")

					}

					result.push(objectiveData);
				}

				
			});

			let goalRef = db.collection("goals").doc(goalId).get()
				.then(doc => {
					let data = doc.data();
					goal = data.name;
					//now get strategy

					let stratRef = db.collection("strategies").doc(data.strategyId).get()
						.then(doc => {
							let stratDat = doc.data();
							strategy = stratDat.name;

							var response = {
								goal : goal,
								strategy : strategy,
								objectives : result,
								error : "",
								success : true
							};
							res.json(response);

						})
						.catch( err => {
							console.log(err);
							var response = {
								goal : goal,
								strategy : strategy,
								objectives : [],
								error : "Error getting objectives",
								success : false
							};
							res.json(response);
						});

				})
				.catch(err => {
					console.log(err);
					var response = {
						goal : goal,
						strategy : strategy,
						objectives : [],
						error : "Error getting objectives",
						success : false
					};
					res.json(response);
				});

			
		})
		.catch(err => {
			var response = {
				objectives : [],
				error : "Error getting objectives",
				success : false
			};
			res.json(response);
		});
});

/***************************
	Get Objective by ID:
		Request - (string:objectiveId)
		Response - (bool:success,string:error, 
		objective: {
			string:objectiveId, string:goalId, string:name, string: description, array of strings:tags, 
			string []: assignedUsers, string:startDate, string:endDate
		})
***************************/
router.post('/get_objective_by_id', function(req,res){
	let objectiveId = req.body.objectiveId;

	let error = "";
	let success = true;

	let queryRef = db.collection("objectives").doc(objectiveId).get()
		.then(doc => {
			if (!doc.exists || !doc.get("valid")) {
				var response = {
					objective : {},
					error : "No objective with that ID",
					success : false
				};
				res.json(response);
		    } else {
		    	let objectiveData = {
		    		objectiveId: objectiveId,
		    		name: doc.get("name"),
		    		description: doc.get("description"),
		    		tags: doc.get("tags"),
		    		assignedUsers : doc.get("assignedUsers"),
		    		startDate: doc.get("startDate"),
		    		endDate: doc.get("endDate")
		    	}

		    	var response = {
					objective : objectiveData,
					error : "",
					success : true
				};
				res.json(response);
		    }
		})
		.catch(err => {
			console.log(err);
			var response = {
				objective: {},
				error : "Error getting objective",
				success : false
			};
			res.json(response);
		});
});


/***************************
	Create Objective:
		Request - (string:goalId, string:name, string: description, array of strings:tags, 
			strings []: assignedUsers, string:startDate, string:endDate)
		Response - (string:objectiveId, bool:success, string:error)

		NOTE : if it's optional for the user to pass in some of these fields, jsut send EMPTY STRINGS or EMPTY ARRAY ([])
***************************/
router.post('/create_objective', function(req,res){
	let name = req.body.name;
	let description = req.body.description;
	let goalId = req.body.goalId;
	let tags = null;
	if (req.body.tags != null) {
		tags = req.body.tags;
	}
	let assignedUsers = null;
	if (req.body.assignedUsers != null) {
		assignedUsers = req.body.assignedUsers;
	}
	let startDate = req.body.startDate;
	let endDate = req.body.endDate;

	let objectiveId = "";
	let error = "";
	let success = true;

	if(!name){
		objectiveId = "";
		error = 'Create objective error - missing name';
		success = false;
	}else if(!goalId){
		objectiveId = "";
		error = 'Create objective error - missing goalId';
		success = false;
	}else{
		//Database call
		let objectiveData = {
			name : name,
			description : description,
			goalId : goalId,
			tags: null,
			assignedUsers : null,
			startDate : startDate,
			endDate : endDate,
			status : 0,
			valid : true
		}
		let objectiveRef = db.collection("objectives").doc();
		objectiveRef.set(objectiveData);

		objectiveId = objectiveRef.id;
		// Add tags to tag collection
		let tagRef = db.collection("tags");
		for(let t in tags){
			tagRef.doc(tags[t]).set({tagName:tags[t]});
		}

		//Update Goal's Objective List
		let goalRef = db.collection("goals").doc(goalId);
		goalRef.get().then(doc =>{
			if(!doc.exists){
				objectiveId = "";
				error = 'Create objective error - unable to find goal with matching id';
				success = false;
			}else{
				goalRef.update({
					objectives: admin.firestore.FieldValue.arrayUnion(objectiveId)
				})
			}
		}).catch(err =>{
			objectiveId = false;
			error = "Create objective error - error updating goal's objective list";
			success = false;
		});

	}

	var response = {
		objectiveId : objectiveId,
		error : error,
		success : success
	};
	res.json(response);

});

/***************************
	Update Objective:
		Request - (string:objectiveId, string: description, string:name, string [] :tags, string []:assignedUsers, 
			string:startDate, string:endDate, int:status)
		Response - (bool:success,string:error)
***************************/
router.post('/update_objective', function(req,res){
	let objectiveId = req.body.objectiveId;
	let name = req.body.name;
	let description = req.body.description;
	let tags = req.body.tags;
	let assignedUsers = req.body.assignedUsers;
	let startDate = req.body.startDate;
	let endDate = req.body.endDate;
	let status = req.body.status;

	let success = true;
	let error = "";

	db.collection("objectives").doc(objectiveId).get() 
		.then(doc => {
			//check if strategy with that id exists
			if (!doc.exists) {
				error = "No objective with that ID";
				success = false;

				var response = {
					success : success,
					error : error
				};
				res.json(response);
			}
			else {

				//update the objective
				db.collection("objectives").doc(objectiveId).update( {
					name : name,
					description : description,
					tags : tags,
					assignedUsers : assignedUsers,
					startDate : startDate,
					endDate : endDate,
					status : status
				});

				var response = {
					success : true,
					error : error
				};
				res.json(response);
			}
		})
		.catch(err => {
			console.log('error getting doc' , err);
		});

});

/***************************
	Update Objective Status:
		Request - (int:status,string:objectiveId)
		Response - (bool:success)
***************************/
router.post('/update_objective_status', function(req,res){
	let status = req.body.status;
	let objectiveId = req.body.objectiveId;
	let error = "";
	
	db.collection("objectives").doc(objectiveId).get() 
		.then(doc => {
			//check if strategy with that id exists
			if (!doc.exists) {
				error = "No objective with that ID";
				success = false;

				var response = {
					success : success,
					error : error
				};
				res.json(response);
			}
			else {

				//update the strategy
				db.collection("objectives").doc(objectiveId).update( {
					status : status
				});

				var response = {
					success : true,
					error : error
				};
				res.json(response);
			}
		})
		.catch(err => {
			console.log('error getting doc' , err);
		});

});

/***************************
	Add Tag:
		Request - (string:tagName)
		Response - (bool:success)
***************************/
router.post('/add_tag', function(req,res){
	let tag = req.body.tagName;
	if(!tag){
		var response = {
			success : false,
			error : "tag is null"
		}
		res.json(response);
	}else{
		tagRef = db.collection('tags');

		let newTag = {
			tagName : tag
		}
		tagRef.doc(tag).set(newTag);
		var response = {
			success : true,
			error : ""
		}
		res.json(response);
	}
});


/***************************
	Assign Tag:
		Request - (string:tagName, string objectiveId)
		Response - (bool:success)
***************************/
router.post('/assign_tag', function(req,res){
	let tag = req.body.tagName;
	let objective = req.body.objectiveId;

	let objRef = db.collection('objectives').doc(objective);
	objRef.get().then(doc =>{
		if(doc.exists){
			objRef.update({
				tags : admin.firestore.FieldValue.arrayUnion(tag)
			});
			let response = {
				success : true,
				error : ""
			}
			res.send(response);
		}else{
			let response = {
				success : false,
				error : "Objective Id does not match any objective"
			}
			res.send(response);
		}
	});
});

/***************************
	Unassign Tag:
		Request - (string:tagName, string objectiveId)
		Response - (bool:success)
***************************/
router.post('/unassign_tag', function(req,res){
	let tag = req.body.tagName;
	let objective = req.body.objectiveId;

	let objRef = db.collection('objectives').doc(objective);
	objRef.get().then(doc =>{
		if(doc.exists){
			objRef.update({
				tags : admin.firestore.FieldValue.arrayRemove(tag)
			});
			let response = {
				success : true,
				error : ""
			}
			res.send(response);
		}else{
			let response = {
				success : false,
				error : "Objective Id does not match any objective"
			}
			res.send(response);
		}
	});
});

/***************************
	Assign User:
		Request - (string:userId, string: objectiveId)
		Response - (bool:success, string:error)
***************************/
router.post('/assign_user', function(req,res) {
	let userId = req.body.userId;
	let objectiveId = req.body.objectiveId;
	let response = null;
	if(!objectiveId || !objectiveId){
		response = {
			success : false,
			error : "Either userId or objectiveId is null"
		}
		res.json(response);
	}
	else{
		let objRef = db.collection('objectives').doc(objectiveId);
		objRef.get().then(doc => {
			if(doc.exists){
				objRef.update({
					assignedUsers : admin.firestore.FieldValue.arrayUnion(userId)
				})
				response = {
					success : true,
					error : ""
				};
				res.json(response);
			}else{
				response = {
					success : false,
					error : "objectiveId does not exist"
				}
				res.json(response);
			}
		});
	}
});

/***************************
	Unassign User:
		Request - (string:userId, string: objectiveId)
		Response - (bool:success, string:error)
***************************/
router.post('/unassign_user', function(req,res) {
	let userId = req.body.userId;
	let objectiveId = req.body.objectiveId;
	let response = null;
	if(!objectiveId || !objectiveId){
		response = {
			success : false,
			error : "Either userId or objectiveId is null"
		}
		res.json(response);
	}
	else{
		let objRef = db.collection('objectives').doc(objectiveId);
		objRef.get().then(doc => {
			if(doc.exists){
				objRef.update({
					assignedUsers : admin.firestore.FieldValue.arrayRemove(userId)
				})
				response = {
					success : true,
					error : ""
				};
				res.json(response);
			}else{
				response = {
					success : false,
					error : "objectiveId does not exist"
				}
				res.json(response);
			}
		});
	}
});

/***************************
	Delete Objective:
		Request - (string:objectiveId)
		Response - (bool:success)
***************************/
router.post('/delete_objective', function(req,res) {
	let objectiveId = req.body.objectiveId;
	
	let objRef = db.collection('objectives').doc(objectiveId);
	objRef.get().then(doc => {
		if(doc.exists){
			// let goal = doc.data().goalId;
			// db.collection('goals').doc(goal).update({
			// 	objectives : admin.firestore.FieldValue.arrayRemove(objectiveId)
			// });
			objRef.update({valid:false});
			let response = {
				success : true,
				error : ""			
			};
			res.json(response);
		}else{
			let response = {
				success : false,
				error : "Objective id does not exist"			
			};
			res.json(response);
		}
	}).catch(err =>{

	});
	
});

/***************************
	Get Objectives By Tag:
		Request - (string: tag) since the tag should be unique
		Response - (array of objects: objectives, string: error, bool: success)
***************************/
router.post('/get_objectives_by_tag', function(req,res) {

	let tag = req.body.tag;

	let objectivesRef = db.collection("objectives");
	let result = [];
	let allObjectives = objectivesRef.where("tags", "array-contains", tag).get()
		.then(snapshot => {
			snapshot.forEach(doc => {
				if(doc.get("valid")){
					let docData = doc.data();
					docData.objectiveId = doc.id;
					result.push(docData);
				}
			});

			let response = {
				success : true,
				error : "",
				objectives : result		
			};
			res.json(response);
		})
		.catch(err => {
			console.log(err);
			var response = {
				objectives : [],
				error : "Error getting objectives",
				success : false
			};
			res.json(response);
		});

});
/***************************
	Get All Tags:
		Request - 
		Response - (array of tags: tags, string: error, bool: success)
***************************/
router.post('/get_all_tags', function(req,res){
	let result = [];
	let tagRef = db.collection("tags").get()
		.then(snapshot =>{
			snapshot.forEach(doc =>{
				result.push(doc.get("tagName"));
			});
			let response = {
				tags : result,
				error : "",
				success : true
			};
			res.json(response);
		}).catch(err => {
			console.log(err);
			let response = {
				tags : result,
				error : "Error getting tags",
				success : false
			};
			res.json(response);
		});
});

module.exports = router;

