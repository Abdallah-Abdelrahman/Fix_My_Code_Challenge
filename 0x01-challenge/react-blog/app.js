/**
 * Express configurations.
 *
 * @type {exports|module.exports}
 */
const Router = require('react-router');
const React = require('react/addons');
const express = require('express');
const Iso = require('iso');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

// Define Routes here
const posts = require('./routes/post.routes');
const routes = require('./src/routes.jsx');
const alt = require('./src/alt');
const config = require('./config.js');
const app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: 'copy cat', resave: false, saveUninitialized: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(cookieParser());

// use Routes here
app.use('/', posts);

app.use(function (req, res) {
  const data = res.locals.data || {};
  alt.bootstrap(JSON.stringify(data));

  const metaDescription = res.locals.metaDescription || '';

  const iso = new Iso();

  Router.run(routes, req.url, function (Handler) {
    const content = React.renderToString(React.createElement(Handler));

    iso.add(content, alt.flush());

    res.render('index', {
      content: iso.render(),
      pageTitle: config.pageTitle,
      metaDescription
    });
  });
});

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  if (!err.status || err.status !== 404) {
    err.status = 500;
  }

  console.log(err);

  res.status(err.status);

  res.sendFile(path.resolve(__dirname + '/views/error/' + err.status + '.html'));
});

app.listen(config.port, function () {
  console.log('Listening on ' + config.baseUrl);
});
