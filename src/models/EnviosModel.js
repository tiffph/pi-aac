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

  async register(idAluno) {
    this.cleanUp(idAluno);
    await this.validate();

    if(this.errors.length > 0) return;

    
  }



}

module.exports = Envio;
