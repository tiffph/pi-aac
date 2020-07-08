const Cadastro = require('../models/CadastroModel');

exports.index = (req, res) => {
  res.render('includes/signup-users')
}
exports.indexLogin = (req, res) => {
  res.render('includes/login')
}
exports.register = async function(req, res) {
  try {
    const cadastro = new Cadastro(req.body);
    await cadastro.register();

    if (cadastro.errors.length > 0) {
      req.flash('errors', cadastro.errors);
      req.session.save(function() {
        return res.redirect('back');
      });
      return;
    }
    req.session.save(function() {
      return res.render('includes/users');
    });
    return res.send(cadastro.errors);
  } catch (error) {
    console.log(error);
    return res.render('404');
  }
}
  
exports.login = async function(req, res) {
  try {
    const login = new Cadastro(req.body);
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