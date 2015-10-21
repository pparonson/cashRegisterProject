var cashRegister = require('cashRegister');
var subscribers = require('subscribers');

console.log(new cashRegister.Account());
var jsonAcct = new cashRegister.Account(175);

console.log(JSON.stringify(jsonAcct));
console.log(subscribers.makePublisher(jsonAcct));
