const Sale = require('../schemas/Sale');

module.exports = function(app) {
  function alertForLatePayments() {
    Sale.find({ isPaid: false }, (err, sales) => {
      if (err) { console.log("Error in Set Interval for Late Payments Alert"); }
      if (sales != []) {
        console.log("LATE PAYMENTS");
        sales.map((sale) => {
          console.log(`SALE // Blank ID: ${sale.blankID}, Sale Date: ${sale.saleDate}`);
        });
      } else {
        console.log("Sales all Paid, Will run again in 12 Hours!");
      }
    })
  }

  alertForLatePayments();
  setInterval(alertForLatePayments, 43200000);
}
