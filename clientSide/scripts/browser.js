//needs access to Jquery and cashRegister.js (this in turn needs subscribers)
requirejs.config({
	paths:{
		cashRegister: "../node_modules/cashRegister/cashRegister",
		jquery: "../node_modules/jquery/dist/jquery.min",
		subscribers: "../node_modules/subscribers/subscribers"
	}
})

require(["cashRegister", "jquery"], function (cashRegister, $) {
//var cashRegister = require('cashRegister');
var account;
$(document).ready(function(){
	//make a decision
	var localStorageJson = localStorage.getItem("Account");
	if (localStorageJson&&localStorageJson!=="undefined"){
		console.log(typeof localStorageJson)
		console.log(localStorageJson)
		var obj = JSON.parse(localStorageJson);
		account=cashRegister.Account.loadJSON(obj);
		presentAccount();
	}
	if (!account){
		var welcome=$("#welcomePage")
		welcome.css("display","block")
		$("#submitWelcome").click(function(){
			account=cashRegister.Account.initializeAccount($("#SBalance").val(), $("#acctName").val());
			welcome.css("display","none");
			presentAccount();
		})
		//send to welcome page 
		//initialize account by calling cashRegister.Account.initializeAccount(balance, acctname) and call presentAccount
	}
	
	
	
	
});
function presentAccount(){
	$("#accountMainPage").css("display","block");
	var table=$("#mainTable");
	if (table.children.length>1){
		for(var i = 1; i<table.children.length;i++){
			table.children[i].remove();
		}
	}
	
}

$(window).unload(function(){
	localStorage.setItem("Account", JSON.stringify(account))
})
})