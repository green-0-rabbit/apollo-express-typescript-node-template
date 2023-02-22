import { Kind, TypeDefinitionNode, TypeNode } from "graphql";

interface IField {
    kind: string;
    name: string;
    type: string;
}

interface SimpleTypeDefinitionNode {
  name: string;
  fields: IField[];
}

const getFieldTypeString = (type: TypeNode): string => {
  switch (type.kind) {
    case Kind.NAMED_TYPE:
      return type.name.value;
    case Kind.LIST_TYPE:
      return `[${getFieldTypeString(type.type)}]`;
    case Kind.NON_NULL_TYPE:
      return `${getFieldTypeString(type.type)}!`;
    default:
      throw new Error(`Unsupported field type: ${(type as any).kind}`);
  }
};

export const simplifyObjectTypeDef = (
  node: TypeDefinitionNode
): SimpleTypeDefinitionNode | undefined => {
  if (node.kind !== Kind.OBJECT_TYPE_DEFINITION) {
    return undefined;
  }

  const name = node.name.value;
  if (!node.fields) throw new Error(`fields is empty`);
  const fields = node.fields.map((field) => {
    const fieldName = field.name.value;
    const fieldType = getFieldTypeString(field.type);
    return {
      kind: "FIELD_DEFINITION",
      name: fieldName,
      type: fieldType,
    };
  });

  return {
    name,
    fields,
  };
};
