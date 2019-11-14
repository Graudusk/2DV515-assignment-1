/**
 * General middleware.
 */
'use strict';

function auth(req, res, next) {
  if (req.session && req.session.email) {
    return next();
  }

  console.info('User is not authenticated.');
  console.info('Redirecting to /user/login.');
  // res.redirect("/user/login");
  res.redirect('/?error=You need to be logged in to view this content');
}

function logIncomingToConsole(req, res, next) {
  console.info(`Got request on ${req.path} (${req.method}).`);
  next();
}

module.exports = {
  logIncomingToConsole: logIncomingToConsole,
  auth: auth,
};
