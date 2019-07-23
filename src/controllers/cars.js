/* eslint-disable prefer-destructuring */
/* eslint-disable linebreak-style */
// eslint-disable-next-line import/no-extraneous-dependencies
const { Client } = require('pg');

const jwt = require('jsonwebtoken');

const respondErr = (err, res) => {
  console.log(err);
  res.status(500).json({
    status: 500,
    error: {
      message: 'error encountered',
    },
  });
};

const responseSuccess = (res, car_ad) => {
  res.status(200).json({
    status: 200,
    data: {
      status: 200,
      state: 'success',
      message: 'result completed',
      car_ad,
    },
  });
};

const nocarfound = (res) => {
  res.status(200).json({
    status: 200,
    data: {
      message: 'No car found!!!',
    },
  });
};

// GET REQUESTS
const getCars = (req, res) => {
  // PRICE-RANGE AND STATUS-AVAILABLE
  jwt.verify(req.token, process.env.JWT_KEY, (err, authData) => {
    if (err) {
      res.status(401).json({
        status: 401,
        data: {
          message: 'invalid token!!!',
        },
      });
    } else {
      // PG Connect
      const pg = new Client({
        connectionString: process.env.db_URL,
      });
      pg.connect();
      const pgCallback = (err, dbres) => {
        if (err) {
          respondErr(err, res);
          pg.end();
        } else if (dbres.rows.length === 0) {
          nocarfound(res);
          pg.end();
        } else {
          responseSuccess(res, dbres.rows);
          pg.end();
        }
      };

      if (req.query.min_price && req.query.max_price && req.query.status) {
        // eslint-disable-next-line consistent-return
        const query = 'SELECT * FROM carads WHERE price BETWEEN $1 AND $2 AND LOWER(status) = LOWER($3)';
        const value = [req.query.min_price, req.query.max_price, 'available'];
        pg.query(query, value, pgCallback);
      } else if (req.query.state && req.query.status) {
      // eslint-disable-next-line consistent-return
        const query = 'SELECT * FROM carads WHERE LOWER(status)=LOWER($1) AND LOWER(state)=LOWER($2)';
        const value = ['available', req.query.state];
        pg.query(query, value, pgCallback);
      } else if (req.query.manufacturer && req.query.state) {
        // eslint-disable-next-line consistent-return
        const query = 'SELECT * FROM carads WHERE LOWER(manufacturer)=LOWER($1) AND LOWER(state)=LOWER($2)';
        const value = [req.query.manufacturer, req.query.state];
        pg.query(query, value, pgCallback);
      } else if (req.query.status) {
        // eslint-disable-next-line consistent-return
        if (req.query.status === 'sold') {
          const email = authData.user.email;
          let query = 'SELECT is_admin FROM users WHERE LOWER(email) = LOWER($1)';
          let value = [email];
          // eslint-disable-next-line consistent-return
          pg.query(query, value, (err, dbres) => {
            if (err) {
              respondErr(err, res);
              pg.end();
            } else if (!dbres.rows[0].is_admin) {
              const car_ad = [];
              res.status(200).json({
                status: 200,
                data: {
                  state: 'success',
                  message: 'result completed!!',
                  car_ad,
                },
              });
              pg.end();
            } else {
              query = 'SELECT * FROM carads WHERE LOWER(status) = LOWER($1)';
              value = [req.query.status];
              pg.query(query, value, pgCallback);
            }
          });
        } else {
          const query = 'SELECT * FROM carads WHERE LOWER(status) = LOWER($1)';
          const value = [req.query.status];
          pg.query(query, value, pgCallback);
        }
      } else if (req.query.body_type) {
        console.log(req.query.body_type);
        // eslint-disable-next-line consistent-return
        const query = 'SELECT * FROM carads WHERE LOWER(body_type)=LOWER($1) AND status=LOWER($2)';
        const value = [req.query.body_type, 'available'];
        pg.query(query, value, pgCallback);
      } else if (req.query.manufacturer) {
        // eslint-disable-next-line consistent-return
        const query = 'SELECT * FROM carads WHERE LOWER(manufacturer) = LOWER($1) AND LOWER(status)=LOWER($2)';
        const value = [req.query.manufacturer, 'available'];
        pg.query(query, value, pgCallback);
      } else {
        const email = authData.user.email;
        let query = 'SELECT * FROM users WHERE LOWER(email) = LOWER($1)';
        const value = [email];
        // eslint-disable-next-line consistent-return
        pg.query(query, value, (err, dbres) => {
          if (err) {
            respondErr(err, res);
            pg.end();
          } else if (dbres.rows[0].is_admin === false) {
            res.status(403).json({
              error: {
                message: 'Access Denied!!!',
              },
            });
            pg.end();
          } else {
            query = 'SELECT * FROM carads';
            pg.query(query, value, pgCallback);
          }
        });
      }
    }
  });
};

