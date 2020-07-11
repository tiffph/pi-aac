const express = require('express');
const route = express.Router();

const homeController = require('./src/controllers/homeController');
const userController = require('./src/controllers/userController');
const aacController = require('./src/controllers/aacController');

const { loginRequired } = require('./src/middleware/middleware');

//Rotas home
route.get('/', homeController.index)

//Cadastro Routes
route.get('/usuarios/novo-usuario', userController.index);
route.post('/usuarios', userController.register);
// Login Routes
route.get('/login', userController.indexLogin);
route.get('/login-noToken', userController.logout);
// Users Routes
route.post('/usuarios', userController.login);
route.get('/usuarios', userController.indexUsers);
// Edit User Routes
route.get('/usuarios/edit/:id', userController.editIndex);
route.post('/usuarios/edit/:id', userController.edit);

// AAC Routes
route.get('/aac', aacController.index);
route.get('/aac/nova-aac', aacController.indexCreate);
route.post('/home/aac', aacController.create);
// Edit AAC Routes: TODO 
// route.get('/usuarios/edit/:id', userController.editIndex);
// route.post('/usuarios/edit/:id', userController.edit);

route.get('/solicitacoes', userController.edit);
route.post('/solicitacoes/edit/:id', userController.edit);

module.exports = route;