const express = require("express");
const router = express.Router();
const admin = require('firebase-admin');

/***************************
	Add User:
		Request - (String:name, String email)
		Response - (int : userId)
***************************/
router.post('/add_user',function(req,res)->{
	console.log("Add User");
});


/***************************
	Edit User: TDB
		Request - ()
		Response - ()
***************************/