// Generated from grammars/HiveParser.g4 by ANTLR 4.7.2
// jshint ignore: start
var antlr4 = require('antlr4/index');

// This class defines a complete generic visitor for a parse tree produced by HiveParser.

function HiveParserVisitor() {
	antlr4.tree.ParseTreeVisitor.call(this);
	return this;
}

HiveParserVisitor.prototype = Object.create(antlr4.tree.ParseTreeVisitor.prototype);
HiveParserVisitor.prototype.constructor = HiveParserVisitor;

// Visit a parse tree produced by HiveParser#statements.
HiveParserVisitor.prototype.visitStatements = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#statementSeparator.
HiveParserVisitor.prototype.visitStatementSeparator = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#empty.
HiveParserVisitor.prototype.visitEmpty = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#statement.
HiveParserVisitor.prototype.visitStatement = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#explainStatement.
HiveParserVisitor.prototype.visitExplainStatement = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#explainOption.
HiveParserVisitor.prototype.visitExplainOption = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#vectorizationOnly.
HiveParserVisitor.prototype.visitVectorizationOnly = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#vectorizatonDetail.
HiveParserVisitor.prototype.visitVectorizatonDetail = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#execStatement.
HiveParserVisitor.prototype.visitExecStatement = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#loadStatement.
HiveParserVisitor.prototype.visitLoadStatement = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#replicationClause.
HiveParserVisitor.prototype.visitReplicationClause = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#exportStatement.
HiveParserVisitor.prototype.visitExportStatement = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#importStatement.
HiveParserVisitor.prototype.visitImportStatement = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#replDumpStatement.
HiveParserVisitor.prototype.visitReplDumpStatement = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#replLoadStatement.
HiveParserVisitor.prototype.visitReplLoadStatement = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#replConfigs.
HiveParserVisitor.prototype.visitReplConfigs = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#replConfigsList.
HiveParserVisitor.prototype.visitReplConfigsList = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#replStatusStatement.
HiveParserVisitor.prototype.visitReplStatusStatement = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#ddlStatement.
HiveParserVisitor.prototype.visitDdlStatement = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#ifExists.
HiveParserVisitor.prototype.visitIfExists = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#restrictOrCascade.
HiveParserVisitor.prototype.visitRestrictOrCascade = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#ifNotExists.
HiveParserVisitor.prototype.visitIfNotExists = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#rewriteEnabled.
HiveParserVisitor.prototype.visitRewriteEnabled = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#rewriteDisabled.
HiveParserVisitor.prototype.visitRewriteDisabled = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#storedAsDirs.
HiveParserVisitor.prototype.visitStoredAsDirs = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#orReplace.
HiveParserVisitor.prototype.visitOrReplace = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#createDatabaseStatement.
HiveParserVisitor.prototype.visitCreateDatabaseStatement = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#dbLocation.
HiveParserVisitor.prototype.visitDbLocation = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#dbProperties.
HiveParserVisitor.prototype.visitDbProperties = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#dbPropertiesList.
HiveParserVisitor.prototype.visitDbPropertiesList = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#switchDatabaseStatement.
HiveParserVisitor.prototype.visitSwitchDatabaseStatement = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#dropDatabaseStatement.
HiveParserVisitor.prototype.visitDropDatabaseStatement = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#databaseComment.
HiveParserVisitor.prototype.visitDatabaseComment = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#createTableStatement.
HiveParserVisitor.prototype.visitCreateTableStatement = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#truncateTableStatement.
HiveParserVisitor.prototype.visitTruncateTableStatement = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#dropTableStatement.
HiveParserVisitor.prototype.visitDropTableStatement = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#alterStatement.
HiveParserVisitor.prototype.visitAlterStatement = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#alterTableStatementSuffix.
HiveParserVisitor.prototype.visitAlterTableStatementSuffix = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#alterTblPartitionStatementSuffix.
HiveParserVisitor.prototype.visitAlterTblPartitionStatementSuffix = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#alterStatementPartitionKeyType.
HiveParserVisitor.prototype.visitAlterStatementPartitionKeyType = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#alterViewStatementSuffix.
HiveParserVisitor.prototype.visitAlterViewStatementSuffix = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#alterMaterializedViewStatementSuffix.
HiveParserVisitor.prototype.visitAlterMaterializedViewStatementSuffix = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#alterDatabaseStatementSuffix.
HiveParserVisitor.prototype.visitAlterDatabaseStatementSuffix = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#alterDatabaseSuffixProperties.
HiveParserVisitor.prototype.visitAlterDatabaseSuffixProperties = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#alterDatabaseSuffixSetOwner.
HiveParserVisitor.prototype.visitAlterDatabaseSuffixSetOwner = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#alterDatabaseSuffixSetLocation.
HiveParserVisitor.prototype.visitAlterDatabaseSuffixSetLocation = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#alterStatementSuffixRename.
HiveParserVisitor.prototype.visitAlterStatementSuffixRename = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#alterStatementSuffixAddCol.
HiveParserVisitor.prototype.visitAlterStatementSuffixAddCol = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#alterStatementSuffixAddConstraint.
HiveParserVisitor.prototype.visitAlterStatementSuffixAddConstraint = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#alterStatementSuffixUpdateColumns.
HiveParserVisitor.prototype.visitAlterStatementSuffixUpdateColumns = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#alterStatementSuffixDropConstraint.
HiveParserVisitor.prototype.visitAlterStatementSuffixDropConstraint = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#alterStatementSuffixRenameCol.
HiveParserVisitor.prototype.visitAlterStatementSuffixRenameCol = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#alterStatementSuffixUpdateStatsCol.
HiveParserVisitor.prototype.visitAlterStatementSuffixUpdateStatsCol = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#alterStatementSuffixUpdateStats.
HiveParserVisitor.prototype.visitAlterStatementSuffixUpdateStats = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#alterStatementChangeColPosition.
HiveParserVisitor.prototype.visitAlterStatementChangeColPosition = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#alterStatementSuffixAddPartitions.
HiveParserVisitor.prototype.visitAlterStatementSuffixAddPartitions = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#alterStatementSuffixAddPartitionsElement.
HiveParserVisitor.prototype.visitAlterStatementSuffixAddPartitionsElement = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#alterStatementSuffixTouch.
HiveParserVisitor.prototype.visitAlterStatementSuffixTouch = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#alterStatementSuffixArchive.
HiveParserVisitor.prototype.visitAlterStatementSuffixArchive = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#alterStatementSuffixUnArchive.
HiveParserVisitor.prototype.visitAlterStatementSuffixUnArchive = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#partitionLocation.
HiveParserVisitor.prototype.visitPartitionLocation = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#alterStatementSuffixDropPartitions.
HiveParserVisitor.prototype.visitAlterStatementSuffixDropPartitions = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#alterStatementSuffixProperties.
HiveParserVisitor.prototype.visitAlterStatementSuffixProperties = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#alterViewSuffixProperties.
HiveParserVisitor.prototype.visitAlterViewSuffixProperties = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#alterMaterializedViewSuffixRewrite.
HiveParserVisitor.prototype.visitAlterMaterializedViewSuffixRewrite = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#alterMaterializedViewSuffixRebuild.
HiveParserVisitor.prototype.visitAlterMaterializedViewSuffixRebuild = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#alterStatementSuffixSerdeProperties.
HiveParserVisitor.prototype.visitAlterStatementSuffixSerdeProperties = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#alterIndexStatementSuffix.
HiveParserVisitor.prototype.visitAlterIndexStatementSuffix = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#alterStatementSuffixFileFormat.
HiveParserVisitor.prototype.visitAlterStatementSuffixFileFormat = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#alterStatementSuffixClusterbySortby.
HiveParserVisitor.prototype.visitAlterStatementSuffixClusterbySortby = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#alterTblPartitionStatementSuffixSkewedLocation.
HiveParserVisitor.prototype.visitAlterTblPartitionStatementSuffixSkewedLocation = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#skewedLocations.
HiveParserVisitor.prototype.visitSkewedLocations = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#skewedLocationsList.
HiveParserVisitor.prototype.visitSkewedLocationsList = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#skewedLocationMap.
HiveParserVisitor.prototype.visitSkewedLocationMap = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#alterStatementSuffixLocation.
HiveParserVisitor.prototype.visitAlterStatementSuffixLocation = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#alterStatementSuffixSkewedby.
HiveParserVisitor.prototype.visitAlterStatementSuffixSkewedby = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#alterStatementSuffixExchangePartition.
HiveParserVisitor.prototype.visitAlterStatementSuffixExchangePartition = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#alterStatementSuffixRenamePart.
HiveParserVisitor.prototype.visitAlterStatementSuffixRenamePart = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#alterStatementSuffixStatsPart.
HiveParserVisitor.prototype.visitAlterStatementSuffixStatsPart = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#alterStatementSuffixMergeFiles.
HiveParserVisitor.prototype.visitAlterStatementSuffixMergeFiles = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#alterStatementSuffixBucketNum.
HiveParserVisitor.prototype.visitAlterStatementSuffixBucketNum = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#createIndexStatement.
HiveParserVisitor.prototype.visitCreateIndexStatement = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#createIndexMainStatement.
HiveParserVisitor.prototype.visitCreateIndexMainStatement = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#dropIndexStatement.
HiveParserVisitor.prototype.visitDropIndexStatement = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#tablePartitionPrefix.
HiveParserVisitor.prototype.visitTablePartitionPrefix = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#blocking.
HiveParserVisitor.prototype.visitBlocking = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#alterStatementSuffixCompact.
HiveParserVisitor.prototype.visitAlterStatementSuffixCompact = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#alterStatementSuffixSetOwner.
HiveParserVisitor.prototype.visitAlterStatementSuffixSetOwner = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#fileFormat.
HiveParserVisitor.prototype.visitFileFormat = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#inputFileFormat.
HiveParserVisitor.prototype.visitInputFileFormat = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#tabTypeExpr.
HiveParserVisitor.prototype.visitTabTypeExpr = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#partTypeExpr.
HiveParserVisitor.prototype.visitPartTypeExpr = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#tabPartColTypeExpr.
HiveParserVisitor.prototype.visitTabPartColTypeExpr = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#descStatement.
HiveParserVisitor.prototype.visitDescStatement = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#analyzeStatement.
HiveParserVisitor.prototype.visitAnalyzeStatement = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#showStatement.
HiveParserVisitor.prototype.visitShowStatement = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#lockStatement.
HiveParserVisitor.prototype.visitLockStatement = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#lockDatabase.
HiveParserVisitor.prototype.visitLockDatabase = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#lockMode.
HiveParserVisitor.prototype.visitLockMode = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#unlockStatement.
HiveParserVisitor.prototype.visitUnlockStatement = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#unlockDatabase.
HiveParserVisitor.prototype.visitUnlockDatabase = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#createRoleStatement.
HiveParserVisitor.prototype.visitCreateRoleStatement = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#dropRoleStatement.
HiveParserVisitor.prototype.visitDropRoleStatement = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#grantPrivileges.
HiveParserVisitor.prototype.visitGrantPrivileges = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#revokePrivileges.
HiveParserVisitor.prototype.visitRevokePrivileges = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#grantRole.
HiveParserVisitor.prototype.visitGrantRole = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#revokeRole.
HiveParserVisitor.prototype.visitRevokeRole = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#showRoleGrants.
HiveParserVisitor.prototype.visitShowRoleGrants = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#showRoles.
HiveParserVisitor.prototype.visitShowRoles = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#showCurrentRole.
HiveParserVisitor.prototype.visitShowCurrentRole = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#setRole.
HiveParserVisitor.prototype.visitSetRole = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#showGrants.
HiveParserVisitor.prototype.visitShowGrants = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#showRolePrincipals.
HiveParserVisitor.prototype.visitShowRolePrincipals = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#privilegeIncludeColObject.
HiveParserVisitor.prototype.visitPrivilegeIncludeColObject = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#privilegeObject.
HiveParserVisitor.prototype.visitPrivilegeObject = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#privObject.
HiveParserVisitor.prototype.visitPrivObject = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#privObjectCols.
HiveParserVisitor.prototype.visitPrivObjectCols = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#privilegeList.
HiveParserVisitor.prototype.visitPrivilegeList = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#privlegeDef.
HiveParserVisitor.prototype.visitPrivlegeDef = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#privilegeType.
HiveParserVisitor.prototype.visitPrivilegeType = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#principalSpecification.
HiveParserVisitor.prototype.visitPrincipalSpecification = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#principalName.
HiveParserVisitor.prototype.visitPrincipalName = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#withGrantOption.
HiveParserVisitor.prototype.visitWithGrantOption = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#grantOptionFor.
HiveParserVisitor.prototype.visitGrantOptionFor = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#adminOptionFor.
HiveParserVisitor.prototype.visitAdminOptionFor = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#withAdminOption.
HiveParserVisitor.prototype.visitWithAdminOption = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#metastoreCheck.
HiveParserVisitor.prototype.visitMetastoreCheck = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#resourceList.
HiveParserVisitor.prototype.visitResourceList = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#resource.
HiveParserVisitor.prototype.visitResource = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#resourceType.
HiveParserVisitor.prototype.visitResourceType = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#createFunctionStatement.
HiveParserVisitor.prototype.visitCreateFunctionStatement = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#dropFunctionStatement.
HiveParserVisitor.prototype.visitDropFunctionStatement = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#reloadFunctionStatement.
HiveParserVisitor.prototype.visitReloadFunctionStatement = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#createMacroStatement.
HiveParserVisitor.prototype.visitCreateMacroStatement = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#dropMacroStatement.
HiveParserVisitor.prototype.visitDropMacroStatement = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#createViewStatement.
HiveParserVisitor.prototype.visitCreateViewStatement = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#createMaterializedViewStatement.
HiveParserVisitor.prototype.visitCreateMaterializedViewStatement = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#viewPartition.
HiveParserVisitor.prototype.visitViewPartition = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#dropViewStatement.
HiveParserVisitor.prototype.visitDropViewStatement = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#dropMaterializedViewStatement.
HiveParserVisitor.prototype.visitDropMaterializedViewStatement = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#showFunctionIdentifier.
HiveParserVisitor.prototype.visitShowFunctionIdentifier = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#showStmtIdentifier.
HiveParserVisitor.prototype.visitShowStmtIdentifier = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#tableComment.
HiveParserVisitor.prototype.visitTableComment = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#tablePartition.
HiveParserVisitor.prototype.visitTablePartition = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#tableBuckets.
HiveParserVisitor.prototype.visitTableBuckets = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#tableSkewed.
HiveParserVisitor.prototype.visitTableSkewed = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#rowFormat.
HiveParserVisitor.prototype.visitRowFormat = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#recordReader.
HiveParserVisitor.prototype.visitRecordReader = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#recordWriter.
HiveParserVisitor.prototype.visitRecordWriter = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#rowFormatSerde.
HiveParserVisitor.prototype.visitRowFormatSerde = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#rowFormatDelimited.
HiveParserVisitor.prototype.visitRowFormatDelimited = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#tableRowFormat.
HiveParserVisitor.prototype.visitTableRowFormat = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#tablePropertiesPrefixed.
HiveParserVisitor.prototype.visitTablePropertiesPrefixed = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#tableProperties.
HiveParserVisitor.prototype.visitTableProperties = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#tablePropertiesList.
HiveParserVisitor.prototype.visitTablePropertiesList = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#keyValueProperty.
HiveParserVisitor.prototype.visitKeyValueProperty = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#keyProperty.
HiveParserVisitor.prototype.visitKeyProperty = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#tableRowFormatFieldIdentifier.
HiveParserVisitor.prototype.visitTableRowFormatFieldIdentifier = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#tableRowFormatFieldIdentifierEcapedBy.
HiveParserVisitor.prototype.visitTableRowFormatFieldIdentifierEcapedBy = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#tableRowFormatCollItemsIdentifier.
HiveParserVisitor.prototype.visitTableRowFormatCollItemsIdentifier = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#tableRowFormatMapKeysIdentifier.
HiveParserVisitor.prototype.visitTableRowFormatMapKeysIdentifier = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#tableRowFormatLinesIdentifier.
HiveParserVisitor.prototype.visitTableRowFormatLinesIdentifier = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#tableRowNullFormat.
HiveParserVisitor.prototype.visitTableRowNullFormat = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#tableFileFormat.
HiveParserVisitor.prototype.visitTableFileFormat = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#tableFileFormatStoredBy.
HiveParserVisitor.prototype.visitTableFileFormatStoredBy = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#tableFileFormatStoredAs.
HiveParserVisitor.prototype.visitTableFileFormatStoredAs = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#tableFileFormatStoredAsFormat.
HiveParserVisitor.prototype.visitTableFileFormatStoredAsFormat = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#tableInputOutputFileFormat.
HiveParserVisitor.prototype.visitTableInputOutputFileFormat = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#tableInputLiteral.
HiveParserVisitor.prototype.visitTableInputLiteral = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#tableOutputLiteral.
HiveParserVisitor.prototype.visitTableOutputLiteral = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#tableLocation.
HiveParserVisitor.prototype.visitTableLocation = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#columnNameTypeList.
HiveParserVisitor.prototype.visitColumnNameTypeList = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#columnNameTypeOrConstraintList.
HiveParserVisitor.prototype.visitColumnNameTypeOrConstraintList = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#columnNameColonTypeList.
HiveParserVisitor.prototype.visitColumnNameColonTypeList = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#columnNameList.
HiveParserVisitor.prototype.visitColumnNameList = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#columnName.
HiveParserVisitor.prototype.visitColumnName = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#extColumnName.
HiveParserVisitor.prototype.visitExtColumnName = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#columnNameOrderList.
HiveParserVisitor.prototype.visitColumnNameOrderList = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#columnParenthesesList.
HiveParserVisitor.prototype.visitColumnParenthesesList = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#enableValidateSpecification.
HiveParserVisitor.prototype.visitEnableValidateSpecification = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#enableSpecification.
HiveParserVisitor.prototype.visitEnableSpecification = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#validateSpecification.
HiveParserVisitor.prototype.visitValidateSpecification = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#enforcedSpecification.
HiveParserVisitor.prototype.visitEnforcedSpecification = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#relySpecification.
HiveParserVisitor.prototype.visitRelySpecification = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#createConstraint.
HiveParserVisitor.prototype.visitCreateConstraint = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#alterConstraintWithName.
HiveParserVisitor.prototype.visitAlterConstraintWithName = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#tableLevelConstraint.
HiveParserVisitor.prototype.visitTableLevelConstraint = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#pkUkConstraint.
HiveParserVisitor.prototype.visitPkUkConstraint = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#checkConstraint.
HiveParserVisitor.prototype.visitCheckConstraint = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#createForeignKey.
HiveParserVisitor.prototype.visitCreateForeignKey = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#alterForeignKeyWithName.
HiveParserVisitor.prototype.visitAlterForeignKeyWithName = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#skewedValueElement.
HiveParserVisitor.prototype.visitSkewedValueElement = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#skewedColumnValuePairList.
HiveParserVisitor.prototype.visitSkewedColumnValuePairList = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#skewedColumnValuePair.
HiveParserVisitor.prototype.visitSkewedColumnValuePair = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#skewedColumnValues.
HiveParserVisitor.prototype.visitSkewedColumnValues = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#skewedColumnValue.
HiveParserVisitor.prototype.visitSkewedColumnValue = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#skewedValueLocationElement.
HiveParserVisitor.prototype.visitSkewedValueLocationElement = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#orderSpecification.
HiveParserVisitor.prototype.visitOrderSpecification = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#nullOrdering.
HiveParserVisitor.prototype.visitNullOrdering = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#columnNameOrder.
HiveParserVisitor.prototype.visitColumnNameOrder = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#columnNameCommentList.
HiveParserVisitor.prototype.visitColumnNameCommentList = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#columnNameComment.
HiveParserVisitor.prototype.visitColumnNameComment = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#columnRefOrder.
HiveParserVisitor.prototype.visitColumnRefOrder = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#columnNameType.
HiveParserVisitor.prototype.visitColumnNameType = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#columnNameTypeOrConstraint.
HiveParserVisitor.prototype.visitColumnNameTypeOrConstraint = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#tableConstraint.
HiveParserVisitor.prototype.visitTableConstraint = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#columnNameTypeConstraint.
HiveParserVisitor.prototype.visitColumnNameTypeConstraint = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#columnConstraint.
HiveParserVisitor.prototype.visitColumnConstraint = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#foreignKeyConstraint.
HiveParserVisitor.prototype.visitForeignKeyConstraint = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#colConstraint.
HiveParserVisitor.prototype.visitColConstraint = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#alterColumnConstraint.
HiveParserVisitor.prototype.visitAlterColumnConstraint = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#alterForeignKeyConstraint.
HiveParserVisitor.prototype.visitAlterForeignKeyConstraint = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#alterColConstraint.
HiveParserVisitor.prototype.visitAlterColConstraint = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#columnConstraintType.
HiveParserVisitor.prototype.visitColumnConstraintType = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#defaultVal.
HiveParserVisitor.prototype.visitDefaultVal = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#tableConstraintType.
HiveParserVisitor.prototype.visitTableConstraintType = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#constraintOptsCreate.
HiveParserVisitor.prototype.visitConstraintOptsCreate = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#constraintOptsAlter.
HiveParserVisitor.prototype.visitConstraintOptsAlter = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#columnNameColonType.
HiveParserVisitor.prototype.visitColumnNameColonType = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#colType.
HiveParserVisitor.prototype.visitColType = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#colTypeList.
HiveParserVisitor.prototype.visitColTypeList = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#type_db_col.
HiveParserVisitor.prototype.visitType_db_col = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#primitiveType.
HiveParserVisitor.prototype.visitPrimitiveType = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#listType.
HiveParserVisitor.prototype.visitListType = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#structType.
HiveParserVisitor.prototype.visitStructType = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#mapType.
HiveParserVisitor.prototype.visitMapType = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#unionType.
HiveParserVisitor.prototype.visitUnionType = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#setOperator.
HiveParserVisitor.prototype.visitSetOperator = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#queryStatementExpression.
HiveParserVisitor.prototype.visitQueryStatementExpression = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#queryStatementExpressionBody.
HiveParserVisitor.prototype.visitQueryStatementExpressionBody = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#withClause.
HiveParserVisitor.prototype.visitWithClause = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#cteStatement.
HiveParserVisitor.prototype.visitCteStatement = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#fromStatement.
HiveParserVisitor.prototype.visitFromStatement = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#singleFromStatement.
HiveParserVisitor.prototype.visitSingleFromStatement = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#regularBody.
HiveParserVisitor.prototype.visitRegularBody = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#atomSelectStatement.
HiveParserVisitor.prototype.visitAtomSelectStatement = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#selectStatement.
HiveParserVisitor.prototype.visitSelectStatement = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#setOpSelectStatement.
HiveParserVisitor.prototype.visitSetOpSelectStatement = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#selectStatementWithCTE.
HiveParserVisitor.prototype.visitSelectStatementWithCTE = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#body.
HiveParserVisitor.prototype.visitBody = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#insertClause.
HiveParserVisitor.prototype.visitInsertClause = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#destination.
HiveParserVisitor.prototype.visitDestination = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#limitClause.
HiveParserVisitor.prototype.visitLimitClause = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#deleteStatement.
HiveParserVisitor.prototype.visitDeleteStatement = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#columnAssignmentClause.
HiveParserVisitor.prototype.visitColumnAssignmentClause = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#setColumnsClause.
HiveParserVisitor.prototype.visitSetColumnsClause = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#updateStatement.
HiveParserVisitor.prototype.visitUpdateStatement = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#sqlTransactionStatement.
HiveParserVisitor.prototype.visitSqlTransactionStatement = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#startTransactionStatement.
HiveParserVisitor.prototype.visitStartTransactionStatement = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#transactionMode.
HiveParserVisitor.prototype.visitTransactionMode = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#transactionAccessMode.
HiveParserVisitor.prototype.visitTransactionAccessMode = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#isolationLevel.
HiveParserVisitor.prototype.visitIsolationLevel = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#levelOfIsolation.
HiveParserVisitor.prototype.visitLevelOfIsolation = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#commitStatement.
HiveParserVisitor.prototype.visitCommitStatement = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#rollbackStatement.
HiveParserVisitor.prototype.visitRollbackStatement = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#setAutoCommitStatement.
HiveParserVisitor.prototype.visitSetAutoCommitStatement = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#abortTransactionStatement.
HiveParserVisitor.prototype.visitAbortTransactionStatement = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#mergeStatement.
HiveParserVisitor.prototype.visitMergeStatement = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#whenClauses.
HiveParserVisitor.prototype.visitWhenClauses = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#whenNotMatchedClause.
HiveParserVisitor.prototype.visitWhenNotMatchedClause = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#whenMatchedAndClause.
HiveParserVisitor.prototype.visitWhenMatchedAndClause = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#whenMatchedThenClause.
HiveParserVisitor.prototype.visitWhenMatchedThenClause = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#updateOrDelete.
HiveParserVisitor.prototype.visitUpdateOrDelete = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#killQueryStatement.
HiveParserVisitor.prototype.visitKillQueryStatement = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#selectClause.
HiveParserVisitor.prototype.visitSelectClause = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#selectList.
HiveParserVisitor.prototype.visitSelectList = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#selectTrfmClause.
HiveParserVisitor.prototype.visitSelectTrfmClause = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#selectItem.
HiveParserVisitor.prototype.visitSelectItem = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#trfmClause.
HiveParserVisitor.prototype.visitTrfmClause = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#selectExpression.
HiveParserVisitor.prototype.visitSelectExpression = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#selectExpressionList.
HiveParserVisitor.prototype.visitSelectExpressionList = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#window_clause.
HiveParserVisitor.prototype.visitWindow_clause = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#window_defn.
HiveParserVisitor.prototype.visitWindow_defn = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#window_specification.
HiveParserVisitor.prototype.visitWindow_specification = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#window_frame.
HiveParserVisitor.prototype.visitWindow_frame = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#window_range_expression.
HiveParserVisitor.prototype.visitWindow_range_expression = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#window_value_expression.
HiveParserVisitor.prototype.visitWindow_value_expression = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#window_frame_start_boundary.
HiveParserVisitor.prototype.visitWindow_frame_start_boundary = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#window_frame_boundary.
HiveParserVisitor.prototype.visitWindow_frame_boundary = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#tableAllColumns.
HiveParserVisitor.prototype.visitTableAllColumns = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#tableOrColumn.
HiveParserVisitor.prototype.visitTableOrColumn = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#expressionList.
HiveParserVisitor.prototype.visitExpressionList = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#aliasList.
HiveParserVisitor.prototype.visitAliasList = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#fromClause.
HiveParserVisitor.prototype.visitFromClause = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#fromSource.
HiveParserVisitor.prototype.visitFromSource = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#atomjoinSource.
HiveParserVisitor.prototype.visitAtomjoinSource = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#joinSource.
HiveParserVisitor.prototype.visitJoinSource = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#joinSourcePart.
HiveParserVisitor.prototype.visitJoinSourcePart = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#uniqueJoinSource.
HiveParserVisitor.prototype.visitUniqueJoinSource = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#uniqueJoinExpr.
HiveParserVisitor.prototype.visitUniqueJoinExpr = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#uniqueJoinToken.
HiveParserVisitor.prototype.visitUniqueJoinToken = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#joinToken.
HiveParserVisitor.prototype.visitJoinToken = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#lateralView.
HiveParserVisitor.prototype.visitLateralView = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#tableAlias.
HiveParserVisitor.prototype.visitTableAlias = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#tableBucketSample.
HiveParserVisitor.prototype.visitTableBucketSample = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#splitSample.
HiveParserVisitor.prototype.visitSplitSample = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#tableSample.
HiveParserVisitor.prototype.visitTableSample = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#tableSource.
HiveParserVisitor.prototype.visitTableSource = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#uniqueJoinTableSource.
HiveParserVisitor.prototype.visitUniqueJoinTableSource = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#tableName.
HiveParserVisitor.prototype.visitTableName = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#viewName.
HiveParserVisitor.prototype.visitViewName = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#subQuerySource.
HiveParserVisitor.prototype.visitSubQuerySource = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#partitioningSpec.
HiveParserVisitor.prototype.visitPartitioningSpec = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#partitionTableFunctionSource.
HiveParserVisitor.prototype.visitPartitionTableFunctionSource = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#partitionedTableFunction.
HiveParserVisitor.prototype.visitPartitionedTableFunction = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#whereClause.
HiveParserVisitor.prototype.visitWhereClause = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#searchCondition.
HiveParserVisitor.prototype.visitSearchCondition = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#valuesClause.
HiveParserVisitor.prototype.visitValuesClause = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#valuesTableConstructor.
HiveParserVisitor.prototype.visitValuesTableConstructor = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#valueRowConstructor.
HiveParserVisitor.prototype.visitValueRowConstructor = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#virtualTableSource.
HiveParserVisitor.prototype.visitVirtualTableSource = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#groupByClause.
HiveParserVisitor.prototype.visitGroupByClause = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#groupby_expression.
HiveParserVisitor.prototype.visitGroupby_expression = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#groupByEmpty.
HiveParserVisitor.prototype.visitGroupByEmpty = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#rollupStandard.
HiveParserVisitor.prototype.visitRollupStandard = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#rollupOldSyntax.
HiveParserVisitor.prototype.visitRollupOldSyntax = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#groupingSetExpression.
HiveParserVisitor.prototype.visitGroupingSetExpression = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#groupingSetExpressionMultiple.
HiveParserVisitor.prototype.visitGroupingSetExpressionMultiple = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#groupingExpressionSingle.
HiveParserVisitor.prototype.visitGroupingExpressionSingle = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#havingClause.
HiveParserVisitor.prototype.visitHavingClause = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#havingCondition.
HiveParserVisitor.prototype.visitHavingCondition = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#expressionsInParenthesis.
HiveParserVisitor.prototype.visitExpressionsInParenthesis = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#expressionsNotInParenthesis.
HiveParserVisitor.prototype.visitExpressionsNotInParenthesis = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#expressionPart.
HiveParserVisitor.prototype.visitExpressionPart = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#expressions.
HiveParserVisitor.prototype.visitExpressions = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#columnRefOrderInParenthesis.
HiveParserVisitor.prototype.visitColumnRefOrderInParenthesis = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#columnRefOrderNotInParenthesis.
HiveParserVisitor.prototype.visitColumnRefOrderNotInParenthesis = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#orderByClause.
HiveParserVisitor.prototype.visitOrderByClause = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#clusterByClause.
HiveParserVisitor.prototype.visitClusterByClause = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#partitionByClause.
HiveParserVisitor.prototype.visitPartitionByClause = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#distributeByClause.
HiveParserVisitor.prototype.visitDistributeByClause = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#sortByClause.
HiveParserVisitor.prototype.visitSortByClause = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#functionStatement.
HiveParserVisitor.prototype.visitFunctionStatement = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#functionName.
HiveParserVisitor.prototype.visitFunctionName = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#castExpression.
HiveParserVisitor.prototype.visitCastExpression = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#caseExpression.
HiveParserVisitor.prototype.visitCaseExpression = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#whenExpression.
HiveParserVisitor.prototype.visitWhenExpression = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#floorExpression.
HiveParserVisitor.prototype.visitFloorExpression = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#floorDateQualifiers.
HiveParserVisitor.prototype.visitFloorDateQualifiers = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#extractExpression.
HiveParserVisitor.prototype.visitExtractExpression = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#timeQualifiers.
HiveParserVisitor.prototype.visitTimeQualifiers = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#constant.
HiveParserVisitor.prototype.visitConstant = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#stringLiteralSequence.
HiveParserVisitor.prototype.visitStringLiteralSequence = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#charSetStringLiteral.
HiveParserVisitor.prototype.visitCharSetStringLiteral = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#dateLiteral.
HiveParserVisitor.prototype.visitDateLiteral = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#timestampLiteral.
HiveParserVisitor.prototype.visitTimestampLiteral = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#timestampLocalTZLiteral.
HiveParserVisitor.prototype.visitTimestampLocalTZLiteral = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#intervalValue.
HiveParserVisitor.prototype.visitIntervalValue = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#intervalLiteral.
HiveParserVisitor.prototype.visitIntervalLiteral = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#intervalExpression.
HiveParserVisitor.prototype.visitIntervalExpression = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#intervalQualifiers.
HiveParserVisitor.prototype.visitIntervalQualifiers = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#atomExpression.
HiveParserVisitor.prototype.visitAtomExpression = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#precedenceUnaryOperator.
HiveParserVisitor.prototype.visitPrecedenceUnaryOperator = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#isCondition.
HiveParserVisitor.prototype.visitIsCondition = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#precedenceBitwiseXorOperator.
HiveParserVisitor.prototype.visitPrecedenceBitwiseXorOperator = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#precedenceStarOperator.
HiveParserVisitor.prototype.visitPrecedenceStarOperator = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#precedencePlusOperator.
HiveParserVisitor.prototype.visitPrecedencePlusOperator = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#precedenceConcatenateOperator.
HiveParserVisitor.prototype.visitPrecedenceConcatenateOperator = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#precedenceAmpersandOperator.
HiveParserVisitor.prototype.visitPrecedenceAmpersandOperator = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#precedenceBitwiseOrOperator.
HiveParserVisitor.prototype.visitPrecedenceBitwiseOrOperator = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#precedenceRegexpOperator.
HiveParserVisitor.prototype.visitPrecedenceRegexpOperator = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#precedenceSimilarOperator.
HiveParserVisitor.prototype.visitPrecedenceSimilarOperator = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#precedenceDistinctOperator.
HiveParserVisitor.prototype.visitPrecedenceDistinctOperator = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#precedenceEqualOperator.
HiveParserVisitor.prototype.visitPrecedenceEqualOperator = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#precedenceNotOperator.
HiveParserVisitor.prototype.visitPrecedenceNotOperator = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#precedenceAndOperator.
HiveParserVisitor.prototype.visitPrecedenceAndOperator = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#precedenceOrOperator.
HiveParserVisitor.prototype.visitPrecedenceOrOperator = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#expression.
HiveParserVisitor.prototype.visitExpression = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#subQueryExpression.
HiveParserVisitor.prototype.visitSubQueryExpression = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#precedenceSimilarExpressionPart.
HiveParserVisitor.prototype.visitPrecedenceSimilarExpressionPart = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#precedenceSimilarExpressionAtom.
HiveParserVisitor.prototype.visitPrecedenceSimilarExpressionAtom = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#precedenceSimilarExpressionIn.
HiveParserVisitor.prototype.visitPrecedenceSimilarExpressionIn = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#precedenceSimilarExpressionPartNot.
HiveParserVisitor.prototype.visitPrecedenceSimilarExpressionPartNot = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#booleanValue.
HiveParserVisitor.prototype.visitBooleanValue = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#booleanValueTok.
HiveParserVisitor.prototype.visitBooleanValueTok = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#tableOrPartition.
HiveParserVisitor.prototype.visitTableOrPartition = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#partitionSpec.
HiveParserVisitor.prototype.visitPartitionSpec = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#partitionVal.
HiveParserVisitor.prototype.visitPartitionVal = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#dropPartitionSpec.
HiveParserVisitor.prototype.visitDropPartitionSpec = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#dropPartitionVal.
HiveParserVisitor.prototype.visitDropPartitionVal = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#dropPartitionOperator.
HiveParserVisitor.prototype.visitDropPartitionOperator = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#sysFuncNames.
HiveParserVisitor.prototype.visitSysFuncNames = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#descFuncNames.
HiveParserVisitor.prototype.visitDescFuncNames = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#identifier.
HiveParserVisitor.prototype.visitIdentifier = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#functionIdentifier.
HiveParserVisitor.prototype.visitFunctionIdentifier = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#principalIdentifier.
HiveParserVisitor.prototype.visitPrincipalIdentifier = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#nonReserved.
HiveParserVisitor.prototype.visitNonReserved = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#sql11ReservedKeywordsUsedAsFunctionName.
HiveParserVisitor.prototype.visitSql11ReservedKeywordsUsedAsFunctionName = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#resourcePlanDdlStatements.
HiveParserVisitor.prototype.visitResourcePlanDdlStatements = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#rpAssign.
HiveParserVisitor.prototype.visitRpAssign = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#rpAssignList.
HiveParserVisitor.prototype.visitRpAssignList = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#rpUnassign.
HiveParserVisitor.prototype.visitRpUnassign = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#rpUnassignList.
HiveParserVisitor.prototype.visitRpUnassignList = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#createResourcePlanStatement.
HiveParserVisitor.prototype.visitCreateResourcePlanStatement = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#createResourcePlanStatementLikeExisting.
HiveParserVisitor.prototype.visitCreateResourcePlanStatementLikeExisting = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#createNewResourcePlanStatement.
HiveParserVisitor.prototype.visitCreateNewResourcePlanStatement = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#withReplace.
HiveParserVisitor.prototype.visitWithReplace = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#activate.
HiveParserVisitor.prototype.visitActivate = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#enable.
HiveParserVisitor.prototype.visitEnable = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#disable.
HiveParserVisitor.prototype.visitDisable = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#unmanaged.
HiveParserVisitor.prototype.visitUnmanaged = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#alterResourcePlanStatement.
HiveParserVisitor.prototype.visitAlterResourcePlanStatement = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#alterResourcePlanRenameSuffix.
HiveParserVisitor.prototype.visitAlterResourcePlanRenameSuffix = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#globalWmStatement.
HiveParserVisitor.prototype.visitGlobalWmStatement = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#replaceResourcePlanStatement.
HiveParserVisitor.prototype.visitReplaceResourcePlanStatement = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#dropResourcePlanStatement.
HiveParserVisitor.prototype.visitDropResourcePlanStatement = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#poolPath.
HiveParserVisitor.prototype.visitPoolPath = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#triggerExpression.
HiveParserVisitor.prototype.visitTriggerExpression = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#triggerExpressionStandalone.
HiveParserVisitor.prototype.visitTriggerExpressionStandalone = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#triggerOrExpression.
HiveParserVisitor.prototype.visitTriggerOrExpression = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#triggerAndExpression.
HiveParserVisitor.prototype.visitTriggerAndExpression = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#triggerAtomExpression.
HiveParserVisitor.prototype.visitTriggerAtomExpression = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#triggerLiteral.
HiveParserVisitor.prototype.visitTriggerLiteral = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#comparisionOperator.
HiveParserVisitor.prototype.visitComparisionOperator = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#triggerActionExpression.
HiveParserVisitor.prototype.visitTriggerActionExpression = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#triggerActionExpressionStandalone.
HiveParserVisitor.prototype.visitTriggerActionExpressionStandalone = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#createTriggerStatement.
HiveParserVisitor.prototype.visitCreateTriggerStatement = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#alterTriggerStatement.
HiveParserVisitor.prototype.visitAlterTriggerStatement = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#triggerConditionExpression.
HiveParserVisitor.prototype.visitTriggerConditionExpression = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#dropTriggerStatement.
HiveParserVisitor.prototype.visitDropTriggerStatement = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#poolAssign.
HiveParserVisitor.prototype.visitPoolAssign = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#poolAssignList.
HiveParserVisitor.prototype.visitPoolAssignList = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#createPoolStatement.
HiveParserVisitor.prototype.visitCreatePoolStatement = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#alterPoolStatement.
HiveParserVisitor.prototype.visitAlterPoolStatement = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#dropPoolStatement.
HiveParserVisitor.prototype.visitDropPoolStatement = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#createMappingStatement.
HiveParserVisitor.prototype.visitCreateMappingStatement = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#alterMappingStatement.
HiveParserVisitor.prototype.visitAlterMappingStatement = function(ctx) {
  return this.visitChildren(ctx);
};


// Visit a parse tree produced by HiveParser#dropMappingStatement.
HiveParserVisitor.prototype.visitDropMappingStatement = function(ctx) {
  return this.visitChildren(ctx);
};



exports.HiveParserVisitor = HiveParserVisitor;