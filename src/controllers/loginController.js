const Login = require('../models/LoginModel');

exports.index = (req, res) => {
  res.render('includes/login')
}

exports.login = async function(req, res) {
  try {
    const login = new Login(req.body);
    await login.login();

    if (login.errors.length > 0) {
      req.flash('errors', login.errors);
      req.session.save(function() {
        return res.redirect('back');
      });
      return;
    }
    req.session.user = login.user;
    req.session.save(function() {
      return res.redirect('/usuarios');
    });
    return res.send(login.errors);
  } catch (error) {
    console.log(error);
    return res.render('404');
  }
  
}