const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');

const {PORT = 3000} = process.env;

const app = express();

const users = [{id: 1, email: 'dsangel@gmail.com', password: '123'}];

const payments = [];

app.use(
  session({
    secret: 'algo secreto',
    name: 'sid',
    rolling: true,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60,
      sameSite: true,
    },
  }),
);

app.use(bodyParser.json());

const auth = (req, res, next) => {
  if (req.session.userId) {
    return next();
  }

  res.status(401).send('You must be logged in to access this resource');
};

app.post('/register', (req, res) => {
  const {email, password} = req.body;
  const exist = users.some(user => user.email === email);
  if (exist) {
    return res.send('User already exist');
  }

  const id = users.length + 1;
  const newUser = {
    id,
    email,
    password,
  };

  req.session.userId = id;
  users.push(newUser);
  res.send('User created successfully!');
});

//  POST http://localhost:3000/login

app.post('/login', (req, res) => {
  const {email, password} = req.body;
  const user = users.find(
    user => user.email === email && user.password === password,
  );

  if (!user) {
    return res.send('Please verify email or password');
  }

  req.session.userId = user.id;
  res.send('Login successfully!');
});

app.post('/payment', auth, (req, res) => {
  const {payment} = req.body;

  const userPayment = {
    userId: req.session.userId,
    ...payment,
  };
  payments.push(userPayment);
  res.send(userPayment);
});

app.get('/user/payments', auth, (req, res) => {
  const {userId} = req.session;
  const result = payments.filter(payment => payment.userId === userId);
  res.send(result);
});

app.post('/logout', auth, (req, res) => {
  req.session.destroy();
  res.send('Logout successfully!');
});

app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