// GET SPECIFIC CAR
const getCar = (req, res) => {
  const ad = req.params;
  jwt.verify(req.token, process.env.JWT_KEY, (err) => {
    if (err) {
      res.status(401).json({
        error: {
          status: 401,
          message: 'error..invalid Token',
        },
      });
    } else {
      const pg = new Client({
        connectionString: process.env.db_URL,
      });
      pg.connect();
      // eslint-disable-next-line consistent-return
      const query = 'SELECT * FROM carads WHERE id = $1';
      const value = [ad.id];

      pg.query(query, value, (err, dbres) => {
        console.log(dbres);
        if (err) {
          // console.log(err);
          res.status(500).json({
            error: {
              message: 'error encountered',
            },
          });
          pg.end();
        } else if (dbres.rows === 0) {
          res.status(200).json({
            status: 200,
            data: {
              status: 200,
              message: 'No car found!!',
            },
          });
          pg.end();
        } else {
          const car_ad = dbres.rows;
          res.status(200).json({
            status: 200,
            data: {
              state: 'success',
              message: 'Success, result completed',
              car_ad,
            },
          });
          pg.end();
        }
      });
    }
  });
};

// GET ADS BY A OWNER
const getadsByOwner = (req, res) => {
  jwt.verify(req.token, process.env.JWT_KEY, (err, authData) => {
    if (err) {
      res.status(403).json({
        error: {
          message: 'error..invalid Token',
        },
      });
    } else {
      const email = authData.user.email;
      const pg = new Client({
        connectionString: process.env.db_URL,
      });
      pg.connect();
      let query = 'SELECT id FROM users WHERE LOWER(email) = LOWER($1)';
      let value = [email];
      // eslint-disable-next-line consistent-return
      pg.query(query, value, (err, dbres) => {
        if (err) {
          res.status(403).json({
            error: {
              message: 'error..',
            },
          });
          console.error(err);
          pg.end();
        } else {
          const owner = dbres.rows[0].id;
          query = 'SELECT * FROM carads WHERE owner = $1';
          value = [owner];
          pg.query(query, value, (err, dbres) => {
            if (err) {
              // console.log(err);
              res.status(500).json({
                data: {
                  message: 'error encountered',
                },
              });
              pg.end();
            } else if (dbres.rows.length === 0) {
              res.status(200).json({
                status: 200,
                data: {
                  message: 'No car found!!',
                },
              });
              pg.end();
            } else {
              const car_ad = dbres.rows;
              res.status(200).json({
                status: 200,
                data: {
                  state: 'success',
                  message: 'Success, result completed',
                  car_ad,
                },
              });
              pg.end();
            }
          });
        }
      });
    }
  });
};

