

interface User {
    name: string;
    age: number;
    city: string;
  }

let users:User[] = [
    { name: 'John Doe', age: 31, city: 'New York' },
    { name: 'Jane Smith', age: 25, city: 'Los Angeles' },
  ];

const resolvers = {
    Query: {
        getUser: (_: any, args:User) => {
          return users.find(user => user.name === args.name);
        },
        getUsers: () => {
          return users;
        },
      },
      Mutation: {
        addUser: (_: any, args:User) => {
          const newUser = { name: args.name, age: args.age, city: args.city };
          users.push(newUser);
          return newUser;
        },
        updateUser: (_: any, args:User) => {
          const userIndex = users.findIndex(user => user.name === args.name);
          if (userIndex >= 0) {
            users[userIndex] = { name: args.name, age: args.age, city: args.city };
            return users[userIndex];
          } else {
            throw new Error('User not found.');
          }
        },
        deleteUser: (_: any, args:User) => {
          const userIndex = users.findIndex(user => user.name === args.name);
          if (userIndex >= 0) {
            const deletedUser = users[userIndex];
            users.splice(userIndex, 1);
            return deletedUser;
          } else {
            throw new Error('User not found.');
          }
        },
      },
};

export default resolvers;