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
      const envios = await EnvioModel.find({idAluno: idAluno});
      return envios;
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
    if(this.body.file.length === 0) {
      this.errors.push('O envio de um arquivo é obrigatório');
    }
    if(this.body.horasEquivalentes.length === 0) {
      this.errors.push('Duração do evento é obrigatória');
    }

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
