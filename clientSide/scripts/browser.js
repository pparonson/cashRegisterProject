//needs access to Jquery and cashRegister.js (this in turn needs subscribers)
requirejs.config({
	paths:{
		cashRegister: "../../node_modules/cashRegister/cashRegister",
		jquery: "../../node_modules/jquery/dist/jquery.min",
		jqueryui: "./jquery-ui.min",
		subscribers: "../../node_modules/subscribers/subscribers",
		jqplot: "../jqPlot/jquery.jqplot.min",
		jqplothighlighter: "../jqPlot/plugins/jqplot.highlighter.min",
		jqplotpierenderer: "../jqPlot/plugins/jqplot.pieRenderer.min"

	},
	"shim": {
		"jqplot": ["jquery"],
		"jqplothighlighter": ["jqplot"],
		"jqplotpierenderer": ["jqplot"]
	}
});

require(["cashRegister", "jquery", "jqueryui", "jqplot", "jqplothighlighter"
		, "jqplotpierenderer"], function(cashRegister, $) {
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
			+ " #mainTable td.balanceCol.first").attr("contenteditable","true");
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
		// console.log($("#accountType, #memo, #transactionAmount"));
		$("#accountType, #transactionAmount").val("");
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
		for (i = 0; i < account.transactions.length; i += 1) {
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
			//only reached when switching selected row
			if (selectedRow !== null && selectedRow.data("tID") !== $(this).parent().data("tID")){
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
		console.log(setDataPointArray);
		$("#jqPlotAccount").empty();
		var options = {
			title:account.accountName,
			grid:{drawGridlines:false},
			axes:{
				yaxis:{

				},
				xaxis:{
					showTicks:false
				}
			},
			highlighter: {
				tooltipContentEditor: function(str, seriesIndex, pointIndex){

					if (pointIndex===0)
						return "StartingBalance: $"+account.startingBalance;
					else{
						//return seriesIndex;
						console.log(chart.series[0].data[pointIndex]);
						return account.transactions[pointIndex-1].toString()
							+ "\n Balance: $"+chart.series[0].data[pointIndex][1];
					}
				},
				show: true
				, sizeAdjust: 7.5
				, tooltipLocation: "se"
			}
		};//end: obj options
		// if transactions present, call chart .jqplot fn
		if (account.transactions.length>0) {
			var chart = $.jqplot('jqPlotAccount'
			, [setDataPointArray()], options);
		}//end: if

		// if a memo withdrawl expense is present
		// iterate through transaction obj and grab memo
		options = {
      		title: ' ',
		    seriesDefaults: {
		        shadow: false,
				highlighter: {
					// tooltipContentEditor: function(str, seriesIndex, pointIndex){
					// 	return "['Transportation', 0]";
					// }
					show: true
					, tooltipLocation: "se"
					, useAxesFormatters: false
					, formatString: "%s"

				}//end: obj highlighter
		        , renderer: jQuery.jqplot.PieRenderer
		        , rendererOptions: {
		        	startAngle: 180,
		        	sliceMargin: 4,
		        	showDataLabels: true
				}//end: renderOptions obj literal
		    }//end: seriesDefaults
		    , legend: { show:true, location: 'w' }
		}//end: options obj
		$("#jqPlotMemo").empty();
		if (account.transactions.length > 0) {
			var data = setPieChartData();
			$.jqplot('jqPlotMemo', [data], options);
		}//end: if
	}//end: fn presentAccount()

	/*
	DataPointTable
	 */
	function setDataPointArray() {
		var dataPointTableList = [];
		dataPointTableList.push(account.startingBalance);
		$.each(account.transactions, function() {
			var currentBalance = dataPointTableList[dataPointTableList.length - 1]
				+ this.amount;
			dataPointTableList.push(currentBalance);

		});//end: $.each()
		console.log(dataPointTableList);
		return dataPointTableList;
	}//end: fn setDataPointArray

	// iterate through account.transactions to get to account.transaction.memo
	// create a obj container to add account.transaction.memo to appropriate expense
	// category array
	function setPieChartData() {
		var pieChartData = [];
		pieChartData[0] = ["Transportation", 0];
		pieChartData[1] = ["Entertainment", 0];
		pieChartData[2] = ["Food", 0];
		pieChartData[3] = ["Housing", 0];
		pieChartData[4] = ["Utilities", 0];
		pieChartData[5] = ["Personal", 0];
		pieChartData[6] = ["Health", 0];
		pieChartData[7] = ["Child-care", 0];
		pieChartData[8] = ["Education", 0];
		pieChartData[9] = ["Pets", 0];
		pieChartData[10] = ["Miscellaneous", 0];

		$.each(account.transactions, function(key, value) {
			switch(value.memo) {
    			case "Transportation":
        			pieChartData[0][1] -= value.amount;
        			break;
    			case "Entertainment":
					pieChartData[1][1] -= value.amount;
					break;
				case "Food":
					pieChartData[2][1] -= value.amount;
					break;
				case "Housing":
					pieChartData[3][1] -= value.amount;
					break;
				case "Utilities":
					pieChartData[4][1] -= value.amount;
					break;
				case "Personal":
					pieChartData[5][1] -= value.amount;
					break;
				case "Health":
					pieChartData[6][1] -= value.amount;
					break;
				case "Child-care":
					pieChartData[7][1] -= value.amount;
					break;
				case "Education":
					pieChartData[8][1] -= value.amount;
					break;
				case "Pets":
					pieChartData[9][1] -= value.amount;
					break;
				case "Miscellaneous":
					pieChartData[10][1] -= value.amount;
					break;
				default:
					console.log("Error adding memo expense to pieChartData object.");
				}//end: switch
		});//end: $.each()
		var tempPieChartData = [];
		for (var i = 0; i < pieChartData.length; i += 1) {
			if (pieChartData[i][1] > 0) {
				tempPieChartData.push(pieChartData[i]);
			}
		}//end:for
		return tempPieChartData;
	}//end fn pieChartDataList

	$(window).unload(function(){
		localStorage.setItem("Account", JSON.stringify(account));
	});
});//end: fn require
