require('dotenv').config();

const express = require('express');
const app = express();

const mongoose = require('mongoose');
mongoose.connect(process.env.CONNECTIONSTRING, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
  app.emit('pronto');
}).catch(e => console.log(e));

const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const flash = require('connect-flash');

const routes = require('./routes');
const path = require('path');
const helmet = require('helmet');
const csurf = require('csurf');

const {meuMiddleware, checkCsrfError, csrfMiddleware} = require('./src/middleware/middleware');

app.use(helmet());

app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.resolve(__dirname, 'public')));

const sessionOptions = session({
  secret: 'fheifjljfilefj',
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true
  }
});
app.use(sessionOptions);
app.use(flash());

app.set('views', path.resolve(__dirname, 'src', 'views'));
app.set('view engine', 'ejs');

app.use(csurf());
app.use(meuMiddleware);
app.use(checkCsrfError);
app.use(csrfMiddleware);

app.use(routes)

app.on('pronto', () => {
  app.listen(3300, () => {
    console.log('Acessar http://localhost:3300');
    console.log('Servidor executando na porta 3000');
  });
});
