const express = require('express');
const route = express.Router();

const homeController = require('./src/controllers/homeController');
const cadastroController = require('./src/controllers/cadastroController');
const aacController = require('./src/controllers/aacController');

const { loginRequired } = require('./src/middleware/middleware')
//Rotas home
route.get('/', homeController.index)

//Rotas cadastro e login
route.get('/usuarios/novo-usuario', cadastroController.index);
route.get('/login', cadastroController.indexLogin);
route.get('/login-noToken', cadastroController.logout);
route.post('/home/usuarios', cadastroController.register);
route.post('/usuarios', cadastroController.login);
route.get('/usuarios', cadastroController.login);
route.get('/usuarios/edit', cadastroController.edit);

route.get('/aac', aacController.index);
route.get('/aac/nova-aac', aacController.indexCreate);
route.post('/home/aac', aacController.create);


module.exports = route;