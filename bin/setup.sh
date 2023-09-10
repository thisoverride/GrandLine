#!/bin/bash

# Couleurs pour les messages
BLUE='\033[0;34m'
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Fonction pour demander et valider le nom du projet
ask_for_project_name() {
    while true; do
        read -p "Entrez le nom du projet: " project_name
        
        if [ -z "$project_name" ]; then
            echo "Le nom du projet ne peut pas être vide. Veuillez spécifier un nom."
        else
            # Valider le nom du projet en supprimant les caractères spéciaux et les espaces
            project_name=$(echo "$project_name" | tr -cd '[:alnum:]._-' | sed 's/^[-]*//;s/[-]*$//')

            if [ -z "$project_name" ]; then
                echo "Nom de projet invalide. Veuillez spécifier un nom valide."
            else
                # Ajouter le préfixe "svc." au nom du projet
                project_name="svc.$project_name"
                break
            fi
        fi
    done
}

# Fonction pour créer un répertoire s'il n'existe pas déjà
create_directory() {
    if [ ! -d "$1" ]; then
        mkdir -p "$1"
    fi
}
# Fonction pour afficher un message en jaune
print_warning() {
    echo -e "${YELLOW}$1${NC}"
}
# Demander et valider le nom du projet
ask_for_project_name

# Créer un répertoire avec le nom du projet
create_directory "$project_name"

# Naviguer dans le répertoire du projet
cd "$project_name" || exit

# Créer les répertoires src, build, et test s'ils n'existent pas déjà
create_directory src
create_directory build
create_directory tests/___unit___/
touch tests/___unit___/index.test.ts

# Créer un fichier Dockerfile s'il n'existe pas déjà
touch Dockerfile

cat <<EOL > package.json
{
  "name": "$project_name",
  "version": "1.0.0",
  "main": "main.js",
  "license": "MIT",
  "scripts": {
    "dev": "ts-node-dev src/main.ts",
    "prod": "node build/main.js",
    "build": "tsc"
  }
}

EOL
# Initialisez le projet avec yarn (acceptez les valeurs par défaut)
# yarn init -y

# Installez TypeScript, Express, Morgan, Jest et leurs types respectifs
yarn add --dev typescript @types/node @types/express @types/morgan jest
yarn add express morgan

# Installez ts-node dans les devDependencies
yarn add --dev ts-node-dev

# Exécutez la commande tsc --init pour créer un fichier tsconfig.json
npx tsc --init

# Créez un fichier "main.ts" dans le dossier "src" s'il n'existe pas déjà
echo "console.log('"$project_name" generated !');" > src/main.ts

echo "${BLUE} Pour lancer le projet en mode développement 🛠️ , utilisez la commande :${NC}"
echo "${GREEN} yarn dev${NC}"
echo "${BLUE} Pour lancer le projet en mode production 🚀, utilisez la commande :${NC}"
echo "${GREEN} yarn prod${NC}"
echo "${BLUE} Pour lancer les tests unitaires 🧪 sur le projet, utilisez la commande :${NC}"
echo "${GREEN} yarn test ${NC}"
echo "${BLUE} Pour vous complier le projet ⚙️ utilisez la commande :${NC}"
echo "${GREEN} yarn build ${NC}"
echo "${BLUE} Pour vous positionner dans le projet 📂 utilisez la commande :${NC}"
echo "${GREEN} cd $project_name ${NC}"

# echo "Script terminé. Le projet $project_name est initialisé, les dépendances sont installées, et la structure de dossiers pour les tests unitaires est prête."