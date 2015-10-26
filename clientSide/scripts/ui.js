var currentDate;
function formatDate() {
    var currentDate = new Date(),
        //add 1 to 0 based index month
        currentMonth = '' + (currentDate.getMonth() + 1),
        currentDay = '' + currentDate.getDate(),
        currentYear = currentDate.getFullYear();

    if (currentMonth.length < 2) {
        currentMonth = '0' + currentMonth
    };
    if (currentDay.length < 2) {
        currentDay = '0' + currentDay
    };

    currentDate = [currentYear, currentMonth
        , currentDay].join('-');
    console.log(currentDate);
    return currentDate;
}
document.getElementById("transactionDate").value = formatDate();

$(function() {
  $( "#datepicker" ).datepicker();
  $( "#format" ).change(function() {
    $( "#datepicker" ).datepicker( "option", "dateFormat", $( this ).val() );
  });
});
