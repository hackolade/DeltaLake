export type ColumnDefinition = {
  name: string;
  type: string;
  nullable: boolean;
  isActivated: boolean;
  isCaseSensitive?: boolean;
  length?: number;
  precision?: number;
  primaryKey?: boolean;
  primaryKeyConstraintName?: string;
  scale?: number;
  timePrecision?: number;
  unique?: boolean;
  uniqueKeyConstraintName?: string;
};

export type ConstraintDtoColumn = {
  name: string;
  isActivated: boolean;
};

export type KeyType = 'PRIMARY KEY' | 'UNIQUE' | 'CHECK';

export type ConstraintDto = {
  keyType: KeyType;
  name: string;
  columns?: ConstraintDtoColumn[];
};

export type JsonSchema = Record<string, unknown>;
