var nomJoueur="";
var joueursPresents=[];

function refreshJoueurs(){
    $.getJSON("/joueurs", (data) => {
        joueursPresents=data;
    });
}

function infos(){
    console.log("Joueurs dans la partie :");
    $.getJSON("http://localhost:8888/joueurs",data => {console.log(data);});
};

function entrerDansLaPartie(){
    nomJoueur = document.getElementById("nom").value;
    if (nomJoueur !="" && nomJoueur != " "){
        $.getJSON("http://localhost:8888/entree/"+nomJoueur,(data) => {
            console.log(data);
            if(data.erreur){
                $("#listeJoueurs").text(data.erreur);
            }else{
                $("#listeJoueurs").empty();
                if (nomJoueur == data.joueurs[0]) numJoueur=0;
                else numJoueur=1;
                for (let joueur of data.joueurs){
                    $("#listeJoueurs").append("<li>"+joueur+"</li>");
                }
                refreshJoueurs();
                setJeton(joueursPresents.indexOf(nomJoueur));
                $("#nom").prop("disabled",true);
                $("#enter").prop("disabled",true);
                $("#quitter").prop("disabled",false);
            }
        });
    }
    refreshJoueurs();
};

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
                $("#nom").prop("disabled",false);
                $("#enter").prop("disabled",false);
                $("#quitter").prop("disabled",true);
            }
        });
    }
    refreshJoueurs();
};

function clear(){
    $(".principal").remove();
    $("body").removeClass();
}

function testSiLancee(){
    console.log('test');
    $.getJSON("/partieLancee", (data) => {
        if(data==true){
            showJeu();
            refreshJoueurs();
            clearInterval(testSiLanceeInterval);
        }
    });
    refreshJoueurs();
}

let testSiLanceeInterval=setInterval(testSiLancee,1000);

function showJeu(){
    clear();
    $("header").text("Partie en cours...");
    var div1="<div id='tablier' class='game'></div>";
    var bouton="<button type='button'class='quitterButton red'>Quitter la partie</button>";
    $("body").append(div1,bouton);
    genereDamier(20, 11, 11);
}

function lancer(){
    refreshJoueurs();
    $.getJSON("/lancerPartie",(data) => {});
}