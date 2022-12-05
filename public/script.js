var nomJoueur="";
var joueursPresents=[];
$("#menu").hide();

function refreshJoueurs(){           // fonction pour raffraichir les joueurs présents
    $.getJSON("/joueurs", (data) => {
        joueursPresents=data;
    });
}

function infos(){     // renvoie les informations sur les joueurs dans la console
    console.log("Joueurs dans la partie :");
    $.getJSON("http://localhost:8888/joueurs",data => {console.log(data);});
}

function entrerDansLaPartie(){
    nomJoueur = document.getElementById("nom").value;
    console.log(nomJoueur+" veut entrer")
    if (nomJoueur !="" && nomJoueur != " "){          //evite d'avoir un nom de joueur vide
        $.getJSON("http://localhost:8888/entree/"+nomJoueur,(data) => {
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
                refreshJoueurs();
                setJeton(joueursPresents.indexOf(nomJoueur));
                $("#nom").prop("disabled",true);  // une fois le joueur dans la partie on veut éviter qu'un
                $("#enter").prop("disabled",true);     // autre joueur entre sur la même page
                $("#quitter").prop("disabled",false);   // le bouton quitter devient disponible
            }
        });
    }
    
    refreshJoueurs();
}

function quitterLaPartie(){
    nomJoueur = document.getElementById("nom").value;
    if (nomJoueur !="" && nomJoueur != " "){
        $.getJSON("http://localhost:8888/sortie/"+nomJoueur,(data) => {
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
                $("#nom").prop("disabled",false);         // inversement à la fonction entrerDansLaPartie
                $("#enter").prop("disabled",false);
                $("#quitter").prop("disabled",true);
            }
        });
    }
    
    refreshJoueurs();
}

function clear(){                    // fonction pour "clear" la page web afin d'afficher le jeu
    $(".principal").remove();
    $("body").removeClass();
}

function testSiLancee(){               // fonction pour vérifier si la partie est lancée
    // console.log('test');
    $.getJSON("/partieLancee", (data) => {
        if(data==true){
            showJeu();
            refreshJoueurs();
            clearInterval(testSiLanceeInterval);
        }
    });
    refreshJoueurs();
}

let testSiLanceeInterval=setInterval(testSiLancee,1000); // teste toute les 1 secondes si la partie est bien lancée

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
    $.getJSON("/setup/"+nbJChoix+"/"+tailleChoix, (data) => {});
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

function actualiseDamier(){
    $.getJSON('/dernierPion', (data) => {
        $("#h"+data.case).attr("fill",couleursJoueurs[data.joueur]);
        console.log("on actualise");
        console.log(data);
    })
    
}

let actualiseDamierInterval=setInterval(actualiseDamier,1000);

function showJeu(){            // fonction principale qui affiche le jeu une fois qu'un joueur lance la partie
    clear();
    $("header").text("Partie en cours...");
    var tabScore="<table>\
                    <thead>\
                        <tr>\
                            <th colspan='2'>Nombre de pions posés</th>\
                        </tr>\
                    </thead>\
                    <tbody>";
    joueursPresents.forEach((element,index) => {
        tabScore+="<tr><td>"+element+"</td><td id='score"+index+"'>0</td></tr>"
    });
    tabScore+="</tbody></table>";
    var div1="<div id='tablier' class='game'></div>";
    var bouton="<button type='button' class='quitterButton red'\
        onClick='quitterLaPartieEnCours()'>Quitter la partie</button>";
    $("body").append(tabScore,div1,bouton);
    $.getJSON('/recupTaille',(n) => {
        genereDamier(20,n,n);
    });
}

function quitterLaPartieEnCours(){
    $.getJSON("http://localhost:8888/sortie/"+joueursPresents,(data) => {});
    refreshJoueurs();
}

function lancer(){    // Pour lancer la partie
    refreshJoueurs();
    $.getJSON("/lancerPartie",(data) => {});
}

$.getJSON('/estSetup', (data) => {
    if(data) showMenu();
});