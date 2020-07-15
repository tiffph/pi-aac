const mongoose = require('mongoose');
const getSchema = require('../../common/aac-schema.json');

const AacSchema = new mongoose.Schema(getSchema);

mongoose.set('useFindAndModify', false);
const AacModel = mongoose.model('AtividadesComplementares', AacSchema);

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
    this.aac = await AacModel.create(this.body);
    
  }

  async getAtividade(atividade) {
    try {
      const getAtividade = await AacModel.findOne({atividade: atividade});
      console.log(getAtividade);
      return getAtividade;
    } catch (error) {
      
    }
  }

  async verifyAac() {
    const verify = await AacModel.findOne({atividade: this.body.atividade});
    return verify ? true : false;
  }

  async updateAcc(id) {
    if(typeof id !== 'string') return;
    const atividadeId = await AacModel.findById(id);

    if(atividadeId.atividade !== this.body.atividade) {
      await this.aacExists();
      if (this.errors.length > 0) return;
    }

    this.validate();
    if (this.errors.length > 0) return;

    await this.update(id, this.body);
  }

  async update(id, aacEdit) {
    try {
      this.aac = await AacModel.findByIdAndUpdate(id, aacEdit, { new: true });
    } catch (error) {
      console.log(error);
      this.errors.push('Algo aconteceu. Tente novamente mais tarde.');
    }
  }

  async aacExists() {
    try {
      const verify = await AacModel.findOne({atividade: this.body.atividade});
      if (verify) this.errors.push('Atividade já cadastrada');
    } catch (error) {
      this.errors.push('Algo aconteceu. Tente novamente mais tarde.');
      console.log(error);
    }
  }

  validate() {
    this.cleanUp();
    const carga = isNaN(this.body.cargaLimite);

    if(this.body.atividade.length === 0) this.errors.push('Atividade é um campo obrigatório');
    if(carga) this.errors.push('Carga limite aceita apenas números');
    
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
        cargaLimite: this.body.cargaLimite ? this.body.cargaLimite : 0
      }
    }
  }

  async getModalidade(idAtividade) {
    try {
      const search = await AacModel.find({atividade : idAtividade});
      return search[0].modalidade;
    } catch (error) {
      console.log(error);
    }
  }

  async searchAac() {
    try {
      const aacsList = await AacModel.find().sort({ atividade: 1 });
      return aacsList;
    } catch (error) {
      console.log(error);
    }
  }

  async searchId(id) {
    try {
      if(typeof id !== 'string') return;
      const aacId = await AacModel.findById(id);
      return aacId;
    } catch (error) {
      console.log(error);
      this.errors.push('Algo aconteceu. Tente novamente mais tarde.');
    }
  }
}
module.exports = Create;