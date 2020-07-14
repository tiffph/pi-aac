const Aac = require('../models/AacModel');

exports.index = async (req, res) => {
  try {
    const idUser = req.session.user;
    const requestList = new Aac(req.body);

    if(idUser) {
      if(idUser.typeUser === 'Aluno') {
        return res.render('sem-permicao');
      
      } else if (idUser.typeUser === 'Administrador') {
        const aacsList = await requestList.searchAac();
        console.log(aacsList);
        return res.render('includes/aac', { aacsList });
        
      } else if (idUser.typeUser === 'Coordenação') {
        return res.render('sem-permicao');
      
      } else if (idUser.typeUser === 'Secretaria') {
        return res.render('sem-permicao');
      }
    } else {
      return res.render('404');
    }

  } catch (error) {
    console.log(error);
    return res.render('404');
  }
}

exports.indexNewAac = (req, res) => {
  const idUser = req.session.user;

    if(idUser) {
      if (idUser.typeUser === 'Administrador') {
        return res.render('includes/aac-new');
      } else {
        return res.render('sem-permicao');
      } 
    } else {
      return res.render('404');
    }
}

exports.create = async (req, res) => {
  try {
    const create = new Aac(req.body);
    await create.create();

    if(create.errors.length > 0) {
      req.flash('errors', create.errors);
      req.session.save(() => res.redirect('back'));
      return;
    }
    req.flash('success', 'Cadastro concluído com sucesso');
    req.session.save(() => res.redirect('back'));

  } catch (error) {
    console.log(error);
  }
}

// @TODO EDIT AND REMOVE