const jwt = require('jsonwebtoken');
const cars = require('../db/Cars.js');
const orders = require('../db/Orders.js');

// const jwtKey = require('../bin/www');

const postOrder = (req, res) => {
  const newOrder = req.body;
  newOrder.id = orders.length + 1;
  newOrder.created_on = new Date();
  newOrder.status = 'available';
  jwt.verify(req.token, process.env.JWT_KEY, (err, authData) => {
    if (err) {
      res.status(403).json({
        message: 'error..Invalid Token',
      });
    } else {
      cars.push(newOrder);
      res.json({
        message: 'Posted successfully',
        newOrder,
        authData,
      });
    }
  });
};

const patchOrder = (req, res) => {
  jwt.verify(req.token, process.env.JWT_KEY, (err, authData) => {
    if (err) {
      res.status(403).json({
        message: 'error..incorrect Token',
      });
    } else {
      const foundOrder = orders.filter(order => order.id === parseInt(req.params.id, 10));
      const editOrder = foundOrder[0];
      editOrder.amount = req.body.amount;
      res.json({
        message: 'Updated successfully',
        authData,
        editOrder,
      });
    }
  });
};
module.exports = {
  postOrder,
  patchOrder,
};
