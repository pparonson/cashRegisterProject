// cleaning up this file
var cashRegister = require('cashRegister');

console.log(new cashRegister.Account());
var jsonAcct = new cashRegister.Account(175);

console.log(JSON.stringify(jsonAcct));
