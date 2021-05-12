const convertType = (type) => {
    switch (type) {

        case 'array<tinyint>':
        case 'array<smallint>':
        case 'array<int>':
        case 'array<bigint>':
        case 'array<float>':
        case 'array<array>':
        case 'array<decimal>': return 'array<num>';

        case 'array<char>':
        case 'array<varchar>':
        case 'array<string>': return 'array<txt>';
        default: return type;
    }
}

const getMapSubtypeByValue = (val) => {
    switch (val) {
        case 'tinyint':
        case 'smallint':
        case 'int':
        case 'bigint':
        case 'float':
        case 'double':
        case 'decimal': return 'map<num>';
        case 'char':
        case 'varchar':
        case 'string': return 'map<txt>';
        case 'boolean': return 'map<bool>';
        case 'date': return 'map<date>';
        case 'timestamp': return 'map<ts>';
        case 'interval': return 'map<intrvl>';
        default: return 'map<txt>';
    }
}


const handleType = type => {
    const convertedType = convertType(type)
    if (typeof type === 'string') {
        switch (convertedType) {
            case 'tinyint':
            case 'smallint':
            case 'int':
            case 'bigint':
            case 'float':
            case 'double':
            case 'decimal': return { type: 'numeric', mode: convertedType };
            case 'char':
            case 'varchar':
            case 'string': return { type: 'text', mode: convertedType };
            case 'array<txt>':
            case 'array<num>':
            case 'array<ts>':
            case 'array<date>':
            case 'array<intrvl>':
            case 'array<array>':
            case 'array<map>':
            case 'array<struct>':
            case 'array<union>':
            case 'array': return { type: 'array', sybtype: convertedType };
            default: return { type: 'text'};
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
        const handledType = handleType(type.key)
        return {
            type: "document",
            childType: "map",
            subtype: getMapSubtypeByValue(type.val),
            keyType: handledType.type,
            keySubtype: handledType.mode
        }
    }

};

const reverseTableColumn = column => {
    return {
        ...handleType(column.colType), name: column.colName, comments: column.colComment, required: column.isNotNull
    }
}

module.exports = { reverseTableColumn };