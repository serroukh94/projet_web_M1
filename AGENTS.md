\=== Page 1 ===
Projet web
Nest.js - GraphQL - RabbitMQ
Jérôme Commaret - Efrei - Juin 2025

\=== Page 2 ===
Votre intervenant
15 ans d’expérience dans le digital
• 8 ans en gestion de projet
• 7 ans en développement web
Dans des grands groupes (Coca-Cola, GDF-SUEZ, Groupe Publicis), start-ups
(LeLynx.fr), ou ESNs (SQLI, Digitas…)

Contributeur sur Void, un « Cursor Opensource » afin d’y ajouter Mistral.AI

\=== Page 3 ===
Le projet
Une application de messagerie type « Messenger » de Facebook
• Création de profil utilisateur.
• Liste d’utilisateurs (tout les profils crées).
• Liste de conversations.
• Détails de Conversations.

\=== Page 4 ===
Barême
• 8 points sur la présentation finale (slides, expression orale, explications)
• 12 points sur l’application (fonctionnelle, look and feel, et bonus)

Slides Expression Explication Fonctionnelle Look And feel Bonus

Présentation 4 2 2

Application 4 4 4

\=== Page 5 ===
C’est parti !

\=== Page 6 ===
Faisabilité
Pourquoi Nest.js ?
• Structure et Organisation : Nest.js impose une architecture modulaire et organisée (basée sur les modules, contrôleurs, services), ce qui est crucial pour la maintenance et l'évolution d'un projet complexe.
• TypeScript : L'utilisation de TypeScript par défaut offre un typage fort, réduisant les erreurs à l'exécution et améliorant l'autocomplétion et la compréhension du code.
• Écosystème : Il intègre nativement des solutions pour la plupart des besoins d'un backend : ORM (TypeORM, Prisma), authentification (Passport), et bien sûr, GraphQL.

Pourquoi GraphQL ?
• Efficacité des Données : Contrairement à REST, GraphQL permet au client de demander précisément les données dont il a besoin, évitant le "sur-chargement" (over-fetching) ou le "sous-chargement" (under-fetching). C'est idéal pour une application de messagerie où différentes vues (liste de conversations, vue d'une conversation) nécessitent des données différentes.
• Endpoint Unique : Toutes les requêtes passent par un seul point d'entrée, ce qui simplifie la gestion de l'API.
• Temps Réel avec les Subscriptions : GraphQL inclut nativement un système de "Subscriptions" basé sur les WebSockets, parfait pour pousser les nouveaux messages aux clients en temps réel.

