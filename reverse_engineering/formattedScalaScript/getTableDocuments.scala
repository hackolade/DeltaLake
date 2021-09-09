import scala.util.parsing.json.JSONObject;

val isAbsolute: Boolean = true;
val percentage: Double = 20;
val absoluteNumber: Int = 1000;
var count: Double = (sqlContext
  .sql("select count(*) as count from default.bloom_test")
  .select("count")
  .collect()(0)(0))
  .asInstanceOf[Long]
  .toDouble;

val limit: Int =
  if (isAbsolute) absoluteNumber else ((count / 100) * percentage).ceil.toInt;

var rows = sqlContext
  .sql(
    "SELECT * FROM default.bloom_test LIMIT " + limit
  )
  .map(row => JSONObject(row.getValuesMap(row.schema.fieldNames)).toString())
  .collect()
  .mkString("[", ", ", "]");
