const Create = require('../models/CreateModel');

exports.index = (req, res) => {
  return res.render('includes/aac');
}

exports.indexCreate = (req, res) => {
  return res.render('includes/aac-new');
}

exports.create = async (req, res) => {
  try {
    const create = new Create(req.body);
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