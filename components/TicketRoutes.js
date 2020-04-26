const fs = require('fs');

const ExchangeRate = require('../schemas/ExchangeRate');
const Customer = require('../schemas/Customer');
const User = require('../schemas/User');
const Commission = require('../schemas/Commission');
const Blank = require('../schemas/Blank');
const Payment = require('../schemas/Payment');
const Ticket = require('../schemas/Ticket');
const Sale = require('../schemas/Sale');

module.exports = function(app) {
  // Record a sold ticket
  app.post('/addSoldTicket', (req, res) => {
  	if (req.body.saleType && req.body.paymentMethod && req.body.blankNumber && req.body.blankType && req.body.customerID && req.body.from && req.body.to && req.body.localTax && req.body.payLater) {
  		ExchangeRate.findOne({}, (err, rate) => {
  			if(rate != null) {
  				Customer.findOne({ _id: req.body.customerID }, (err, customer) => {
  					if (customer != null) {
              User.findOne({ _id: req.body.user }, (err, agent) => {
                if (agent != null) {
                  Commission.findOne({ blankType: req.body.blankType }, (err, commission) => {
      							if (commission != null) {
      								Blank.findOne({ type: req.body.blankType, number: req.body.blankNumber }, (err, blank) => {
      									if (blank != null) {
      										Payment.findOneOrCreate({
      											type: req.body.paymentMethod,
      										  cardNumber: req.body.cardNumber ? req.body.cardNumber : null,
      										  expiryDate: req.body.cardExpiry ? req.body.cardExpiry : null,
      										  cvc: req.body.cvc ? req.body.cvc : null,
      										  issuer: req.body.cardIssuer ? req.body.cardIssuer : null,
      										  customerID: customer._id
      										}, (err, payment) => {
      											if (err) { res.status(400).json({ errors: err }); }
    												let newSale = new Sale({
    													saleType: req.body.saleType,
    													isPaid: !req.body.payLater,
    													costLocal: req.body.costLocal ? req.body.costLocal : null,
    													costUSD: req.body.costUSD ? req.body.costUSD : null,
    													localTaxes: req.body.localTax,
                              saleDate: Date.now(),
    													otherTaxes: req.body.otherTax ? req.body.otherTax : null,
    													currentRate: rate._id,
    													commission: commission._id,
    													agentID: agent._id,
    													paymentID: payment._id,
    													customerID: customer._id,
    													blankID: blank._id
    												});
                            newSale.save();

                            let newTicket = new Ticket({
                              isValid: true,
                              departure: req.body.from,
                              destination: req.body.to,
                              blankID: blank._id,
                              customerID: customer._id,
                              saleID: newSale._id
                            })

                            newTicket.save();
    												res.status(200).json({ ok: true });
      										});

      										blank.sold = true;
      										blank.save();
      									} else {
      										res.status(400).json({ errors: "Error, Blank not Found!" });
      									}
      								});
      							} else {
      								res.status(400).json({ errors: "Error, Commission not Found!" });
      							}
                  });
                } else {
                  res.status(400).json({ errors: "Agent ID Not Found!" });
                }
  						});
  					} else {
  						res.status(400).json({ errors: "Error, Customer not Found!" });
  					}
  			});
  			} else {
  				res.status(400).json({ errors: "Error, Exchange Rate not Found!" });
  			}
  		});
  	} else {
  		res.status(400).json({ errors: "Invalid Query!" });
  	}
  });

  app.post('/refundSoldTicket', (req, res) => {
    if(req.body.ticketID) {
      Ticket.findById(req.body.ticketID, (err, ticket) => {
    		if (err) { res.status(400).json({ errors: err }) };
    		if (ticket != null) {
          if (ticket.isValid == true) {
      			let refundData = {
      				datetime: Date.now(),
      				ticketID: req.body.ticketID,
      			}
      			fs.writeFileSync(`${__dirname}/../refunds/${req.body.ticketID}.log`, JSON.stringify(refundData));
      			ticket.isValid = false;
      			ticket.save();
      			res.status(200).json({ ok: true });
          } else {
            res.status(400).json({ errors: "Ticket is Invalid!" });
          }
    		} else {
    			res.status(400).json({ errors: "Ticket returned Null" });
    		}
    	});
    } else {
      res.status(400).json({ errors: "Invalid Query!" });
    }
  });

  app.get('/getLatePayments', (req, res) => {
    let resJson = [];
    Sale.find({ isPaid: false }, (err, sales) => {
      if (err) { res.status(400).json({ errors: err })}
      sales.map((sale) => {
        Blank.findById(sale.blankID, (err, blank) => {
          Customer.findById(sale.customerID, (err, customer) => {
            resJson.append({
              customerName: `${customer.name} ${customer.surname}`,
              blankType: blank.type,
              blankNumber: blank.number
            });
          });
        });
      });
      res.status(200).json({ ok: true, sales: resJson });
    });
  });
}
