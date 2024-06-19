const express = require('express');
const path = require("path");
const cors = require('cors');
const fs = require("fs");
const jwt = require("jsonwebtoken")//importiamo il bellissimo generatore/lettore di token

const app = express();
const port = 3000;

const jwtkey = 'fanculoAllaMiaMorteDaFullStack'//e gli assegniamo una chiave a nostra scelta

app.use(express.json());
app.use(cors());

app.post('/login', (req, res) => {//non ho error handling ancora
  // console.log(req);
  const { username, password } = req.body;
  fs.readFile(process.cwd() + '/data/users.json', (err, data) => {
    const users = JSON.parse(data).users
    //qui la voce users del file viene messa dentro l'oggetto users, fare sempre attenzione a quale chiave dell'oggetto si sta passando
    if (users.some(user => (user.username === username || user.email === username) && user.password === password)) {
      //some() si usa per ottenere un booleano facendo il confronto con ogni indice dell'array
      const user = users.find(user => user.username === username || user.email === username)
      //find() capace che lo conosci meglio di me
      const token = jwt.sign({ id: user.id, username: user.username }, jwtkey)
      //sign({chiavi:valori da mettere dentro la codifica},chiaveDiCodifica) ti crea un token partendo dai valori messi in oggetto e la chiave di crittazione
      const authedUser = JSON.stringify(user)
      //qui assegniamo a authedUser lo user in stringa json
      res.json({ token, authedUser })
      //nota di sintassi su res.status(codiceRisposta).json(oggetto), si può dare in una sola dichiarazione sia il codide della response, che il body jsonato della response. Per quanto riguarda l'oggetto all'interno della response, si possono concatenare più oggetti separandoli con virgole
    }
    else {
      res.status(401).json({ error: 'Credenziali errate' });
    }
    //nota finale per non farti rincoglionire come è successo a me: tutto l'handling delle credenziali è avvenuto dentro fs.readFile()
  })

  // if (username === 'admin' && password === 'pa123') {
  //   res.json({ token: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VybmFtZSIsImlhdCI6MTY1OTk0NDMyMiwiZXhwIjoxNjU5OTUyODMyfQ.5-6F0o-zV3z0_a_a_0_a_a_a_a_a_a_a_a_a_a_a_a_a_a_a_a_a_a_a_a_a_a_a_a_a_a_a_a' });
  // } else {
  //   res.status(401).json({ error: 'Credenziali errate' });
  // }
});

app.get('/shops', (req, res) => {
  fs.readFile(process.cwd() + '/data/shops.json', (err, data) => {
    if (err) throw err;
    res.send(JSON.parse(data).shops);
  });
})

app.get('/shops/:id', (req, res) => {
  const shopId = req.params.id;
  fs.readFile(path.join(process.cwd(), 'data', 'shops.json'), (err, data) => {
    if (err) throw err;
    const shops = JSON.parse(data);
    const shop = shops.find(s => +s.id === +shopId);
    if (shop) {
      res.send(shop);
    } else {
      res.status(404).send({ error: 'Shop non trovato' });
    }
  });
});

app.post('/shops', (req, res) => {

  const newShop = req.body;

  fs.readFile(path.join(process.cwd(), 'data', 'shops.json'), (err, data) => {
    if (err) throw err;
    let shops = JSON.parse(data);

    const maxId = shops.reduce((max, shop) => Math.max(max, parseInt(shop.id, 10)), 0);
    newShop.id = maxId + 1;

    // Aggiungi il nuovo shop alla lista
    shops.push(newShop);

    // Scrivi la lista aggiornata nel file JSON
    fs.writeFile(path.join(process.cwd(), 'data', 'shops.json'), JSON.stringify(shops, null, 2), (err) => {
      if (err) throw err;
      res.status(201).send(newShop);
    });

  });

})



app.listen(port, () => {
  console.log(`Fake API listening on port ${port}`);
});