declare type Booleanish = boolean | 'true' | 'false';
declare type Numberish = number | string;
declare type Nullable<T = void> = T | null | undefined;
declare type VoidListener = VoidFunction | null | undefined;

export type { Booleanish, Nullable, Numberish, VoidListener };
