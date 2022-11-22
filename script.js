function infos(){
    console.log("Dans infos()");
    $.getJSON("http://localhost:8888/joueurs",data => {console.log(data);});
};

function entrerDansLaPartie(){
    let nom = document.getElementById("nom").value;
    if (nom !="" && nom != " "){
        $.getJSON("http://localhost:8888/entree/"+nom,(data) => {
            //console.log(data);
            if(data.erreur){
                $("#listeJoueurs").text(data.erreur);
            }else{
                $("#listeJoueurs").empty();
                if (nom == data.joueurs[0]) numJoueur=0;
                else numJoueur=1;
                for (let joueur of data.joueurs){
                    $("#listeJoueurs").append("<li>"+joueur+"</li>");
                }
            }
        });
    }
};

function quitterLaPartie(){
    let nom = document.getElementById("nom").value;
    if (nom !="" && nom != " "){
        $.getJSON("http://localhost:8888/sortie/"+nom,(data) => {
            //console.log(data);
            if(data.erreur){
                $("#listeJoueurs").text(data.erreur);
            }else{
                $("#listeJoueurs").empty();
                if (nom == data.joueurs[0]) numJoueur=0;
                else numJoueur=1;
                for (let joueur of data.joueurs){
                    $("#listeJoueurs").append("<li>"+joueur+"</li>");
                }
            }
        });
    }
};