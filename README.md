# zod-data-provider

A small TypeScript zod utility library for defining data provider interfaces with nice DX

## Installation

```
npm install zod-data-provider
```

## Example usage

Define a set of data methods, like so:

```typescript
const entityMethods = [
  dataMethodDefinition({
    methodName: "findEntityByName",
    input: z.string(),
    output: entitySchema,
    errors: z.enum(["EntityNotFound"]),
  }),
  dataMethodDefinition({
    methodName: "createEntity",
    input: z.object({ entityName: z.string() }),
    output: entitySchema,
    errors: z.object({
      reason: z.literal("EntityAlreadyExists"),
      existingEntity: entitySchema,
    }),
  }),
] as const;
```

Then, you can create a `DataProvider` utility type to use as an interface to encapsulate providers:

```typescript
type EntityDataProvider = DataProvider<typeof entityMethods>;

EntityDataProvider["findEntityByName"]; // (input: string) => Promise<ResOk<Entity> | ResErr<EntityNotFound>>
EntityDataProvider["createEntity"]; // (input: { entityName: string }) => Promise<ResOk<Entity> | ResErr<{ reason: "EntityAlreadyExists", existingEntity: Entity}>>
```

You can implement a data provider by using `implements`, like:

```typescript
class EntityDataProviderImpl implements EntityDataProvider {
  async findEntityByName(input: string) {
    // ...
  }
  async createEntity(input: { entityName: string }) {
    // ...
  }
}
```

You can also use a data validator to parse data from unsafe data sources:

```typescript
export const entityDataValidator = dataValidator(entityMethods);

entityDataValidator.findEntityByName.input.safeParse(...); // access to input, output, and errors
entityDataValidator.createEntity.input.safeParse(...);
```

See the [example](./example) folder for a full example.
