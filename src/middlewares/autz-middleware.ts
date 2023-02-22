import {
    GraphQLResolveInfo,
    Kind,
    TypeDefinitionNode
} from "graphql";
import {
    IMiddlewareFunction,
    IMiddlewareResolver
} from "graphql-middleware/dist/types";
import { fieldsToRelations, simplifyObjectTypeDef } from "../utils";
import typeDefs from "../_typedefs";

export const authZMiddleware: IMiddlewareFunction = async (
  resolve: Parameters<IMiddlewareResolver<any, any, any>>[0],
  root: any,
  args: any,
  ctx: any,
  info: GraphQLResolveInfo
) => {
  // console.log("before", root);
  // Query | Mutation | Subscription | ObjectType ( User, Books ...)
  // const operationType = info.path.typename
  // Query | Mutation | Subscription | ObjectType ( User, Books ...) - most Reliable
  const parentType = info.parentType.name;
  //  ObjectType ( User, Books, String, Boolean ...) --- useful in order to check role
  const returnType = info.returnType.toString();
  //  ObjectType ( getUser, getUsers, addUser ...)
  const fieldName = info.fieldName;

  const definitions = typeDefs[0].definitions[0];
  const fields =
    definitions.kind === Kind.OBJECT_TYPE_DEFINITION
      ? definitions.fields![0]
      : [];

  if (parentType === "Query" || parentType === "Mutation") {
    console.log("before", {
      parentType,
      returnType: returnType.toString(),
      fieldName,
      definitions: JSON.stringify(
        simplifyObjectTypeDef(definitions as TypeDefinitionNode)
      ),
      fields,
    });
    console.log({ fieldPath: fieldsToRelations(info) });
    // Execute your query-level code here
  }

  const result = await resolve(root, args, ctx, info);
  //   console.log("after");
  return result;
};