Pourquoi le Message Queuing (MQ) ?
• Découplage : Le service qui reçoit les messages (l'API) est découplé du service qui les traite et les distribue. Si le service de distribution tombe en panne, les messages ne sont pas perdus ; ils restent dans la file d'attente.
• Scalabilité et Résilience : On peut facilement ajouter plus de "workers" pour traiter les messages en cas de forte charge. Le système garantit que les messages seront livrés même en cas de pic de trafic ou de panne temporaire.
• Asynchronisme : Envoyer un message n'a pas besoin de bloquer la requête de l'utilisateur. L'API peut accepter le message, le mettre dans la file d'attente en quelques millisecondes et répondre immédiatement à l'utilisateur

\=== Page 7 ===
Configuration (1/2)

* Déterminez vos groupes
* Création de Github et envoi à l’adresse [jerome.commaret@intervenants.efrei.net](mailto:jerome.commaret@intervenants.efrei.net)

\=== Page 8 ===
Configuration (2/2)

1. Installer Node.js :  [https://nodejs.org/en/download](https://nodejs.org/en/download)
2. Nest.js
   puis
3. RabbitMQ  (dans un fichier docker-compose.yml à la racine du projet)

puis
4.Dépendances GraphQL

\[Image transcription]

Etape 1: Exemple docker-compose.yml (approximation OCR)

```yaml
db:
  image: postgres:14
  restart: always
  environment:
    POSTGRES_USER: postgres
    POSTGRES_PASSWORD: password
  volumes:
    - ./data:/var/lib/postgresql/data
rabbitmq:
  image: rabbitmq:3-management
  ports:
    - "5672:5672"
    - "15672:15672"
```

\=== Page 9 ===
Architecture

1. Client (Web/Mobile) :
   • Interagit avec l'API Nest.js via des requêtes et mutations GraphQL. Écoute les nouveaux messages via une souscription GraphQL.
2. API Nest.js / GraphQL :
   • Expose les Queries (ex: getConversations), Mutations (ex: sendMessage) et Subscriptions (ex: onMessageSent).
   • Quand une mutation sendMessage est reçue, elle ne distribue pas le message directement. Elle le publie dans une file d'attente RabbitMQ.
3. Worker/Listener Nest.js (Microservice)
   • Ce service écoute les messages provenant de la file d'attente RabbitMQ.
   • Lorsqu'il reçoit un message, il le sauvegarde en base de données, puis le publie via le PubSub de GraphQL pour que les clients abonnés le reçoivent

\=== Page 10 ===
Schéma GraphQL (version simplifiée)
\[Image transcription]

```graphql
type User {
  id: ID!
  username: String!
  avatar: String
}

type Message {
  id: ID!
  content: String!
  author: User!
  createdAt: DateTime!
}

type Conversation {
  id: ID!
  participants: [User!]!
  messages: [Message!]!
}

type Query {
  conversations(userId: ID!): [Conversation!]!
  conversation(id: ID!): Conversation
}

type Mutation {
  sendMessage(conversationId: ID!, content: String!): Message!
}

type Subscription {
  messageSent(conversationId: ID!): Message!
}
```

\=== Page 11 ===
API : Nest.js - GraphQL (Résolveur pour les messages - simplifié)
\[Image transcription]

```ts
@Resolver(() => Message)
export class MessageResolver {
  constructor(private readonly messageService: MessageService) {}

  @Mutation(() => Message)
  async sendMessage(
    @Args('conversationId') conversationId: string,
    @Args('content') content: string,
    @CurrentUser() user: User,
  ) {
    return this.messageService.sendMessage(conversationId, content, user.id);
  }

  @Subscription(() => Message, {
    filter: (payload, variables) => payload.conversationId === variables.conversationId,
  })
  messageSent(@Args('conversationId') conversationId: string) {
    return pubSub.asyncIterator('messageSent');
  }
}
```

\=== Page 12 ===
Intégration RabbitMQ
Etape 1: Configurer le client (src/rabbitmq/rabbitmq.module.ts)
\[Image transcription]

```ts
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RabbitMQService } from './rabbitmq.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'CHAT_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://user:password@localhost:5672'],
          queue: 'chat_queue',
        },
      },
    ]),
  ],
  providers: [RabbitMQService],
  exports: [RabbitMQService],
})
export class RabbitMQModule {}
```

\=== Page 13 ===
Intégration RabbitMQ
Etape 1 (bis): Configurer le client dans un module (src/rabbitmq/rabbitmq.module.ts)
\[Image transcription]

```ts
import { Injectable } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';

@Injectable()
export class RabbitMQService {
  private client: ClientProxy;

  constructor() {
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://user:password@localhost:5672'],
        queue: 'chat_queue',
      },
    });
  }

  async emit(pattern: string, data: any) {
    this.client.emit(pattern, data);
  }
}
```

\=== Page 14 ===
Intégration RabbitMQ
Etape 2: Créer le service (src/rabbitmq/rabbitmq.service.ts)
\[Image transcription]

```ts
@Injectable()
export class MessageService {
  constructor(private readonly rabbitService: RabbitMQService) {}

  async sendMessage(payload: CreateMessageDto) {
    await this.rabbitService.emit('message_created', payload);
    return payload;
  }
}
```

\=== Page 15 ===
Intégration RabbitMQ
Etape 3: Créer le resolver (src/message/message.resolver.ts)
\[Image transcription]

```ts
@Resolver(() => Message)
export class MessageResolver {
  constructor(private readonly messageService: MessageService) {}

  @Mutation(() => Message)
  async sendMessage(@Args('dto') dto: CreateMessageDto) {
    return this.messageService.sendMessage(dto);
  }
}
```

\=== Page 16 ===
Intégration RabbitMQ
Etape 3: Créer le listener (src/message/message.controller.ts)
\[Image transcription]

```ts
@Controller()
export class MessageController {
  constructor(private readonly pubSub: PubSubService) {}

  @EventPattern('message_created')
  async handleNewMessage(@Payload() data: any, @Ctx() context: RmqContext) {
    console.log('New message', data);
    this.pubSub.publish('messageSent', { ...data });

    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    channel.ack(originalMsg);
  }
}
```

\=== Page 17 ===
CI/CD
Etape 1 - Dockerfile à la racine
\[Image transcription]

```dockerfile
# Stage 1
FROM node:20 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build

# Stage 2
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY package*.json ./
RUN npm ci --production --legacy-peer-deps
CMD ["node", "dist/main.js"]
```

\=== Page 18 ===
CI/CD
Etape 2 - Github Action
\[Image transcription]

```yaml
name: CI
on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci --legacy-peer-deps
      - run: npm run test
      - run: docker build -t mychatapp .
      - uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USER }}
          password: ${{ secrets.DOCKER_PASS }}
      - run: docker push mychatapp
```

\=== Page 19 ===
Tests
Unitaire :
Quoi tester ? Des fonctions pures, des méthodes de service.

\=== Page 20 ===
Tests
Intégration:
Quoi tester ? Tester qu'une mutation sendMessage appelle bien le service RabbitMQService

\=== Page 21 ===
Tests
End to end :
Postman : Créez une collection de requêtes pour tester votre API GraphQL. Vous pouvez écrire des scripts de test dans Postman pour valider les réponses.
Puppeteer : Simulez un utilisateur réel.

Artillery :
Quoi tester ?

* Temps de réponse de la mutation sendMessage.,
* Latence de réception du message via la souscription.
* Utilisation CPU et mémoire du serveur API et de RabbitMQ.

\=== Page 22 ===
Tests de performances
\[Image transcription]
(Exemple de rapport Artillery JSON)

```json
{
  "metrics": {
    "latency": {
      "min": 12,
      "max": 350,
      "median": 45,
      "p95": 210
    },
    "requests": 5000,
    "throughput": 100
  }
}
```

\=== Page 23 ===
Optimisations et Améliorations
Analysez les résultats des tests de performance pour trouver les goulots d’étranglement.
• Problème N+1 dans GraphQL :
◦ Symptôme : Si vous demandez une conversation avec 100 messages, et pour chaque message, son auteur, vous pourriez faire 101 requêtes à la base de données.
◦ Solution : Utilisez DataLoader. C'est un utilitaire qui regroupe les requêtes identiques qui se produisent dans un même "tick" de l'event loop en une seule requête (ex: SELECT \* FROM users WHERE id IN (1, 2, 3, ...)).
• Base de Données Lente :
◦ Solution : Assurez-vous que vos colonnes utilisées pour les recherches (ex: conversationId) ont des index. Utilisez un outil d'analyse de requêtes (ex: EXPLAIN ANALYZE en PostgreSQL).
• Scalabilité de RabbitMQ :
◦ Solution : Si un seul nœud RabbitMQ ne suffit pas, vous pouvez créer un cluster RabbitMQ pour répartir la charge.
• Mise en Cache :
◦ Solution : Utilisez une solution comme Redis pour mettre en cache les données fréquemment accédées (profils utilisateur, conversations récentes) afin de réduire la charge sur la base de données principale.

\=== Page 24 ===
Documentation
Un projet n'est complet que lorsqu'il est bien documenté.
• README.md : C'est la porte d'entrée de votre projet. Il doit contenir :
◦ Une description claire du projet.
◦ La liste des fonctionnalités clés.
◦ Les technologies utilisées.
◦ Des instructions claires pour l'installation et le lancement :

1. git clone ...
2. npm install
3. cp .env.example .env (et expliquer les variables d'environnement)
4. docker-compose up -d
5. npm run start\:dev

• Documentation de l'API :
◦ GraphQL est auto-documenté grâce à l'introspection, mais vous pouvez utiliser des outils comme Compodoc pour générer une documentation web complète de votre code Nest.js.
◦ Fournissez des exemples de requêtes pour les mutations et les souscriptions principales.
