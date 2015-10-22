//needs access to Jquery and cashRegister.js (this in turn needs subscribers)
requirejs.config({
	paths:{
		cashRegister: "../../node_modules/cashRegister/cashRegister",
		jquery: "../../node_modules/jquery/dist/jquery.min",
		subscribers: "../../node_modules/subscribers/subscribers"
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
	table.empty();
	table.append($("<tr g='from js'><th>Date</th><th>Amount</th><th>Type</th><th>Memo</th><th>Balance</th></tr>"));
	var row, i;
	for (i=0;i<account.transactions.length;i++){
		row = makeRow(account.transactions[i]);
		table.append(row);
		
	}
	function makeRow(transactionObj){
		var tr = $("<tr></tr>");
		tr.append($("<td>"+transactionObj.date+"</td>"));
		tr.append($("<td>"+transactionObj.amount+"</td>"));
		tr.append($("<td>"+transactionObj.type+"</td>"));
		tr.append($("<td>"+transactionObj.memo+"</td>"));
		return tr;
	}
	
}

$(window).unload(function(){
	localStorage.setItem("Account", JSON.stringify(account))
})
})