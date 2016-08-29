'use strict';


// ---- Includes ----

// Node.js
var util = require('util');
var path = require('path');


// Application
var Hapi = require('hapi');
var Jade = require('pug');


// Plugins
var Vision = require('vision'); // Happy views
var Inert = require('inert'); // for static content
var Joi = require('joi'); // Form Validation
var Hoek = require('hoek'); // Error Handler


// Custom App Extensions
var mailer = require('./mailer');
var DB = require('./database');


// ---- Server ----

var server = new Hapi.Server();
server.connection({ port: process.env.PORT || 8080 });


// ---- Routes ----

var pages = {
    '/' : 'index',
    '/about' : 'about',
    '/inv62' : 'inv62',
    '/web' : 'web',
    /*
    '/node' : 'node',
    '/full-stack' : 'full-stack',
    '/open-source' : 'open-source',
    '/databases' : 'databases',
    '/testing-continuous-deployment' : 'testing-continuous-deployment',
    */
};


// ---- Routing ----

server.register([Vision, Inert], function(err) {

  Hoek.assert(!err, err);

  if (err) { throw err; }
  server.views({
    engines: { jade: Jade },
    path: __dirname + '/templates',
    helpersPath: __dirname + '/templates/helpers',
    compileOptions: {
      pretty: true
    }
  });

  var handle = function(url) {
    return function(req, res){
      // Regenerate template on each request if NODE_ENV != "production"
      res.view(pages[url], {
        title: "The Larson Agency | Engineering and Development Resource",
      });
    };
  };

  for (var k in pages){
    server.route({
      method : "GET",
      path: k,
      handler : handle(k)
    });
  }

  // Serve static files from `static` dir.
  server.route({
    method: 'GET',
    path: '/{param*}',
    handler: {
      directory: {
        path: 'static',
        listing: false,
        index: true
      }
    }
  });

  // ---- EMAIL ----

  // Handler for /api/contact AJAX endpoint
  server.route({
    method: 'POST',
    path: '/api/contact',
    config: {
      handler: function (req, res) {
        mailer.greeting(req.payload.email, req.payload.first, req.payload.last);
        mailer.prospect(req.payload.email, req.payload.first, req.payload.last, req.payload.msg);
        DB.Prospect.create({
          firstname: req.payload.first,
          lastname: req.payload.last,
          email: req.payload.email,
          description: req.payload.msg,
        }).then(function(prospect) {
          return res({ status: 'ok', errors: [], result: {}});
        });
      },
      validate: {
        payload: {
          first: Joi.string(),
          last: Joi.string(),
          email: Joi.string().email().required(),
          msg: Joi.string(),
        }
      }
    }
  });


  // ---- Launch Server ----

  server.start(function(err) {
    if (err) { throw err; }
    console.log("Server is listening at " + server.info.uri);
  });
});


