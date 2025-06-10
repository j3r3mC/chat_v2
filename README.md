# custom_chat

**custom_chat** est une application de chat personnalisée basée sur une architecture microservices. Elle permet aux utilisateurs de participer à des discussions publiques dans des channels gérés par des administrateurs, de poster des fichiers et d'échanger des messages privés. Pour assurer la confidentialité, les messages privés (texte) sont cryptés avec RSA grâce au module `cryptoUtils`. Notez que, pour des raisons de performance et de taille, **les fichiers** ne sont pas chiffrés et sont stockés en clair.

---

## Table des Matières

- [Architecture](#architecture)
- [Fonctionnalités](#fonctionnalités)
- [Microservices](#microservices)
- [Endpoints Clés](#endpoints-clés)
- [Technologies Utilisées](#technologies-utilisées)
- [Installation et Déploiement](#installation-et-déploiement)
- [Sécurité – Cryptage des Messages Privés](#sécurité--cryptage-des-messages-privés)
- [Licence](#licence)

---

## Architecture

L’architecture de **custom_chat** se compose de plusieurs microservices indépendants, orchestrés via un API Gateway. Le front-end (développé en React) consomme l'API via l’API Gateway, qui redirige les requêtes vers le microservice adéquat.

```plaintext
                         +-------------------------+
                         |      API Gateway        |
                         |   (Express, Port 5000)  |
                         +-----------+-------------+
                                     |
      +------+-----------+-----------+-----------+---------+
      |      |           |           |           |         |
      v      v           v           v           v         v
+---------+  +---------+   +--------------------+  +-------+  +----------+
| Auth    |  | Chat    |   | Private Message    |  | Admin |  | Channel  |
| Service |  | Service |   | Service (5002)     |  |Service|  | Service  |
| (3001)  |  | (3002)  |   | - Sécurité         |  | (3003)|  | (3004)   |
|         |  |         |   |   (RSA, cryptoUtils)|         |  |          |
+---------+  +---------+   +--------------------+  +-------+  +----------+
                     \                    |
                      \                   |
                       \                  v
                        \       +---------------------+
                         \      |   Base de Données   |
                          \     |  (MySQL/PostgreSQL) |
                           \    +---------------------+
                            \
                             +----------------------+
                             |      Fichiers        |
                             | (upload/ & uploads/)  |
                             +----------------------+
> Remarques : > - L’API Gateway redirige les requêtes vers les différents microservices via http-proxy-middleware. > - Les fichiers uploadés sont stockés dans le répertoire upload et sont accessibles via l’API Gateway. > - Les services communiquent via des API REST, et Socket.io permet la mise à jour en temps réel des messages.

Fonctionnalités
Discussions Publiques :

Participez à des conversations dans différents channels.

Channels créés et gérés par les administrateurs.

Possibilité de poster des fichiers (images, documents, etc.).

Discussions Privées :

Échange de messages privés entre utilisateurs.

Les messages texte sont cryptés via RSA avant stockage et décryptés à la lecture.

Les fichiers ne sont pas cryptés (pour éviter les problèmes liés aux grandes tailles).

Gestion Administratif :

Inscription, Connexion et gestion des utilisateurs (via le Auth Service et Admin Service).

Gestion des channels (création, jonction, et suppression).

Microservices
Auth Service (Port 3001)
Gère l’inscription, la connexion et l’authentification des utilisateurs.

Chat Service (Port 3002)
Gère le chat public en temps réel via Socket.io..

Private Message Service (Port 5002)
Gère les échanges de messages privés et le transfert de fichiers. Sécurité : Les messages texte sont cryptés grâce au module cryptoUtils (RSA).

Admin Service (Port 3003)
Fournit des endpoints pour la gestion des utilisateurs et des opérations administratives.

Channel Service (Port 3004)
Gère la création, la jonction et la suppression de channels.

Endpoints Clés
Auth Service
POST /api/auth/login

POST /api/auth/register

Chat Service (Public)
GET /api/chat/messages/:channelId

POST /api/chat/send

Private Message Service
POST /api/private-messages/send

GET /api/private-messages/:roomId Récupère les messages d'une conversation spécifique

GET /api/private-messages/conversations Récupère toutes les conversations privées de l'utilisateur

PUT /api/private-messages/update/:messageId

DELETE /api/private-messages/delete/:messageId

POST /api/private-messages/send-file

Admin Service
GET /api/admin/users

DELETE /api/admin/user/:userId

Channel Service
GET /api/channels/all

POST /api/channels/join

POST /api/channels/create

DELETE /api/channels/channel/:channelId

Fichiers Statique
Accessible via : http://localhost:5000/upload/{fileName}

Technologies Utilisées
Backend :

Node.js, Express

Socket.io

http-proxy-middleware (API Gateway)

RSA & Crypto avec cryptoUtils

mime-types

Frontend :

React, React Router, Socket.io Client

Base de Données :

MySQL ou PostgreSQL

Sécurité :

JWT, chiffrement RSA

Installation et Déploiement
Prérequis
Node.js (v14+)

SGBD (MySQL ou PostgreSQL)

npm (ou yarn)

Installation
Cloner le Repository :

bash
git clone https://votre-repository-url.git
cd custom_chat
Installer les Dépendances pour Chaque Microservice :

Par exemple, pour le Auth Service :

bash
cd auth-service
npm install
Répétez pour les autres services : chat-service, private-message-service, admin-service, channel-service.

Configuration :

Créez un fichier .env dans chaque service avec les variables nécessaires (PORT, URL_DB, clés RSA, etc.).

Configurez les chemins d’accès aux clés RSA pour le service Private Message dans le fichier cryptoUtils.js (dossier security).

Lancement
Individuellement : Lancez chaque microservice en utilisant un script (ex. : npm start dans le dossier du service).

Via Docker (Optionnel) : Utilisez Docker Compose pour orchestrer l’ensemble des services. Un fichier docker-compose.yml peut être fourni pour simplifier le déploiement.

API Gateway : Démarrez l’API Gateway sur le port 5000. Celle-ci redirigera les requêtes vers les microservices.

Front-End : Dans le dossier du front-end, installez les dépendances et lancez l'application React :

bash
npm install
npm start
Sécurité – Cryptage des Messages Privés
Le service Private Message sécurise les échanges privés grâce au chiffrement RSA :

Avant stockage : Le contenu des messages privés (texte) est encrypté avec RSA via les fonctions définies dans security/cryptoUtils.js.

À la lecture : Lorsque les messages sont récupérés, ils sont décryptés pour être affichés en clair dans l'application.

Fichiers : Les fichiers (images, documents) ne sont pas chiffrés afin de conserver des performances optimales et éviter les problèmes de taille.

Licence
Ce projet est sous licence MIT.

---