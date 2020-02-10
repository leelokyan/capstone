/***
*	Workspace Page Handlers 
*/
const express = require("express");
const admin = require('firebase-admin');

exports.getUsers = function(db) {
	db.collection('users').get()
	  .then((snapshot) => {
	    snapshot.forEach((doc) => {
	      console.log(doc.id, '=>', doc.data());
	    });
	  })
	  .catch((err) => {
	    console.log('Error getting documents', err);
	});
}
