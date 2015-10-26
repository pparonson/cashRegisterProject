//needs access to Jquery and cashRegister.js (this in turn needs subscribers)
requirejs.config({
	paths:{
		cashRegister: "../../node_modules/cashRegister/cashRegister",
		jquery: "../../node_modules/jquery/dist/jquery.min",
		jqueryui: "./jquery-ui.min",
		subscribers: "../../node_modules/subscribers/subscribers"
	}
});

require(["cashRegister", "jquery", "jqueryui"], function (cashRegister, $) {
//var cashRegister = require('cashRegister');
	var account;
	var selectedRow=null;
	$(document).ready(function(){
		//jQuery datepicker
		$(function() {
		  $( "#datepicker" ).datepicker({
			  dateFormat: "yy-mm-dd"
		  });

		});
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
		}
		//getElementById translated to jQuery
		//document.getElementById("transactionDate").value = getCurrentDate();
		$("#datepicker").val(getCurrentDate);
		//make a decision branch
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

			//send to welcome page
			//initialize account by calling cashRegister.Account.initializeAccount(balance, acctname) and call presentAccount
		}
		$("#submitWelcome").click(function(){
				account=cashRegister.Account.initializeAccount(($("#SBalance").val()*1), $("#acctName").val());
				$("#welcomePage").css("display","none");
				presentAccount();
				account.subscribe("change", function(){
				presentAccount();
				});
			});

		$("#submitDeposit").click(function(){
			try{
			account.addTransaction(($("#transactionAmount").val()*1)
						,$("#datepicker").val()
						,$("#accountType").val()
						,$("#memo").val());
			}catch(err){
				alert(err);
			}

		});
		$("#submitWithdraw").click(function(){
			try{
			account.addTransaction(($("#transactionAmount").val()*-1)
						,$("#datepicker").val()
						,$("#accountType").val()
						,$("#memo").val());
			}catch(err){
				alert(err);
			}
		});
		$("#deleteAccount").click(function(){
			account=null;
			$("#accountMainPage").css("display","none");
			$("#welcomePage").css("display","block");
		});
		$("#editAccount").click(function(){
			$("#mainTable td:not(.edit):not(.delete)").attr("contenteditable","true");
			$("#mainTable tr:has(td)").addClass("editableRow");
		})


		$("#mainTable td").focus(function(){
			if (selectedRow!=null&&selectedRow.data("tID")!==$(this).parent().data("tID")){
				selectedRow.removeClass("selectedRow");
				console.log("logic to reset")
				console.log(selectedRow);
				console.log($(this).parent())
			}
			selectedRow=$(this).parent();

			$(this).parent().addClass("selectedRow");
			var tracker = $(this).parent().html();
			$(this).parent().find(".edit").html("save").off().click(
				function(){
					account.editTransaction()
				}
			);
			$(this).parent().find(".delete").html("delete row").off().click(
				function(){
					alert("delete");
				}
			);

				$("#mainTable td").blur(function(evt){

					//$(this).parent().html(tracker);

				})


		})



	});
	function presentAccount(){
		$("#accountMainPage").css("display","block");
		var table=$("#mainTable");
		table.empty();
		table.append($("<tr><th class='date'>Date</th><th class='type'>Type</th><th class='memo'>Memo</th><th class='amount'>Amount</th><th class='balance'>Balance</th></tr>"));
		table.append($("<tr><td class='date'></td><td class='type'></td><td class='memo'></td><td class='amount'></td><td class='balanceCol'>"+account.startingBalance+"</td><td class='edit'></td></tr>"));
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
			tr.data("tID", transactionObj.id);
			console.log(tr.data("tID"));
			console.log(transactionObj.id)
			tr.append($("<td class='date'>"+transactionObj.date+"</td>"));
			tr.append($("<td class='type'>"+transactionObj.type+"</td>"));
			tr.append($("<td class='memo'>"+transactionObj.memo+"</td>"));
			tr.append($("<td class='amount'>"+transactionObj.amount+"</td>"));
			var balanceCalc = $("#mainTable tr:last-child .balanceCol").html()*1+transactionObj.amount;
			//console.log($("#mainTable>tbody:last-child .balanceCol").html());
			tr.append($("<td class='balanceCol'>"+balanceCalc+"</td>"));
			tr.append($("<td class='edit'></td>"));
			tr.append($("<td class='delete'></td>"));
			return tr;
		}
		$("#currentBalance").html("Balance: "+account.currentBalance);

	}

	$(window).unload(function(){
		localStorage.setItem("Account", JSON.stringify(account));
	});
});
