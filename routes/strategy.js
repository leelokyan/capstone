const express = require("express");
const router = express.Router();

const db = initialize();

function initialize () {
	const admin = require('firebase-admin');
	let db = admin.firestore();
	return db;
}

async function getCompletion (goals) {
	let completeNum = 0;
	let totalNum = 0;
	for (var x of goals) {
		//these are goalids, so need to query each of them
		let currX = x;
		await db.collection("objectives").where("goalId", "==", currX).get()
			.then(snapshot => {
				snapshot.forEach(doc => {
					if (doc.get("status") == 1) {
						console.log("1 " + doc.get("name"));
						completeNum++;
					}
					totalNum++;
				});			
			});

	}

	let result = {
		completeNum : completeNum,
		totalNum : totalNum
	};
	return result;

}

/***************************
	Get Strategies:
		Request - 
		Response - (bool:success,string:error,array of objects:Strategies)
***************************/
router.post('/get_strategies', function(req,res){
	let result = [];
	let success = true;
	let error = "";

	console.log("get_strategies");

	let strategiesRef = db.collection("strategies");
	let allStrategies = strategiesRef.get()
		.then(snapshot => {
			success = true;
			let index = 0; 
			let snapshotlength = snapshot.docs.length;
			snapshot.forEach(doc => {
				//now, we need to get the % completion
				let goals = doc.get("goals");
				let completeNum = 0;
				let totalNum = 0;
				getCompletion(goals).then(completionResult => {
					completeNum = completionResult.completeNum;
					totalNum = completionResult.totalNum;


					//right now this doesn't work because of the stupid async stuff
					let completion = 0;
					if (totalNum > 0) {
						completion = completeNum / totalNum * 100;
					}
					//name
					//array of goals
					//description
					//completion percentage
					let strategyData = {
						strategyId : doc.id,
						name : doc.get("name"),
						goals : doc.get("goals"),
						description : doc.get("description"),
						completion : completion
					};

					result.push(strategyData);

					index++;
					if (index == snapshotlength) {
						var response = {
							strategies : result,
							error : error,
							success : success
						};
						res.json(response);
					}

				})

				
			});

			
		})
		.catch (err => {
			console.log("Error getting documents", err);
			error = "Unable to get documents";
			success = false;

			var response = {
				strategies : [],
				error : error,
				success : success
			};
			res.json(response);
		})

});

/***************************
	Create Strategy:
		Request - (String:name,String:description)
		Response - (string:strategyId,string:error)
***************************/
router.post('/create_strategy', function(req,res){
	let name = req.body.name;
	let description = req.body.description;

	let strategyId = "";
	let error = "";

	if(!name || !description){
		strategyId = "";
		error = 'Create strategy error - missing name or description';
	}else{
		//Database call
		let strategyData = {
			name : name,
			description : description,
			goals : []
		}
		let strategyRef = db.collection("strategies").doc();
		strategyRef.set(strategyData);

		strategyId = strategyRef.id;
	}

	var response = {
		strategyId : strategyId,
		error : error
	};
	res.json(response);

});

/***************************
	Update Strategy:
		Request - (string: strategyId, string:name,string:description)
		Response - (bool:success)
***************************/
router.post('/update_strategy', function(req,res){
	let name = req.body.name;
	let description = req.body.description;
	let strategyId = req.body.strategyId;

	let success = true;
	let error = "";

	db.collection("strategies").doc(strategyId).get() 
		.then(doc => {
			//check if strategy with that id exists
			if (!doc.exists) {
				error = "No strategy with that ID";
				success = false;

				var response = {
					success : success,
					error : error
				};
				res.json(response);
			}
			else {

				//update the strategy
				db.collection("strategies").doc(strategyId).update( {
					name : name,
					description : description
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

module.exports = router;