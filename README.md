````markdown
# 💬 Nest GraphQL Chat Backend

Projet M1 – EFREI : micro‑service de messagerie en temps réel basé sur NestJS, GraphQL, RabbitMQ, MongoDB et REACT.

---

## 🗂️ Tech Stack

| Couche       | Outil                           | Rôle                                                      |
|--------------|---------------------------------|-----------------------------------------------------------|
| API HTTP     | NestJS 11 + @nestjs/graphql     | Schéma GraphQL, mutations, queries et subscriptions       |
| Broker       | RabbitMQ 3                      | File `chat_queue` pour dispatcher les messages           |
| Persistence  | MongoDB 7 + Mongoose 8          | Collections `users`, `messages`, `conversations`          |
| Temps réel   | graphql-subscriptions / PubSub  | Envoi de `messageAdded` aux clients via WebSocket         |
| Containers   | Docker / Docker Compose         | Instanciation locale de RabbitMQ et MongoDB               |
| Front-end    | React (Vite)                    | Application client web                                    |
| Docker / Docker Compose         | Instanciation locale de RabbitMQ et MongoDB               |

---

## 🚀 Mise en route (dev)

1. **Cloner le projet**
   ```bash
   git clone https://github.com/serroukh94/projet_web_M1.git
   cd ProjetWEB/backend
````

### ⚙️ Variables d'environnement

Créer un fichier `.env` à la racine du backend :

```env
MONGO_URI=mongodb://localhost:27017/chatdb
RABBITMQ_URL=amqp://user:password@localhost:5672
RABBITMQ_QUEUE=chat_queue
```

---

2. **Installer les dépendances**

   ```bash
   npm install
   ```

3. **Démarrer les services externes**

   ```bash
   # Lancement de MongoDB, Mongo Express et RabbitMQ
   docker compose up -d
   ```

4. **Compiler et démarrer l'API**

   ```bash
   npm run build && npm start
   # GraphQL Playground: http://localhost:3000/graphql
   ```

5. **Démarrer le worker RabbitMQ → MongoDB**

   ```bash
   npm run start:worker
   ```

> **Note** : pour lancer le front-end, place-toi dans `ProjetWEB/front` puis exécute :
>
> ```bash
> npm i
> npm run dev
> ```

## 📝 Exemples de requêtes (GraphQL)

### Créer un utilisateur

```graphql
mutation {
  createUser(username: "Alice") {
    id
    username
    createdAt
  }
}
```

### Envoyer un message (mode optimiste)

```graphql
mutation Send($cid: ID!, $content: String!) {
  sendMessage(conversationId: $cid, content: $content) {
    id
    content
    author { username }
    createdAt
  }
}
```

**Variables** :

```json
{ "cid": "64b9454c1d7f9320fcbe196a", "content": "Hello Mongo!" }
```

### Souscription aux nouveaux messages

```graphql
subscription OnMsg($cid: ID!) {
  messageAdded(conversationId: $cid) {
    id
    content
    author { username }
    createdAt
  }
}
```

---

## 📁 Structure du dossier `backend`

```plaintext
src/
├── schemas/            # Modèles Mongoose + définitions GraphQL
├── chat.resolver.ts    # Queries + createUser
├── message.resolver.ts # sendMessage + subscription
├── message.service.ts  # Persistance côté worker
├── rabbitmq/           # Module et client RabbitMQ
├── worker.ts           # Bootstrap du micro-service RMQ
└── ...
```

---

## 🐇 Dashboard RabbitMQ

* URL : [http://localhost:15672](http://localhost:15672)
* Auth : Voir le docker compose
* File `chat_queue` : voir les messages en attente quand le worker est arrêté.

---

## 🍃 MongoDB CLI rapide

```bash
mongosh "mongodb://localhost:27017/chatdb" --eval "db.users.find().pretty()"
```

---

## ⚙️ Scripts npm utiles

| Commande               | Description                                |
| ---------------------- | ------------------------------------------ |
| `npm start`            | Démarre l'API compilée (`dist/main.js`)    |
| `npm run start:dev`    | API en hot-reload (avec ts-node-dev)       |
| `npm run start:worker` | Lance le worker (`dist/worker.js`)         |
| `npm run build`        | Compile TypeScript → `dist/`               |
| `npm run dev`          | (Front) Démarrage du front-end en dev mode |

```markdown
```
