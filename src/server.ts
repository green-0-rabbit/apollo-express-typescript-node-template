import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { makeExecutableSchema } from "@graphql-tools/schema";
import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import { applyMiddleware } from "graphql-middleware";
import http from "http";
import { authZMiddleware } from "./middlewares";
import resolvers from "./_resolvers";
import typeDefs from "./_typedefs";

const app = express();
const httpServer = http.createServer(app);

app.use(express.json());

const schema = makeExecutableSchema({ resolvers, typeDefs });
const schemaWithMdl = applyMiddleware(schema, authZMiddleware);

export const server: ApolloServer = new ApolloServer({
  schema: schemaWithMdl,
  introspection: true,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

async function start() {
  await server.start();

  app.use(cors(), bodyParser.json(), expressMiddleware(server));
  const PORT = process.env.PORT || 4000;

  await new Promise((resolve) =>
    httpServer.listen({ port: PORT }, resolve as any)
  );
  console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
}

start();
