const { response } = require("express")
const express = require("express");
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = new require("socket.io")(server);
server.listen(8888, () => {
console.log('Ecoute sur le port 8888') ;
});

var joueurs = [];
var hex = []; 
for (i=0;i<121;i++) hex.push(-1);
var jeton = -1, dernierPion = -1;
var partieLancee=false;

app.get('/', (request,response) => {
    response.sendFile('index.html',{root: __dirname});
});

app.get('/fichier/:nomFichier', (request,response) => {  
    response.sendFile(request.params.nomFichier,{root: __dirname});
});

app.get('/jeu', (request,response) => {  
    response.sendFile('hexagone.html',{root: __dirname});
});

app.get('/joueurs', (request,response) => {
    console.log(joueurs);
    response.json(joueurs);
});

app.get('/entree/:nomJoueur', (request,response) => {
    let nomJoueur = request.params.nomJoueur;
    if (joueurs.length<4){ 
        if (!joueurs.includes(nomJoueur)){
            joueurs.push(nomJoueur);
            response.json({joueurs:joueurs});
        }else response.json({joueurs:joueurs,erreur:"Le joueur est déja là !"});
    }else response.json({joueurs:joueurs,erreur:"Trop de Joueurs !"}); 
});

app.get('/sortie/:nomJoueur', (request,response) => {
    let nomJoueur = request.params.nomJoueur;
    let index = joueurs.indexOf(nomJoueur);
    if (index != -1){
        joueurs.splice(index, 1);
        response.json({joueurs:joueurs});
    }else response.json({joueurs:joueurs,erreur:"Ce joueur n'existe pas"});
});

app.get('/pion/:position/:numJoueur', (request,response) => {
    console.log(request.params.numJoueur);
    if (request.params.numJoueur == jeton){
        let position = parseInt(request.params.position);
        if (position >= 0 && position < 121)
            if (hex[position] == -1){
                hex[position] = jeton;
                jeton++; if (jeton == 2) jeton = 0;
                dernierPion = position;
            }
    }
});

app.get('/getPions', (request,response) => {
    response.json(hex);
})

app.get('/dernierPion', (request,response) => {
    console.log(dernierPion);
    response.json(dernierPion);
});

app.get('/lancerPartie', (request,response) => {
    partieLancee=true;
    response.end();
})

app.get('/partieLancee', (request,response) => {
    console.log(partieLancee);
    response.json(partieLancee);
})

app.get('/etatJeton', (request,reponse) => {
    console.log(etatJeton);
    response.json(etatJeton);
});