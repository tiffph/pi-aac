const mongoose = require('mongoose');
const getSchema = require('../../common/envios-schema.json');
const moment = require('moment');

const EnvioSchema = new mongoose.Schema(getSchema);

mongoose.set('useFindAndModify', false);
const EnvioModel = mongoose.model('Envio', EnvioSchema);


class Envio {
  constructor(body) {
    this.body = body;
    this.errors = [];
    this.envio = null;
  }

  async listRequests(idAluno) {
    try {
      const envios = await EnvioModel.find({idAluno: idAluno}).sort({updatedAt: -1});
      return envios;
    } catch (error) {
      console.log(error);
      this.errors.push('Algo aconteceu. Tente novamente mais tarde.');
    }
  }

  async listCoo() {
    try {
      const envios = await EnvioModel.find({status: 'pendingCoo'}).sort({updatedAt: -1});
      return envios;
    } catch (error) {
      console.log(error);
      this.errors.push('Algo aconteceu. Tente novamente mais tarde.');
    }
  }

  async viewCoo(envioId, user, modalidade) {
    if(typeof envioId !== 'string') return;

    await this.cleanUpCoo(user, modalidade, envioId);
    await this.validateEdit();

    if (this.errors.length > 0) return;
    await this.update(envioId, this.body);
  }

  async update(id, envioEdit) {
    try {
      this.user = await EnvioModel.findByIdAndUpdate(id, envioEdit, { new: true })
    } catch (error) {
      console.log(error);
      this.errors.push('Algo aconteceu. Tente novamente mais tarde.');
    }
  }

  async cleanUpCoo(userId, modalidade, envioId) {
    try {
      const envio = await EnvioModel.findById(envioId);
      const user = userId.name;
      const now = moment().format('LLL');
      const deny = this.body.reasonToDeny;
      console.log(deny);
      this.body = {
        status: deny ? 'editing' : 'pendingSec',
        approvedByCoo: deny ? '' : user,
        approvedBySec: '',
        updatedAt: now,
        modalidade: modalidade,
        atividade: this.body.atividade ? this.body.atividade : envio.atividade,
        horasEquivalentes: this.body.horasEquivalentes,
        reasonToDeny: deny ? deny : ''
      }
    } catch (error) {
      console.log(error);
      this.errors.push('Algo aconteceu. Tente novamente mais tarde.');
    }
    
  }

  async cleanUpSec(userId, modalidade, envioId) {
    try {
      const envio = await EnvioModel.findById(envioId);
      const user = userId.name;
      const now = moment().format('LLL');

      this.body = {
        status: 'approved',
        approvedBySec: user,
        updatedAt: now,
        modalidade: modalidade,
        atividade: this.body.atividade ? this.body.atividade : envio.atividade,
        horasEquivalentes: this.body.horasEquivalentes,
        reasonToDeny: ''
      }
    } catch (error) {
      console.log(error);
      this.errors.push('Algo aconteceu. Tente novamente mais tarde.');
    }
    
  }

  async edit(envioId, modalidade) {
    if(typeof envioId !== 'string') return;
    await this.cleanUpEdit(modalidade, envioId);

    await this.validate();
    if (this.errors.length > 0) return;
    
    await this.update(envioId, this.body);
  }
  
  async cleanUpEdit(modalidade, envioId) {
    try {
      const envio = await EnvioModel.findById(envioId);
      const now = moment().format('LLL');
      const deny = envio.reasonToDeny;
      console.log(deny);
      this.body = {
        status: 'pendingCoo',
        approvedByCoo: '',
        approvedBySec: '',
        updatedAt: now,
        modalidade: modalidade,
        atividade: this.body.atividade ? this.body.atividade : envio.atividade,
        horasEquivalentes: this.body.horasEquivalentes,
        file: this.body.fileBase64 ? this.body.fileBase64 : envio.file,
        reasonToDeny: deny ? deny : ''
      }
      console.log(this.body);
    } catch (error) {
      console.log(error);
      this.errors.push('Algo aconteceu. Tente novamente mais tarde.');
    }
  }

  async listSec() {
    try {
      const envios = await EnvioModel.find({status: 'pendingSec'}).sort({updatedAt: -1});
      return envios;
    } catch (error) {
      console.log(error);
      this.errors.push('Algo aconteceu. Tente novamente mais tarde.');
    }
  }

  async searchId(params) {
    try {
      const envio = await EnvioModel.findById(params);
      return envio;
    } catch (error) {
      console.log(error);
      this.errors.push('Algo aconteceu. Tente novamente mais tarde.');
    }
  }

  async register(idAluno, modalidade) {
    this.cleanUp(idAluno, modalidade);
    await this.validate();
    
    if(this.errors.length > 0) return;
    
    // @TODO validação de horas já registradas por busca na collection horas
    this.envio = await EnvioModel.create(this.body);
  }
  
  validate() {
    const horas = isNaN(this.body.horasEquivalentes);
    if(this.body.file.length === 0) {
      this.errors.push('O envio de um arquivo é obrigatório');
    }
    if(this.body.horasEquivalentes.length === 0) {
      this.errors.push('Duração do evento é obrigatória');
    }
    if(horas) {
      this.errors.push('Duração do evento aceita apenas números');
    }
  }
  validateEdit() {
    const horas = isNaN(this.body.horasEquivalentes);
    if(this.body.horasEquivalentes.length === 0) {
      this.errors.push('Duração do evento é obrigatória');
    } else if (horas) {
      this.errors.push('Duração do evento aceita apenas números');
    }
    return;
  }

  cleanUp(aluno, modalidade) {
    for (const key in this.body) {
      if (typeof this.body[key] !== 'string') {
        this.body[key] = '';
      }
    }
    
    const now = moment().format('LLL');
    
    this.body = {
      idAluno: aluno,
      status: 'pendingCoo',
      approvedByCoo: '',
      approvedBySec: '',
      createdAt: now,
      updatedAt: now,
      modalidade: modalidade,
      atividade: this.body.atividade,
      horasEquivalentes: this.body.horasEquivalentes,
      file: this.body.fileBase64,
      reasonToDeny: ''
    }
  }

}

module.exports = Envio;
