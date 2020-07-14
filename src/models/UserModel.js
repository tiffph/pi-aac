const mongoose = require('mongoose');
const validator = require('validator');
const bcryptjs = require('bcryptjs');
const getSchema = require('../../common/user-schema.json');
const moment = require('moment');

const UserSchema = new mongoose.Schema(getSchema);

mongoose.set('useFindAndModify', false);
const UserModel = mongoose.model('User', UserSchema);


class User {
  constructor(body) {
    this.body = body;
    this.errors = [];
    this.user = null;
    this.passw = this.body.password;
  }

  //CREATE NEW
  async register() {
    this.cleanUp();
    await this.submit();
    
    if(this.errors.length > 0) return;
    const salt = bcryptjs.genSaltSync();
    this.passw = bcryptjs.hashSync(this.passw, salt);

    await this.userExists();
    if (this.errors.length > 0) return;

    this.body.password = this.passw;
    this.user = await UserModel.create(this.body);
  }

  async userExists() {
    try {
      const verify = await UserModel.findOne({username: this.body.username});
      if (verify) this.errors.push('Usuário já existe');
    } catch (error) {
      this.errors.push('Algo aconteceu. Tente novamente mais tarde.');
      console.log(error);
    }
  }

  cpfValidator(){
    const cpfProvider = this.body.cpf;
    let soma;
    let resto;
    soma = 0;
    if (cpfProvider == "00000000000") return false;
       
    for (let i=1; i<=9; i++) soma = soma + parseInt(cpfProvider.substring(i-1, i)) * (11 - i);
    resto = (soma * 10) % 11;
    
    if ((resto == 10) || (resto == 11))  resto = 0;
    if (resto != parseInt(cpfProvider.substring(9, 10)) ) return false;
     
    soma = 0;
    for (let i = 1; i <= 10; i++) soma = soma + parseInt(cpfProvider.substring(i-1, i)) * (12 - i);
    resto = (soma * 10) % 11;
    
    if ((resto == 10) || (resto == 11))  resto = 0;
    if (resto != parseInt(cpfProvider.substring(10, 11) ) ) return false;
    return true;
  }

  submit() {
    console.log(this.body);
    if (!validator.isEmail(this.body.username) && this.body.username.length !== 0) {
      this.errors.push('Email inválido');
    } else if (this.body.username.length === 0) {
      this.errors.push('Email é obrigatório');
    }
    if(this.passw) {
      if ((this.passw.length <= 3 || this.passw.length >= 50) && this.passw.length !== 0) {
        this.errors.push('A senha precisa ter entre 3 e 50 caracteres');
      } else if (this.passw.length === 0) {
        this.errors.push('Senha obrigatória');
      }
    }
    
    
    if ((this.body.name.length <= 3 || this.body.name.length >= 70) && this.body.name.length !== 0) {
      this.errors.push('O nome precisa ter entre 3 e 70 caracteres');
    } else if (this.body.name.length === 0) {
      this.errors.push('Nome é obrigatório');
    }
    
    if ((this.body.matricula.length <= 3 || this.body.matricula.length >= 15) && this.body.matricula.length !== 0) {
      this.errors.push('A Matricula precisa ter entre 3 e 15 caracteres');
    } else if (this.body.matricula.length === 0) {
      this.errors.push('Matricula é obrigatório');
    }

    if (this.body.typeUser === '') {
      this.errors.push('Tipo de usuário é obrigatório');
    }

    const verifyCPF = this.cpfValidator();

    if (!verifyCPF && this.body.cpf.length !== 0) {
      this.errors.push('CPF é inválido');
    } else if (this.body.cpf.length === 0) {
      this.errors.push('CPF é obrigatório');
    }
    return;
  }

  // EDIT
  async edit(id) {
    if(typeof id !== 'string') return;
    const userId = await UserModel.findById(id);

    if(userId.username !== this.body.username) {
      await this.userExists();
      if (this.errors.length > 0) return;
    }

    this.submit();
    if(this.errors.length > 0) return;
    this.user = await UserModel.findByIdAndUpdate(id, this.body, { new: true });
  }

  async searchId(id) {
    try {
      if(typeof id !== 'string') return;
      const userId = await UserModel.findById(id);

      return userId;
    } catch (error) {
      console.log(error);
      this.errors.push('Algo aconteceu. Tente novamente mais tarde.');
    }
  }

  // LOGIN
  async login() {
    await this.validate();
    if(this.errors.length > 0) return;

    await this.getUser();
  }

  async getUser() {
    this.user = await UserModel.findOne({username: this.body.username});
    if (!this.user) {
      this.errors.push('Usuário não cadastrado. Entre em contato com um administrador');
      return false;
    } else {
      if (!bcryptjs.compareSync(this.passw, this.user.password)) {
        this.errors.push('Senha inválida');
        this.user = null;
        return;
      }
    }
  }

  validate() {
    this.cleanUp();
    if (!validator.isEmail(this.body.username) && this.body.username.length !== 0) {
      this.errors.push('Email inválido');
    } else if (this.body.username.length === 0) {
      this.errors.push('Email é obrigatório');
    }
    if ((this.passw.length <= 3 || this.passw.length >= 50) && this.passw.length !== 0) {
      this.errors.push('A senha precisa ter entre 3 e 50 caracteres');
    } else if (this.passw.length === 0) {
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

    if(this.user) {
      this.body = this.user;
    } else {
      this.body = {
        username: this.body.username,
        password: this.body.password,
        name: this.body.name,
        cpf: this.body.cpf,
        matricula: this.body.matricula,
        typeUser: this.body.typeUser
      }
    }
  }

  async searchUsers() {
    const usersList = await UserModel.find().sort({ criadoEm: -1});
    return usersList;
  }

  async getUserById(id) {
    const userRequest = await UserModel.findById(id);
    return userRequest;
  }
}

module.exports = User;