const mongoose = require('mongoose');
const getSchema = require('../../common/envios-schema.json');
const getSchemaHoras = require('../../common/horas-schema.json');
const moment = require('moment');

const EnvioSchema = new mongoose.Schema(getSchema);
const HorasSchema = new mongoose.Schema(getSchemaHoras);

mongoose.set('useFindAndModify', false);
const EnvioModel = mongoose.model('Envio', EnvioSchema);
const HorasModel = mongoose.model('Horas', HorasSchema);


class Envio {
  constructor(body) {
    this.body = body;
    this.errors = [];
    this.envio = null;
  }

  async listRequests(idAluno) {
    try {
      const envios = await EnvioModel.find({idAluno: idAluno}).sort({updatedAt: 1});
      return envios;
    } catch (error) {
      console.log(error);
      this.errors.push('Algo aconteceu. Tente novamente mais tarde.');
    }
  }

  async listCoo() {
    try {
      const envios = await EnvioModel.find({status: 'pendingCoo'}).sort({updatedAt: 1});
      return envios;
    } catch (error) {
      console.log(error);
      this.errors.push('Algo aconteceu. Tente novamente mais tarde.');
    }
  }

  async viewCoo(envioId, user, modalidade) {
    if(typeof envioId !== 'string') return;

    await this.cleanUpFunc(user, modalidade);
    await this.validateEdit();

    if (this.errors.length > 0) return;
    if (this.body.status === 'approved') {
      await this.approved(envioId, this.body);
    }
    await this.update(envioId, this.body);
  }

  async listHoras(idAluno) {
    const getHoras = await HorasModel.find({idAluno});
    return getHoras;
  }

  async approved(envioId, approved) {
    const getIdAluno = await EnvioModel.findById(envioId);
    const getHoras = await this.listHoras(getIdAluno.idAluno);

    let horasTotais;
    let horasEnsino;
    let horasPesquisa;
    let horasExtensao;
    let horasValidas;
    if(getHoras.length > 0) {
      horasTotais = getHoras[0].totalHoras;
      horasEnsino = getHoras[0].horasEnsino;
      horasPesquisa = getHoras[0].horasPesquisa;
      horasExtensao = getHoras[0].horasExtensao;
      horasValidas = getHoras[0].horasValidas;
    } else {
      horasTotais = 0;
      horasEnsino = 0;
      horasPesquisa = 0;
      horasExtensao = 0;
      horasValidas = 0;
    }
    const getInt = parseInt(approved.horasEquivalentes, 10);

    horasTotais+=getInt;
    
    if (approved.modalidade === 'Ensino'){
      horasEnsino+=getInt;
    } else if (approved.modalidade === 'Extensão') {
      horasExtensao+=getInt;
    } else if (approved.modalidade === 'Pesquisa') {
      horasPesquisa+=getInt;
    }


    if (horasValidas >= 58 && (horasPesquisa == 0 || horasEnsino == 0 || horasExtensao == 0)) {
      if (((horasPesquisa == 0 && horasEnsino == 0) || (horasExtensao == 0 && horasPesquisa == 0) || ( horasEnsino == 0 && horasExtensao == 0))) {
        horasValidas = horasValidas;
      } 
    } else {
      const check = horasValidas + getInt;
      if (check >= 60) {
        horasValidas = 60;
      } else {
        horasValidas = check;
      }
    }
    const sendApproved = {
      idAluno: getIdAluno.idAluno,
      totalHoras: horasTotais,
      horasEnsino: horasEnsino,
      horasPesquisa: horasPesquisa,
      horasExtensao: horasExtensao,
      horasValidas: horasValidas
    };
    
    if(getHoras.length > 0) {
      await HorasModel.findByIdAndUpdate(getHoras[0]._id, sendApproved, { new: true })
    } else {
      await HorasModel.create(sendApproved);
    }

  }

  async update(id, envioEdit) {
    try {
      this.user = await EnvioModel.findByIdAndUpdate(id, envioEdit, { new: true })
    } catch (error) {
      console.log(error);
      this.errors.push('Algo aconteceu. Tente novamente mais tarde.');
    }
  }

  async cleanUpFunc(userId, modalidade) {
    try {
      const user = userId.name;
      const now = moment().format('LLL');
      const deny = this.body.reasonToDeny;
      if (userId.typeUser === 'Secretaria') {
        this.body = {
          status:  deny ? 'editing' : 'approved',
          approvedBySec: deny ? '' : user,
          updatedAt: now,
          modalidade: modalidade,
          atividade: this.body.atividade,
          horasEquivalentes: this.body.horasEquivalentes,
          reasonToDeny: deny ? deny : ''
        }
      } else {
        this.body = {
          status: deny ? 'editing' : 'pendingSec',
          approvedByCoo: deny ? '' : user,
          approvedBySec: '',
          updatedAt: now,
          modalidade: modalidade,
          atividade: this.body.atividade,
          horasEquivalentes: this.body.horasEquivalentes,
          reasonToDeny: deny ? deny : ''
        }
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
    
    this.envio = await EnvioModel.create(this.body);
  }
  
  // validação de horas já registradas por busca na collection horas
  async limiteHoras(atividade, id, novoEnvioHoras) {
    try {
      console.log(atividade);
      if (atividade.cargaLimite > 0) {
        const limit = atividade.cargaLimite;
        const envioAluno = await EnvioModel.find({idAluno: id, atividade: atividade.atividade});
        
        if(envioAluno.length > 0) {
          let horas = 0;
          for(let i = 0; i < envioAluno.length; i++) {
            if (envioAluno[i].horasEquivalentes) {
              if (envioAluno[i].status === 'approved') {
                console.log(envioAluno[i].horasEquivalentes);
                horas+= envioAluno[i].horasEquivalentes;
              }
            }
          }
          console.log(horas);
          if(horas >= limit) {
            this.errors.push('Você já atingiu o limite de horas dessa atividade.');
          } else {
            const getInt = parseInt(novoEnvioHoras, 10);

            const soma = horas + getInt;
            console.log(typeof horas);

            console.log(typeof getInt);
            console.log(soma);
            const diferenca = limit - horas;
            if (soma > limit) {
              this.errors.push(`O limite de horas dessa atividade é ${limit}h e você possui ${horas}h. Você pode inserir no campo a diferença (${diferenca}h).`);
            }
          }
        }
        return;
      }
    } catch (error) {
      console.log(error);
      this.errors.push('Algo aconteceu. Tente novamente mais tarde.');
    }
  }
  
  async validate() {
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
