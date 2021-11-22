const handleSubtype = (childType, parentType) => {
    if (typeof childType === 'string') {
        switch (childType) {
            case 'tinyint':
            case 'smallint':
            case 'int':
            case 'bigint':
            case 'float':
            case 'double':
            case 'decimal': return { subtype: `${parentType}<num>` };
            case 'char':
            case 'varchar':
            case 'string': return { subtype: `${parentType}<txt>` };
            case 'binary': return { subtype: `${parentType}<bin>` };
            case 'boolean': return { subtype: `${parentType}<bool>` };
            case 'date': return { subtype: `${parentType}<date>` };
            case 'timestamp': return { subtype: `${parentType}<ts>` };
            case 'interval': return { subtype: `${parentType}<intrvl>` };
            case 'union': return { subtype: `${parentType}<union>` };
            default: return { subtype: `${parentType}<txt>` };
        }
    }
    if (childType.type === 'array') {
        return {
            subtype: `${parentType}<array>`,
            properties: [
                handleType(childType)
            ]
        }
    }
    if (childType.type === 'map') {
        return {
            subtype: `${parentType}<map>`,
            properties: [
                handleType(childType)
            ]
        }
    }
    if (childType.type === 'struct') {
        return {
            subtype: `${parentType}<struct>`,
            properties: [
                handleType(childType)
            ]
        }
    }

    return {};
}


const handleType = type => {
    if (typeof type === 'string') {
        switch (type) {
            case 'tinyint':
            case 'smallint':
            case 'int':
            case 'bigint':
            case 'float':
            case 'double':
            case 'decimal': return { type: 'numeric', mode: type };
            case 'char':
            case 'varchar':
            case 'string': return { type: 'text', mode: type };
            case 'boolean': return { type: 'bool' };
            case 'binary': return { type: 'binary', mode: type };
            case 'timestamp': return { type: 'timestamp' };
            case 'date': return { type: 'date' };
            case 'interval': return { type: 'interval' };
            default: return { type: 'text' };
        }
    }
    if (type.type === "array") {
        return {
            type: 'array',
            ...handleSubtype(type.elements, 'array')
        }
    }
    if (type.type === "struct") {
        return {
            subtype: "struct<str>",
            keyType: "string",
            properties: type.params.map(column => reverseTableColumn(column))
        }
    }
    if (type.type === "map") {
        const handledType = handleType(type.key);

        return {
            type: "document",
            childType: "map",
            keyType: handledType.type,
            keySubtype: handledType.mode,
            ...handleSubtype(type.val, 'map')
        }
    }

};

const reverseTableColumn = column => {
    return {
        ...handleType(column.colType), name: column.colName, comments: column.colComment
    }
}

module.exports = { reverseTableColumn };