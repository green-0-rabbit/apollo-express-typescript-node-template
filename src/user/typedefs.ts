import { gql } from 'apollo-server-express';

const typedefs = gql`
  type User {
    name: String!
    age: Int
    city: String!
  }

  type Query {
    getUser(name: String!): User
    getUsers: [User]!
  }

  type Mutation {
    addUser(name: String!, age: Int!, city: String!): User!
    updateUser(name: String!, age: Int!, city: String!): User!
    deleteUser(name: String!): User!
  }
`;

export default typedefs;