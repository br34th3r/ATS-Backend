const Customer = require('../schemas/Customer');

module.exports = function(app) {
  // Create a customer account
  app.post('/addCustomer', (req, res) => {
  	if (req.query.name && req.query.surname && req.query.alias && req.query.email) {
  		let newCustomer = new Customer({
  			name: req.query.name,
  		  surname: req.query.surname,
  		  alias: req.query.alias,
  			customerStatus: false,
  			email: req.query.email,
  			payments: [],
  			balance: 0
  		});

  		newCustomer.save();
  		res.json("New Customer Added!");
  	}
  });

  // Get all the customers
  app.get('/customers', (req, res) => {
  	Customer.find({}, (err, docs) => {
  		if (err) throw err;
  		res.send(docs);
  		console.log("Returned All Customers!");
  	});
  });

  // Get a customer
  app.get('/customers/:customerID', (req, res) => {
  	Customer.findById(req.params.customerID, (err, doc) => {
  		if (err) throw err;
  		res.json(doc);
  		console.log("Returned Customer by ID");
  	});
  });

  // Edit discount plan
  app.patch('/customers/:customerID/discount/:discountType', (req, res) => {
  	Customer.findOneAndUpdate({ _id: req.params.customerID }, { discountStatus: req.params.discountType });
  	res.send("Updated Customer Discount Status!");
  	console.log("Updated Customer Discount Status!");
  });
}
