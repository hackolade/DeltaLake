const getDatabasesTablesCode = () => `import scala.util.parsing.json.JSONObject;

val databaseNames: List[String] = sqlContext
  .sql(\"SHOW DATABASES\")
  .select(\"databaseName\")
  .collect()
  .map(_(0).toString)
  .toList;

var databasesTables = databaseNames
  .map(dbName => {
    val dbViews: List[String] = sqlContext
      .sql(\"SHOW VIEWS FROM \" + dbName)
      .select(\"viewName\")
      .collect()
      .map(_(0).toString)
      .toList;
    val dbTables: List[String] = sqlContext
      .sql(\"SHOW TABLES FROM \" + dbName)
      .select(\"tableName\")
      .collect()
      .map(_(0).toString)
      .filter(table => !dbViews.contains(table))
      .toList;
    val formattedViews: List[String] = dbViews.map(view => view + \" (v)\")
    val dbCollections: String = (dbTables ++ formattedViews)
      .map(name => \"\\"\" + name + \"\\"\")
      .mkString(\"[\", \", \", \"]\");
    \"{\\"dbName\\":\\"\" + dbName + \"\\", \\"dbCollections\\":\\"\" + dbCollections + \"\\", \\"isEmpty\\":\\"\" + (dbTables.isEmpty && dbViews.isEmpty) + \"\\"}\"
  })
  .mkString(\"[\", \", \", \"]\");`

const getClusterData = (tablesNames, databasesNames) => `import scala.util.parsing.json.JSONObject;

class Database(
    var name: String,
    var dbProperties: String,
    var dbTables: String
) {
  override def toString(): String = {
    return \"\\"\" + name + \"\\": {\\"dbTables\\" : \" + dbTables + \"\\", \\"dbProperties\\" : \" + dbProperties + \"\\"}\"
  };
};

class Entity(
    var name: String,
    var nullableMap: String,
    var indexes: String
) {
  override def toString(): String = {
    return \"{\\"name\\":\\"\" + name + \"\\", \\"nullableMap\\":\\"\" + nullableMap + \"\\", \\"indexes\\":\\"\" + indexes + \"\\"}\"
  };
};

val databasesNames: List[String] = List(${databasesNames});

val databasesTablesNames: Map[String, List[String]] =
  Map(${tablesNames});

val clusterData = databasesNames
  .map(dbName => {
    val dbProperties = sqlContext
      .sql(\"DESCRIBE DATABASE EXTENDED \" + dbName)
      .filter(row => {
        val requiredProperties = List(\"Comment\", \"Location\", \"Properties\")
        requiredProperties.contains(row.getString(0))
      })
      .map(row => \"\\"\" + row.getString(0) + \"\\" : \\"\" + row.getString(1) + \"\\"\")
      .collect()
      .toList
      .mkString(\"{\", \", \", \"}\");

    val dbTablesNames = databasesTablesNames.get(dbName).getOrElse(List())

    val dbTables = dbTablesNames
      .map(tableName => {

        val nullableMap = spark
          .table(dbName + \".\" + tableName)
          .schema
          .fields
          .map(field => \"\\"\" + field.name + \"\\" : \\"\" + field.nullable + \"\\"\")
          .mkString(\"{\", \", \", \"}\");

        val bloomFilteredIndexes = spark
          .table(dbName + \".\" + tableName)
          .schema
          .map(field => \"\\"\" + field.name + \"\\" : \\"\" + field.metadata + \"\\"\")
          .mkString(\"{\", \", \", \"}\");
        new Entity(
          tableName,
          nullableMap,
          bloomFilteredIndexes
        );
      })
      .mkString(\"[\", \", \", \"]\");
    (new Database(dbName, dbProperties, dbTables)).toString();
  })
  .mkString(\"{\", \", \", \"}\");
`

const getDocuments = ({dbName, tableName,columnsToSelect, isAbsolute, percentage, absoluteNumber}) => `import scala.util.parsing.json.JSONObject;

val isAbsolute: Boolean = ${isAbsolute};
val percentage: Double = ${percentage}.0;
val absoluteNumber: Int = ${absoluteNumber};
var count: Double = (sqlContext
  .sql("SELECT COUNT(*) AS count FROM ${dbName}.${tableName}")
  .select("count")
  .collect()(0)(0))
  .asInstanceOf[Long]
  .toDouble;

val limit: Int =
  if (isAbsolute) absoluteNumber else ((count / 100) * percentage).ceil.toInt;

var rows = sqlContext
  .sql(
    "SELECT ${columnsToSelect} FROM ${dbName}.${tableName} LIMIT " + limit
  )
  .map(row => JSONObject(row.getValuesMap(row.schema.fieldNames)).toString())
  .collect()
  .mkString("[", ", ", "]");
`

module.exports = {
  getDatabasesTablesCode,
  getClusterData,
  getDocuments
};