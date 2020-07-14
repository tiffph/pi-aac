const User = require('../models/UserModel');
const Envio = require('../models/EnviosModel');

exports.index = (req, res) => {
  const idUser = req.session.user;

  if(idUser) {
    if (idUser.typeUser === 'Administrador') {
      return res.render('includes/novo-usuario', { userId: {} });
    } else {
      return res.render('sem-permicao');
    }
  } else {
    return res.render('404');
  }
}
exports.indexLogin = (req, res) => {
  if (req.session) req.session.destroy();
  res.render('includes/login')
}
exports.indexUsers = async (req, res) => {
  try {
    const requestList = new User(req.body);
    const usersList = await requestList.searchUsers();
    const idUser = req.session.user;

    if(idUser) {
      if (idUser.typeUser === 'Administrador') {
        return res.render('includes/users', { usersList });
      } else {
        return res.render('sem-permicao');
      }
    } else {
      return res.render('404');
    }
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
  const idUser = req.session.user;

  if(!userId) {
    return res.render('404');
  }
  if(idUser) {
     if (idUser.typeUser === 'Administrador') {
      return res.render('includes/novo-usuario', { userId });
    } else {
      return res.render('sem-permicao');
    }
  } else {
    return res.render('404');
  }
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

    req.session.user = login.user;
    req.session.save(async function() {
      if (req.session.user) {
        const ss = req.session.user;
        console.log(ss);
        try {
          if(ss.typeUser === 'Administrador') {
            const usersList = await login.searchUsers();
            return res.render('includes/users', { usersList });
  
          } else if(ss.typeUser === 'Aluno' || ss.typeUser === 'Coordenação' || ss.typeUser === 'Secretaria') {
            const request = new Envio(req.body);
            let envios;

            if(ss.typeUser === 'Aluno') {
              envios = await request.listRequests(ss._id);
              return res.render('includes/envios', { envios, user: ss.typeUser });
            } else if (ss.typeUser === 'Coordenação' || ss.typeUser === 'Secretaria') {

              if(ss.typeUser === 'Coordenação') {
                envios = await request.listCoo();
              } else if(ss.typeUser === 'Secretaria') {
                envios = await request.listSec();
              } 
              return res.render('includes/envios', { envios, user: ss.typeUser });
            }
          } else {
            return res.render('404');
          }
  
        } catch (error) {
          console.log(error);
          return res.render('404');
        }
      }
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