// POST CAR
const postCar = (req, res) => {
  jwt.verify(req.token, process.env.JWT_KEY, (err, authData) => {
    if (err) {
      res.status(401).json({
        status: 401,
        error: {
          message: 'error..invalid token',
        },
      });
    } else {
      const newAd = req.body;
      const created_on = Date.now();
      const price = newAd.price;
      let door = newAd.door;
      door = door || null;
      let image_url = newAd.image_url;
      image_url = image_url || '';
      let owner;
      const email = authData.user.email;
      const pg = new Client({
        connectionString: process.env.db_URL,
      });
      pg.connect();
      let query = 'SELECT * FROM users WHERE LOWER(email) = LOWER($1)';
      let value = [email];
      // eslint-disable-next-line consistent-return
      pg.query(query, value, (err, dbres) => {
        if (err) {
          res.status(403).json({
            status: 403,
            error: {
              message: 'error..',
            },
          });
          console.error(err);
          pg.end();
        } else if (dbres.rows[0].first_name === null) {
          res.status(403).json({
            status: 403,
            error: {
              message: 'Please complete your registration inorder to post a car!!',
            },
          });
          pg.end();
        } else {
          owner = dbres.rows[0].id;
          query = 'INSERT INTO carads(status, price, manufacturer, model, body_type, owner, state, ext_col, int_col, transmission, mileage, door, description, image_url) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)';
          value = [
            newAd.status, price, newAd.manufacturer,
            newAd.model, newAd.body_type, owner, newAd.state,
            newAd.ext_col, newAd.int_col, newAd.transmission,
            newAd.mileage, door, newAd.description, image_url,
          ];
          // eslint-disable-next-line consistent-return
          // PG Query
          // eslint-disable-next-line no-unused-vars
          pg.query(query, value, (err, dbRes) => {
            if (err) {
              console.error(err);
              res.status(500).json({
                status: 500,
                error: {
                  message: 'error..',
                },
              });
              pg.end();
            } else {
              const id = owner;
              const manufacturer = newAd.manufacturer;
              const model = newAd.model;
              res.json({
                status: 200,
                data: {
                  state: 'success',
                  message: 'Posted successfully',
                  id,
                  email,
                  created_on,
                  manufacturer,
                  model,
                },
              });
              pg.end();
            }
          });
        }
      });
    }
  });
};

// PATCH CAR AD
const patchCar = (req, res) => {
  // eslint-disable-next-line no-unused-vars
  jwt.verify(req.token, process.env.JWT_KEY, (err, authData) => {
    if (err) {
      res.status(401).json({
        status: 401,
        error: {
          message: 'error..invalid token',
        },
      });
    } else {
      const email = authData.user.email;
      const adId = req.params.id;
      const ad = req.body;
      let query;
      let value;
      let currUser;
      let owner;
      const pg = new Client({
        connectionString: process.env.db_URL,
      });
      pg.connect();
      query = 'SELECT * FROM users WHERE LOWER(email) = LOWER($1)';
      value = [email];
      // eslint-disable-next-line consistent-return
      pg.query(query, value, (err, dbres) => {
        if (err) {
          res.status(403).json({
            error: {
              message: 'error..',
            },
          });
          console.error(err);
          pg.end();
        } else {
          currUser = dbres.rows[0].id;
          query = 'SELECT owner FROM carads WHERE id = $1';
          value = [adId];
          // eslint-disable-next-line consistent-return
          // eslint-disable-next-line no-shadow
          pg.query(query, value, (err, dbres) => {
            if (err) {
              console.error(err);
              res.status(403).json({
                status: 403,
                error: {
                  message: 'error..',
                },
              });
              pg.end();
            } else if (dbres.rows.length === 0) {
              res.status(200).json({
                status: 200,
                data: {
                  message: 'No ad found',
                },
              });
              pg.end();
            } else {
              owner = dbres.rows[0].owner;
              if (currUser === owner) {
                query = 'UPDATE carads SET status=$1, price=$2 WHERE id=$3';
                value = [ad.status, ad.price, adId];
                // eslint-disable-next-line consistent-return
                // eslint-disable-next-line no-unused-vars
                pg.query(query, value, (err, dbresponse) => {
                  if (err) {
                    console.error(err);
                    res.status(500).json({
                      status: 500,
                      error: {
                        message: 'An error occured, Please check input!!!',
                      },
                    });
                    pg.end();
                  } else {
                    res.status(200).json({
                      status: 200,
                      data: {
                        state: 'success',
                        status: 200,
                        message: 'AD updated successfully!!',
                        ad,
                      },
                    });
                    pg.end();
                  }
                });
              } else {
                res.status(403).json({
                  error: {
                    message: 'You are not permiited to update this ad!!!',
                  },
                });
                pg.end();
              }
            }
          });
        }
      });
    }
  });
};


