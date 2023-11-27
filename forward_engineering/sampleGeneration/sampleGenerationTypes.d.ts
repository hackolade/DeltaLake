type EntityLevelParsedJsonData = {
    [columnName: string]: any | null | undefined,
}

type ContainerLevelParsedJsonData = {
    [collectionId: string]: EntityLevelParsedJsonData,
}

export type ParsedJsonData = EntityLevelParsedJsonData | ContainerLevelParsedJsonData
