//needs access to Jquery and cashRegister.js (this in turn needs subscribers)
requirejs.config({
	paths:{
		cashRegister: "../../node_modules/cashRegister/cashRegister",
		jquery: "../../node_modules/jquery/dist/jquery.min",
		subscribers: "../../node_modules/subscribers/subscribers"
	}
});

require(["cashRegister", "jquery"], function (cashRegister, $) {
//var cashRegister = require('cashRegister');
	var account;
	$(document).ready(function(){
		//make a decision
		var localStorageJson = localStorage.getItem("Account");
		if (localStorageJson && localStorageJson!== "undefined" && localStorageJson!== "null"){
			$("#welcomePage").css("display","none");	//temporary
			console.log(typeof localStorageJson);
			console.log(localStorageJson);
			var obj = JSON.parse(localStorageJson);
			account = cashRegister.Account.loadJSON(obj);
			presentAccount();
			account.subscribe("change", function(){
			presentAccount();
			});
		}
		if (!account){
			var welcome=$("#welcomePage");
			welcome.css("display","block");
			$("#submitWelcome").click(function(){
				account=cashRegister.Account.initializeAccount(($("#SBalance").val()*1), $("#acctName").val());
				welcome.css("display","none");
				presentAccount();
				account.subscribe("change", function(){
				presentAccount();
				});
			});
			//send to welcome page
			//initialize account by calling cashRegister.Account.initializeAccount(balance, acctname) and call presentAccount
		}

		$("#submitDeposit").click(function(){

			account.addTransaction(($("#transactionAmount").val()*1)
						,$("#transactionDate").val()
						,$("#accountType").val()
						,$("#memo").val());

		});
		$("#submitWithdraw").click(function(){

			account.addTransaction(($("#transactionAmount").val()*-1)
						,$("#transactionDate").val()
						,$("#accountType").val()
						,$("#memo").val());

		});
		$("#deleteAccount").click(function(){
			account=null;
			$("#accountMainPage").css("display","none");
			$("#welcomePage").css("display","block");
			
			
		});



	});
	function presentAccount(){
		$("#accountMainPage").css("display","block");
		var table=$("#mainTable");
		table.empty();
		table.append($("<tr><th>Date</th><th>Amount</th><th>Type</th><th>Memo</th><th>Balance</th></tr>"));
		table.append($("<tr><td colspan='4'>Starting Balance</td><td class='balanceCol'>"+account.startingBalance+"</td></tr>"));
		var row, i;
		for (i=0;i<account.transactions.length;i++){
			row = makeRow(account.transactions[i]);
			table.append(row);

		}
		function makeRow(transactionObj){

			var tr = $("<tr></tr>");
			if (transactionObj.amount<0){
				tr.addClass("withdrawRow");
			}
			else{
				tr.addClass("depositRow");
			}
			tr.append($("<td>"+transactionObj.date+"</td>"));
			tr.append($("<td>"+transactionObj.amount+"</td>"));
			tr.append($("<td>"+transactionObj.type+"</td>"));
			tr.append($("<td>"+transactionObj.memo+"</td>"));
			var balanceCalc = $("#mainTable tr:last-child .balanceCol").html()*1+transactionObj.amount;
			//console.log($("#mainTable>tbody:last-child .balanceCol").html());
			tr.append($("<td class='balanceCol'>"+balanceCalc+"</td>"));
			return tr;
		}
		$("#currentBalance").html("Balance: "+account.currentBalance);

	}

	$(window).unload(function(){
		localStorage.setItem("Account", JSON.stringify(account));
	});
});
