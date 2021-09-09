import scala.util.parsing.json.JSONObject;

val databaseNames: List[String] = sqlContext
  .sql("SHOW DATABASES")
  .select("databaseName")
  .collect()
  .map(_(0).toString)
  .toList;

var databasesTables = databaseNames
  .map(dbName => {
    val dbViews: List[String] = sqlContext
      .sql("SHOW VIEWS FROM " + dbName)
      .select("viewName")
      .collect()
      .map(_(0).toString)
      .toList;
    val dbTables: List[String] = sqlContext
      .sql("SHOW TABLES FROM " + dbName)
      .select("tableName")
      .collect()
      .map(_(0).toString)
      .filter(table => !dbViews.contains(table))
      .toList;
    val formattedViews: List[String] = dbViews.map(view => view + " (v)")
    val dbCollections: String = (dbTables ++ formattedViews)
      .map(name => "\"" + name + "\"")
      .mkString("[", ", ", "]");
    "{\"dbName\":\"" + dbName + "\", \"dbCollections\":\"" + dbCollections + "\", \"isEmpty\":\"" + (dbTables.isEmpty && dbViews.isEmpty) + "\"}"
  })
  .mkString("[", ", ", "]");
