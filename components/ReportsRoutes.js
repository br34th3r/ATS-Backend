const fs = require('fs');

module.exports = function(app) {
  // Generate a stock turnover report
  app.post('/stockReport', (req, res) => {
  	console.log("Generate a stock turnover report");
  });

  // Generate an individual interline sales report
  app.post('/interlineSalesReport/:travelAgent', (req, res) => {
  	console.log("Generate an individual interline sales report");
  });

  // Generate an individual domestic sales report
  app.post('/domesticSalesReport/:travelAgent', (req, res) => {
  	console.log("Generate an individual domestic sales report");
  });

  // Generate a global interline sales report per advisor
  app.post('/globalInterlineSalesReport/advisor', (req, res) => {
  	console.log("Generate a global interline sales report per advisor");
  });

  // Generate a global interline sales report per USD rate
  app.post('/globalInterlineSalesReport/USD', (req, res) => {
  	console.log("Generate a global interline sales report per USD rate");
  });

  // Generate a global domestic sales report
  app.post('/globalDomesticSalesReport', (req, res) => {
  	console.log("Generate a global interline sales report per USD rate");
  });
}
