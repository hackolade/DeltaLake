export type EntityLevelParsedJsonData = {
    [columnName: string]: any | null | undefined,
}

export type ContainerLevelParsedJsonData = {
    [collectionId: string]: EntityLevelParsedJsonData,
}

export type ParsedJsonData = EntityLevelParsedJsonData | ContainerLevelParsedJsonData
