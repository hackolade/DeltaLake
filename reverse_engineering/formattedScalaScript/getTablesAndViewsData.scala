import scala.util.parsing.json.JSONObject;

class Database(
    var name: String,
    var dbProperties: String,
    var dbTables: String,
    var dbViews: String
) {
  override def toString(): String = {
    return "\"" + name + "\": {\"dbTables\" : " + dbTables + "\", \"dbViews\" : " + dbViews + "\", \"dbProperties\" : " + dbProperties + "\"}"
  };
};

class Entity(
    var name: String,
    var ddl: String,
    var checkConstraints: String,
    var nullableMap: String,
    var indexes: String
) {
  override def toString(): String = {
    return "{\"name\":\"" + name + "\", \"ddl\":\"" + ddl + "\", \"checkConstraints\":\"" + checkConstraints + "\", \"nullableMap\":\"" + nullableMap + "\", \"indexes\":\"" + indexes + "\"}"
  };
};

val databasesNames: List[String] = List("default", "speeeed"); //db names must be replaced with names selected by user 

val databasesTablesNames: Map[String, List[String]] =
  Map("default" -> List("bloom_test"), "speeeed" -> List());//table names must be replaced with names selected by user 

val databasesViewsNames: Map[String, List[String]] =
  Map("default" -> List("experienced_employee"), "speeeed" -> List());//view names must be replaced with names selected by user 

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
    val dbViewsNames = databasesViewsNames.get(dbName).getOrElse(List())

    val dbTables = dbTablesNames
      .map(tableName => {
        val ddl = sqlContext
          .sql("SHOW CREATE TABLE `" + dbName + "`.`" + tableName + "`")
          .select("createtab_stmt")
          .first
          .getString(0);

        val checkConstraints = sqlContext
          .sql("DESCRIBE DETAIL " + dbName + "." + tableName)
          .select("properties")
          .map(row =>
            JSONObject(
              row
                .getValuesMap(row.schema.fieldNames)
                .get("properties")
                .getOrElse(Map())
            ).toString()
          )
          .collect()(0);

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
          ddl,
          checkConstraints,
          nullableMap,
          bloomFilteredIndexes
        );
      })
      .mkString("[", ", ", "]");

    val dbViews = dbViewsNames
      .map(viewName => {
        val ddl = sqlContext
          .sql("SHOW CREATE TABLE `" + dbName + "`.`" + viewName + "`")
          .select("createtab_stmt")
          .first
          .getString(0);
        "{\"name\":\"" + viewName + "\", \"ddl\":\"" + ddl + "\"}"
      })
      .mkString("[", ", ", "]");

    (new Database(dbName, dbProperties, dbTables, dbViews)).toString();
  })
  .mkString("{", ", ", "}");
