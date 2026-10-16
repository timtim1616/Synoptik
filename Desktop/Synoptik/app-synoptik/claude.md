Markdown# Instructions projet & Contexte technique — SynopTik

Ce fichier fournit tout le contexte nécessaire à un modèle IA ou un nouveau développeur intervenant sur la base de code de SynopTik.

---

## 1. Vue d'ensemble du projet

**SynopTik** est une application web conçue pour l'élaboration et la documentation de synoptiques audiovisuels et réseau professionnels (régies de direct, plateaux de tournage, régies de diffusion, événements d'entreprise).

### Fonctionnalités maîtresses
- **Éditeur nodal visuel** : Manipulation d'équipements modulaires (caméras, mélangeurs vidéo, switchs réseau, ordinateurs de diffusion, moniteurs) et de blocs de notes mémo.
- **Routage de câbles typé** : Connexions orientées ou bidirectionnelles basées sur les connecteurs réels (SDI, HDMI, NDI, Dante, USB-C, Fibre optique, XLR, 230V). Détection visuelle des incompatibilités de signal.
- **Bilan d'énergie & BOM matériel** : Synthèse automatique des équipements présents, calcul dynamique de la puissance électrique totale consommée (en Watts), et bilan des métrages de câbles.
- **Export professionnel** : Export PNG/PDF haute fidélité (format A4 paysage) avec cartouche normalisé (indice de version, date, technicien référent, lieu et légende des signaux).
- **Fiches équipements enrichies sans surcharge BDD** : Affichage dynamique d'une photographie commerciale de l'appareil dans l'inspecteur via un hook serveur, sans stockage d'images sur la base de données.

---

## 2. Architecture système & Déploiement

Le projet fonctionne selon une séparation stricte entre une Single Page Application React et un backend PocketBase auto-hébergé sur un serveur VPS dédié.

