socket.on("hello from server", () =>  {
    console.log("socket io connecté");
});

var nomJoueur="";
var joueursPresents=[];
$("#menu").hide();

// function refreshJoueurs(){           // fonction pour raffraichir les joueurs présents
//     $.getJSON("/joueurs", (data) => {
//         joueursPresents=data;
//     });
// }

socket.on('refreshJ', (data) => {
    joueursPresents=data;
    listeJoueurs(joueursPresents);
});

function infos(){     // renvoie les informations sur les joueurs dans la console
    console.log("Joueurs dans la partie :");
    $.getJSON("http://localhost:8888/joueurs",data => {console.log(data);});
}

function listeJoueurs(joueurs){
    $("#listeJoueurs").empty();
    for (let joueur of joueurs){           // ajoute le joueur
        $("#listeJoueurs").append("<li>"+joueur+"</li>");
    }
}

function entrerDansLaPartie(){
    nomJoueur = document.getElementById("nom").value;
    console.log(nomJoueur+" veut entrer")
    if (nomJoueur !="" && nomJoueur != " "){          //evite d'avoir un nom de joueur vide
        //$.getJSON("http://localhost:8888/entree/"+nomJoueur,(data) => {
        socket.emit('entreeReq',nomJoueur);
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
                // refreshJoueurs();
                $("#nom").prop("disabled",true);  // une fois le joueur dans la partie on veut éviter qu'un
                $("#enter").prop("disabled",true);     // autre joueur entre sur la même page
                $("#quitter").prop("disabled",false);   // le bouton quitter devient disponible
            }
        });
    }
    // refreshJoueurs();
}

function quitterLaPartie(){
    nomJoueur = document.getElementById("nom").value;
    if (nomJoueur !="" && nomJoueur != " "){
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
    // refreshJoueurs();
}

function clear(){                    // fonction pour "clear" la page web afin d'afficher le jeu
    $(".principal").remove();
    $("body").removeClass();
}

// function testSiLancee(){               // fonction pour vérifier si la partie est lancée
//     // console.log('test');
//     $.getJSON("/partieLancee", (data) => {
//         if(data==true){
//             showJeu();
//             refreshJoueurs();
//             clearInterval(testSiLanceeInterval);
//         }
//     });
//     refreshJoueurs();
// }

//let testSiLanceeInterval=setInterval(testSiLancee,1000); // teste toute les 1 secondes si la partie est bien lancée

socket.on('partieLancee',() => {
    showJeu();
    // refreshJoueurs();
});

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

function showMenu(){
    $("#setup").hide();       
    $("header").text("Bienvenue !");
    $("#menu").show();
}

function afficheScores(tab){
    tab.forEach((element,index) => {
        $("#score"+index).text(element); 
    });
}

// function actualiseDamier(){
//     $.getJSON('/dernierPion', (data) => {
//         $("#h"+data.case).attr("fill",couleursJoueurs[data.joueur]);
//         let now = new Date();
//         console.log("on actualise "+now.getTime());
//         console.log(data);
//     })
// }

// let actualiseDamierInterval=setInterval(actualiseDamier,2000);

socket.on('dernierPion',(data) => {
    $("#h"+data.case).attr("fill",couleursJoueurs[data.joueur]);
    oldScore = $("#score"+data.joueur).text();
    $("#score"+data.joueur).text(parseInt(oldScore)+1);
    console.log("on actualise");
});

function send(){
    let message = $('#message').val();
    console.log(message);
    socket.emit('envoieMessage',{'auteur':nomJoueur,'message':message,'numeroJeton':jeton});
}

socket.on('recoitMessage', (data) => {
    $("#messages").append("<li class='text"+couleursJoueurs[data.numeroJeton]+"'>"+data.auteur+": "+data.message+"</li>");
});

function showJeu(){   // fonction principale qui affiche le jeu une fois qu'un joueur lance la partie
    clear();
    // refreshJoueurs();
    console.log(joueursPresents);
    setJeton(joueursPresents.indexOf(nomJoueur));
    $("header").text("Partie en cours...");
    var tabScore="<table>\
                    <thead>\
                        <tr>\
                            <th colspan='2'>Nombre de pions posés</th>\
                        </tr>\
                    </thead>\
                    <tbody>";
    console.log(joueursPresents);
    joueursPresents.forEach((element,index) => {
        tabScore+="<tr><td>"+element+"</td><td id='score"+index+"'>0</td></tr>"
    });
    tabScore+="</tbody></table>";
    var div1="<div id='tablier' class='game'></div>";
    var chat="<div id='chat' class='chat'>\
        <ul id='messages'></ul>\
        <input id='message' type='text'><button onClick='send()'>Envoyer</button></div>";
    var bouton="<button type='button' class='quitterButton red'\
        onClick='quitterLaPartieEnCours()'>Quitter la partie</button>";
    $("body").append(tabScore,div1,chat,bouton);
    $.getJSON('/recupTaille',(n) => {
        genereDamier(20,n,n);
    });
}

function quitterLaPartieEnCours(){
    $.getJSON("http://localhost:8888/sortie/"+joueursPresents,(data) => {});
    // refreshJoueurs();
}

function lancer(){    // Pour lancer la partie
    // refreshJoueurs();
    // $.getJSON("/lancerPartie",(data) => {});
    socket.emit('lancerPartie');
}

// $.getJSON('/estSetup', (data) => {
//     if(data) showMenu();
// });

socket.emit('estSetupReq');
socket.on('estSetupRep', (data) => {
    if(data) showMenu();
});

