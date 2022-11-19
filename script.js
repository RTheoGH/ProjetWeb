function infos(){
    console.log("Dans infos()");
    $.getJSON("http://localhost:8888/joueurs",data => {console.log(data);});
};

function entrerDansLaPartie(){
    let nom = document.getElementById("nom").value;
    if (nom !="" && nom != " "){
        $.getJSON("http://localhost:8888/entree/"+nom,(data) => {
            if (nom == data.joueurs[0]) numJoueur=0;
            else numJoueur=1;
            noms = "";
            for (let nom of data.joueurs) noms+=nom+" ";
            $("#listeJoueurs").text(noms);
            
        });
    }
};

function quitterLaPartie(){
    
};