const { response } = require("express")
const express = require("express");
// const { cp } = require("fs");
const app = express();
const http = require('http');
// const { toUnicode } = require("punycode");
const server = http.createServer(app);
const io = new require("socket.io")(server);
server.listen(8888, () => {
console.log('Ecoute sur le port 8888') ;
});

var joueurs = [];
var rotation = [];
var taille=0;
var [caseDepartJ1,caseDepartJ2,caseDepartJ3,caseDepartJ4]=[[],[],[],[]];
var listeVictoire=[];
var joueursMax = 0;
function initJMax(j){
    joueursMax = parseInt(j) || 0;
}
var hex = [];
function initHex(n){
    for (i=0;i<n**2;i++) hex.push(-1);
}
var isCorridor=False;
var jeton = 0, dernierPion = -1;
var dernierJeton = -1;
var partieLancee=false;

function tourNext(tour){
    if(tour==rotation[rotation.length-1]){
        tour = rotation[0];
    }else{
        tour = rotation[rotation.indexOf(tour)+1];
    }
    return tour;
}

function victoireRec(jetonJoueur,caseAutours){
    console.log("caseAutours debut victoire rec :");
    console.log(caseAutours);
    let suiteRec=[];
    console.log("caseAutours du joueur "+jetonJoueur);
    console.log("liste victoire");
    console.log(listeVictoire);
    for(i in caseAutours){
        if(!listeVictoire.includes(caseAutours[i])){
            console.log("caseAutours : ");
            console.log(caseAutours);
            suiteRec.push(caseAutours[i]);
            // listeVictoire.push(suite[i]);
        }
    }
    if(suiteRec.length!=0){
        console.log(jetonJoueur+" caseAutours  :");
        console.log("liste victoire");
        console.log(listeVictoire);
        console.log("suiteRec");
        console.log(suiteRec);
        victoire(jetonJoueur,suiteRec);
    }
}

function victoire(jetonJoueur,depart){
    let caseAutours=[];      //caseAutours=i quand 4 joueurs ?
    for(i of depart){
        if(hex[i]==jetonJoueur){
            caseAutours=[];
            if(!caseDepartJ1.includes(i)){
                if(hex[i-taille]==jetonJoueur) caseAutours.push(i-taille);
                if(hex[i-taille+1]==jetonJoueur && !caseDepartJ3.includes(i)) caseAutours.push(i-taille+1);
            }
            if(!caseDepartJ2.includes(i)){
                if(hex[i-1]==jetonJoueur) caseAutours.push(i-1);
                if(hex[i+taille-1]==jetonJoueur && !caseDepartJ4.includes(i)) caseAutours.push(i+taille-1);
            }
            if(!caseDepartJ3.includes(i)){
                if(hex[i+1]==jetonJoueur) caseAutours.push(i+1);
                if(hex[i-taille+1]==jetonJoueur && !caseDepartJ1.includes(i)) caseAutours.push(i-taille+1);
            }
            if(!caseDepartJ4.includes(i)){
                if(hex[i+taille]==jetonJoueur) caseAutours.push(i+taille);
                if(hex[i+taille-1]==jetonJoueur && !caseDepartJ2.includes(i)) caseAutours.push(i+taille-1);
            }
        }
    }
    switch(jetonJoueur){
        case 0 :
            for(j of caseAutours){
                if(caseDepartJ4.includes(j)){
                    console.log('Victoire du joueur 1 !');
                    finDePartie(joueurs[jetonJoueur]);
                }
            }
        break;
        case 1 :
            for(j of caseAutours){
                if(caseDepartJ3.includes(j)){
                    console.log('Victoire du joueur 2 !');
                    finDePartie(joueurs[jetonJoueur]);
                }
            }
        break;
        case 2 :
            console.log("caseAutours de J3 : ");
            console.log(caseAutours);
            for(j of caseAutours){
                if(caseDepartJ3.includes(j)){
                    console.log('Victoire du joueur 3 !');
                    finDePartie(joueurs[jetonJoueur]);
                }
            }
        break;
        case 3 :
            console.log("caseAutours de J4 : ");
            console.log(caseAutours);
            for(j of caseAutours){
                if(caseDepartJ4.includes(j)){
                    console.log('Victoire du joueur 4 !');
                    finDePartie(joueurs[jetonJoueur]);
                }
            }
        break;
    }
    if(!listeVictoire.includes(i)) listeVictoire.push(i);
    victoireRec(jetonJoueur,caseAutours);
}

