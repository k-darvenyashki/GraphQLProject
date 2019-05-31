const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');

const Game = require('./models/game');

const app = express();



app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(bodyParser.json());

app.use(
  '/graphql',
  graphqlHttp({
    schema: buildSchema(`
        type Game {
          _id: ID!
          title: String!
          description: String!
          price: Float!
          date: String!
        }

        input GameInput {
          title: String!
          description: String!
          price: Float!
          date: String!
        }

        input UpdateGameInput {
          id: String!
          title: String!
          description: String!
          price: Float!
        }

        type RootQuery {
            games: [Game!]!
        }

        type RootMutation {
            addGame(gameInput: GameInput): Game
            removeGame(gameId: ID!): Game
            updateGame(updateGameInput: UpdateGameInput): Game
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
      games: () => {
        return Game.find()
          .then(games => {
            return games.map(game => {
              return { ...game._doc, _id: game.id };
            });
          })
          .catch(err => {
            throw err;
          });
      },
      addGame: args => {
        const game = new Game({
          title: args.gameInput.title,
          description: args.gameInput.description,
          price: +args.gameInput.price,
          date: new Date(args.gameInput.date)
        });
        return game
          .save()
          .then(result => {
            console.log(result);
            return { ...result._doc, _id: result._doc._id.toString() };
          })
          .catch(err => {
            console.log(err);
            throw err;
          });
      },
      removeGame: args => {
        try {
          return Game.deleteOne({ _id: args.gameId });
        } catch (err) {
          throw err;
        }
      },
      updateGame: args => {
        try {
          return Game.findOneAndUpdate({_id: args.updateGameInput.id}, {title: args.updateGameInput.title, description: args.updateGameInput.description, price: args.updateGameInput.price});
        } catch (err) {
          throw err;
        }
      }
    },
    graphiql: true
  })
);

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${
      process.env.MONGO_PASSWORD
    }@mycluster-3irvu.mongodb.net/${process.env.MONGO_DB}?retryWrites=true`
  )
  .then(() => {
    app.listen(8000);
  })
  .catch(err => {
    console.log(err);
  });
