socket.on("hello from server", () =>  {
    console.log("socket io connecté");
});

var nomJoueur="";
var joueursPresents=[];
$("#menu").hide();
var compteurC=[0,0,0,0];

/* Raffraichie les joueurs présents */
socket.on('refreshJ', (data) => {
    joueursPresents=data;
    listeJoueurs(joueursPresents);
});

/* renvoie les informations sur les joueurs dans la console */
function infos(){     
    // console.log("Joueurs dans la partie :");
    $.getJSON("http://localhost:8888/joueurs",data => {
        alert("Joueurs dans la partie : "+data)
    });
}

/* affiche les joueurs ayant rejoint à l'écran */
function listeJoueurs(joueurs){
    $("#listeJoueurs").empty();
    for (let joueur of joueurs){           // ajoute le joueur
        $("#listeJoueurs").append("<li>"+joueur+"</li>");
    }
}

/* fonction pour entrer dans la partie */
function entrerDansLaPartie(){
    nomJoueur = document.getElementById("nom").value.trim().replace(/[^a-zA-Z0-9 ]/g,'');
    console.log(nomJoueur+" veut entrer")
    if (nomJoueur !=""){          //evite d'avoir un nom de joueur vide
        //$.getJSON("http://localhost:8888/entree/"+nomJoueur,(data) => {   // ancien JSON
        socket.emit('entreeReq',nomJoueur);                                 // remplacement par socket
        socket.on('entreeRep', (data) => {   
            console.log(data);
            if(data.erreur){
                $("#listeJoueurs").text(data.erreur);
            }else{
                $("#listeJoueurs").empty();
                if (nomJoueur == data.joueurs[0]) numJoueur=0;
                else numJoueur=1;
                for (let joueur of data.joueurs){           // ajoute le joueur
                    $("#listeJoueurs").append("<li>"+joueur+"</li>");
                }
                $("#nom").prop("disabled",true);     // une fois le joueur dans la partie on veut éviter qu'un
                $("#enter").prop("disabled",true);   // autre joueur entre sur la même page
                $("#quitter").prop("disabled",false);// le bouton quitter devient disponible
            }
        });
    }
}

/* fonction pour quitter la partie */
function quitterLaPartie(){
    nomJoueur = document.getElementById("nom").value.trim().replace(/[^a-zA-Z0-9 ]/g,'');
    if (nomJoueur !=""){
        // $.getJSON("http://localhost:8888/sortie/"+nomJoueur,(data) => {
        socket.emit('sortieReq',nomJoueur);
        socket.on('sortieRep', (data) => {
            //console.log(data);
            if(data.erreur){
                $("#listeJoueurs").text(data.erreur);
            }else{
                $("#listeJoueurs").empty();
                if (nomJoueur == data.joueurs[0]) numJoueur=0;
                else numJoueur=1;
                for (let joueur of data.joueurs){
                    $("#listeJoueurs").append("<li>"+joueur+"</li>");
                }
                $("#nom").prop("disabled",false);   // inversement à la fonction entrerDansLaPartie
                $("#enter").prop("disabled",false);
                $("#quitter").prop("disabled",true);
            }
        });
    }
}

/* fonction pour "clear" la page web afin d'afficher le jeu */
function clear(){                    
    $(".principal").remove();
    $("body").removeClass();
}

/* si la partie est déja lancée, affiche directement le jeu */
socket.on('partieLancee',() => {
    showJeu();
});

/* récupère les données initialisés par le premier joueur lors du paramétrage */
function recupParams(){
    const nbJoueurs = document.querySelectorAll('input[name="nbJ"]');
    const nbTaille = document.querySelectorAll('input[name="taille"]');
    let nbJChoix;
    for (const nbJ of nbJoueurs) {
        if (nbJ.checked) {
            nbJChoix = nbJ.value;
            break;
        }
    }
    let tailleChoix;
    for (const taille of nbTaille) {
        if (taille.checked) {
            tailleChoix = taille.value;
            break;
        }
    }
    // console.log(nbJChoix,tailleChoix);
    // $.getJSON("/setup/"+nbJChoix+"/"+tailleChoix, (data) => {});
    socket.emit("setup",{"nbJChoix": nbJChoix, "tailleChoix": tailleChoix});
    showMenu();
}

/* affiche le menu permettant d'entrer son nom, de rejoindre etc. */
function showMenu(){
    $("#setup").hide();       
    $("header").text("Bienvenue !");
    $("#menu").show();
}

/* affiche le nombre de pions posés pour chaque joueurs */
function afficheScores(tab){
    tab.forEach((element,index) => {
        $("#score"+index).text(element); 
    });
}

/* affiche le nombre de corridors posés pour chaque joueurs */
function afficheCorridors(tab){
    tab.forEach((element,index) => {
        $("#corridor"+index).text(element);
    });
}

/* actualise le damier lorqu'un joueur pose un pion */
socket.on('dernierPion',(data) => {
    console.log("type du pion : "+data.typePion);
    let direction = (data.typePion).substring(8);
    console.log(direction);
    if(data.typePion!="pion"){
        poseCorridor(direction, "h"+data.case);
        oldCorridor= $("#corridor"+data.joueur).text();
        $("#corridor"+data.joueur).text(parseInt(oldCorridor)+1);
        console.log("on actualise corridors posés");
        compteurC[data.joueur]+=1;
        console.log("Compteur de corridors :"+compteurC);
        // if(compteurC[data.joueur]==3){                // petit test pour desactiver les corridors une fois le nombre atteint
        //     $("#pion").prop("checked",true);                    // le probleme c'est que ça désactiver les boutons pour tout le monde
        //     $("#corridorTLBR").prop("disabled",true);             // sans que tous les joueurs aient posé leurs n corridors
        //     $("#corridorTRBL").prop("disabled",true);
        //     $("#corridorMLMR").prop("disabled",true);
        // }
    }
    else{
        $("#h"+data.case).attr("fill",couleursJoueurs[data.joueur]);
        oldScore = $("#score"+data.joueur).text();
        $("#score"+data.joueur).text(parseInt(oldScore)+1);
        console.log("on actualise pion posés");
    }
});