```text
[Navigateur Client]
   │
   ├── Frontend React / ReactFlow (SPA)
   │        │
   │        └── Requêtes CRUD + GET /api/product-search?q=...
   │                 │
   ▼                 ▼
[Nginx Reverse-Proxy (Port 443 SSL)]
   ├── synoptik.timeobinda.fr/           ──► Dossier /var/www/synoptik/
   └── synoptik.timeobinda.fr/api/...    ──► Proxy_pass [http://127.0.0.1:8091](http://127.0.0.1:8091)
                                                    │
                                                    ▼
                                          [PocketBase (Go)]
                                            └─ pb_hooks/product_search.pb.js
                                                    │
                                                    ▼ (Requête HTTP sortante)
                                          [CDN Web / Bing Images]
Détails du VPS & InfrastructureIP VPS : 185.157.245.117Utilisateur système : rootDomaine public : synoptik.timeobinda.fr   Dossier web racine (Frontend compilé) : /var/www/synoptik/Dossier application PocketBase : /var/www/pocketbase-synoptik/Service systemd du backend : pocketbase-synoptik.serviceLigne d'exécution du backend :Bash/var/www/pocketbase-synoptik/pocketbase serve --http=127.0.0.1:8091
Configuration reverse proxy (Nginx) :
Nginx gère les certificats SSL Let's Encrypt pour synoptik.timeobinda.fr, sert les fichiers statiques de /var/www/synoptik/, et redirige tout le trafic /api/ vers le port interne 8091.   3. Frontend (React + Vite)Dépendances clésReact 18+ / Vite@xyflow/react (ReactFlow) : Moteur de rendu du canvas nodulaire.lucide-react : Bibliothèque d'icônes vectorielles.html-to-image & jspdf : Rendu vectoriel et matriciel pour la création des PDF vectoriels et PNG haute définition.pocketbase : SDK client JavaScript pour l'authentification et les souscriptions temps réel.Paramétrage de ReactFlow (src/App.jsx)Le canvas est spécifiquement configuré pour supporter l'ergonomie trackpad et souris standard :panOnScroll={true} et panOnScrollMode="free" : Défilement bidirectionnel fluide à 2 doigts sur trackpad.zoomOnPinch={true} : Zoom par pincement au trackpad.panOnDrag={[1]} : Translation du canevas maintenue au clic molette de souris.selectionOnDrag={true} et selectionMode="partial" : Le clic gauche sans modifier de nœud permet de tracer un cadre de sélection rectangulaire pour attraper plusieurs éléments.Alignement multi-sélection : Dès que deux nœuds ou plus sont sélectionnés, un bandeau d'outils flottant s'affiche en haut pour aligner (gauche, droite, haut, centrage horizontal/vertical, distribution régulière).Répertoire des composantssrc/components/DeviceNode.jsx : Nœud ReactFlow représentant un appareil audiovisuel. Affiche le rôle, l'IP, les entrées sur la gauche, les sorties sur la droite, et les ports bidirectionnels (réseau, USB-C) sur la face inférieure.src/components/AnnotationNode.jsx : Nœuds mémo légers redimensionnables avec sélecteur de couleurs prédéfinies.src/components/CustomEdge.jsx : Ligne de connexion personnalisée. Affiche la couleur liée au protocole de signal et supporte le calcul de longueur de câble.src/components/Dashboard.jsx : Page d'accueil listant les projets de l'utilisateur, permettant la duplication, suppression et création de nouveaux synoptiques.src/components/Modals.jsx : Fenêtres modales gérant les métadonnées du projet, les paramètres d'export (thème clair/sombre, cartouche), et la nomenclature récapitulative du matériel.src/services/pocketbase.js : Initialisation du singleton SDK PocketBase.src/services/productSearch.js : Service interrogeant l'API interne PocketBase /api/product-search avec mise en cache locale par session (Map) pour éviter les requêtes redondantes.4. Backend & Hook PocketBase (pb_hooks)Philosophie de stockagePour maintenir la base de données pb_data/data.db à une taille minimale et éviter de gérer des centaines de mégaoctets de pièces jointes médias, aucune image n'est enregistrée en base.Le Hook de recherche produitLe fichier /var/www/pocketbase-synoptik/pb_hooks/product_search.pb.js étend le moteur Go de PocketBase :Point de terminaison exposé : GET /api/product-search?q={terme}   Fonctionnement :Reçoit la marque et le modèle transmis par le front-end.Émet une requête HTTP sortante côté serveur vers Bing Images en injectant des qualificateurs métiers stricts (official, filtres photo).Extrait l'URL directe d'une miniature hébergée sur CDN (tse*.mm.bing.net ou CDN revendeur tel qu'Idealo).Applique une liste noire pour exclure automatiquement les résultats non pertinents (Pinterest / pinimg.com, agences immobilières, vêtements, blogs).Retourne un JSON léger contenant l'URL distante au navigateur client.5. Commandes de travail & Recettes de déploiementDéveloppement localBash# Installation des dépendances
npm install

# Démarrer le serveur de développement local
npm run dev

# Vérifier la compilation avant envoi
npm run build
Déploiement en productionLe déploiement du front-end est automatisé via la commande suivante :Bashnpm run deploy
Cette commande exécute vite build puis téléverse le dossier généré dist/ en SCP sur le VPS dans /var/www/synoptik/.Commandes utiles sur le serveur VPSConnexion :Bashssh root@185.157.245.117
Gérer le service PocketBase :Bash# Vérifier l'état du service
systemctl status pocketbase-synoptik

# Redémarrer le service (obligatoire après modification d'un script dans pb_hooks/)
systemctl restart pocketbase-synoptik

# Voir les journaux en direct (logs d'exécution et erreurs JavaScript de pb_hooks)
journalctl -u pocketbase-synoptik -f
Modifier le hook de recherche d'image :Bashnano /var/www/pocketbase-synoptik/pb_hooks/product_search.pb.js