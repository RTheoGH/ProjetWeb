# PROJETWEB - Jeu de Hex
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)


## Projet réalisé par

- Reynier Theo 22008945 (Groupe C)
- Hommais Anthony 22010461 (Groupe C)

---

## Liste des fonctionnalités implémentés

- Un seul joueur par page web
    > Limite de joueur pouvant rejoindre la partie par page web.

- Paramétrage par le premier joueur
    > Le premier joueur parametre la partie, les joueurs se connectant ensuite sont dirigés directement vers le menu de connexion.

- Sortie d’un joueur
    > Un joueur peut quitter la partie avant que celle-ci se lance.

- Sortie d'un joueur en cours de partie
    > Un joueur peut aussi quitter la partie lorqu'elle est en cours.Ces pions resteront sur le plateau.

- Détection automatique de la victoire
    > Lorqu'un joueur reussit a relier deux bords du plateau il gagne la partie.
    > De plus, si tous les autres joueurs ont quitté la partie et qu'il reste un seul joueur, ce joueur remporte la partie automatiquement.

- Pose d’hexagones
    > Les joueurs posent des hexagones sur le damier.

- Hexagone corridors
    > Les joueurs peuvent poser des "corridors", des voies à sens unique.

- Communication des joueurs :
    > Tchat textuel (protégé : pour eviter de créer des boutons et autres).

- Tableau Pions :
    > Compte le nombre de pions posés par les joueurs.

- Tableau Corridors : 
    > Compte le nombre de corridors posés par les joueurs (limité à 3).

---

## Installer les packages
```bash
npm install
```

## Pour lancer le jeu 
```bash
node index.js
```
