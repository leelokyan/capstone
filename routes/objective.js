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
		Response - (array of objects:Objectives; string: error; bool: success)
***************************/
router.post('/get_my_objectives', function(req,res){
	let userId = req.body.userId;

	let objectivesRef = db.collection("objectives");
	let result = [];
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
				let users = doc.get("assignedUsers");
				if (users.includes(userId)) {
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
				if (tempGoalId == goalId) {
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
	Get Objective by ID:
		Request - (string:objectiveId)
		Response - (bool:success,string:error, 
		objective: {
			string:objectiveId, string:goalId, string:name, string: description, array of strings:tags, 
			array of strings: assignedUsers, string:startDate, string:endDate
		})
***************************/
router.post('/get_objective_by_id', function(req,res){
	let objectiveId = req.body.objectiveId;

	let error = "";
	let success = true;

	let queryRef = db.collection("objectives").doc(objectiveId).get()
		.then(doc => {
			if (!doc.exists) {
				success = "false";
				error = "No objective with that ID";
		    } else {
		    	let objectiveData = {
		    		objectiveId: objectiveId,
		    		name: doc.get("name"),
		    		description: doc.get("description"),
		    		tags: doc.get("tags"),
		    		assignedUsers: doc.get("assignedUsers"),
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
			array of strings: assignedUsers, string:startDate, string:endDate)
		Response - (string:objectiveId, bool:success, string:error)

		NOTE : if it's optional for the user to pass in some of these fields, jsut send EMPTY STRINGS or EMPTY ARRAY ([])
***************************/
router.post('/create_objective', function(req,res){
	let name = req.body.name;
	let description = req.body.description;
	let goalId = req.body.goalId;
	let tags = req.body.tags;
	let assignedUsers = req.body.assignedUsers;
	let startDate = req.body.startDate;
	let endDate = req.body.endDate;

	let objectiveId = "";
	let error = "";
	let success = true;

	if(!name){
		objectiveId = "";
		error = 'Create objective error - missing name';
		success = false;
	}else{
		//Database call
		let objectiveData = {
			name : name,
			description : description,
			goalId : goalId,
			tags: tags,
			assignedUsers : assignedUsers,
			startDate : startDate,
			endDate : endDate,
			status : 0
		}
		let objectiveRef = db.collection("objectives").doc();
		objectiveRef.set(objectiveData);

		objectiveId = objectiveRef.id;
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

				//update the strategy
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

