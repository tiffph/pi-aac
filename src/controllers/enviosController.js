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
    await create.register(idUser);
  } catch (error) {
    console.log(error);
    return res.render('404');
  }
}