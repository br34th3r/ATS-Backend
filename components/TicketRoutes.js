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
  	if (req.query.saleType && req.query.paymentMethod && req.query.blankID && req.query.customerID && req.query.from && req.query.to && req.query.localTax && req.query.commissionID && req.query.saleDate && req.query.payLater) {
  		ExchangeRate.findOne({}, (err, rate) => {
  			if(rate != null) {
  				Customer.findOne({ _id: req.query.customerID }, (err, customer) => {
  					if (customer != null) {
  						Commission.findOne({ _id: req.query.commissionID }, (err, commission) => {
  							if (commission != null) {
  								Blank.findOne({ _id: req.query.blankID }, (err, blank) => {
  									if (blank != null) {
  										Payment.findOneOrCreate({
  											type: req.query.paymentMethod,
  										  cardNumber: req.query.cardNumber ? req.query.cardNumber : null,
  										  expiryDate: req.query.cardExpiry ? req.query.cardExpiry : null,
  										  cvc: req.query.cvc ? req.query.cvc : null,
  										  issuer: req.query.cardIssuer ? req.query.cardIssuer : null,
  										  customerID: req.query.customerID
  										}, (err, payment) => {
  											if (err) throw err;
  											if (rate != null) {
  												let newSale = new Sale({
  													saleType: req.query.saleType,
  													isPaid: !req.query.payLater,
  													costLocal: req.query.costLocal ? req.query.costLocal : null,
  													costUSD: req.query.costUSD ? req.query.costUSD : null,
  													localTaxes: req.query.localTax,
  													otherTaxes: req.query.otherTax ? req.query.otherTax : null,
  													currentRate: rate._id,
  													commission: commission._id,
  													agentID: req.session.passport.user,
  													paymentID: payment._id,
  													customerID: customer._id,
  													blankID: blank._id
  												});

                          let newTicket = new Ticket({
                            isValid: true,
                            departure: req.query.from,
                            destination: req.query.to,
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
