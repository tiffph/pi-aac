const mongoose = require('mongoose');
const validator = require('validator');

const CreateSchema = new mongoose.Schema({
  atividade: { 
    type: String,
    required: true
  },
  modalidade: { 
    type: String,
    required: true
  },
  cargaLimite: { 
    type: String,
    required: true
  },
  horasEquivalentes: { 
    type: String,
    required: true
  }
});

const CreateModel = mongoose.model('AtividadesComplementares', CreateSchema);

class Create {
  constructor(body) {
    this.body = body;
    this.errors = [];
    this.aac = null;
    this.edit = false;
  }

  async create() {
    const verifyAac = await this.verifyAac();
    if (verifyAac) {
      this.errors.push('Atividade já cadastrada');
      return;
    }
    await this.validate();

    if (this.errors.length > 0) return;
    this.aac = await CreateModel.create(this.body);
    
  }

  async verifyAac() {
    const verify = await CreateModel.findOne({atividade: this.body.atividade});
    return verify ? true : false;
  }

  validate() {
    this.cleanUp();

    if(this.body.atividade.length === 0) this.errors.push('Atividade é um campo obrigatório');
    if(this.body.horasEquivalentes.length === 0) this.errors.push('Horas equivalentes é um campo obrigatório');
    return;
  }

  cleanUp() {
    for (const key in this.body) {
      if (typeof this.body[key] !== 'string') {
        this.body[key] = '';
      }
    }

    if(this.aac) {
      this.body = this.aac;
    } else {
      this.body = {
        atividade: this.body.atividade,
        modalidade: this.body.modalidade,
        cargaLimite: this.body.cargaLimite ? this.body.cargaLimite : 'N/A',
        horasEquivalentes: this.body.horasEquivalentes 
      }
    }
  }
}
module.exports = Create;