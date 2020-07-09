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
    req.flash('success', 'Cadastro concluído com sucesso');
    req.session.save(() => res.redirect('back'));
    return res.send(cadastro.errors);
  } catch (error) {
    console.log(error);
    return res.render('404');
  }
}

exports.edit = async (req, res) => {
  
}
  
exports.login = async function(req, res) {
  try {
    if(req.session.user) {
      if (req.session.user.typeUser === 'Aluno') {
        return res.render('includes/users');
      } else {
        return res.render('includes/signup-users')
      }
    }
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
      return res.render('includes/users');
    });
  } catch (error) {
    console.log(error);
    return res.render('404');
  }
}

exports.logout = (req, res) => {
  req.session.destroy();
  res.redirect('/login');
}