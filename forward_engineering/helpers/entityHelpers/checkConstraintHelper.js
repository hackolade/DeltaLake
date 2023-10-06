
/**
 * @param columns {Object[]}
 * @param tableName {string}
 * @return string[]
 * */
const getCheckConstraintsScripts = (columns, tableName) => {
    return Object.keys(columns)
        .map(colName => ({ colName: colName.replaceAll('`', ''), ...columns[colName] }))
        .filter(column => column.constraints.check)
        .map(column => {
            const constraintName = column.constraints.checkConstraintName
                ? column.constraints.checkConstraintName
                : `${column.colName}_constraint`
            return `ALTER TABLE ${tableName} ADD CONSTRAINT \`${constraintName}\` CHECK (${column.constraints.check})`
        });
}

module.exports = {
    getCheckConstraintsScripts
}
