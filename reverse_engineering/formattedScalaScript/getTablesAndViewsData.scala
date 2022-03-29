import scala.util.parsing.json.JSONObject;

class Database(
    var name: String,
    var dbTables: String
) {
  override def toString(): String = {
    return "\"" + name + "\": {\"dbTables\" : " + dbTables + "\"}"
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

    val dbTablesNames = databasesTablesNames.get(dbName).getOrElse(List())

    val dbTables = dbTablesNames
      .map(tableName => {
        try {
          throw new Exception("Wait a little")
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
        }
        catch {
          case _: Throwable => new Entity(tableName, "{}", "{}")
        }
      })
      .mkString("[", ", ", "]");
      
    (new Database(dbName, dbTables)).toString();
  })
  .mkString("{", ", ", "}");
