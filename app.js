var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var ip = require('ip');
var flash = require('connect-flash');
var models = require('./models');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var passport = require('passport');
var session = require('express-session');


var routes = require('./routes/router');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());
app.use(session({ secret: 'ilovescotchscotchyscotchscotch' }));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
//app.use(express.static(path.join(__dirname, 'angular')));
require('./config/passport.js')(passport); // pass passport for configuration
//require('./routes/router.js')(app, passport); // load our routes and pass in our app and fully configured passport
app.use(express.static('public'));
//
app.use('/', routes);
//app.use('/users', users);

//Start Server
models.sequelize.sync().then(function () {
  var server = app.listen(8080, function () {
    var host = ip.address();
    var port = server.address().port;
    console.log('Example app listening at http://%s:%s', host, port);
  });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});



// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
