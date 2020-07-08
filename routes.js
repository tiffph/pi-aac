const express = require('express');
const route = express.Router();

const homeController = require('./src/controllers/homeController');
const cadastroController = require('./src/controllers/cadastroController');

//Rotas home
route.get('/', homeController.index)

//Rotas cadastro
route.get('/usuarios/novo-usuario', cadastroController.index);
route.get('/login', cadastroController.indexLogin);
route.post('/home/usuarios', cadastroController.register);
route.post('/usuarios', cadastroController.login);


module.exports = route;