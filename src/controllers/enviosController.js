const Envio = require('../models/EnviosModel');
const Atividades = require('../models/AacModel');

exports.iframe = (req, res) => {
  return res.render('includes/regulamento');
  
}

exports.index = async (req, res) => {
  try {
    const idUser = req.session.user._id;
    const request = new Envio(req.body);
    const envios = await request.listRequests(idUser);
    return res.render('includes/envios', { envios });
  } catch (error) {
    console.log(error);
    return res.render('404');
  }
}

exports.indexNew = async (req, res) => {
  try {
    const request = new Atividades(req.body);
    const atividades = await request.searchAac();
    res.render('includes/novo-envio', { envioId: {}, atividades })
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