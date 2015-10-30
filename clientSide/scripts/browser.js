//needs access to Jquery and cashRegister.js (this in turn needs subscribers)
requirejs.config({
	paths:{
		cashRegister: "../../node_modules/cashRegister/cashRegister",
		jquery: "../../node_modules/jquery/dist/jquery.min",
		jqueryui: "./jquery-ui.min",
		subscribers: "../../node_modules/subscribers/subscribers",
		jqplot: "../jqPlot/jquery.jqplot.min"
	},
	"shim": {
		"jqplot": ["jquery"]
	}
});

require(["cashRegister", "jquery", "jqueryui", "jqplot"], function(cashRegister, $) {
//var cashRegister = require('cashRegister');
	var account;
	var selectedRow = null;
	$(document).ready(function(){
		//jQuery datepicker
		$( "#datepicker" ).datepicker({
			dateFormat: "yy-mm-dd"
		});//end: fn

		$( "#accountType" ).autocomplete({
			source: ["Cash", "Credit Card", "Check #"
			, "Wire Transfer", "Direct Deposit"]
		});//end: fn



		/*
		getElementById translated to jQuery
		document.getElementById("transactionDate").value = getCurrentDate();
		 */
		$("#datepicker").val(getCurrentDate);
		//make a decision branch
		var localStorageJson = localStorage.getItem("Account");
		if (localStorageJson && localStorageJson !== "undefined" &&
		localStorageJson !== "null"){
				$("#welcomePage").css("display","none");	//temporary
				console.log(typeof localStorageJson);
				console.log(localStorageJson);
				var obj = JSON.parse(localStorageJson);
				account = cashRegister.Account.loadJSON(obj);
				presentAccount();
				account.subscribe("change", function() {
				presentAccount();
			});
		}//end: if

		if (!account){
			var welcome = $("#welcomePage");
			welcome.css("display","block");
		}//end: if

		/*
		send to welcome page
		initialize account by calling cashRegister.Account.initializeAccount
			(balance, acctname) and call presentAccount
		 */
		$("#submitWelcome").click(function() {
			account = cashRegister.Account.initializeAccount(
				($("#SBalance").val() * 1), $("#acctName").val());
			$("#welcomePage").css("display","none");
			presentAccount();
			account.subscribe("change", function() {
				presentAccount();
			});//end: fn
		});

		$("#submitDeposit").click(function() {
				try{
					account.addTransaction(
						($("#transactionAmount").val() * 1)
						,$("#datepicker").val()
						,$("#accountType").val()
						,$("#memo").val()
					);
			}catch(err) {
				alert(err);
			}

		});//end: fn

		$("#submitWithdraw").click(function() {
			try{
				account.addTransaction(
					($("#transactionAmount").val()*-1)
					,$("#datepicker").val()
					,$("#accountType").val()
					,$("#memo").val()
				);
			}catch(err){
				alert(err);
			}
		});//end: fn

		$("#deleteAccount").click(function() {
			account = null;
			$("#accountMainPage").css("display","none");
			$("#welcomePage").css("display","block");
		});

		$("#editAccount").click(function() {
			$("#mainTable td:not(.edit):not(.delete):not(.balanceCol):not(.first),"
			+" #mainTable td.balanceCol.first").attr("contenteditable","true");
			//$("#mainTable td.balanceCol.first").attr("contenteditable","true");
			//$("#mainTable tr:has(td)").addClass("editableRow");
		});

	});//end: fn document.ready()
	function getCurrentDate() {
		    var currentDate = new Date(),
		        //add 1 to 0 based index month
		        currentMonth = '' + (currentDate.getMonth() + 1),
		        currentDay = '' + currentDate.getDate(),
		        currentYear = currentDate.getFullYear();

		    if (currentMonth.length < 2) {
		        currentMonth = '0' + currentMonth;
		    }
		    if (currentDay.length < 2) {
		        currentDay = '0' + currentDay;
		    }

		    currentDate = [currentYear, currentMonth,
				currentDay].join('-');
		    // console.log(currentDate);
		    return currentDate;
	}//end: fn
	function presentAccount() {
		$("#datepicker").val(getCurrentDate);
		console.log($("#accountType, #memo, #transactionAmount"));
		$("#accountType, #memo, #transactionAmount").val("");
		selectedRow=null;
		$("#accountMainPage").css("display","block");
		var table = $("#mainTable");
		table.empty();
		table.append($("<tr><th class='date'>Date</th>"
					+ "<th class='type'>Type</th>"
					+ "<th class='memo'>Memo</th>"
					+ "<th class='amount'>Amount</th>"
					+ "<th class='balance'>Balance</th></tr>"));
		table.append($("<tr><td class='date first'></td>"
					+ "<td class='type first'></td>"
					+ "<td class='memo first'></td>"
					+ "<td class='amount first'></td>"
					+ "<td class='balanceCol first'>" + account.startingBalance + "</td>"
					+ "<td class='edit first'></td>"
					+ "<td class='delete first'></td></tr>"));
		var row, i;
		for (i = 0; i < account.transactions.length; i += 1){
			row = makeRow(account.transactions[i]);
			table.append(row);
		}//end: for

		function makeRow(transactionObj) {
			var tr = $("<tr></tr>");
			if (transactionObj.amount<0) {
				tr.addClass("withdrawRow");
			} else{
				tr.addClass("depositRow");
			}//end: if
			tr.data("tID", transactionObj.id);
			console.log(tr.data("tID"));
			console.log(transactionObj.id);
			tr.append($("<td class='date'>" + transactionObj.date + "</td>"));
			tr.append($("<td class='type'>" + transactionObj.type + "</td>"));
			tr.append($("<td class='memo'>" + transactionObj.memo + "</td>"));
			tr.append($("<td class='amount'>" + transactionObj.amount + "</td>"));
			var balanceCalc = $("#mainTable tr:last-child .balanceCol").html() * 1
				+ transactionObj.amount;
			//console.log($("#mainTable>tbody:last-child .balanceCol").html());
			tr.append($("<td class='balanceCol'>" + balanceCalc+"</td>"));
			tr.append($("<td class='edit'></td>"));
			tr.append($("<td class='delete'></td>"));
			return tr;
		}//end: fn makeRow()

		$("#currentBalance").html("Balance: " + account.currentBalance);

		$("#mainTable td:not(.edit):not(.delete)").focus(function(evt){

			if (selectedRow !== null && selectedRow.data("tID") !== $(this).parent().data("tID")){//only reached when switching selected row
				selectedRow.removeClass("selectedRow");
				selectedRow.find("td.amount").html(selectedRow.amount);
				selectedRow.find("td.date").html(selectedRow.date);
				selectedRow.find("td.type").html(selectedRow.type);
				selectedRow.find("td.memo").html(selectedRow.memo);
				selectedRow.find("td.balanceCol").html(selectedRow.balance);
				console.log("logic to reset");
				console.log(selectedRow);
				console.log($(this).parent());


			}//end: if

			//need a conditional here
			if (selectedRow===null||selectedRow.data("tID") !== $(this).parent().data("tID")){
				selectedRow=$(this).parent();
				selectedRow.amount=selectedRow.find("td.amount").html();
				selectedRow.date=selectedRow.find("td.date").html();
				selectedRow.type=selectedRow.find("td.type").html();
				selectedRow.memo=selectedRow.find("td.memo").html();
				selectedRow.balance=selectedRow.find("td.balanceCol").html();

				selectedRow.addClass("selectedRow");
			}



			selectedRow.find(".edit:not(.first)").html("save").off().click(
				function(evt){
					var row=$(evt.target).parent();
					var amt=row.find("td.amount").html()*1;
					var date=row.find("td.date").html();
					var type=row.find("td.type").html();
					var memo=row.find("td.memo").html();
					var id = row.data("tID");
					console.log(amt +date+type+memo+id);
					account.editTransaction(id, amt, date, type, memo);
				}//end: fn
			);
			selectedRow.find(".edit.first").html("save").off().click(
				function(evt){
					var row=$(evt.target).parent();
					var balance=row.find("td.balanceCol").html();
					if (!isNaN(Number(balance))){
						account.startingBalance=Number(balance);
						account.notify("change");
						presentAccount();
					}

				}
			);


			selectedRow.find(".delete:not(.first)").html("delete row").off().click(
				function(evt){
					account.deleteTransaction($(evt.target).parent().data("tID"));
				}//end: fn
			);




		});//end: fn .focus()
	}//end: fn presentAccount()

	$(window).unload(function(){
		localStorage.setItem("Account", JSON.stringify(account));
	});
});//end: fn require
