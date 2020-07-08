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

const CadastroModel = mongoose.model('Cadastro', CadastroSchema);


class Cadastro {
  constructor(body) {
    this.body = body;
    this.errors = [];
    this.user = null;
    this.passw = this.body.password;
  }

  async register() {
    console.log('entrou no register')
    await this.submit();
    console.log(this.errors);
    if(this.errors.length > 0) return;
    const salt = bcryptjs.genSaltSync();
    this.passw = bcryptjs.hashSync(this.passw, salt);

    await this.userExists();
    if (this.errors.length > 0) return;

    this.body.password = this.passw;
    this.user = await CadastroModel.create(this.body);
  }

  async userExists() {
    try {
      const verify = await CadastroModel.findOne({username: this.body.username});
      if (verify) this.errors.push('Usuário já existe');
    } catch (error) {
      console.log('errorUserExists', error);
    }
  }

  cpfValidator(){
    console.log('entra aqui?');
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
    this.cleanUp();
    console.log(this.body);
    for(let i in this.body) {
      console.log(`i = ${this.body[i]}, length = ${this.body[i].length}, typeof ${typeof this.body[i]}`);
    }
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
    console.log('name aqui', this.body.name.length);
    if ((this.body.name.length <= 3 || this.body.name.length >= 70) && this.body.name.length !== 0) {
      this.errors.push('O nome precisa ter entre 3 e 70 caracteres');
    } else if (this.body.name.length === 0) {
      this.errors.push('Nome é obrigatório');
    }
    console.log('matricula aqui', this.body.matricula.length);
    if ((this.body.matricula.length <= 3 || this.body.matricula.length >= 15) && this.body.matricula.length !== 0) {
      this.errors.push('A Matricula precisa ter entre 3 e 15 caracteres');
    } else if (this.body.matricula.length === 0) {
      this.errors.push('Matricula é obrigatório');
    }
    console.log('typeUser aqui', this.body.typeUser.length);

    if (this.body.typeUser.length === 0) {
      this.errors.push('Tipo de usuário é obrigatório');
    // } else if (this.body.typeUser.length === 0) {
    //   this.errors.push('Tipo de usuário é obrigatório');
    }

    const verifyCPF = this.cpfValidator();
    console.log('verifyCPF aqui', verifyCPF);
    console.log('cpf aqui', this.body.cpf.length);

    if (!verifyCPF && this.body.cpf.length !== 0) {
      this.errors.push('CPF é inválido');
    } else if (this.body.cpf.length === 0) {
      this.errors.push('CPF é obrigatório');
    }
    return;
  }



  async login() {
    console.log('entrou no login')
    await this.validate();
    if(this.errors.length > 0) return;

    await this.getUser();
  }

  async getUser() {
    this.user = await CadastroModel.findOne({username: this.body.username});
    console.log('getUser', this.user);
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
    console.log('cleanUp', this.user);

    if(this.user) {
      this.body = this.user;
    } else {
      this.body = {
        username: this.body.username,
        password: this.body.password,
        name: this.body.name,
        cpf: this.body.cpf,
        matricula: this.body.matricula,
        typeUser: this.body.typeUser,
        modalidade: this.body.modalidade ? this.body.modalidade : ''
      }
    }
  }
}

module.exports = Cadastro;