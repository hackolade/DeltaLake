// --- Use only spaces in python script literals

const { FIELD_METADATA_STRING_MAX } = require('../../shared/constants');

/** Full cluster field metadata in one notebook exit (preferred when output fits). */
const getClusterData = ({ tablesNames, databasesNames, sizeOnly = false }) => `
import json

databasesNames = [${databasesNames}]
databasesTablesNames = {${tablesNames}}

def metadata_to_dict(m):
    try:
        if m is None:
            return {}
        return json.loads(m.json())
    except Exception:
        return {}

def getTableFieldMetadata(dbName, tableName):
    try:
        tableFieldsMetaInfo = spark.table(dbName + "." + tableName).schema.fields
        return {
            "name": tableName,
            "nullableMap": { field.name: field.nullable for field in tableFieldsMetaInfo },
            "indexes": { field.name: metadata_to_dict(field.metadata) for field in tableFieldsMetaInfo }
        }
    except Exception:
        return {
            "name": tableName,
            "nullableMap": {},
            "indexes": {}
        }

def getDatabaseMetadata(dbName):
    dbTablesNames = databasesTablesNames.get(dbName, [])
    return [getTableFieldMetadata(dbName, tableName) for tableName in dbTablesNames]

clusterData = { dbName: getDatabaseMetadata(dbName) for dbName in databasesNames }

payload = json.dumps(clusterData)

size_bytes = len(payload.encode("utf-8"))

dbutils.notebook.exit(${sizeOnly ? 'size_bytes' : 'payload'})
`;

const getClusterColumnNames = ({ tablesNames, databasesNames }) => `
import json

databasesNames = [${databasesNames}]
databasesTablesNames = {${tablesNames}}

def column_names_for_table(db_name, table_name):
    try:
        return [f.name for f in spark.table(db_name + "." + table_name).schema.fields]
    except Exception:
        return []

cluster_column_names = {}
for db_name in databasesNames:
    cluster_column_names[db_name] = [
        {"name": table_name, "columns": column_names_for_table(db_name, table_name)}
        for table_name in databasesTablesNames.get(db_name, [])
    ]

dbutils.notebook.exit(json.dumps(cluster_column_names))
`;

/**
 * @param {string} dbName
 * @param {string} tableName
 * @param {string} columnsJson - JSON array string ('["a","b"]')
 */
const getClusterFieldMetadataBatch = ({ dbName, tableName, columnsJson }) => `
import json
_db = ${JSON.stringify(dbName)}
_table = ${JSON.stringify(tableName)}
_cols = json.loads(${JSON.stringify(columnsJson)})

def truncate_metadata(obj, max_len=${FIELD_METADATA_STRING_MAX}):
    if isinstance(obj, dict):
        return {k: truncate_metadata(v, max_len) for k, v in obj.items()}
    if isinstance(obj, list):
        return [truncate_metadata(i, max_len) for i in obj]
    if isinstance(obj, str) and len(obj) > max_len:
        return obj[:max_len] + "…"
    return obj

def metadata_to_dict(m):
    try:
        if m is None:
            return {}
        return truncate_metadata(json.loads(m.json()))
    except Exception:
        return {}

try:
    _want = set(_cols)
    fields = [f for f in spark.table(_db + "." + _table).schema.fields if f.name in _want]
    out = {
        "name": _table,
        "nullableMap": {f.name: f.nullable for f in fields},
        "indexes": {f.name: metadata_to_dict(f.metadata) for f in fields},
    }
except Exception:
    out = {"name": _table, "nullableMap": {}, "indexes": {}}

dbutils.notebook.exit(json.dumps(out))
`;

const getViewNamesCommand = ({ dbName }) => `
import json

viewNames = spark.sql("show views in ${dbName}").rdd.map(lambda p: p.viewName).collect()
dbutils.notebook.exit(json.dumps(viewNames))
`;

/**
 * Compact column name + Spark type list for building a minimal CREATE TABLE when SHOW CREATE TABLE output is too large.
 * Use a 3-part name (catalog.schema.table) when Unity Catalog applies — the Python command context does not share SQL session catalog state.
 * @param {string} fullName - e.g. "hive_metastore.default.my_table" or "default.my_table"
 */
const getTableSchemaColumnsForDdlFallback = ({ fullName }) => `
import json
_fqn = ${JSON.stringify(fullName)}
_cols = [{"name": f.name, "colType": f.dataType.simpleString()} for f in spark.table(_fqn).schema.fields]
dbutils.notebook.exit(json.dumps(_cols))
`;

module.exports = {
	getClusterData,
	getClusterColumnNames,
	getClusterFieldMetadataBatch,
	getTableSchemaColumnsForDdlFallback,
	getViewNamesCommand,
};
