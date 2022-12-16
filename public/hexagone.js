//window.addEventListener('load', (event) => { genereDamier(20, 11, 11); });

var jeton=0;
function setJeton(newJeton) {jeton=newJeton};
var couleursJoueurs=['red','blue','green','orange'];

function creeHexagone(rayon) {
    var points = new Array();
    for (var i = 0; i < 6; ++i) {
        var angle = i * Math.PI / 3;
        var x = Math.sin(angle) * rayon;
        var y = -Math.cos(angle) * rayon;
        //console.log("x="+Math.round(x*100)/100+" y="+Math.round(y*100)/100);
        points.push([Math.round(x*100)/100, Math.round(y*100)/100]);
    }
    return points;
}

function genereDamier(rayon, nbLignes, nbColonnes) {
    if(nbLignes==9 && nbColonnes==9){  /* augmente la taille globale du damier*/
        rayon=rayon+5;
    };
    if(nbLignes==19 && nbColonnes==19){  /* reduire la taille globale du damier*/
        rayon=rayon-5;
    };
    var i=0;
    distance =  rayon - (Math.sin(1 * Math.PI / 3) * rayon);  // plus grande distance entre l'hexagone et le cercle circonscrit

    d3.select("#tablier").append("svg").attr("width", (nbLignes*2)*2*rayon).attr("height",nbLignes*2*rayon);
    var hexagone = creeHexagone(rayon);
    for (var ligne=0; ligne < nbLignes; ligne++) {
        i++;
        for (var colonne=0; colonne < nbColonnes; colonne++) {
            var d = "";
            var x, y;
            for (h in hexagone) {
                x = hexagone[h][0]+(rayon-distance)*(2+i+2*colonne);
                y = distance*2 + hexagone[h][1]+(rayon-distance*2)*(1+2*ligne);
                if (h == 0) d += "M"+x+","+y+" L";
                else        d +=     x+","+y+" ";
            }
            d += "Z";
            d3.select("svg")
                .append("path")
                .attr("d", d)
                .attr("stroke", "black")
                .attr("fill", "white")
                .attr("id", "h"+(ligne*nbLignes+colonne)) // car un id doit commencer par une lettre pour pouvoir être utilisé
                .on("click", function(d) {
                    let position=d3.select(this).attr('id').substring(1);
                    let typePion = document.querySelector('input[name="swap"]:checked').id;
                    console.log("typePion : "+typePion)
                    console.log(position);
                    socket.emit('pion',{'typePion':typePion,'position':position,'numJoueur':jeton});
                    console.log("typePion hexagone apres emit : "+typePion);
                    // if(typePion=="pion")
                    // d3.select(this).attr('fill', couleursJoueurs[jeton]);
                });
            }
    }
}

function poseCorridor(direction,position) {
    hexagone = $("#"+position);
    hexagone.attr("fill","black");
    points = hexagone.attr("d").split(" ");
    point1 = [];
    point2 = [];
    switch (direction) {
    case "TLBR": //topleft_bottomright
            point1 = [(parseFloat(points[0].split(",")[0].split("M")[1]) + parseFloat(points[5].split(",")[0]))/2, (parseFloat(points[0].split(",")[1]) + parseFloat(points[5].split(",")[1]))/2];
            point2 = [(parseFloat(points[2].split(",")[0]) + parseFloat(points[3].split(",")[0]))/2, (parseFloat(points[2].split(",")[1]) + parseFloat(points[3].split(",")[1]))/2];
        break;
        case "TRBL": //topright_bottomleft
            point1 = [(parseFloat(points[0].split(",")[0].split("M")[1]) + parseFloat(points[1].split(",")[0].split("L")[1]))/2, (parseFloat(points[0].split(",")[1]) + parseFloat(points[1].split(",")[1]))/2];
            console.log(point1);
            point2 = [(parseFloat(points[3].split(",")[0]) + parseFloat(points[4].split(",")[0]))/2, (parseFloat(points[3].split(",")[1]) + parseFloat(points[4].split(",")[1]))/2];
            console.log(point2);
        break;
        case "MLMR": //middleleft_middleright
            point1 = [(parseFloat(points[1].split(",")[0].split("L")[1]) + parseFloat(points[2].split(",")[0]))/2, (parseFloat(points[1].split(",")[1]) + parseFloat(points[2].split(",")[1]))/2];
            console.log(point1);
            point2 = [(parseFloat(points[4].split(",")[0]) + parseFloat(points[5].split(",")[0]))/2, (parseFloat(points[4].split(",")[1]) + parseFloat(points[5].split(",")[1]))/2];
            console.log(point2);
        break;
    }
    corridor = "M" + point1[0] + "," + point1[1] + " L" + point2[0] + "," + point2[1] + " Z";
    d3.select("svg").append("path")
        .attr("id","i"+position.split("h")[1])
        .attr("d",corridor)
        .attr("stroke","white")
        .attr("fill","black")
        .attr("stroke-width","5");
}