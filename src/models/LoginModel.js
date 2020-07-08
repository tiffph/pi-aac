const mongoose = require('mongoose');
const validator = require('validator');
const bcryptjs = require('bcryptjs')

const CadastroSchema = new mongoose.Schema({
  username: { 
    type: String,
    required: true
  },
  password: { 
    type: String,
    required: true
  },
  name: { 
    type: String,
    required: true
  },
  cpf: { 
    type: String,
    required: true
  },
  matricula: { 
    type: String,
    required: true
  },
  typeUser: { 
    type: String,
    required: true
  },
  modalidade: { 
    type: String,
    required: false
  },
  password: { 
    type: String,
    required: true
  }
});

const LoginModel = mongoose.model('Cadastro', CadastroSchema);

class Login {
  constructor(body) {
    this.body = body;
    this.errors = [];
    this.user = null;
    this.passwLogin = this.body.passwordLogin;
  }

  async login() {
    await this.validate();
    if(this.errors.length > 0) return;

    await this.getUser();
  }

  async getUser() {
    this.user = await LoginModel.findOne({username: this.body.emailLogin});
    if (!this.user) {
      this.errors.push('Usuário não cadastrado. Entre em contato com um administrador');
      return false;
    } else {
      if (!bcryptjs.compareSync(this.passwLogin, this.user.password)) {
        this.errors.push('Senha inválida');
        this.user = null;
        return;
      }
    }
  }

  validate() {
    this.cleanUp();
    if (!validator.isEmail(this.body.emailLogin) && this.body.emailLogin.length !== 0) {
      this.errors.push('Email inválido');
    } else if (this.body.emailLogin.length === 0) {
      this.errors.push('Email é obrigatório');
    }
    if ((this.passwLogin.length <= 3 || this.passwLogin.length >= 50) && this.passwLogin.length !== 0) {
      this.errors.push('A senha precisa ter entre 3 e 50 caracteres');
    } else if (this.passwLogin.length === 0) {
      this.errors.push('Senha obrigatória');
    }

    return;
  }

  cleanUp() {
    for (const key in this.body) {
      if (typeof this.body[key] !== 'string') {
        this.body[key] = '';
      }
    }

    this.body = {
      username: this.body.emailLogin,
      password: this.body.passwordLogin,
    }
  }
}

module.exports = Login;