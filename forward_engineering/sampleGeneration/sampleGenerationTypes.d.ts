import {ModelTypes} from "../types/modelTypes";

export type EntityLevelParsedJsonData = {
    [columnName: string]: any | null | undefined,
}

export type ContainerLevelParsedJsonData = {
    [collectionId: string]: EntityLevelParsedJsonData,
}

export type ParsedJsonData = EntityLevelParsedJsonData | ContainerLevelParsedJsonData

export type SampleGenerationEntityJsonSchema = {
    bucketName: string,
    collectionName: string,
    properties: {
        [columnName: string]: {
            type: ModelTypes,
            GUID: string,
        }
    }
}