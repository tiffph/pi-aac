const express = require('express');
const route = express.Router();
const homeController = require('./src/controllers/homeController');
const contatoController = require('./src/controllers/contatoController');

//Rotas home
route.get('/', homeController.paginaInicial)
route.post('/', homeController.trataPost)

//Rotas home
route.get('/contato', contatoController.paginaInicial)
// route.post('/contato', contatoController.trataPost)


module.exports = route;