socket.on("hello from server", () =>  {
    console.log("socket io connecté");
});

var nomJoueur="";
var joueursPresents=[];
$("#menu").hide();

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

/* actualise le damier lorqu'un joueur pose un pion */
socket.on('dernierPion',(data) => {
    if(data.isCorridor){
        poseCorridor(data.direction, "h"+data.case);
    }
    else{
    $("#h"+data.case).attr("fill",couleursJoueurs[data.joueur]);
    oldScore = $("#score"+data.joueur).text();
    $("#score"+data.joueur).text(parseInt(oldScore)+1);
    console.log("on actualise");
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
    var tabScore="<table><thead>\
                        <tr><th colspan='2'>Nombre de pions posés</th></tr>\
                        </thead>\
                    <tbody>";
    //console.log(joueursPresents);
    joueursPresents.forEach((element,index) => {
        tabScore+="<tr><td>"+element+"</td><td id='score"+index+"'>0</td></tr>"
    });
    tabScore+="</tbody></table>";
    var top="<div id='j1' class='nomJ hautJ red'>"+joueursPresents[0]+"</div>"
    var gauche="<div id='j2' class='nomJ gaucheJ blue'>"+joueursPresents[1]+"</div>"
    var droite="<div id='j3' class='nomJ droiteJ green'>"+joueursPresents[2]+"</div>"
    var bas="<div id='j4' class='nomJ basJ orange'>"+joueursPresents[3]+"</div>"
    var div1="<div id='tablier' class='game'></div>";   // jeu de hex
    var chat="<div id='chat' class='chat'>\
        <ul id='messages'></ul>\
        <input id='message' type='text'><button onClick='send()'>Envoyer</button></div>"; // tchat textuel
    var bouton="<button class='quitterButton red'\
        onClick='quitterLaPartieEnCours()'>Quitter la partie</button>";
    if(joueursPresents.length==2){
        $("body").append(tabScore,top,gauche,div1,chat,bouton);
    }
    if(joueursPresents.length==3){
        $("body").append(tabScore,top,gauche,droite,div1,chat,bouton);
    }
    if(joueursPresents.length==4){
        $("body").append(tabScore,top,gauche,droite,bas,div1,chat,bouton);
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

socket.on('victoire', (vainqueur) => {
    var victoire ="<div class='victoire'><div class='textVictoire'>"+vainqueur+" remporte la partie !\
        <br/><button class='newGameButton'\
        onClick='window.location.reload()'>Nouvelle Partie</button></div></div>";
    $("body").append(victoire);
});