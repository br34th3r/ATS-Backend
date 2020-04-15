const fs = require('fs');

const ExchangeRate = require('../schemas/ExchangeRate');
const Customer = require('../schemas/Customer');
const Commission = require('../schemas/Commission');
const Blank = require('../schemas/Blank');
const Payment = require('../schemas/Payment');
const Ticket = require('../schemas/Ticket');
const Sale = require('../schemas/Sale');

module.exports = function(app) {
  // Record a sold ticket
  app.post('/addSoldTicket', (req, res) => {
  	if (req.body.saleType && req.body.paymentMethod && req.body.blankID && req.body.customerID && req.body.from && req.body.to && req.body.localTax && req.body.commissionID && req.body.saleDate && req.body.payLater) {
  		ExchangeRate.findOne({}, (err, rate) => {
  			if(rate != null) {
  				Customer.findOne({ _id: req.body.customerID }, (err, customer) => {
  					if (customer != null) {
  						Commission.findOne({ _id: req.body.commissionID }, (err, commission) => {
  							if (commission != null) {
  								Blank.findOne({ _id: req.body.blankID }, (err, blank) => {
  									if (blank != null) {
  										Payment.findOneOrCreate({
  											type: req.body.paymentMethod,
  										  cardNumber: req.body.cardNumber ? req.body.cardNumber : null,
  										  expiryDate: req.body.cardExpiry ? req.body.cardExpiry : null,
  										  cvc: req.body.cvc ? req.body.cvc : null,
  										  issuer: req.body.cardIssuer ? req.body.cardIssuer : null,
  										  customerID: req.body.customerID
  										}, (err, payment) => {
  											if (err) throw err;
  											if (rate != null) {
  												let newSale = new Sale({
  													saleType: req.body.saleType,
  													isPaid: !req.body.payLater,
  													costLocal: req.body.costLocal ? req.body.costLocal : null,
  													costUSD: req.body.costUSD ? req.body.costUSD : null,
  													localTaxes: req.body.localTax,
  													otherTaxes: req.body.otherTax ? req.body.otherTax : null,
  													currentRate: rate._id,
  													commission: commission._id,
  													agentID: req.session.passport.user,
  													paymentID: payment._id,
  													customerID: customer._id,
  													blankID: blank._id
  												});

                          let newTicket = new Ticket({
                            isValid: true,
                            departure: req.body.from,
                            destination: req.body.to,
                            saleDate: Date.now(),
                            blankID: blank._id,
                            customerID: customer._id
                          })

  												newSale.save();
                          newTicket.save();
  												res.send("Added new sale!");
  											} else {
  												res.send("Error, Exchange Rate not Found!");
  											}
  										});

  										blank.sold = true;
  										blank.save();
  									} else {
  										res.send("Error, Blank not Found!");
  									}
  								});
  							} else {
  								res.send("Error, Commission not Found!");
  							}
  						});
  					} else {
  						res.send("Error, Customer not Found!");
  					}
  			});
  			} else {
  				res.send("Error, Exchange Rate not Found!");
  			}
  		});
  	} else {
  		res.send("Invalid Query!");
  	}
  });

  app.post('/refundSoldTicket/:ticketID', (req, res) => {
  	Ticket.findById(req.params.ticketID, (err, ticket) => {
  		if (err) throw err;
  		if (ticket != null) {
  			let refundData = {
  				datetime: Date.now(),
  				ticketID: req.params.ticketID,
  			}
  			fs.writeFileSync(`${__dirname}/../refunds/${req.params.ticketID}`, JSON.stringify(refundData));
  			ticket.isValid = false;
  			ticket.save();
  			res.send("Confirmed Refund!");
  		} else {
  			res.send("Ticket returned Null");
  		}
  	});
  });
}
