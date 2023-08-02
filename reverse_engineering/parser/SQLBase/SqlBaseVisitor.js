// Generated from grammars/SqlBase.g4 by ANTLR 4.9.2
// jshint ignore: start
const antlr4 = require("antlr4");

// This class defines a complete generic visitor for a parse tree produced by SqlBaseParser.

class SqlBaseVisitor extends antlr4.tree.ParseTreeVisitor {

	// Visit a parse tree produced by SqlBaseParser#singleStatement.
	visitSingleStatement(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#singleExpression.
	visitSingleExpression(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#singleTableIdentifier.
	visitSingleTableIdentifier(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#singleMultipartIdentifier.
	visitSingleMultipartIdentifier(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#singleFunctionIdentifier.
	visitSingleFunctionIdentifier(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#singleDataType.
	visitSingleDataType(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#singleTableSchema.
	visitSingleTableSchema(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#statementDefault.
	visitStatementDefault(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#dmlStatement.
	visitDmlStatement(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#use.
	visitUse(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#createNamespace.
	visitCreateNamespace(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#setNamespaceProperties.
	visitSetNamespaceProperties(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#setNamespaceLocation.
	visitSetNamespaceLocation(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#dropNamespace.
	visitDropNamespace(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#showNamespaces.
	visitShowNamespaces(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#createTable.
	visitCreateTable(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#createTableLike.
	visitCreateTableLike(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#replaceTable.
	visitReplaceTable(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#analyze.
	visitAnalyze(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#analyzeTables.
	visitAnalyzeTables(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#addTableColumns.
	visitAddTableColumns(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#renameTableColumn.
	visitRenameTableColumn(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#dropTableColumns.
	visitDropTableColumns(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#renameTable.
	visitRenameTable(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#setTableProperties.
	visitSetTableProperties(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#unsetTableProperties.
	visitUnsetTableProperties(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#alterTableAlterColumn.
	visitAlterTableAlterColumn(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#hiveChangeColumn.
	visitHiveChangeColumn(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#hiveReplaceColumns.
	visitHiveReplaceColumns(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#setTableSerDe.
	visitSetTableSerDe(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#addTablePartition.
	visitAddTablePartition(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#renameTablePartition.
	visitRenameTablePartition(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#dropTablePartitions.
	visitDropTablePartitions(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#setTableLocation.
	visitSetTableLocation(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#recoverPartitions.
	visitRecoverPartitions(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#dropTable.
	visitDropTable(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#dropView.
	visitDropView(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#createView.
	visitCreateView(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#createTempViewUsing.
	visitCreateTempViewUsing(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#alterViewQuery.
	visitAlterViewQuery(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#createFunction.
	visitCreateFunction(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#dropFunction.
	visitDropFunction(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#explain.
	visitExplain(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#showTables.
	visitShowTables(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#showTableExtended.
	visitShowTableExtended(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#showTblProperties.
	visitShowTblProperties(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#showColumns.
	visitShowColumns(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#showViews.
	visitShowViews(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#showPartitions.
	visitShowPartitions(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#showFunctions.
	visitShowFunctions(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#showCreateTable.
	visitShowCreateTable(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#showCurrentNamespace.
	visitShowCurrentNamespace(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#describeFunction.
	visitDescribeFunction(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#describeNamespace.
	visitDescribeNamespace(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#describeRelation.
	visitDescribeRelation(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#describeQuery.
	visitDescribeQuery(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#commentNamespace.
	visitCommentNamespace(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#commentTable.
	visitCommentTable(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#refreshTable.
	visitRefreshTable(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#refreshFunction.
	visitRefreshFunction(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#refreshResource.
	visitRefreshResource(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#cacheTable.
	visitCacheTable(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#uncacheTable.
	visitUncacheTable(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#clearCache.
	visitClearCache(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#loadData.
	visitLoadData(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#truncateTable.
	visitTruncateTable(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#repairTable.
	visitRepairTable(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#manageResource.
	visitManageResource(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#failNativeCommand.
	visitFailNativeCommand(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#setTimeZone.
	visitSetTimeZone(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#setQuotedConfiguration.
	visitSetQuotedConfiguration(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#setConfiguration.
	visitSetConfiguration(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#resetQuotedConfiguration.
	visitResetQuotedConfiguration(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#resetConfiguration.
	visitResetConfiguration(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#configKey.
	visitConfigKey(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#configValue.
	visitConfigValue(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#unsupportedHiveNativeCommands.
	visitUnsupportedHiveNativeCommands(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#createTableHeader.
	visitCreateTableHeader(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#replaceTableHeader.
	visitReplaceTableHeader(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#bucketSpec.
	visitBucketSpec(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#skewSpec.
	visitSkewSpec(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#locationSpec.
	visitLocationSpec(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#commentSpec.
	visitCommentSpec(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#query.
	visitQuery(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#insertOverwriteTable.
	visitInsertOverwriteTable(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#insertIntoTable.
	visitInsertIntoTable(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#insertOverwriteHiveDir.
	visitInsertOverwriteHiveDir(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#insertOverwriteDir.
	visitInsertOverwriteDir(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#partitionSpecLocation.
	visitPartitionSpecLocation(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#partitionSpec.
	visitPartitionSpec(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#partitionVal.
	visitPartitionVal(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#namespace.
	visitNamespace(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#describeFuncName.
	visitDescribeFuncName(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#describeColName.
	visitDescribeColName(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#ctes.
	visitCtes(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#namedQuery.
	visitNamedQuery(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#tableProvider.
	visitTableProvider(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#createTableClauses.
	visitCreateTableClauses(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#tableProperties.
	visitTableProperties(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#tableOptions.
	visitTableOptions(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#tablePropertyList.
	visitTablePropertyList(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#tableProperty.
	visitTableProperty(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#tablePropertyKey.
	visitTablePropertyKey(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#tablePropertyValue.
	visitTablePropertyValue(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#constantList.
	visitConstantList(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#nestedConstantList.
	visitNestedConstantList(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#createFileFormat.
	visitCreateFileFormat(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#tableFileFormat.
	visitTableFileFormat(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#genericFileFormat.
	visitGenericFileFormat(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#storageHandler.
	visitStorageHandler(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#resource.
	visitResource(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#singleInsertQuery.
	visitSingleInsertQuery(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#multiInsertQuery.
	visitMultiInsertQuery(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#deleteFromTable.
	visitDeleteFromTable(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#updateTable.
	visitUpdateTable(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#mergeIntoTable.
	visitMergeIntoTable(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#queryOrganization.
	visitQueryOrganization(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#multiInsertQueryBody.
	visitMultiInsertQueryBody(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#queryTermDefault.
	visitQueryTermDefault(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#setOperation.
	visitSetOperation(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#queryPrimaryDefault.
	visitQueryPrimaryDefault(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#fromStmt.
	visitFromStmt(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#table.
	visitTable(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#inlineTableDefault1.
	visitInlineTableDefault1(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#subquery.
	visitSubquery(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#sortItem.
	visitSortItem(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#fromStatement.
	visitFromStatement(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#fromStatementBody.
	visitFromStatementBody(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#transformQuerySpecification.
	visitTransformQuerySpecification(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#regularQuerySpecification.
	visitRegularQuerySpecification(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#transformClause.
	visitTransformClause(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#selectClause.
	visitSelectClause(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#setClause.
	visitSetClause(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#matchedClause.
	visitMatchedClause(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#notMatchedClause.
	visitNotMatchedClause(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#matchedAction.
	visitMatchedAction(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#notMatchedAction.
	visitNotMatchedAction(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#assignmentList.
	visitAssignmentList(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#assignment.
	visitAssignment(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#whereClause.
	visitWhereClause(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#havingClause.
	visitHavingClause(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#hint.
	visitHint(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#hintStatement.
	visitHintStatement(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#fromClause.
	visitFromClause(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#aggregationClause.
	visitAggregationClause(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#groupByClause.
	visitGroupByClause(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#groupingAnalytics.
	visitGroupingAnalytics(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#groupingSet.
	visitGroupingSet(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#pivotClause.
	visitPivotClause(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#pivotColumn.
	visitPivotColumn(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#pivotValue.
	visitPivotValue(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#lateralView.
	visitLateralView(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#setQuantifier.
	visitSetQuantifier(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#relation.
	visitRelation(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#joinRelation.
	visitJoinRelation(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#joinType.
	visitJoinType(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#joinCriteria.
	visitJoinCriteria(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#sample.
	visitSample(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#sampleByPercentile.
	visitSampleByPercentile(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#sampleByRows.
	visitSampleByRows(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#sampleByBucket.
	visitSampleByBucket(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#sampleByBytes.
	visitSampleByBytes(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#identifierList.
	visitIdentifierList(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#identifierSeq.
	visitIdentifierSeq(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#orderedIdentifierList.
	visitOrderedIdentifierList(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#orderedIdentifier.
	visitOrderedIdentifier(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#identifierCommentList.
	visitIdentifierCommentList(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#identifierComment.
	visitIdentifierComment(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#tableName.
	visitTableName(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#aliasedQuery.
	visitAliasedQuery(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#aliasedRelation.
	visitAliasedRelation(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#inlineTableDefault2.
	visitInlineTableDefault2(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#tableValuedFunction.
	visitTableValuedFunction(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#inlineTable.
	visitInlineTable(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#functionTable.
	visitFunctionTable(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#tableAlias.
	visitTableAlias(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#rowFormatSerde.
	visitRowFormatSerde(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#rowFormatDelimited.
	visitRowFormatDelimited(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#multipartIdentifierList.
	visitMultipartIdentifierList(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#multipartIdentifier.
	visitMultipartIdentifier(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#tableIdentifier.
	visitTableIdentifier(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#functionIdentifier.
	visitFunctionIdentifier(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#namedExpression.
	visitNamedExpression(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#namedExpressionSeq.
	visitNamedExpressionSeq(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#partitionFieldList.
	visitPartitionFieldList(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#partitionTransform.
	visitPartitionTransform(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#partitionColumn.
	visitPartitionColumn(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#identityTransform.
	visitIdentityTransform(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#applyTransform.
	visitApplyTransform(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#transformArgument.
	visitTransformArgument(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#expression.
	visitExpression(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#logicalNot.
	visitLogicalNot(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#predicated.
	visitPredicated(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#exists.
	visitExists(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#logicalBinary.
	visitLogicalBinary(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#predicate.
	visitPredicate(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#valueExpressionDefault.
	visitValueExpressionDefault(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#comparison.
	visitComparison(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#arithmeticBinary.
	visitArithmeticBinary(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#arithmeticUnary.
	visitArithmeticUnary(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#struct.
	visitStruct(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#dereference.
	visitDereference(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#simpleCase.
	visitSimpleCase(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#columnReference.
	visitColumnReference(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#rowConstructor.
	visitRowConstructor(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#last.
	visitLast(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#star.
	visitStar(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#overlay.
	visitOverlay(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#subscript.
	visitSubscript(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#subqueryExpression.
	visitSubqueryExpression(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#substring.
	visitSubstring(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#currentDatetime.
	visitCurrentDatetime(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#cast.
	visitCast(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#constantDefault.
	visitConstantDefault(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#lambda.
	visitLambda(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#parenthesizedExpression.
	visitParenthesizedExpression(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#extract.
	visitExtract(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#trim.
	visitTrim(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#functionCall.
	visitFunctionCall(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#searchedCase.
	visitSearchedCase(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#position.
	visitPosition(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#first.
	visitFirst(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#nullLiteral.
	visitNullLiteral(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#intervalLiteral.
	visitIntervalLiteral(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#typeConstructor.
	visitTypeConstructor(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#numericLiteral.
	visitNumericLiteral(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#booleanLiteral.
	visitBooleanLiteral(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#stringLiteral.
	visitStringLiteral(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#comparisonOperator.
	visitComparisonOperator(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#arithmeticOperator.
	visitArithmeticOperator(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#predicateOperator.
	visitPredicateOperator(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#booleanValue.
	visitBooleanValue(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#interval.
	visitInterval(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#errorCapturingMultiUnitsInterval.
	visitErrorCapturingMultiUnitsInterval(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#multiUnitsInterval.
	visitMultiUnitsInterval(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#errorCapturingUnitToUnitInterval.
	visitErrorCapturingUnitToUnitInterval(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#unitToUnitInterval.
	visitUnitToUnitInterval(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#intervalValue.
	visitIntervalValue(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#colPosition.
	visitColPosition(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#arrayDataType.
	visitArrayDataType(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#mapDataType.
	visitMapDataType(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#structDataType.
	visitStructDataType(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#primitiveDataType.
	visitPrimitiveDataType(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#qualifiedColTypeWithPositionList.
	visitQualifiedColTypeWithPositionList(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#qualifiedColTypeWithPosition.
	visitQualifiedColTypeWithPosition(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#colTypeList.
	visitColTypeList(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#colType.
	visitColType(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#tableConstraint.
	visitTableConstraint(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#primaryKeyConstraint.
	visitPrimaryKeyConstraint(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#foreignKeyConstraint.
	visitForeignKeyConstraint(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#tableConstraintName.
	visitTableConstraintName(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#keyNameList.
	visitKeyNameList(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#foreignKeyConstraintOptions.
	visitForeignKeyConstraintOptions(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#constraintOptions.
	visitConstraintOptions(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#columnConstraint.
	visitColumnConstraint(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#columnConstraintType.
	visitColumnConstraintType(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#columnGeneratedAs.
	visitColumnGeneratedAs(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#generatedAsExpression.
	visitGeneratedAsExpression(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#generatedAsIdentity.
	visitGeneratedAsIdentity(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#complexColTypeList.
	visitComplexColTypeList(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#complexColType.
	visitComplexColType(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#whenClause.
	visitWhenClause(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#windowClause.
	visitWindowClause(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#namedWindow.
	visitNamedWindow(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#windowRef.
	visitWindowRef(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#windowDef.
	visitWindowDef(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#windowFrame.
	visitWindowFrame(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#frameBound.
	visitFrameBound(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#qualifiedNameList.
	visitQualifiedNameList(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#functionName.
	visitFunctionName(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#qualifiedName.
	visitQualifiedName(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#errorCapturingIdentifier.
	visitErrorCapturingIdentifier(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#errorIdent.
	visitErrorIdent(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#realIdent.
	visitRealIdent(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#identifier.
	visitIdentifier(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#unquotedIdentifier.
	visitUnquotedIdentifier(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#quotedIdentifierAlternative.
	visitQuotedIdentifierAlternative(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#quotedIdentifier.
	visitQuotedIdentifier(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#exponentLiteral.
	visitExponentLiteral(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#decimalLiteral.
	visitDecimalLiteral(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#legacyDecimalLiteral.
	visitLegacyDecimalLiteral(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#integerLiteral.
	visitIntegerLiteral(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#bigIntLiteral.
	visitBigIntLiteral(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#smallIntLiteral.
	visitSmallIntLiteral(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#tinyIntLiteral.
	visitTinyIntLiteral(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#doubleLiteral.
	visitDoubleLiteral(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#floatLiteral.
	visitFloatLiteral(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#bigDecimalLiteral.
	visitBigDecimalLiteral(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#alterColumnAction.
	visitAlterColumnAction(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#ansiNonReserved.
	visitAnsiNonReserved(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#strictNonReserved.
	visitStrictNonReserved(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by SqlBaseParser#nonReserved.
	visitNonReserved(ctx) {
	  return this.visitChildren(ctx);
	}
}

module.exports = { SqlBaseVisitor };
