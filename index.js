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
var joueursMax = 0;
function initJMax(j){
    joueursMax = parseInt(j) || 0;
}
var hex = [];
function initHex(n){
    for (i=0;i<n**2;i++) hex.push(-1);
}
var jeton = 0, dernierPion = -1;
var dernierJeton = -1;
var partieLancee=false;

// Partie Express //
app.get('/', (request,response) => {                          // chemin principal
    response.sendFile('public/index.html',{root: __dirname});
});

app.get('/fichier/:nomFichier', (request,response) => {       // chemin permettant d'utiliser les fichiers
    response.sendFile("public/"+request.params.nomFichier,{root: __dirname});
});

app.get('/setup/:nbJChoix/:tailleChoix', (request,response) => { // chemin initialisation jeu
    if (partieLancee) response.end();
    let nbJ = request.params.nbJChoix;
    let taille = request.params.tailleChoix;
    console.log(nbJ,taille);
    initJMax(nbJ);
    initHex(taille);
    console.log(hex);
    console.log(joueursMax);
    response.end();
});

app.get('/estSetup', (request,response) => {       // chemin verifiant si la partie est configurée
    if (joueursMax>=2 && joueursMax<=4 && hex!=[]) response.json(true);
    response.json(false);
});

app.get('/recupTaille', (request,response) => {
    response.json(Math.sqrt(hex.length));
});

app.get('/jeu', (request,response) => {                       // chemin du jeu
    response.sendFile('public/hexagone.html',{root: __dirname});
});

app.get('/joueurs', (request,response) => {                   // chemin d'affichage des infos joueurs
    console.log(joueurs);
    response.json(joueurs);
});

app.get('/entree/:nomJoueur', (request,response) => {         // chemin d'entrer des joueurs
    let nomJoueur = request.params.nomJoueur;
    console.log(nomJoueur+" est entré");
    if (joueurs.length<joueursMax){ 
        if (!joueurs.includes(nomJoueur)){
            joueurs.push(nomJoueur);
            response.json({joueurs:joueurs});
        }else response.json({joueurs:joueurs,erreur:"Le joueur est déja là !"});
    }else response.json({joueurs:joueurs,erreur:"Trop de Joueurs !"}); 
});

app.get('/sortie/:nomJoueur', (request,response) => {         // chemin de sortie des joueurs
    let nomJoueur = request.params.nomJoueur;
    console.log(nomJoueur+" est sorti");
    let index = joueurs.indexOf(nomJoueur);
    if (index != -1){
        joueurs.splice(index, 1);
        response.json({joueurs:joueurs});
    }else response.json({joueurs:joueurs,erreur:"Ce joueur n'existe pas"});
});

app.get('/pion/:position/:numJoueur', (request,response) => { // chemin de renvoie de la postion d'un jeton
    console.log("numJoueur : "+request.params.numJoueur);
    if (request.params.numJoueur == jeton){
        let position = parseInt(request.params.position);
        if (position >= 0 && position < 121)
            if (hex[position] == -1){
                hex[position] = jeton;
                console.log("Avant "+dernierJeton);
                dernierJeton = jeton;
                console.log("Apres "+dernierJeton);
                jeton++; if (jeton == joueursMax) jeton = 0;
                dernierPion = position;
            }
    }console.log("finit ?");
    console.log(partieLancee);
    console.log(dernierPion);
    console.log(dernierJeton);
});

app.get('/getPions', (request,response) => {//chemin de renvoie de la valeur des cases
    response.json(hex);
});

app.get('/dernierPion', (request,response) => {              // chemin de renvoie du dernier pion
    console.log(dernierPion);
    response.json({"case":dernierPion,"joueur":dernierJeton});
});

app.get('/lancerPartie', (request,response) => {             // Pour lancer la partie
    partieLancee=true;                                       // renvoie true lorsqu'un joueur lance la partie
    response.end();
});

app.get('/partieLancee', (request,response) => {             // vérifie si la partie est lancée
    console.log(partieLancee);
    response.json(partieLancee);
});

app.get('/etatJeton', (request,reponse) => {
    console.log(etatJeton);
    response.json(etatJeton);
});

app.get('/chat',(request,response) => {
    console.log("access au chat")
    response.sendFile('public/chat.html',{root: __dirname});
});

// Partie socket //

io.on("connection", (socket) => {
    socket.emit("hello from server");
    socket.on("setup",(data) => {
        if (!partieLancee){
            let nbJ = data.nbJChoix;
            let taille = data.tailleChoix;
            console.log(nbJ,taille);
            initJMax(nbJ);
            initHex(taille);
            console.log(hex);
            console.log(joueursMax);
        }
    });
    socket.on('estSetupReq',() => {
        socket.emit('estSetupRep',joueursMax>=2 && joueursMax<=4 && hex!=[]);
    });
    socket.on('lancerPartie',() => {
        partieLancee=true; 
        io.emit('partieLancee');
    });
    socket.on('entreeReq',(data) => {
        let nomJoueur = data;
        console.log(nomJoueur+" est entré");
        if (joueurs.length<joueursMax){ 
            if (!joueurs.includes(nomJoueur)){
                joueurs.push(nomJoueur);
                socket.emit('entreeRep',{joueurs:joueurs});
                io.emit('refreshJ',joueurs);
            }else socket.emit('entreeRep',{erreur:"Le joueur est déja là !"});
        }else socket.emit('entreeRep',{erreur:"Trop de Joueurs !"}); 
    });
    socket.on('sortieReq',(data) => {
        let nomJoueur = data;
        console.log(nomJoueur+" est sorti");
        let index = joueurs.indexOf(nomJoueur);
        if (index != -1){
            joueurs.splice(index, 1);
            socket.emit('sortieRep',{joueurs:joueurs});
            io.emit('refreshJ',joueurs);
        }else socket.emit('sortieRep',{erreur:"Ce joueur n'existe pas"});
    });
    socket.on('pion',(data) => {
        console.log("numJoueur : "+data.numJoueur);
        if (data.numJoueur == jeton){
            let position = parseInt(data.position);
            if (position >= 0 && position < 121)
                if (hex[position] == -1){
                    hex[position] = jeton;
                    dernierJeton = jeton;
                    jeton++; if (jeton == joueursMax) jeton = 0;
                    dernierPion = position;
                    io.emit('dernierPion',{"case":dernierPion,"joueur":dernierJeton});
                }
        }
    });
    socket.on('envoieMessage',(data) => {
        io.emit('recoitMessage',data);
    })
});

