const Envio = require('../models/EnviosModel');
const Atividades = require('../models/AacModel');
const User = require('../models/UserModel');

exports.iframe = (req, res) => {
  return res.render('includes/regulamento');
  
}

exports.index = async (req, res) => {
  try {
    const idUser = req.session.user;
    const request = new Envio(req.body);
    let envios;

    if(idUser) {
      if(idUser.typeUser === 'Aluno') {
        envios = await request.listRequests(idUser._id);
        return res.render('includes/envios', { envios, user: idUser.typeUser });
      
      } else if (idUser.typeUser === 'Administrador') {
        return res.render('sem-permicao');
      
      } else if (idUser.typeUser === 'Coordenação') {
        envios = await request.listCoo();
        return res.render('includes/envios', { envios, user: idUser.typeUser });
      
      } else if (idUser.typeUser === 'Secretaria') {
        envios = await request.listSec();
        return res.render('includes/envios', { envios, user: idUser.typeUser });
      
      }
    } else {
      return res.render('404');
    }
  } catch (error) {
    console.log(error);
    return res.render('404');
  }
}

exports.indexNew = async (req, res) => {
  try {
    const idUser = req.session.user;

    if(idUser) {
      if (idUser.typeUser === 'Aluno') {
        const request = new Atividades(req.body);
        const atividades = await request.searchAac();
        res.render('includes/novo-envio', { envioId: {}, atividades, user: idUser.typeUser })
      } else {
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


exports.create = async (req, res) => {
  try {
    const idUser = req.session.user._id;
    const create = new Envio(req.body);
    const searchActivity = new Atividades(req.body);
    const getModalidade = await searchActivity.getModalidade(req.body.atividade);
    const getAtividade = await searchActivity.getAtividade(req.body.atividade);
    await create.limiteHoras(getAtividade, idUser, req.body.horasEquivalentes);
    
    if (create.errors.length > 0) {
      req.flash('errors', create.errors);
      req.session.save(function() {
        return res.redirect('back');
      });
      return;
    }
    
    await create.register(idUser, getModalidade);

    if (create.errors.length > 0) {
      req.flash('errors', create.errors);
      req.session.save(function() {
        return res.redirect('back');
      });
      return;
    }

    req.flash('success', 'Solicitação enviada com sucesso');
    req.session.save(function() {
       return res.redirect('/solicitacoes');
    });
    return;

  } catch (error) {
    console.log(error);
    return res.render('404');
  }
}

exports.viewIndex = async (req, res) => {
  if(!req.params.id) return res.render('404');
  const idUser = req.session.user;
    

  if(idUser) {
    if (idUser.typeUser !== 'Administrador') {
      const requestAtividades = new Atividades(req.body);
      const atividades = await requestAtividades.searchAac();
      
      const request = new Envio(req.body);
      const envioId = await request.searchId(req.params.id);
      
      if(!envioId) {
        return res.render('404');
      }
      
      return res.render('includes/novo-envio', { envioId, atividades, user: idUser.typeUser });
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
    const searchActivity = new Atividades(req.body);
    const getModalidade = await searchActivity.getModalidade(req.body.atividade);

    const request = new Envio(req.body);
    await request.edit(req.params.id, getModalidade);

    if (request.errors.length > 0) {
      req.flash('errors', request.errors);
      req.session.save(function() {
        return res.redirect('back');
      });
      return;
    }
    req.flash('success', 'Solicitação enviada para a secretaria com sucesso');
    req.session.save(function() {
      return res.redirect('/solicitacoes');
    });
    return;
  } catch (error) {
    console.log(error);
    return res.render('404');
  }
}



exports.viewDoc = async (req, res) => {
  if(!req.params.id) return res.render('404');
  try {
    const request = new Envio(req.body);
    const envioId = await request.searchId(req.params.id);
    const file = envioId;
    res.render('includes/view-upload', { file })
  } catch (error) {
    console.log(error);
    return res.render('404');
  }
}

exports.viewCoo = async (req, res) => {
  if(!req.params.id) return res.render('404');
  try {
    const searchActivity = new Atividades(req.body);
    const getModalidade = await searchActivity.getModalidade(req.body.atividade);

    const user = new User(req.body);
    const userRequest = await user.getUserById(req.session.user._id);

    const request = new Envio(req.body);
    await request.viewCoo(req.params.id, userRequest, getModalidade);

    if (request.errors.length > 0) {
      req.flash('errors', request.errors);
      req.session.save(function() {
        return res.redirect('back');
      });
      return;
    }
    req.flash('success', 'Solicitação enviada para a secretaria com sucesso');
    req.session.save(function() {
      return res.redirect('/solicitacoes');
    });
    return;
  } catch (error) {
    console.log(error);
    return res.render('404');
  }
}

exports.show = async (req, res) => {
  const idUser = req.session.user;
    
  if(idUser) {
    if (idUser.typeUser === 'Aluno') {
      
      try {
        const request = new Envio(req.body);
        const horaId = await request.listHoras(idUser._id);
        if (horaId[0]) {
          return res.render('includes/relatorio-envios', { getHoras: horaId[0] });
        } else {
          return res.render('includes/sem-relatorio');
        }

      } catch (error) {
        console.log(error);
        return res.render('404');
      }
      
    } else {
      return res.render('sem-permicao');
    } 
  } else {
    return res.render('404');
  }
}