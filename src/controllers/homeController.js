exports.index = (req, res) => {
  if (req.session) req.session.destroy();
  res.redirect('/login');
  return;
}
