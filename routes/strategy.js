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
			snapshot.forEach(doc => {
				//name
				//array of goals
				//description
				let strategyData = {
					strategyId : doc.id,
					name : doc.get("name"),
					goals : doc.get("goals"),
					description : doc.get("description")
				};

				console.log(strategyData);
				result.push(strategyData);
			});

			var response = {
				strategies : result,
				error : error,
				success : success
			};
			res.json(response);
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

/***************************
	Delete Strategy:
		Request - (string: strategyId)
		Response - (bool:success, string:error)
***************************/
router.post('/delete_strategy',function(req,res){
	let strategy = req.body.strategyId;

	if(!strategy){
		let response = {
			success : false,
			error : "sent null"
		};
		res.json(response);
	}else{
		let strategyRef = db.collection('strategies');
		strategyRef.doc(strategy).get().then(doc => {
			if(doc.exists){
				//Do we also delete goals that correspond to this strategy?
				// db.collection('goals').where('strategy','==',strategy).get()
				// 	.then(snapshot =>{
				// 	snapshot.forEach(doc => {
				// 		if(doc.exists){
				// 			doc.delete();
				// 		}
				// 	});
				// });

				strategyRef.doc(strategy).delete();
				let response = {
					success : true,
					error : ""
				};
				res.json(response);
			}else{
				let response = {
					success : false,
					error : "strategy does not exist"
				};
				res.json(response);
			}
		});
	}
});

module.exports = router;