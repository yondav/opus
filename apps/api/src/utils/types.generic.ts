// src/utils/types.generic.ts

/**
 * Represents a type that can be either of type `T` or `null` or `undefined`.
 *
 * @template T - The underlying type.
 */
export type Nullable<T> = T | null | undefined;
