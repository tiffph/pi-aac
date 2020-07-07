exports.paginaInicial = (req, res) => {
  res.render('index', {
    titulo: 'Este é o <span style="color: red;">título</span> da página.',
    números: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
  });
  return;
}

exports.trataPost = (req, res, next) => {
  res.send(req.body);
}