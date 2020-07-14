exports.meuMiddleware = (req, res, next) => {
  res.locals.errors = req.flash('errors');
  res.locals.warnings = req.flash('warnings');
  res.locals.success = req.flash('success');
  res.locals.user = req.session.user;
  next();
}

exports.getTypes = (req, res, next) => {
  // res.locals.
  next();
}

exports.checkCsrfError = (err, req, res, next) => {
  if(err) {
    console.log(err)
    // return res.render('404');
  }
  next();
}

exports.csrfMiddleware = (req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
}

exports.loginRequired = (req, res, next) => {
  if (!req.session.user) {
    req.flash('errors', 'Você precisa fazer login');
    req.session.save(() => res.redirect('/'));
    return;
  }
}