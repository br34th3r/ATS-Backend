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
      res.status(400).json({ errors: "Invalid Query!" })
    }
  });

  // Get all the customers
  app.get('/customers', (req, res) => {
    console.log(req);
  	Customer.find({}, (err, docs) => {
  		if (err) { res.status(400).json({ errors: err }); }
  		res.status(200).json({ ok: true, customers: docs });
  		console.log("Returned All Customers!");
  	});
  });

  // Get a customer
  app.get('/customers/getById', (req, res) => {
    if (req.body.customerID) {
      Customer.findById(req.body.customerID, (err, doc) => {
    		if (err) { res.status(400).json({ errors: err }); }
    		res.status(200).json({ ok: true, customer: doc });
    		console.log("Returned Customer by ID");
    	});
    } else {
      res.status(400).json({ errors: "Invalid Query!" });
    }
  });

  // Edit discount plan
  app.post('/customers/editDiscount', (req, res) => {
    if (req.body.customerID && req.body.discountType) {
      Customer.findOneAndUpdate({ _id: req.body.customerID }, { discountStatus: req.body.discountType }, function(err, result) {
  			if (err) { res.status(400).json({ errors: err }); }
        res.status(200).json({ ok: true });
  		});
    } else {
      res.status(400).json({ errors: "Invalid Query!" });
    }
  });
}
