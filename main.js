var requirejs = require('requirejs');

requirejs.config({
	
	nodeRequire: require,
	paths: {
		cashRegister: "./node_modules/cashRegister/cashRegister",
		subscribers: "./node_modules/subscribers/subscribers"
	}
});

requirejs(["cashRegister","subscribers"], function(cashRegister, subscribers){

console.log(cashRegister)
console.log(new cashRegister.Account());
var jsonAcct = new cashRegister.Account(175);

console.log(JSON.stringify(jsonAcct));

subscribers.makePublisher(jsonAcct);

console.log(subscribers.makePublisher(jsonAcct));
})