// DELETE CAR
export const deleteCar = (req, res) => {
  jwt.verify(req.token, process.env.JWT_KEY, (err, authData) => {
    const email = authData.user.email;
    if (err) {
      res.status(401).json({
        status: 401,
        error: {
          message: 'error..invalid token',
        },
      });
    } else {
      const pg = new Client({
        connectionString: process.env.db_URL,
      });
      pg.connect();
      let query = 'SELECT * FROM users WHERE LOWER(email) = LOWER($1)';
      let value = [email];
      // eslint-disable-next-line consistent-return
      pg.query(query, value, (err, dbres) => {
        if (err) {
          console.error(err);
          res.status(500).json({
            status: 500,
            error: {
              message: 'error..',
            },
          });
          pg.end();
        } else if (dbres.rows[0].is_admin === false) {
          res.status(403).json({
            status: 403,
            error: {
              message: 'You are not permitted to delete this Ad!!!',
            },
          });
          pg.end();
        } else {
          query = 'DELETE FROM carads WHERE id = $1';
          value = [req.params.id];
          // eslint-disable-next-line consistent-return
          // eslint-disable-next-line no-unused-vars
          pg.query(query, value, (err, resdb) => {
            if (err) {
              res.status(500).json({
                status: 500,
                error: {
                  message: 'error..',
                },
              });
              console.error(err);
              pg.end();
            } else if (resdb.rowCount === 0) {
              res.status(200).json({
                status: 200,
                data: {
                  message: 'Ad not found!!',
                },
              });
              pg.end();
            } else {
              res.status(200).json({
                status: 200,
                data: {
                  message: 'AD successfully deleted',
                },
              });
              pg.end();
            }
          });
        }
      });
    }
  });
};

// GET MY CAR ORDERS
export const getCarOrders = (req, res) => {
  jwt.verify(req.token, process.env.JWT_KEY, (err, authData) => {
    if (err) {
      res.status(401).json({
        status: 401,
        error: {
          message: 'error..invalid token',
        },
      });
    } else {
      const email = authData.user.email;
      let curruser;
      let query = 'SELECT id FROM users WHERE LOWER(email) = LOWER($1)';
      let value = [email];
      const pg = new Client({
        connectionString: process.env.db_URL,
      });
      pg.connect();
      pg.query(query, value, (err, resdb) => {
        if (err) {
          res.status(401).json({
            status: 401,
            error: {
              message: 'error..',
            },
          });
          pg.end();
        } else {
          curruser = resdb.rows[0].id;
          query = 'SELECT * FROM purchaseorder WHERE car_owner = $1';
          value = [curruser];
          pg.query(query, value, (err, respo) => {
            // console.log(respo);
            if (err) {
              console.error(err);
              res.status(500).json({
                status: 500,
                error: {
                  message: 'error..',
                },
              });
              pg.end();
            } else if (respo.rows.length === 0) {
              res.status(200).json({
                status: 200,
                data: {
                  state: 'success',
                  status: 200,
                  message: 'you do not have car orders yet',
                },
              });
              pg.end();
            } else {
              const mycar_orders = respo.rows;
              res.status(200).json({
                status: 200,
                data: {
                  state: 'success',
                  status: 200,
                  message: 'orders retrieved',
                  mycar_orders,
                },
              });
              pg.end();
            }
          });
        }
      });
    }
  });
};

