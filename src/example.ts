import { z } from "zod";

import { DataProvider, dataMethodDefinition, dataValidator } from "./index";

type Equals<T, U> = T extends U ? (U extends T ? true : false) : false;
type Expect<T extends true> = T;

const entitySchema = z.object({
    entityId: z.string(),
    entityName: z.string(),
});

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
        errors: z.object({ reason: z.literal("EntityAlreadyExists"), existingEntity: entitySchema }),
    }),
] as const;

// data provider type and data validator object utilities
export type EntityDataProvider = DataProvider<typeof entityMethods>;
export const entityDataValidator = dataValidator(entityMethods);

// Outcomes

// Typed data provider with method name and zod-inferred function signature
type Entity = z.infer<typeof entitySchema>;
type TestFindEntityByName = Expect<Equals<EntityDataProvider["findEntityByName"], (name: string) => Promise<{ value: Entity } | { hasError: true; error: "EntityNotFound" }>>>;
type TestCreateEntity = Expect<Equals<EntityDataProvider["createEntity"], (entity: { entityName: string }) => Promise<{ value: Entity } | { hasError: true; error: { reason: "EntityAlreadyExists", existingEntity: Entity } }>>>;


// Typed data validator allowing access to parse unsafe data sources
const safeData = { entityId: "1", entityName: "test" };
entityDataValidator.createEntity.input.safeParse(safeData); // { success: true, data: { entityName: "test" } }

const unsafeData = 17;
entityDataValidator.findEntityByName.input.safeParse(unsafeData); // { success: false, error: [error] }