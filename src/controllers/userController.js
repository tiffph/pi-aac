const User = require('../models/UserModel');

exports.index = (req, res) => {
  res.render('includes/novo-usuario', { userId: {} })
}
exports.indexLogin = (req, res) => {
  res.render('includes/login')
}
exports.indexUsers = async (req, res) => {
  try {
    const requestList = new User(req.body);
    const usersList = await requestList.searchUsers();
    return res.render('includes/users', { usersList });
  } catch (error) {
    console.log(error);  
  }
}

exports.register = async function(req, res) {
  try {
    const cadastro = new User(req.body);
    await cadastro.register();

    if (cadastro.errors.length > 0) {
      req.flash('errors', cadastro.errors);
      req.session.save(function() {
        return res.redirect('back');
      });
      return;
    }
    req.flash('success', 'Cadastro concluído com sucesso');
    req.session.save(function() {
       return res.redirect('/usuarios');
    });
    return;
  } catch (error) {
    console.log(error);
    return res.render('404');
  }
}
exports.editIndex = async (req, res) => {
  if(!req.params.id) return res.render('404');

  const newUser = new User(req.body);
  const userId = await newUser.searchId(req.params.id);

  if(!userId) {
    return res.render('404');
  }
  
  return res.render('includes/novo-usuario', { userId });
}

exports.edit = async (req, res) => {
  try {
    if(!req.params.id) return res.render('404');
    const edit = new User(req.body);
    await edit.edit(req.params.id);

    if (edit.errors.length > 0) {
      req.flash('errors', edit.errors);
      req.session.save(function() {
        return res.redirect('back');
      });
      return;
    }
    req.flash('success', 'Edição concluída com sucesso');
    req.session.save(function() {
      return res.redirect('/usuarios');
    });
    return;
  } catch (error) {
    console.log(error);
  }
  
}
  
exports.login = async function(req, res) {
  try {
    const login = new User(req.body);
    await login.login();

    if (login.errors.length > 0) {
      req.flash('errors', login.errors);
      req.session.save(function() {
        return res.redirect('back');
      });
      return;
    }

    const usersList = await login.searchUsers();

    req.session.user = login.user;
    req.session.save(function() {
      return res.render('includes/users', { usersList });
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


