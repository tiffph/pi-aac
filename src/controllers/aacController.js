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
        return res.render('includes/aac-new', {aacId: {}});
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

exports.editIndex = async (req, res) => {
  if(!req.params.id) return res.render('404');
  const idUser = req.session.user;
  if(idUser) {
    if (idUser.typeUser === 'Administrador') {
      const request = new Aac(req.body);
      const aacId = await request.searchId(req.params.id);
      
      if(!aacId) {
        return res.render('404');
      }
      
      return res.render('includes/aac-new', { aacId });
    } else {
      return res.render('sem-permicao');
    } 
  } else {
    return res.render('404');
  }
}

exports.edit = async (req, res) => {
  if(!req.params.id) return res.render('404');
  try {
    const request = new Aac(req.body);
    await request.updateAcc(req.params.id);

    if (request.errors.length > 0) {
      req.flash('errors', request.errors);
      req.session.save(function() {
        return res.redirect('back');
      });
      return;
    }

    req.flash('success', 'Solicitação enviada para a secretaria com sucesso');
    req.session.save(function() {
      return res.redirect('/aac');
    });
    return;
  } catch (error) {
    console.log(error);
    return res.render('404');
  }
}