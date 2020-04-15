const Customer = require('../schemas/Customer');

module.exports = function(app) {
  // Create a customer account
  app.post('/addCustomer', (req, res) => {
  	if (req.body.name && req.body.surname && req.body.alias && req.body.email) {
  		let newCustomer = new Customer({
  			name: req.body.name,
  		  surname: req.body.surname,
  		  alias: req.body.alias,
  			customerStatus: false,
  			email: req.body.email,
  			payments: [],
  			balance: 0
  		});

  		newCustomer.save();
  		res.status(200).json({ ok: true });
  	} else {
      res.status(400).josn({ errors: "Invalid Query!" })
    }
  });

  // Get all the customers
  app.get('/customers', (req, res) => {
  	Customer.find({}, (err, docs) => {
  		if (err) throw err;
  		res.send({ok: true, customers: docs });
  		console.log("Returned All Customers!");
  	});
  });

  // Get a customer
  app.get('/customers/getById/:customerID', (req, res) => {
  	Customer.findById(req.params.customerID, (err, doc) => {
  		if (err) throw err;
  		res.json(doc);
  		console.log("Returned Customer by ID");
  	});
  });

  // Edit discount plan
  app.post('/customers/editDiscount/:customerID/discount/:discountType', (req, res) => {
		Customer.findOneAndUpdate({ _id: req.params.customerID }, { discountStatus: req.params.discountType }, function(err, result) {
			if (err) {
				res.send(err);
			} else {
				res.send(result);
				console.log("Updated Customer Discount Status!");
			}
		});
  });
}
