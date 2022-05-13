const getClusterData = (tablesNames, databasesNames) => `
import json

databasesNames = [${databasesNames}]
databasesTablesNames = {${tablesNames}}

def getTableFieldMetadata(dbName, tableName):
    try:
        tableFieldsMetaInfo = spark.table(dbName + "." + tableName).schema.fields
        return {
            "name": tableName,
            "nullableMap": { field.name: field.nullable for field in tableFieldsMetaInfo },
            "indexes": { field.name: field.metadata for field in tableFieldsMetaInfo }
        }
    except:
        return {
            "name": tableName,
            "nullableMap": {},
            "indexes": {}
        }

def getDatabaseMetadata(dbName):
    dbTablesNames = databasesTablesNames.get(dbName, [])
    return [getTableFieldMetadata(dbName, tableName) for tableName in dbTablesNames]

clusterData = { dbName: getDatabaseMetadata(dbName) for dbName in databasesNames }

print(json.dumps(clusterData))
`;

const getViewNamesCommand = databaseName => `
import json

viewNames = spark.sql("show views in ${databaseName}").rdd.map(lambda p: p.viewName).collect()
print(json.dumps(viewNames))
`;

module.exports = {
  getClusterData,
  getViewNamesCommand,
};