// GET A CAR ORDER
export const getACarOrder = (req, res) => {
  jwt.verify(req.token, process.env.JWT_KEY, (err, authData) => {
    if (err) {
      res.status(401).json({
        status: 401,
        error: {
          message: 'error..invalid token',
        },
      });
    } else {
      const email = authData.user.email;
      let curruser;
      let query = 'SELECT id FROM users WHERE LOWER(email) = LOWER($1)';
      let value = [email];
      const pg = new Client({
        connectionString: process.env.db_URL,
      });
      pg.connect();
      pg.query(query, value, (err, resdb) => {
        if (err) {
          res.status(500).json({
            status: 500,
            error: {
              message: 'error..',
            },
          });
          pg.end();
        } else {
          curruser = resdb.rows[0].id;
          query = 'SELECT car_owner FROM purchaseorder WHERE id = $1';
          value = [req.params.id];
          pg.query(query, value, (err, respo) => {
            if (err) {
              res.status(500).json({
                status: 500,
                error: {
                  message: 'error..',
                },
              });
              console.error(err);
              pg.end();
            } else if (respo.rows[0].car_owner === curruser) {
              query = 'SELECT * FROM purchaseorder WHERE id = $1';
              value = [req.params.id];
              pg.query(query, value, (err, response) => {
              // console.log(respo);
                if (err) {
                  console.error(err);
                  res.status(500).json({
                    status: 500,
                    error: {
                      message: 'error..',
                    },
                  });
                  pg.end();
                } else {
                  const car_ord = response.rows[0];
                  res.status(200).json({
                    status: 200,
                    data: {
                      state: 'success',
                      message: 'order retrieved',
                      car_ord,
                    },
                  });
                  pg.end();
                }
              });
            } else {
              res.status(401).json({
                status: 401,
                error: {
                  message: 'not permitted..',
                },
              });
              pg.end();
            }
          });
        }
      });
    }
  });
};

// UPDATE MY CAR ORDERS
export const updateCarOrders = (req, res) => {
  jwt.verify(req.token, process.env.JWT_KEY, (err, authData) => {
    if (err) {
      res.status(401).json({
        status: 401,
        error: {
          message: 'error..invalid token',
        },
      });
    } else {
      const email = authData.user.email;
      let query = 'SELECT id FROM users WHERE email = $1';
      let value = [email];
      const pg = new Client({
        connectionString: process.env.db_URL,
      });
      pg.connect();
      pg.query(query, value, (err, resdb) => {
        if (err) {
          console.error(err);
          res.status(500).json({
            error: {
              status: 500,
              message: 'error..',
            },
          });
          pg.end();
        } else {
          const curruser = resdb.rows[0].id;
          const orderid = req.params.id;
          const status = req.body.status;
          query = 'SELECT car_owner FROM purchaseorder WHERE id = $1';
          value = [orderid];
          pg.query(query, value, (err, resdbo) => {
            if (err) {
              console.error(err);
              res.status(500).json({
                status: 500,
                error: {
                  message: 'error..',
                },
              });
              pg.end();
            } else if (resdbo.rows[0].car_owner !== curruser) {
              res.status(401).json({
                status: 401,
                error: {
                  message: 'You are not permitted to update this ad..',
                },
              });
              pg.end();
            } else {
              query = 'UPDATE purchaseorder SET status=LOWER($1) WHERE id = $2';
              value = [status, orderid];
              pg.query(query, value, (err, dbres) => {
                // const result = dbres.rows[0];/
                if (err) {
                  console.error(err);
                  res.status(500).json({
                    status: 500,
                    error: {
                      message: 'error..',
                    },
                  });
                  pg.end();
                } else {
                  res.json({
                    status: 200,
                    data: {
                      message: 'Order Updated',
                    },
                  });
                  pg.end();
                }
              });
            }
          });
        }
      });
    }
  });
};

module.exports = {
  getCars,
  getCar,
  postCar,
  patchCar,
  deleteCar,
  getadsByOwner,
  getCarOrders,
  updateCarOrders,
  getACarOrder,
};
