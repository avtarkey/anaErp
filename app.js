var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

/* var indexRouter = require('./routes/index'); */
var usersRouter = require('./routes/users');
var formalRouter=require('./routes/formal');
var thirdVersionRouter=require('./routes/thirdVersion');
var advanceRouter=require('./routes/advance')



var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
//app.use(express.json());
app.use(express.json({limit: '50mb'}));//POST 大文件的josn
app.use(express.urlencoded({limit: '50mb'}));//POST 大文件的josn

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
/* app.use(express.static(path.join(__dirname, 'public'))); */

/* 定义路由 */

/* app.use('/', indexRouter); */
app.use('/users', usersRouter);
app.use('/formal', formalRouter);
app.use('/third', thirdVersionRouter);
app.use('/advance', advanceRouter);
app.use('/static', express.static(__dirname + '/public'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
  console.log('================');

});

module.exports = app;
