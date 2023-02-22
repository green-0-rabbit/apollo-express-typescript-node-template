/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { GraphQLResolveInfo } from 'graphql';
import graphqFields from 'graphql-fields';

export function fieldMapToDot(
  fieldMap: any,
  dots: string[] = [],
  parent: string[] = [],
) {
  for (const key of Object.keys(fieldMap)) {
    dots = [...dots, [...parent, key].join('.')];
    if (fieldMap[key]) {
      dots = fieldMapToDot(fieldMap[key], dots, [...parent, key]);
    }
  }
  return dots;
}

export const fieldsToRelations = (
  info: GraphQLResolveInfo,
  options: { depth?: number; root?: string; excludeFields?: string[] } = {
    depth: undefined,
    root: '',
    excludeFields: [],
  },
) => {
  const paths: string[][] = [];

  const nested = (
    field: any,
    key: string = undefined as any,
    deep = 0,
    parent: string[] = [],
  ) => {
    if (Object.values(field).length === 0) {
      return;
    }

    if (deep > 0 || !!options.root) {
      parent.push(key);
      if (
        parent.slice(!options.root ? 0 : options.root?.split('.').length)
          .length > 0 &&
        parent
          .slice(0, !options.root ? 0 : options.root?.split('.').length)
          .toString() ===
          (!options.root ? '' : options.root?.split('.').toString())
      ) {
        const path = parent.slice(
          !options.root ? 0 : options.root?.split('.').length,
        );
        paths.push(path);
      }
    }

    Object.keys(field).forEach((key: any) => {
      if (
        Object.values(field[key]).length > 0 && !!options.depth
          ? deep < options.depth
          : true
      ) {
        nested(field[key], key, deep + 1, [...parent]);
      }
    });
  };

  const fieldName = info.fieldName;
  const value = !options.root
    ? graphqFields(info as any, {}, { excludedFields: options.excludeFields })
    : options.root
        .split('.')
        .reduce(
          (p, prop) => p[prop],
          graphqFields(info as any, {}, { excludedFields: options.excludeFields }),
        );
  // console.log(value);

  const newValue:Record<string,any> = {};
  newValue[fieldName] = value;
  console.log(newValue);
  const userPaths = fieldMapToDot(newValue);
  // nested(newValue, options.root ? options.root.split('.').shift() : undefined);
  console.log(userPaths);

  // return flattenObj(value);

  return paths.map((list: string[]) => list.join('.'));
};

type Entry = { key: string; value: any; optional: boolean };
type Explode<T> = _Explode<T extends readonly any[] ? { '0': T[number] } : T>;

// eslint-disable-next-line @typescript-eslint/naming-convention
type _Explode<T> = T extends object
  ? {
      [K in keyof T]-?: K extends string
        ? Explode<T[K]> extends infer E
          ? E extends Entry
            ? {
                key: `${K}${E['key'] extends '' ? '' : '.'}${E['key']}`;
                value: E['value'];
                optional: E['key'] extends ''
                  ? {} extends Pick<T, K>
                    ? true
                    : false
                  : E['optional'];
              }
            : never
          : never
        : never;
    }[keyof T]
  : { key: ''; value: T; optional: false };

type Collapse<T extends Entry> = {
  [E in Extract<T, { optional: false }> as E['key']]: E['value'];
} & Partial<{
  [E in Extract<T, { optional: true }> as E['key']]: E['value'];
}> extends infer O
  ? { [K in keyof O]: O[K] }
  : never;

export type Flatten<T> = Collapse<Explode<T>>;

export const flattenObj = <T extends Record<string, any>>(
  obj: T,
  parent?: string,
  res = {} as any,
  index = 0,
): Flatten<T> => {
  // eslint-disable-next-line no-param-reassign
  index += 1;
  if (index > 5) {
    // eslint-disable-next-line @typescript-eslint/no-throw-literal
    throw 'object is too deep, maximum authorized level is 6';
  }
  // eslint-disable-next-line no-restricted-syntax
  for (const key of Object.keys(obj)) {
    const propName = parent ? `${parent}.${key}` : key;
    if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
      flattenObj(obj[key], propName, res, index);
    } else {
      res[propName] = obj[key];
    }
  }
  return res;
};