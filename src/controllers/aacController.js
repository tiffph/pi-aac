const Aac = require('../models/AacModel');

exports.index = async (req, res) => {
  try {
    const requestList = new Aac(req.body);
    const aacsList = await requestList.searchAac();
    return res.render('includes/aac', { aacsList });
  } catch (error) {
    console.log(error);
    return res.render('404');
  }
}

exports.indexNewAac = (req, res) => {
  return res.render('includes/aac-new');
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