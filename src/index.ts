import { ZodUndefined, z } from "zod";

type ResOk<Ok> = { hasError?: false; value: Ok };
type ResErr<Err> = { hasError: true; error: Err };
type Res<Ok, Err> = ResOk<Ok> | ResErr<Err>;

export const resOk = <Ok>(value: Ok): ResOk<Ok> => ({ value });
export const resErr = <Err>(error: Err): ResErr<Err> => ({ hasError: true, error });

type DataMethodDefinition<
    TName extends string,
    TInput extends z.ZodTypeAny,
    TOutput extends z.ZodTypeAny,
    TErrors extends z.ZodTypeAny,
> = Record<
    TName,
    {
        input: TInput;
        output: TOutput;
        errors?: TErrors;
    }
>;

type AnyDataMethodDefinition = DataMethodDefinition<string, z.ZodTypeAny, z.ZodTypeAny, z.ZodTypeAny>;
type DataMethodDefinitionForName<TName extends string> = DataMethodDefinition<
    TName,
    z.ZodTypeAny,
    z.ZodTypeAny,
    z.ZodTypeAny
>;

type DataProviderForMethod<
    TMethods extends readonly AnyDataMethodDefinition[],
    K extends keyof UnionToIntersection<TMethods[number]>,
> = K extends string
    ? {
        [key in K & string]: (
            input: z.infer<Extract<TMethods[number], DataMethodDefinitionForName<K>>[K]["input"]>,
        ) => Promise<
            ZodUndefined extends Extract<TMethods[number], DataMethodDefinitionForName<K>>[K]["errors"]
            ? z.infer<Extract<TMethods[number], DataMethodDefinitionForName<K>>[K]["output"]>
            : Res<
                z.infer<Extract<TMethods[number], DataMethodDefinitionForName<K>>[K]["output"]>,
                z.infer<NonNullable<Extract<TMethods[number], DataMethodDefinitionForName<K>>[K]["errors"]>>
            >
        >;
    }
    : never;

type DataProviderDist<TMethods extends readonly AnyDataMethodDefinition[], K> = K extends keyof UnionToIntersection<
    TMethods[number]
>
    ? DataProviderForMethod<TMethods, K>
    : never;

type StringLiteral<T> = T extends `${string & T}` ? T : never;
type UnionToIntersection<U> = (U extends unknown ? (x: U) => void : never) extends (x: infer I) => void ? I : never;

export type DataProvider<TMethods extends readonly AnyDataMethodDefinition[]> = UnionToIntersection<
    DataProviderDist<TMethods, keyof UnionToIntersection<TMethods[number]>>
>;

export const dataMethodDefinition = <
    TName,
    TInput extends z.ZodTypeAny,
    TOutput extends z.ZodTypeAny,
    TErrors extends z.ZodTypeAny | undefined = undefined,
>({
    methodName,
    input,
    output,
    errors,
}: {
    methodName: StringLiteral<TName>;
    input: TInput;
    output: TOutput;
    errors?: TErrors;
}) =>
    ({
        [methodName]: {
            input,
            output,
            errors,
        },
    }) as DataMethodDefinition<
        StringLiteral<TName>,
        TInput,
        TOutput,
        TErrors extends undefined ? ZodUndefined : NonNullable<TErrors>
    >;

export type DataValidator<TMethods extends readonly AnyDataMethodDefinition[]> = UnionToIntersection<TMethods[number]>;
export const dataValidator = <TMethods extends readonly AnyDataMethodDefinition[]>(
    methods: TMethods,
): DataValidator<TMethods> => Object.assign({}, ...methods);
