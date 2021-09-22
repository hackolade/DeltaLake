import scala.util.parsing.json.JSONObject;

class Database(
    var name: String,
    var dbProperties: String,
    var dbTables: String
) {
  override def toString(): String = {
    return "\"" + name + "\": {\"dbTables\" : " + dbTables + "\", \"dbProperties\" : " + dbProperties + "\"}"
  };
};

class Entity(
    var name: String,
    var nullableMap: String,
    var indexes: String
) {
  override def toString(): String = {
    return "{\"name\":\"" + name + "\", \"nullableMap\":\"" + nullableMap + "\", \"indexes\":\"" + indexes + "\"}"
  };
};

val databasesNames: List[String] = List("default", "speeeed"); //db names must be replaced with names selected by user 

val databasesTablesNames: Map[String, List[String]] =
  Map("default" -> List("bloom_test"), "speeeed" -> List());//table names must be replaced with names selected by user 

val clusterData = databasesNames
  .map(dbName => {
    val dbProperties = sqlContext
      .sql("DESCRIBE DATABASE EXTENDED " + dbName)
      .filter(row => {
        val requiredProperties = List("Comment", "Location", "Properties")
        requiredProperties.contains(row.getString(0))
      })
      .map(row => "\"" + row.getString(0) + "\" : \"" + row.getString(1) + "\"")
      .collect()
      .toList
      .mkString("{", ", ", "}");

    val dbTablesNames = databasesTablesNames.get(dbName).getOrElse(List())

    val dbTables = dbTablesNames
      .map(tableName => {
        val nullableMap = spark
          .table(dbName + "." + tableName)
          .schema
          .fields
          .map(field => "\"" + field.name + "\" : \"" + field.nullable + "\"")
          .mkString("{", ", ", "}");

        val bloomFilteredIndexes = spark
          .table(dbName + "." + tableName)
          .schema
          .map(field => "\"" + field.name + "\" : \"" + field.metadata + "\"")
          .mkString("{", ", ", "}");
        new Entity(
          tableName,
          nullableMap,
          bloomFilteredIndexes
        );
      })
      .mkString("[", ", ", "]");
      
    (new Database(dbName, dbProperties, dbTables)).toString();
  })
  .mkString("{", ", ", "}");