/* met fin à la partie et envoie un message de renvoie des joueurs au lobby */
function finDePartie(vainqueur){
    partieLancee=false;
    io.emit('victoire',vainqueur);
    hex = [];
    joueurs = [];
    rotation = [];
    [caseDepartJ1,caseDepartJ2,caseDepartJ3,caseDepartJ4]=[[],[],[],[]];
    joueursMax = 0;
    jeton = 0, dernierPion = -1;
    dernierJeton = -1;
}

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
        }//console.log("finit ?");
    // console.log(partieLancee);
    // console.log(dernierPion);
    // console.log(dernierJeton);
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

// Partie socket //

io.on("connection", (socket) => {
    socket.emit("hello from server");
    socket.on("setup",(data) => {
        if (!partieLancee){
            let nbJ = data.nbJChoix;
            taille = parseInt(data.tailleChoix);
            console.log(nbJ,taille);
            initJMax(nbJ);
            initHex(taille);
            for(let i=0;i<taille**2;i++){
                //console.log("i :"+i);
                    if (0<=i && i<taille){
                        //console.log("in j1:"+i);
                        caseDepartJ1.push(i);
                    }
                    let j=0;
                    while(j<taille){
                        if(i==j*taille){
                            //console.log("in j2:"+i);
                            caseDepartJ2.push(i);
                        }
                        j++;
                    }
                    j=0;
                    while(j<taille){
                        if(i==j*taille+(taille-1)){
                            //console.log("in j3:"+i);
                            caseDepartJ3.push(i);
                        }
                        j++;
                    }
                    if(i>=(taille**2)-taille && i<taille**2){
                        //console.log("in j4:"+i);
                        caseDepartJ4.push(i);
                    }
            }
            // console.log(caseDepartJ1);
            // console.log(caseDepartJ2);
            // console.log(caseDepartJ3);
            // console.log(caseDepartJ4);
            // console.log(hex);
            // console.log(joueursMax);
        }
    });
    socket.on('estSetupReq',() => {
        socket.emit('estSetupRep',joueursMax>=2 && joueursMax<=4 && hex!=[]);

    });
    socket.on('lancerPartie',() => {
        if(joueurs.length==joueursMax){
            partieLancee=true; 
            for(let i=0;i<joueursMax;i++){
                rotation.push(i);
            }
            console.log(rotation);
            io.emit('partieLancee');
        }
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
        if (!partieLancee){
            let nomJoueur = data;
            console.log(nomJoueur+" est sorti");
            let index = joueurs.indexOf(nomJoueur);
            if (index != -1){
                joueurs.splice(index, 1);
                socket.emit('sortieRep',{joueurs:joueurs});
                io.emit('refreshJ',joueurs);
            }else socket.emit('sortieRep',{erreur:"Ce joueur n'existe pas"});
        }else{
            let numJoueur = data;
            let index = rotation.indexOf(numJoueur);
            rotation.splice(index,1);
            if (numJoueur == jeton){
                jeton=tourNext(jeton);
            }
            if (rotation.length<2){
                finDePartie(joueurs[rotation[0]]);
                // io.emit('victoire',joueurs[rotation[0]]);
            }
        }
    });
    socket.on('pion',(data) => {
        console.log("numJoueur : "+data.numJoueur);
        isCorridor=False;
        if(data.isCorridor) isCorridor=True;
        if (data.numJoueur == jeton){
            let position = parseInt(data.position);
            if (position >= 0 && position <hex.length)
                if (hex[position] == -1){
                    hex[position] = jeton;
                    dernierJeton = jeton;
                    // jeton++; if (jeton == joueursMax) jeton = 0;
                    console.log("jeton : "+jeton);
                    jeton=tourNext(jeton);
                    console.log("jeton : "+jeton);
                    dernierPion = position;
                    io.emit('dernierPion',{'isCorridor':isCorridor,"case":dernierPion,"joueur":dernierJeton});
                    listeVictoire=[];
                    console.log("dernierPion "+dernierPion)
                    switch(data.numJoueur){
                        case 0:
                            victoire(0,caseDepartJ1);
                            break;
                        case 1:
                            victoire(1,caseDepartJ2);
                            break;
                        case 2:
                            victoire(2,caseDepartJ2);
                            break;
                        case 3:
                            victoire(3,caseDepartJ1);
                            break;
                    }
                }
        }
    });
    socket.on('envoieMessage',(data) => {
        io.emit('recoitMessage',data);
    });
});