/* fonction pour envoyer un message */
function send(){
    let message = $('#message').val().trim().replace(/[^a-zA-Z0-9 ]/g,'');
    if (!message==""){
        console.log(message);
        socket.emit('envoieMessage',{'auteur':nomJoueur,'message':message,'numeroJeton':jeton});
    }
    $('#message').val("");
}

/* reception des messages */
socket.on('recoitMessage', (data) => {
    $("#messages").append("<li class='text"+couleursJoueurs[data.numeroJeton]+"'>"+data.auteur+": "+data.message+"</li>");
});

/* fonction principale qui affiche le jeu une fois qu'un joueur lance la partie */
function showJeu(){   
    clear();
    //console.log(joueursPresents);
    setJeton(joueursPresents.indexOf(nomJoueur));
    $("header").text("Partie en cours...");
    var tabScore="<table class='tabPion'><thead>\
                        <tr><th colspan='2'>Nombre de pions posés</th></tr>\
                        </thead>\
                    <tbody>";               // tableau du nombre de pions posés
    //console.log(joueursPresents);
    joueursPresents.forEach((element,index) => {
        tabScore+="<tr><td>"+element+"</td><td id='score"+index+"'>0</td></tr>"
    });
    tabScore+="</tbody></table>";

    var tabCorridor="<table class='tabCorridor'><thead>\
                        <tr><th colspan='2'>Corridors posés</th></tr>\
                        </thead>\
                    <tbody>";                 // tableau du nombre de corridors posés
    joueursPresents.forEach((element,index) => {
        tabCorridor+="<tr><td>"+element+"</td><td id='corridor"+index+"'>0</td></tr>"
    });

    var swap="<div class='switchPC'>\
            <input name='swap' id='pion' type='radio' value='Pion' checked />\
            <label for='pion'>Pion</label><br/>\
            <input name='swap' id='corridorTLBR' type='radio'/>\
            <label for='corridorTLBR'>Corridor \\</label><br/>\
            <input name='swap' id='corridorTRBL' type='radio'/>\
            <label for='corridorTRBL'>Corridor /</label><br/>\
            <input name='swap' id='corridorMLMR' type='radio'/>\
            <label for='corridorMLMR'>Corridor -</label><br/></div>"; // boutons radios pour poser un pion ou un corridor

    var top="<div id='j1' class='nomJ hautJ red'>"+joueursPresents[0]+"</div>"      // nom joueur 1 en haut
    var gauche="<div id='j2' class='nomJ gaucheJ blue'>"+joueursPresents[1]+"</div>"      // nom joueur 2 a gauche
    var droite="<div id='j3' class='nomJ droiteJ green'>"+joueursPresents[2]+"</div>"     // nom joueur 3 a droite
    var bas="<div id='j4' class='nomJ basJ orange'>"+joueursPresents[3]+"</div>"    // nom joueur 4 en bas
    var div1="<div id='tablier' class='game'></div>";   // jeu de hex
    var chat="<div id='chat' class='chat'>\
        <ul id='messages'></ul>\
        <input id='message' type='text'><button onClick='send()'>Envoyer</button></div>"; // tchat textuel
    var bouton="<button class='quitterButton red'\
        onClick='quitterLaPartieEnCours()'>Quitter la partie</button>";        // bouton quitter la partie en cours
    if(joueursPresents.length==2){      // si on lance une partie a 2 joueurs
        $("body").append(tabScore,tabCorridor,swap,top,gauche,div1,chat,bouton);
    }
    if(joueursPresents.length==3){      // si on lance une partie a 3 joueurs
        $("body").append(tabScore,tabCorridor,swap,top,gauche,droite,div1,chat,bouton);
    }
    if(joueursPresents.length==4){      // si on lance une partie a 4 joueurs
        $("body").append(tabScore,tabCorridor,swap,top,gauche,droite,bas,div1,chat,bouton);
    }
    // $("body").append(tabScore,top,gauche,droite,bas,div1,chat,bouton);
    $.getJSON('/recupTaille',(n) => {
        genereDamier(20,n,n);
    });
}

/* Pour quitter la partie en cours */
function quitterLaPartieEnCours(){
    // $.getJSON("http://localhost:8888/sortie/"+joueursPresents,(data) => {});
    socket.emit('sortieReq',jeton);
}

/* Pour lancer la partie */
function lancer(){    
    socket.emit('lancerPartie');
    console.log("La partie commence!")
}

/* Si les paramètres sont déja initialisés, affiche directement le menu de connexion */
socket.emit('estSetupReq');
socket.on('estSetupRep', (data) => {
    if(data) showMenu();
});

/* affiche la victoire puis propose de relancer une partie */
socket.on('victoire', (vainqueur) => {
    var victoire ="<div class='victoire'><div class='textVictoire'>"+vainqueur+" remporte la partie !\
        <br/><button class='newGameButton'\
        onClick='window.location.reload()'>Nouvelle Partie</button></div></div>";
    $("body").append(victoire);
    compteur=[0,0,0,0];
});
