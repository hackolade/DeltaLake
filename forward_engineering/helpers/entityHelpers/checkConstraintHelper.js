
/**
 * @param columns {Object[]}
 * @param tableName {string}
 * @return string[]
 * */
const getCheckConstraintsScripts = (columns, tableName) => {
    return Object.keys(columns)
        .map(colName => ({ colName: colName.replaceAll('`', ''), ...columns[colName] }))
        .filter(column => column.constraints.check)
        .map(column => `ALTER TABLE ${tableName} ADD CONSTRAINT \`${column.colName}_constraint\` CHECK (${column.constraints.check})`);
}

module.exports = {
    getCheckConstraintsScripts
}
