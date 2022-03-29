// Generated from grammars/HiveParser.g4 by ANTLR 4.7.2
// jshint ignore: start
var antlr4 = require('antlr4/index');

// This class defines a complete listener for a parse tree produced by HiveParser.
function HiveParserListener() {
	antlr4.tree.ParseTreeListener.call(this);
	return this;
}

HiveParserListener.prototype = Object.create(antlr4.tree.ParseTreeListener.prototype);
HiveParserListener.prototype.constructor = HiveParserListener;

// Enter a parse tree produced by HiveParser#statements.
HiveParserListener.prototype.enterStatements = function(ctx) {
};

// Exit a parse tree produced by HiveParser#statements.
HiveParserListener.prototype.exitStatements = function(ctx) {
};


// Enter a parse tree produced by HiveParser#statementSeparator.
HiveParserListener.prototype.enterStatementSeparator = function(ctx) {
};

// Exit a parse tree produced by HiveParser#statementSeparator.
HiveParserListener.prototype.exitStatementSeparator = function(ctx) {
};


// Enter a parse tree produced by HiveParser#empty.
HiveParserListener.prototype.enterEmpty = function(ctx) {
};

// Exit a parse tree produced by HiveParser#empty.
HiveParserListener.prototype.exitEmpty = function(ctx) {
};


// Enter a parse tree produced by HiveParser#statement.
HiveParserListener.prototype.enterStatement = function(ctx) {
};

// Exit a parse tree produced by HiveParser#statement.
HiveParserListener.prototype.exitStatement = function(ctx) {
};


// Enter a parse tree produced by HiveParser#explainStatement.
HiveParserListener.prototype.enterExplainStatement = function(ctx) {
};

// Exit a parse tree produced by HiveParser#explainStatement.
HiveParserListener.prototype.exitExplainStatement = function(ctx) {
};


// Enter a parse tree produced by HiveParser#explainOption.
HiveParserListener.prototype.enterExplainOption = function(ctx) {
};

// Exit a parse tree produced by HiveParser#explainOption.
HiveParserListener.prototype.exitExplainOption = function(ctx) {
};


// Enter a parse tree produced by HiveParser#vectorizationOnly.
HiveParserListener.prototype.enterVectorizationOnly = function(ctx) {
};

// Exit a parse tree produced by HiveParser#vectorizationOnly.
HiveParserListener.prototype.exitVectorizationOnly = function(ctx) {
};


// Enter a parse tree produced by HiveParser#vectorizatonDetail.
HiveParserListener.prototype.enterVectorizatonDetail = function(ctx) {
};

// Exit a parse tree produced by HiveParser#vectorizatonDetail.
HiveParserListener.prototype.exitVectorizatonDetail = function(ctx) {
};


// Enter a parse tree produced by HiveParser#execStatement.
HiveParserListener.prototype.enterExecStatement = function(ctx) {
};

// Exit a parse tree produced by HiveParser#execStatement.
HiveParserListener.prototype.exitExecStatement = function(ctx) {
};


// Enter a parse tree produced by HiveParser#loadStatement.
HiveParserListener.prototype.enterLoadStatement = function(ctx) {
};

// Exit a parse tree produced by HiveParser#loadStatement.
HiveParserListener.prototype.exitLoadStatement = function(ctx) {
};


// Enter a parse tree produced by HiveParser#replicationClause.
HiveParserListener.prototype.enterReplicationClause = function(ctx) {
};

// Exit a parse tree produced by HiveParser#replicationClause.
HiveParserListener.prototype.exitReplicationClause = function(ctx) {
};


// Enter a parse tree produced by HiveParser#exportStatement.
HiveParserListener.prototype.enterExportStatement = function(ctx) {
};

// Exit a parse tree produced by HiveParser#exportStatement.
HiveParserListener.prototype.exitExportStatement = function(ctx) {
};


// Enter a parse tree produced by HiveParser#importStatement.
HiveParserListener.prototype.enterImportStatement = function(ctx) {
};

// Exit a parse tree produced by HiveParser#importStatement.
HiveParserListener.prototype.exitImportStatement = function(ctx) {
};


// Enter a parse tree produced by HiveParser#replDumpStatement.
HiveParserListener.prototype.enterReplDumpStatement = function(ctx) {
};

// Exit a parse tree produced by HiveParser#replDumpStatement.
HiveParserListener.prototype.exitReplDumpStatement = function(ctx) {
};


// Enter a parse tree produced by HiveParser#replLoadStatement.
HiveParserListener.prototype.enterReplLoadStatement = function(ctx) {
};

// Exit a parse tree produced by HiveParser#replLoadStatement.
HiveParserListener.prototype.exitReplLoadStatement = function(ctx) {
};


// Enter a parse tree produced by HiveParser#replConfigs.
HiveParserListener.prototype.enterReplConfigs = function(ctx) {
};

// Exit a parse tree produced by HiveParser#replConfigs.
HiveParserListener.prototype.exitReplConfigs = function(ctx) {
};


// Enter a parse tree produced by HiveParser#replConfigsList.
HiveParserListener.prototype.enterReplConfigsList = function(ctx) {
};

// Exit a parse tree produced by HiveParser#replConfigsList.
HiveParserListener.prototype.exitReplConfigsList = function(ctx) {
};


// Enter a parse tree produced by HiveParser#replStatusStatement.
HiveParserListener.prototype.enterReplStatusStatement = function(ctx) {
};

// Exit a parse tree produced by HiveParser#replStatusStatement.
HiveParserListener.prototype.exitReplStatusStatement = function(ctx) {
};


// Enter a parse tree produced by HiveParser#ddlStatement.
HiveParserListener.prototype.enterDdlStatement = function(ctx) {
};

// Exit a parse tree produced by HiveParser#ddlStatement.
HiveParserListener.prototype.exitDdlStatement = function(ctx) {
};


// Enter a parse tree produced by HiveParser#ifExists.
HiveParserListener.prototype.enterIfExists = function(ctx) {
};

// Exit a parse tree produced by HiveParser#ifExists.
HiveParserListener.prototype.exitIfExists = function(ctx) {
};


// Enter a parse tree produced by HiveParser#restrictOrCascade.
HiveParserListener.prototype.enterRestrictOrCascade = function(ctx) {
};

// Exit a parse tree produced by HiveParser#restrictOrCascade.
HiveParserListener.prototype.exitRestrictOrCascade = function(ctx) {
};


// Enter a parse tree produced by HiveParser#ifNotExists.
HiveParserListener.prototype.enterIfNotExists = function(ctx) {
};

// Exit a parse tree produced by HiveParser#ifNotExists.
HiveParserListener.prototype.exitIfNotExists = function(ctx) {
};


// Enter a parse tree produced by HiveParser#rewriteEnabled.
HiveParserListener.prototype.enterRewriteEnabled = function(ctx) {
};

// Exit a parse tree produced by HiveParser#rewriteEnabled.
HiveParserListener.prototype.exitRewriteEnabled = function(ctx) {
};


// Enter a parse tree produced by HiveParser#rewriteDisabled.
HiveParserListener.prototype.enterRewriteDisabled = function(ctx) {
};

// Exit a parse tree produced by HiveParser#rewriteDisabled.
HiveParserListener.prototype.exitRewriteDisabled = function(ctx) {
};


// Enter a parse tree produced by HiveParser#storedAsDirs.
HiveParserListener.prototype.enterStoredAsDirs = function(ctx) {
};

// Exit a parse tree produced by HiveParser#storedAsDirs.
HiveParserListener.prototype.exitStoredAsDirs = function(ctx) {
};


// Enter a parse tree produced by HiveParser#orReplace.
HiveParserListener.prototype.enterOrReplace = function(ctx) {
};

// Exit a parse tree produced by HiveParser#orReplace.
HiveParserListener.prototype.exitOrReplace = function(ctx) {
};


// Enter a parse tree produced by HiveParser#createDatabaseStatement.
HiveParserListener.prototype.enterCreateDatabaseStatement = function(ctx) {
};

// Exit a parse tree produced by HiveParser#createDatabaseStatement.
HiveParserListener.prototype.exitCreateDatabaseStatement = function(ctx) {
};


// Enter a parse tree produced by HiveParser#dbLocation.
HiveParserListener.prototype.enterDbLocation = function(ctx) {
};

// Exit a parse tree produced by HiveParser#dbLocation.
HiveParserListener.prototype.exitDbLocation = function(ctx) {
};


// Enter a parse tree produced by HiveParser#dbProperties.
HiveParserListener.prototype.enterDbProperties = function(ctx) {
};

// Exit a parse tree produced by HiveParser#dbProperties.
HiveParserListener.prototype.exitDbProperties = function(ctx) {
};


// Enter a parse tree produced by HiveParser#dbPropertiesList.
HiveParserListener.prototype.enterDbPropertiesList = function(ctx) {
};

// Exit a parse tree produced by HiveParser#dbPropertiesList.
HiveParserListener.prototype.exitDbPropertiesList = function(ctx) {
};


// Enter a parse tree produced by HiveParser#switchDatabaseStatement.
HiveParserListener.prototype.enterSwitchDatabaseStatement = function(ctx) {
};

// Exit a parse tree produced by HiveParser#switchDatabaseStatement.
HiveParserListener.prototype.exitSwitchDatabaseStatement = function(ctx) {
};


// Enter a parse tree produced by HiveParser#dropDatabaseStatement.
HiveParserListener.prototype.enterDropDatabaseStatement = function(ctx) {
};

// Exit a parse tree produced by HiveParser#dropDatabaseStatement.
HiveParserListener.prototype.exitDropDatabaseStatement = function(ctx) {
};


// Enter a parse tree produced by HiveParser#databaseComment.
HiveParserListener.prototype.enterDatabaseComment = function(ctx) {
};

// Exit a parse tree produced by HiveParser#databaseComment.
HiveParserListener.prototype.exitDatabaseComment = function(ctx) {
};


// Enter a parse tree produced by HiveParser#createTableStatement.
HiveParserListener.prototype.enterCreateTableStatement = function(ctx) {
};

// Exit a parse tree produced by HiveParser#createTableStatement.
HiveParserListener.prototype.exitCreateTableStatement = function(ctx) {
};


// Enter a parse tree produced by HiveParser#truncateTableStatement.
HiveParserListener.prototype.enterTruncateTableStatement = function(ctx) {
};

// Exit a parse tree produced by HiveParser#truncateTableStatement.
HiveParserListener.prototype.exitTruncateTableStatement = function(ctx) {
};


// Enter a parse tree produced by HiveParser#dropTableStatement.
HiveParserListener.prototype.enterDropTableStatement = function(ctx) {
};

// Exit a parse tree produced by HiveParser#dropTableStatement.
HiveParserListener.prototype.exitDropTableStatement = function(ctx) {
};


// Enter a parse tree produced by HiveParser#alterStatement.
HiveParserListener.prototype.enterAlterStatement = function(ctx) {
};

// Exit a parse tree produced by HiveParser#alterStatement.
HiveParserListener.prototype.exitAlterStatement = function(ctx) {
};


// Enter a parse tree produced by HiveParser#alterTableStatementSuffix.
HiveParserListener.prototype.enterAlterTableStatementSuffix = function(ctx) {
};

// Exit a parse tree produced by HiveParser#alterTableStatementSuffix.
HiveParserListener.prototype.exitAlterTableStatementSuffix = function(ctx) {
};


// Enter a parse tree produced by HiveParser#alterTblPartitionStatementSuffix.
HiveParserListener.prototype.enterAlterTblPartitionStatementSuffix = function(ctx) {
};

// Exit a parse tree produced by HiveParser#alterTblPartitionStatementSuffix.
HiveParserListener.prototype.exitAlterTblPartitionStatementSuffix = function(ctx) {
};


// Enter a parse tree produced by HiveParser#alterStatementPartitionKeyType.
HiveParserListener.prototype.enterAlterStatementPartitionKeyType = function(ctx) {
};

// Exit a parse tree produced by HiveParser#alterStatementPartitionKeyType.
HiveParserListener.prototype.exitAlterStatementPartitionKeyType = function(ctx) {
};


// Enter a parse tree produced by HiveParser#alterViewStatementSuffix.
HiveParserListener.prototype.enterAlterViewStatementSuffix = function(ctx) {
};

// Exit a parse tree produced by HiveParser#alterViewStatementSuffix.
HiveParserListener.prototype.exitAlterViewStatementSuffix = function(ctx) {
};


// Enter a parse tree produced by HiveParser#alterMaterializedViewStatementSuffix.
HiveParserListener.prototype.enterAlterMaterializedViewStatementSuffix = function(ctx) {
};

// Exit a parse tree produced by HiveParser#alterMaterializedViewStatementSuffix.
HiveParserListener.prototype.exitAlterMaterializedViewStatementSuffix = function(ctx) {
};


// Enter a parse tree produced by HiveParser#alterDatabaseStatementSuffix.
HiveParserListener.prototype.enterAlterDatabaseStatementSuffix = function(ctx) {
};

// Exit a parse tree produced by HiveParser#alterDatabaseStatementSuffix.
HiveParserListener.prototype.exitAlterDatabaseStatementSuffix = function(ctx) {
};


// Enter a parse tree produced by HiveParser#alterDatabaseSuffixProperties.
HiveParserListener.prototype.enterAlterDatabaseSuffixProperties = function(ctx) {
};

// Exit a parse tree produced by HiveParser#alterDatabaseSuffixProperties.
HiveParserListener.prototype.exitAlterDatabaseSuffixProperties = function(ctx) {
};


// Enter a parse tree produced by HiveParser#alterDatabaseSuffixSetOwner.
HiveParserListener.prototype.enterAlterDatabaseSuffixSetOwner = function(ctx) {
};

// Exit a parse tree produced by HiveParser#alterDatabaseSuffixSetOwner.
HiveParserListener.prototype.exitAlterDatabaseSuffixSetOwner = function(ctx) {
};


// Enter a parse tree produced by HiveParser#alterDatabaseSuffixSetLocation.
HiveParserListener.prototype.enterAlterDatabaseSuffixSetLocation = function(ctx) {
};

// Exit a parse tree produced by HiveParser#alterDatabaseSuffixSetLocation.
HiveParserListener.prototype.exitAlterDatabaseSuffixSetLocation = function(ctx) {
};


// Enter a parse tree produced by HiveParser#alterStatementSuffixRename.
HiveParserListener.prototype.enterAlterStatementSuffixRename = function(ctx) {
};

// Exit a parse tree produced by HiveParser#alterStatementSuffixRename.
HiveParserListener.prototype.exitAlterStatementSuffixRename = function(ctx) {
};


// Enter a parse tree produced by HiveParser#alterStatementSuffixAddCol.
HiveParserListener.prototype.enterAlterStatementSuffixAddCol = function(ctx) {
};

// Exit a parse tree produced by HiveParser#alterStatementSuffixAddCol.
HiveParserListener.prototype.exitAlterStatementSuffixAddCol = function(ctx) {
};


// Enter a parse tree produced by HiveParser#alterStatementSuffixAddConstraint.
HiveParserListener.prototype.enterAlterStatementSuffixAddConstraint = function(ctx) {
};

// Exit a parse tree produced by HiveParser#alterStatementSuffixAddConstraint.
HiveParserListener.prototype.exitAlterStatementSuffixAddConstraint = function(ctx) {
};


// Enter a parse tree produced by HiveParser#alterStatementSuffixUpdateColumns.
HiveParserListener.prototype.enterAlterStatementSuffixUpdateColumns = function(ctx) {
};

// Exit a parse tree produced by HiveParser#alterStatementSuffixUpdateColumns.
HiveParserListener.prototype.exitAlterStatementSuffixUpdateColumns = function(ctx) {
};


// Enter a parse tree produced by HiveParser#alterStatementSuffixDropConstraint.
HiveParserListener.prototype.enterAlterStatementSuffixDropConstraint = function(ctx) {
};

// Exit a parse tree produced by HiveParser#alterStatementSuffixDropConstraint.
HiveParserListener.prototype.exitAlterStatementSuffixDropConstraint = function(ctx) {
};


// Enter a parse tree produced by HiveParser#alterStatementSuffixRenameCol.
HiveParserListener.prototype.enterAlterStatementSuffixRenameCol = function(ctx) {
};

// Exit a parse tree produced by HiveParser#alterStatementSuffixRenameCol.
HiveParserListener.prototype.exitAlterStatementSuffixRenameCol = function(ctx) {
};


// Enter a parse tree produced by HiveParser#alterStatementSuffixUpdateStatsCol.
HiveParserListener.prototype.enterAlterStatementSuffixUpdateStatsCol = function(ctx) {
};

// Exit a parse tree produced by HiveParser#alterStatementSuffixUpdateStatsCol.
HiveParserListener.prototype.exitAlterStatementSuffixUpdateStatsCol = function(ctx) {
};


// Enter a parse tree produced by HiveParser#alterStatementSuffixUpdateStats.
HiveParserListener.prototype.enterAlterStatementSuffixUpdateStats = function(ctx) {
};

// Exit a parse tree produced by HiveParser#alterStatementSuffixUpdateStats.
HiveParserListener.prototype.exitAlterStatementSuffixUpdateStats = function(ctx) {
};


// Enter a parse tree produced by HiveParser#alterStatementChangeColPosition.
HiveParserListener.prototype.enterAlterStatementChangeColPosition = function(ctx) {
};

// Exit a parse tree produced by HiveParser#alterStatementChangeColPosition.
HiveParserListener.prototype.exitAlterStatementChangeColPosition = function(ctx) {
};


// Enter a parse tree produced by HiveParser#alterStatementSuffixAddPartitions.
HiveParserListener.prototype.enterAlterStatementSuffixAddPartitions = function(ctx) {
};

// Exit a parse tree produced by HiveParser#alterStatementSuffixAddPartitions.
HiveParserListener.prototype.exitAlterStatementSuffixAddPartitions = function(ctx) {
};


// Enter a parse tree produced by HiveParser#alterStatementSuffixAddPartitionsElement.
HiveParserListener.prototype.enterAlterStatementSuffixAddPartitionsElement = function(ctx) {
};

// Exit a parse tree produced by HiveParser#alterStatementSuffixAddPartitionsElement.
HiveParserListener.prototype.exitAlterStatementSuffixAddPartitionsElement = function(ctx) {
};


// Enter a parse tree produced by HiveParser#alterStatementSuffixTouch.
HiveParserListener.prototype.enterAlterStatementSuffixTouch = function(ctx) {
};

// Exit a parse tree produced by HiveParser#alterStatementSuffixTouch.
HiveParserListener.prototype.exitAlterStatementSuffixTouch = function(ctx) {
};


// Enter a parse tree produced by HiveParser#alterStatementSuffixArchive.
HiveParserListener.prototype.enterAlterStatementSuffixArchive = function(ctx) {
};

// Exit a parse tree produced by HiveParser#alterStatementSuffixArchive.
HiveParserListener.prototype.exitAlterStatementSuffixArchive = function(ctx) {
};


// Enter a parse tree produced by HiveParser#alterStatementSuffixUnArchive.
HiveParserListener.prototype.enterAlterStatementSuffixUnArchive = function(ctx) {
};

// Exit a parse tree produced by HiveParser#alterStatementSuffixUnArchive.
HiveParserListener.prototype.exitAlterStatementSuffixUnArchive = function(ctx) {
};


// Enter a parse tree produced by HiveParser#partitionLocation.
HiveParserListener.prototype.enterPartitionLocation = function(ctx) {
};

// Exit a parse tree produced by HiveParser#partitionLocation.
HiveParserListener.prototype.exitPartitionLocation = function(ctx) {
};


// Enter a parse tree produced by HiveParser#alterStatementSuffixDropPartitions.
HiveParserListener.prototype.enterAlterStatementSuffixDropPartitions = function(ctx) {
};

// Exit a parse tree produced by HiveParser#alterStatementSuffixDropPartitions.
HiveParserListener.prototype.exitAlterStatementSuffixDropPartitions = function(ctx) {
};


// Enter a parse tree produced by HiveParser#alterStatementSuffixProperties.
HiveParserListener.prototype.enterAlterStatementSuffixProperties = function(ctx) {
};

// Exit a parse tree produced by HiveParser#alterStatementSuffixProperties.
HiveParserListener.prototype.exitAlterStatementSuffixProperties = function(ctx) {
};


// Enter a parse tree produced by HiveParser#alterViewSuffixProperties.
HiveParserListener.prototype.enterAlterViewSuffixProperties = function(ctx) {
};

// Exit a parse tree produced by HiveParser#alterViewSuffixProperties.
HiveParserListener.prototype.exitAlterViewSuffixProperties = function(ctx) {
};


// Enter a parse tree produced by HiveParser#alterMaterializedViewSuffixRewrite.
HiveParserListener.prototype.enterAlterMaterializedViewSuffixRewrite = function(ctx) {
};

// Exit a parse tree produced by HiveParser#alterMaterializedViewSuffixRewrite.
HiveParserListener.prototype.exitAlterMaterializedViewSuffixRewrite = function(ctx) {
};


// Enter a parse tree produced by HiveParser#alterMaterializedViewSuffixRebuild.
HiveParserListener.prototype.enterAlterMaterializedViewSuffixRebuild = function(ctx) {
};

// Exit a parse tree produced by HiveParser#alterMaterializedViewSuffixRebuild.
HiveParserListener.prototype.exitAlterMaterializedViewSuffixRebuild = function(ctx) {
};


// Enter a parse tree produced by HiveParser#alterStatementSuffixSerdeProperties.
HiveParserListener.prototype.enterAlterStatementSuffixSerdeProperties = function(ctx) {
};

// Exit a parse tree produced by HiveParser#alterStatementSuffixSerdeProperties.
HiveParserListener.prototype.exitAlterStatementSuffixSerdeProperties = function(ctx) {
};


// Enter a parse tree produced by HiveParser#alterIndexStatementSuffix.
HiveParserListener.prototype.enterAlterIndexStatementSuffix = function(ctx) {
};

// Exit a parse tree produced by HiveParser#alterIndexStatementSuffix.
HiveParserListener.prototype.exitAlterIndexStatementSuffix = function(ctx) {
};


// Enter a parse tree produced by HiveParser#alterStatementSuffixFileFormat.
HiveParserListener.prototype.enterAlterStatementSuffixFileFormat = function(ctx) {
};

// Exit a parse tree produced by HiveParser#alterStatementSuffixFileFormat.
HiveParserListener.prototype.exitAlterStatementSuffixFileFormat = function(ctx) {
};


// Enter a parse tree produced by HiveParser#alterStatementSuffixClusterbySortby.
HiveParserListener.prototype.enterAlterStatementSuffixClusterbySortby = function(ctx) {
};

// Exit a parse tree produced by HiveParser#alterStatementSuffixClusterbySortby.
HiveParserListener.prototype.exitAlterStatementSuffixClusterbySortby = function(ctx) {
};


// Enter a parse tree produced by HiveParser#alterTblPartitionStatementSuffixSkewedLocation.
HiveParserListener.prototype.enterAlterTblPartitionStatementSuffixSkewedLocation = function(ctx) {
};

// Exit a parse tree produced by HiveParser#alterTblPartitionStatementSuffixSkewedLocation.
HiveParserListener.prototype.exitAlterTblPartitionStatementSuffixSkewedLocation = function(ctx) {
};


// Enter a parse tree produced by HiveParser#skewedLocations.
HiveParserListener.prototype.enterSkewedLocations = function(ctx) {
};

// Exit a parse tree produced by HiveParser#skewedLocations.
HiveParserListener.prototype.exitSkewedLocations = function(ctx) {
};


// Enter a parse tree produced by HiveParser#skewedLocationsList.
HiveParserListener.prototype.enterSkewedLocationsList = function(ctx) {
};

// Exit a parse tree produced by HiveParser#skewedLocationsList.
HiveParserListener.prototype.exitSkewedLocationsList = function(ctx) {
};


// Enter a parse tree produced by HiveParser#skewedLocationMap.
HiveParserListener.prototype.enterSkewedLocationMap = function(ctx) {
};

// Exit a parse tree produced by HiveParser#skewedLocationMap.
HiveParserListener.prototype.exitSkewedLocationMap = function(ctx) {
};


// Enter a parse tree produced by HiveParser#alterStatementSuffixLocation.
HiveParserListener.prototype.enterAlterStatementSuffixLocation = function(ctx) {
};

// Exit a parse tree produced by HiveParser#alterStatementSuffixLocation.
HiveParserListener.prototype.exitAlterStatementSuffixLocation = function(ctx) {
};


// Enter a parse tree produced by HiveParser#alterStatementSuffixSkewedby.
HiveParserListener.prototype.enterAlterStatementSuffixSkewedby = function(ctx) {
};

// Exit a parse tree produced by HiveParser#alterStatementSuffixSkewedby.
HiveParserListener.prototype.exitAlterStatementSuffixSkewedby = function(ctx) {
};


// Enter a parse tree produced by HiveParser#alterStatementSuffixExchangePartition.
HiveParserListener.prototype.enterAlterStatementSuffixExchangePartition = function(ctx) {
};

// Exit a parse tree produced by HiveParser#alterStatementSuffixExchangePartition.
HiveParserListener.prototype.exitAlterStatementSuffixExchangePartition = function(ctx) {
};


// Enter a parse tree produced by HiveParser#alterStatementSuffixRenamePart.
HiveParserListener.prototype.enterAlterStatementSuffixRenamePart = function(ctx) {
};

// Exit a parse tree produced by HiveParser#alterStatementSuffixRenamePart.
HiveParserListener.prototype.exitAlterStatementSuffixRenamePart = function(ctx) {
};


// Enter a parse tree produced by HiveParser#alterStatementSuffixStatsPart.
HiveParserListener.prototype.enterAlterStatementSuffixStatsPart = function(ctx) {
};

// Exit a parse tree produced by HiveParser#alterStatementSuffixStatsPart.
HiveParserListener.prototype.exitAlterStatementSuffixStatsPart = function(ctx) {
};


// Enter a parse tree produced by HiveParser#alterStatementSuffixMergeFiles.
HiveParserListener.prototype.enterAlterStatementSuffixMergeFiles = function(ctx) {
};

// Exit a parse tree produced by HiveParser#alterStatementSuffixMergeFiles.
HiveParserListener.prototype.exitAlterStatementSuffixMergeFiles = function(ctx) {
};


// Enter a parse tree produced by HiveParser#alterStatementSuffixBucketNum.
HiveParserListener.prototype.enterAlterStatementSuffixBucketNum = function(ctx) {
};

// Exit a parse tree produced by HiveParser#alterStatementSuffixBucketNum.
HiveParserListener.prototype.exitAlterStatementSuffixBucketNum = function(ctx) {
};


// Enter a parse tree produced by HiveParser#createIndexStatement.
HiveParserListener.prototype.enterCreateIndexStatement = function(ctx) {
};

// Exit a parse tree produced by HiveParser#createIndexStatement.
HiveParserListener.prototype.exitCreateIndexStatement = function(ctx) {
};


// Enter a parse tree produced by HiveParser#createIndexMainStatement.
HiveParserListener.prototype.enterCreateIndexMainStatement = function(ctx) {
};

// Exit a parse tree produced by HiveParser#createIndexMainStatement.
HiveParserListener.prototype.exitCreateIndexMainStatement = function(ctx) {
};


// Enter a parse tree produced by HiveParser#dropIndexStatement.
HiveParserListener.prototype.enterDropIndexStatement = function(ctx) {
};

// Exit a parse tree produced by HiveParser#dropIndexStatement.
HiveParserListener.prototype.exitDropIndexStatement = function(ctx) {
};


// Enter a parse tree produced by HiveParser#tablePartitionPrefix.
HiveParserListener.prototype.enterTablePartitionPrefix = function(ctx) {
};

// Exit a parse tree produced by HiveParser#tablePartitionPrefix.
HiveParserListener.prototype.exitTablePartitionPrefix = function(ctx) {
};


// Enter a parse tree produced by HiveParser#blocking.
HiveParserListener.prototype.enterBlocking = function(ctx) {
};

// Exit a parse tree produced by HiveParser#blocking.
HiveParserListener.prototype.exitBlocking = function(ctx) {
};


// Enter a parse tree produced by HiveParser#alterStatementSuffixCompact.
HiveParserListener.prototype.enterAlterStatementSuffixCompact = function(ctx) {
};

// Exit a parse tree produced by HiveParser#alterStatementSuffixCompact.
HiveParserListener.prototype.exitAlterStatementSuffixCompact = function(ctx) {
};


// Enter a parse tree produced by HiveParser#alterStatementSuffixSetOwner.
HiveParserListener.prototype.enterAlterStatementSuffixSetOwner = function(ctx) {
};

// Exit a parse tree produced by HiveParser#alterStatementSuffixSetOwner.
HiveParserListener.prototype.exitAlterStatementSuffixSetOwner = function(ctx) {
};


// Enter a parse tree produced by HiveParser#fileFormat.
HiveParserListener.prototype.enterFileFormat = function(ctx) {
};

// Exit a parse tree produced by HiveParser#fileFormat.
HiveParserListener.prototype.exitFileFormat = function(ctx) {
};


// Enter a parse tree produced by HiveParser#inputFileFormat.
HiveParserListener.prototype.enterInputFileFormat = function(ctx) {
};

// Exit a parse tree produced by HiveParser#inputFileFormat.
HiveParserListener.prototype.exitInputFileFormat = function(ctx) {
};


// Enter a parse tree produced by HiveParser#tabTypeExpr.
HiveParserListener.prototype.enterTabTypeExpr = function(ctx) {
};

// Exit a parse tree produced by HiveParser#tabTypeExpr.
HiveParserListener.prototype.exitTabTypeExpr = function(ctx) {
};


// Enter a parse tree produced by HiveParser#partTypeExpr.
HiveParserListener.prototype.enterPartTypeExpr = function(ctx) {
};

// Exit a parse tree produced by HiveParser#partTypeExpr.
HiveParserListener.prototype.exitPartTypeExpr = function(ctx) {
};


// Enter a parse tree produced by HiveParser#tabPartColTypeExpr.
HiveParserListener.prototype.enterTabPartColTypeExpr = function(ctx) {
};

// Exit a parse tree produced by HiveParser#tabPartColTypeExpr.
HiveParserListener.prototype.exitTabPartColTypeExpr = function(ctx) {
};


// Enter a parse tree produced by HiveParser#descStatement.
HiveParserListener.prototype.enterDescStatement = function(ctx) {
};

// Exit a parse tree produced by HiveParser#descStatement.
HiveParserListener.prototype.exitDescStatement = function(ctx) {
};


// Enter a parse tree produced by HiveParser#analyzeStatement.
HiveParserListener.prototype.enterAnalyzeStatement = function(ctx) {
};

// Exit a parse tree produced by HiveParser#analyzeStatement.
HiveParserListener.prototype.exitAnalyzeStatement = function(ctx) {
};


// Enter a parse tree produced by HiveParser#showStatement.
HiveParserListener.prototype.enterShowStatement = function(ctx) {
};

// Exit a parse tree produced by HiveParser#showStatement.
HiveParserListener.prototype.exitShowStatement = function(ctx) {
};


// Enter a parse tree produced by HiveParser#lockStatement.
HiveParserListener.prototype.enterLockStatement = function(ctx) {
};

// Exit a parse tree produced by HiveParser#lockStatement.
HiveParserListener.prototype.exitLockStatement = function(ctx) {
};


// Enter a parse tree produced by HiveParser#lockDatabase.
HiveParserListener.prototype.enterLockDatabase = function(ctx) {
};

// Exit a parse tree produced by HiveParser#lockDatabase.
HiveParserListener.prototype.exitLockDatabase = function(ctx) {
};


// Enter a parse tree produced by HiveParser#lockMode.
HiveParserListener.prototype.enterLockMode = function(ctx) {
};

// Exit a parse tree produced by HiveParser#lockMode.
HiveParserListener.prototype.exitLockMode = function(ctx) {
};


// Enter a parse tree produced by HiveParser#unlockStatement.
HiveParserListener.prototype.enterUnlockStatement = function(ctx) {
};

// Exit a parse tree produced by HiveParser#unlockStatement.
HiveParserListener.prototype.exitUnlockStatement = function(ctx) {
};


// Enter a parse tree produced by HiveParser#unlockDatabase.
HiveParserListener.prototype.enterUnlockDatabase = function(ctx) {
};

// Exit a parse tree produced by HiveParser#unlockDatabase.
HiveParserListener.prototype.exitUnlockDatabase = function(ctx) {
};


// Enter a parse tree produced by HiveParser#createRoleStatement.
HiveParserListener.prototype.enterCreateRoleStatement = function(ctx) {
};

// Exit a parse tree produced by HiveParser#createRoleStatement.
HiveParserListener.prototype.exitCreateRoleStatement = function(ctx) {
};


// Enter a parse tree produced by HiveParser#dropRoleStatement.
HiveParserListener.prototype.enterDropRoleStatement = function(ctx) {
};

// Exit a parse tree produced by HiveParser#dropRoleStatement.
HiveParserListener.prototype.exitDropRoleStatement = function(ctx) {
};


// Enter a parse tree produced by HiveParser#grantPrivileges.
HiveParserListener.prototype.enterGrantPrivileges = function(ctx) {
};

// Exit a parse tree produced by HiveParser#grantPrivileges.
HiveParserListener.prototype.exitGrantPrivileges = function(ctx) {
};


// Enter a parse tree produced by HiveParser#revokePrivileges.
HiveParserListener.prototype.enterRevokePrivileges = function(ctx) {
};

// Exit a parse tree produced by HiveParser#revokePrivileges.
HiveParserListener.prototype.exitRevokePrivileges = function(ctx) {
};


// Enter a parse tree produced by HiveParser#grantRole.
HiveParserListener.prototype.enterGrantRole = function(ctx) {
};

// Exit a parse tree produced by HiveParser#grantRole.
HiveParserListener.prototype.exitGrantRole = function(ctx) {
};


// Enter a parse tree produced by HiveParser#revokeRole.
HiveParserListener.prototype.enterRevokeRole = function(ctx) {
};

// Exit a parse tree produced by HiveParser#revokeRole.
HiveParserListener.prototype.exitRevokeRole = function(ctx) {
};


// Enter a parse tree produced by HiveParser#showRoleGrants.
HiveParserListener.prototype.enterShowRoleGrants = function(ctx) {
};

// Exit a parse tree produced by HiveParser#showRoleGrants.
HiveParserListener.prototype.exitShowRoleGrants = function(ctx) {
};


// Enter a parse tree produced by HiveParser#showRoles.
HiveParserListener.prototype.enterShowRoles = function(ctx) {
};

// Exit a parse tree produced by HiveParser#showRoles.
HiveParserListener.prototype.exitShowRoles = function(ctx) {
};


// Enter a parse tree produced by HiveParser#showCurrentRole.
HiveParserListener.prototype.enterShowCurrentRole = function(ctx) {
};

// Exit a parse tree produced by HiveParser#showCurrentRole.
HiveParserListener.prototype.exitShowCurrentRole = function(ctx) {
};


// Enter a parse tree produced by HiveParser#setRole.
HiveParserListener.prototype.enterSetRole = function(ctx) {
};

// Exit a parse tree produced by HiveParser#setRole.
HiveParserListener.prototype.exitSetRole = function(ctx) {
};


// Enter a parse tree produced by HiveParser#showGrants.
HiveParserListener.prototype.enterShowGrants = function(ctx) {
};

// Exit a parse tree produced by HiveParser#showGrants.
HiveParserListener.prototype.exitShowGrants = function(ctx) {
};


// Enter a parse tree produced by HiveParser#showRolePrincipals.
HiveParserListener.prototype.enterShowRolePrincipals = function(ctx) {
};

// Exit a parse tree produced by HiveParser#showRolePrincipals.
HiveParserListener.prototype.exitShowRolePrincipals = function(ctx) {
};


// Enter a parse tree produced by HiveParser#privilegeIncludeColObject.
HiveParserListener.prototype.enterPrivilegeIncludeColObject = function(ctx) {
};

// Exit a parse tree produced by HiveParser#privilegeIncludeColObject.
HiveParserListener.prototype.exitPrivilegeIncludeColObject = function(ctx) {
};


// Enter a parse tree produced by HiveParser#privilegeObject.
HiveParserListener.prototype.enterPrivilegeObject = function(ctx) {
};

// Exit a parse tree produced by HiveParser#privilegeObject.
HiveParserListener.prototype.exitPrivilegeObject = function(ctx) {
};


// Enter a parse tree produced by HiveParser#privObject.
HiveParserListener.prototype.enterPrivObject = function(ctx) {
};

// Exit a parse tree produced by HiveParser#privObject.
HiveParserListener.prototype.exitPrivObject = function(ctx) {
};


// Enter a parse tree produced by HiveParser#privObjectCols.
HiveParserListener.prototype.enterPrivObjectCols = function(ctx) {
};

// Exit a parse tree produced by HiveParser#privObjectCols.
HiveParserListener.prototype.exitPrivObjectCols = function(ctx) {
};


// Enter a parse tree produced by HiveParser#privilegeList.
HiveParserListener.prototype.enterPrivilegeList = function(ctx) {
};

// Exit a parse tree produced by HiveParser#privilegeList.
HiveParserListener.prototype.exitPrivilegeList = function(ctx) {
};


// Enter a parse tree produced by HiveParser#privlegeDef.
HiveParserListener.prototype.enterPrivlegeDef = function(ctx) {
};

// Exit a parse tree produced by HiveParser#privlegeDef.
HiveParserListener.prototype.exitPrivlegeDef = function(ctx) {
};


// Enter a parse tree produced by HiveParser#privilegeType.
HiveParserListener.prototype.enterPrivilegeType = function(ctx) {
};

// Exit a parse tree produced by HiveParser#privilegeType.
HiveParserListener.prototype.exitPrivilegeType = function(ctx) {
};


// Enter a parse tree produced by HiveParser#principalSpecification.
HiveParserListener.prototype.enterPrincipalSpecification = function(ctx) {
};

// Exit a parse tree produced by HiveParser#principalSpecification.
HiveParserListener.prototype.exitPrincipalSpecification = function(ctx) {
};


// Enter a parse tree produced by HiveParser#principalName.
HiveParserListener.prototype.enterPrincipalName = function(ctx) {
};

// Exit a parse tree produced by HiveParser#principalName.
HiveParserListener.prototype.exitPrincipalName = function(ctx) {
};


// Enter a parse tree produced by HiveParser#withGrantOption.
HiveParserListener.prototype.enterWithGrantOption = function(ctx) {
};

// Exit a parse tree produced by HiveParser#withGrantOption.
HiveParserListener.prototype.exitWithGrantOption = function(ctx) {
};


// Enter a parse tree produced by HiveParser#grantOptionFor.
HiveParserListener.prototype.enterGrantOptionFor = function(ctx) {
};

// Exit a parse tree produced by HiveParser#grantOptionFor.
HiveParserListener.prototype.exitGrantOptionFor = function(ctx) {
};


// Enter a parse tree produced by HiveParser#adminOptionFor.
HiveParserListener.prototype.enterAdminOptionFor = function(ctx) {
};

// Exit a parse tree produced by HiveParser#adminOptionFor.
HiveParserListener.prototype.exitAdminOptionFor = function(ctx) {
};


// Enter a parse tree produced by HiveParser#withAdminOption.
HiveParserListener.prototype.enterWithAdminOption = function(ctx) {
};

// Exit a parse tree produced by HiveParser#withAdminOption.
HiveParserListener.prototype.exitWithAdminOption = function(ctx) {
};


// Enter a parse tree produced by HiveParser#metastoreCheck.
HiveParserListener.prototype.enterMetastoreCheck = function(ctx) {
};

// Exit a parse tree produced by HiveParser#metastoreCheck.
HiveParserListener.prototype.exitMetastoreCheck = function(ctx) {
};


// Enter a parse tree produced by HiveParser#resourceList.
HiveParserListener.prototype.enterResourceList = function(ctx) {
};

// Exit a parse tree produced by HiveParser#resourceList.
HiveParserListener.prototype.exitResourceList = function(ctx) {
};


// Enter a parse tree produced by HiveParser#resource.
HiveParserListener.prototype.enterResource = function(ctx) {
};

// Exit a parse tree produced by HiveParser#resource.
HiveParserListener.prototype.exitResource = function(ctx) {
};


// Enter a parse tree produced by HiveParser#resourceType.
HiveParserListener.prototype.enterResourceType = function(ctx) {
};

// Exit a parse tree produced by HiveParser#resourceType.
HiveParserListener.prototype.exitResourceType = function(ctx) {
};


// Enter a parse tree produced by HiveParser#createFunctionStatement.
HiveParserListener.prototype.enterCreateFunctionStatement = function(ctx) {
};

// Exit a parse tree produced by HiveParser#createFunctionStatement.
HiveParserListener.prototype.exitCreateFunctionStatement = function(ctx) {
};


// Enter a parse tree produced by HiveParser#dropFunctionStatement.
HiveParserListener.prototype.enterDropFunctionStatement = function(ctx) {
};

// Exit a parse tree produced by HiveParser#dropFunctionStatement.
HiveParserListener.prototype.exitDropFunctionStatement = function(ctx) {
};


// Enter a parse tree produced by HiveParser#reloadFunctionStatement.
HiveParserListener.prototype.enterReloadFunctionStatement = function(ctx) {
};

// Exit a parse tree produced by HiveParser#reloadFunctionStatement.
HiveParserListener.prototype.exitReloadFunctionStatement = function(ctx) {
};


// Enter a parse tree produced by HiveParser#createMacroStatement.
HiveParserListener.prototype.enterCreateMacroStatement = function(ctx) {
};

// Exit a parse tree produced by HiveParser#createMacroStatement.
HiveParserListener.prototype.exitCreateMacroStatement = function(ctx) {
};


// Enter a parse tree produced by HiveParser#dropMacroStatement.
HiveParserListener.prototype.enterDropMacroStatement = function(ctx) {
};

// Exit a parse tree produced by HiveParser#dropMacroStatement.
HiveParserListener.prototype.exitDropMacroStatement = function(ctx) {
};


// Enter a parse tree produced by HiveParser#createViewStatement.
HiveParserListener.prototype.enterCreateViewStatement = function(ctx) {
};

// Exit a parse tree produced by HiveParser#createViewStatement.
HiveParserListener.prototype.exitCreateViewStatement = function(ctx) {
};


// Enter a parse tree produced by HiveParser#createMaterializedViewStatement.
HiveParserListener.prototype.enterCreateMaterializedViewStatement = function(ctx) {
};

// Exit a parse tree produced by HiveParser#createMaterializedViewStatement.
HiveParserListener.prototype.exitCreateMaterializedViewStatement = function(ctx) {
};


// Enter a parse tree produced by HiveParser#viewPartition.
HiveParserListener.prototype.enterViewPartition = function(ctx) {
};

// Exit a parse tree produced by HiveParser#viewPartition.
HiveParserListener.prototype.exitViewPartition = function(ctx) {
};


// Enter a parse tree produced by HiveParser#dropViewStatement.
HiveParserListener.prototype.enterDropViewStatement = function(ctx) {
};

// Exit a parse tree produced by HiveParser#dropViewStatement.
HiveParserListener.prototype.exitDropViewStatement = function(ctx) {
};


// Enter a parse tree produced by HiveParser#dropMaterializedViewStatement.
HiveParserListener.prototype.enterDropMaterializedViewStatement = function(ctx) {
};

// Exit a parse tree produced by HiveParser#dropMaterializedViewStatement.
HiveParserListener.prototype.exitDropMaterializedViewStatement = function(ctx) {
};


// Enter a parse tree produced by HiveParser#showFunctionIdentifier.
HiveParserListener.prototype.enterShowFunctionIdentifier = function(ctx) {
};

// Exit a parse tree produced by HiveParser#showFunctionIdentifier.
HiveParserListener.prototype.exitShowFunctionIdentifier = function(ctx) {
};


// Enter a parse tree produced by HiveParser#showStmtIdentifier.
HiveParserListener.prototype.enterShowStmtIdentifier = function(ctx) {
};

// Exit a parse tree produced by HiveParser#showStmtIdentifier.
HiveParserListener.prototype.exitShowStmtIdentifier = function(ctx) {
};


// Enter a parse tree produced by HiveParser#tableComment.
HiveParserListener.prototype.enterTableComment = function(ctx) {
};

// Exit a parse tree produced by HiveParser#tableComment.
HiveParserListener.prototype.exitTableComment = function(ctx) {
};


// Enter a parse tree produced by HiveParser#tablePartition.
HiveParserListener.prototype.enterTablePartition = function(ctx) {
};

// Exit a parse tree produced by HiveParser#tablePartition.
HiveParserListener.prototype.exitTablePartition = function(ctx) {
};


// Enter a parse tree produced by HiveParser#tableBuckets.
HiveParserListener.prototype.enterTableBuckets = function(ctx) {
};

// Exit a parse tree produced by HiveParser#tableBuckets.
HiveParserListener.prototype.exitTableBuckets = function(ctx) {
};


// Enter a parse tree produced by HiveParser#tableSkewed.
HiveParserListener.prototype.enterTableSkewed = function(ctx) {
};

// Exit a parse tree produced by HiveParser#tableSkewed.
HiveParserListener.prototype.exitTableSkewed = function(ctx) {
};


// Enter a parse tree produced by HiveParser#rowFormat.
HiveParserListener.prototype.enterRowFormat = function(ctx) {
};

// Exit a parse tree produced by HiveParser#rowFormat.
HiveParserListener.prototype.exitRowFormat = function(ctx) {
};


// Enter a parse tree produced by HiveParser#recordReader.
HiveParserListener.prototype.enterRecordReader = function(ctx) {
};

// Exit a parse tree produced by HiveParser#recordReader.
HiveParserListener.prototype.exitRecordReader = function(ctx) {
};


// Enter a parse tree produced by HiveParser#recordWriter.
HiveParserListener.prototype.enterRecordWriter = function(ctx) {
};

// Exit a parse tree produced by HiveParser#recordWriter.
HiveParserListener.prototype.exitRecordWriter = function(ctx) {
};


// Enter a parse tree produced by HiveParser#rowFormatSerde.
HiveParserListener.prototype.enterRowFormatSerde = function(ctx) {
};

// Exit a parse tree produced by HiveParser#rowFormatSerde.
HiveParserListener.prototype.exitRowFormatSerde = function(ctx) {
};


// Enter a parse tree produced by HiveParser#rowFormatDelimited.
HiveParserListener.prototype.enterRowFormatDelimited = function(ctx) {
};

// Exit a parse tree produced by HiveParser#rowFormatDelimited.
HiveParserListener.prototype.exitRowFormatDelimited = function(ctx) {
};


// Enter a parse tree produced by HiveParser#tableRowFormat.
HiveParserListener.prototype.enterTableRowFormat = function(ctx) {
};

// Exit a parse tree produced by HiveParser#tableRowFormat.
HiveParserListener.prototype.exitTableRowFormat = function(ctx) {
};


// Enter a parse tree produced by HiveParser#tablePropertiesPrefixed.
HiveParserListener.prototype.enterTablePropertiesPrefixed = function(ctx) {
};

// Exit a parse tree produced by HiveParser#tablePropertiesPrefixed.
HiveParserListener.prototype.exitTablePropertiesPrefixed = function(ctx) {
};


// Enter a parse tree produced by HiveParser#tableProperties.
HiveParserListener.prototype.enterTableProperties = function(ctx) {
};

// Exit a parse tree produced by HiveParser#tableProperties.
HiveParserListener.prototype.exitTableProperties = function(ctx) {
};


// Enter a parse tree produced by HiveParser#tablePropertiesList.
HiveParserListener.prototype.enterTablePropertiesList = function(ctx) {
};

// Exit a parse tree produced by HiveParser#tablePropertiesList.
HiveParserListener.prototype.exitTablePropertiesList = function(ctx) {
};


// Enter a parse tree produced by HiveParser#keyValueProperty.
HiveParserListener.prototype.enterKeyValueProperty = function(ctx) {
};

// Exit a parse tree produced by HiveParser#keyValueProperty.
HiveParserListener.prototype.exitKeyValueProperty = function(ctx) {
};


// Enter a parse tree produced by HiveParser#keyProperty.
HiveParserListener.prototype.enterKeyProperty = function(ctx) {
};

// Exit a parse tree produced by HiveParser#keyProperty.
HiveParserListener.prototype.exitKeyProperty = function(ctx) {
};


// Enter a parse tree produced by HiveParser#tableRowFormatFieldIdentifier.
HiveParserListener.prototype.enterTableRowFormatFieldIdentifier = function(ctx) {
};

// Exit a parse tree produced by HiveParser#tableRowFormatFieldIdentifier.
HiveParserListener.prototype.exitTableRowFormatFieldIdentifier = function(ctx) {
};


// Enter a parse tree produced by HiveParser#tableRowFormatFieldIdentifierEcapedBy.
HiveParserListener.prototype.enterTableRowFormatFieldIdentifierEcapedBy = function(ctx) {
};

// Exit a parse tree produced by HiveParser#tableRowFormatFieldIdentifierEcapedBy.
HiveParserListener.prototype.exitTableRowFormatFieldIdentifierEcapedBy = function(ctx) {
};


// Enter a parse tree produced by HiveParser#tableRowFormatCollItemsIdentifier.
HiveParserListener.prototype.enterTableRowFormatCollItemsIdentifier = function(ctx) {
};

// Exit a parse tree produced by HiveParser#tableRowFormatCollItemsIdentifier.
HiveParserListener.prototype.exitTableRowFormatCollItemsIdentifier = function(ctx) {
};


// Enter a parse tree produced by HiveParser#tableRowFormatMapKeysIdentifier.
HiveParserListener.prototype.enterTableRowFormatMapKeysIdentifier = function(ctx) {
};

// Exit a parse tree produced by HiveParser#tableRowFormatMapKeysIdentifier.
HiveParserListener.prototype.exitTableRowFormatMapKeysIdentifier = function(ctx) {
};


// Enter a parse tree produced by HiveParser#tableRowFormatLinesIdentifier.
HiveParserListener.prototype.enterTableRowFormatLinesIdentifier = function(ctx) {
};

// Exit a parse tree produced by HiveParser#tableRowFormatLinesIdentifier.
HiveParserListener.prototype.exitTableRowFormatLinesIdentifier = function(ctx) {
};


// Enter a parse tree produced by HiveParser#tableRowNullFormat.
HiveParserListener.prototype.enterTableRowNullFormat = function(ctx) {
};

// Exit a parse tree produced by HiveParser#tableRowNullFormat.
HiveParserListener.prototype.exitTableRowNullFormat = function(ctx) {
};


// Enter a parse tree produced by HiveParser#tableFileFormat.
HiveParserListener.prototype.enterTableFileFormat = function(ctx) {
};

// Exit a parse tree produced by HiveParser#tableFileFormat.
HiveParserListener.prototype.exitTableFileFormat = function(ctx) {
};


// Enter a parse tree produced by HiveParser#tableFileFormatStoredBy.
HiveParserListener.prototype.enterTableFileFormatStoredBy = function(ctx) {
};

// Exit a parse tree produced by HiveParser#tableFileFormatStoredBy.
HiveParserListener.prototype.exitTableFileFormatStoredBy = function(ctx) {
};


// Enter a parse tree produced by HiveParser#tableFileFormatStoredAs.
HiveParserListener.prototype.enterTableFileFormatStoredAs = function(ctx) {
};

// Exit a parse tree produced by HiveParser#tableFileFormatStoredAs.
HiveParserListener.prototype.exitTableFileFormatStoredAs = function(ctx) {
};


// Enter a parse tree produced by HiveParser#tableFileFormatStoredAsFormat.
HiveParserListener.prototype.enterTableFileFormatStoredAsFormat = function(ctx) {
};

// Exit a parse tree produced by HiveParser#tableFileFormatStoredAsFormat.
HiveParserListener.prototype.exitTableFileFormatStoredAsFormat = function(ctx) {
};


// Enter a parse tree produced by HiveParser#tableInputOutputFileFormat.
HiveParserListener.prototype.enterTableInputOutputFileFormat = function(ctx) {
};

// Exit a parse tree produced by HiveParser#tableInputOutputFileFormat.
HiveParserListener.prototype.exitTableInputOutputFileFormat = function(ctx) {
};


// Enter a parse tree produced by HiveParser#tableInputLiteral.
HiveParserListener.prototype.enterTableInputLiteral = function(ctx) {
};

// Exit a parse tree produced by HiveParser#tableInputLiteral.
HiveParserListener.prototype.exitTableInputLiteral = function(ctx) {
};


// Enter a parse tree produced by HiveParser#tableOutputLiteral.
HiveParserListener.prototype.enterTableOutputLiteral = function(ctx) {
};

// Exit a parse tree produced by HiveParser#tableOutputLiteral.
HiveParserListener.prototype.exitTableOutputLiteral = function(ctx) {
};


// Enter a parse tree produced by HiveParser#tableLocation.
HiveParserListener.prototype.enterTableLocation = function(ctx) {
};

// Exit a parse tree produced by HiveParser#tableLocation.
HiveParserListener.prototype.exitTableLocation = function(ctx) {
};


// Enter a parse tree produced by HiveParser#columnNameTypeList.
HiveParserListener.prototype.enterColumnNameTypeList = function(ctx) {
};

// Exit a parse tree produced by HiveParser#columnNameTypeList.
HiveParserListener.prototype.exitColumnNameTypeList = function(ctx) {
};


// Enter a parse tree produced by HiveParser#columnNameTypeOrConstraintList.
HiveParserListener.prototype.enterColumnNameTypeOrConstraintList = function(ctx) {
};

// Exit a parse tree produced by HiveParser#columnNameTypeOrConstraintList.
HiveParserListener.prototype.exitColumnNameTypeOrConstraintList = function(ctx) {
};


// Enter a parse tree produced by HiveParser#columnNameColonTypeList.
HiveParserListener.prototype.enterColumnNameColonTypeList = function(ctx) {
};

// Exit a parse tree produced by HiveParser#columnNameColonTypeList.
HiveParserListener.prototype.exitColumnNameColonTypeList = function(ctx) {
};


// Enter a parse tree produced by HiveParser#columnNameList.
HiveParserListener.prototype.enterColumnNameList = function(ctx) {
};

// Exit a parse tree produced by HiveParser#columnNameList.
HiveParserListener.prototype.exitColumnNameList = function(ctx) {
};


// Enter a parse tree produced by HiveParser#columnName.
HiveParserListener.prototype.enterColumnName = function(ctx) {
};

// Exit a parse tree produced by HiveParser#columnName.
HiveParserListener.prototype.exitColumnName = function(ctx) {
};


// Enter a parse tree produced by HiveParser#extColumnName.
HiveParserListener.prototype.enterExtColumnName = function(ctx) {
};

// Exit a parse tree produced by HiveParser#extColumnName.
HiveParserListener.prototype.exitExtColumnName = function(ctx) {
};


// Enter a parse tree produced by HiveParser#columnNameOrderList.
HiveParserListener.prototype.enterColumnNameOrderList = function(ctx) {
};

// Exit a parse tree produced by HiveParser#columnNameOrderList.
HiveParserListener.prototype.exitColumnNameOrderList = function(ctx) {
};


// Enter a parse tree produced by HiveParser#columnParenthesesList.
HiveParserListener.prototype.enterColumnParenthesesList = function(ctx) {
};

// Exit a parse tree produced by HiveParser#columnParenthesesList.
HiveParserListener.prototype.exitColumnParenthesesList = function(ctx) {
};


// Enter a parse tree produced by HiveParser#enableValidateSpecification.
HiveParserListener.prototype.enterEnableValidateSpecification = function(ctx) {
};

// Exit a parse tree produced by HiveParser#enableValidateSpecification.
HiveParserListener.prototype.exitEnableValidateSpecification = function(ctx) {
};


// Enter a parse tree produced by HiveParser#enableSpecification.
HiveParserListener.prototype.enterEnableSpecification = function(ctx) {
};

// Exit a parse tree produced by HiveParser#enableSpecification.
HiveParserListener.prototype.exitEnableSpecification = function(ctx) {
};


// Enter a parse tree produced by HiveParser#validateSpecification.
HiveParserListener.prototype.enterValidateSpecification = function(ctx) {
};

// Exit a parse tree produced by HiveParser#validateSpecification.
HiveParserListener.prototype.exitValidateSpecification = function(ctx) {
};


// Enter a parse tree produced by HiveParser#enforcedSpecification.
HiveParserListener.prototype.enterEnforcedSpecification = function(ctx) {
};

// Exit a parse tree produced by HiveParser#enforcedSpecification.
HiveParserListener.prototype.exitEnforcedSpecification = function(ctx) {
};


// Enter a parse tree produced by HiveParser#relySpecification.
HiveParserListener.prototype.enterRelySpecification = function(ctx) {
};

// Exit a parse tree produced by HiveParser#relySpecification.
HiveParserListener.prototype.exitRelySpecification = function(ctx) {
};


// Enter a parse tree produced by HiveParser#createConstraint.
HiveParserListener.prototype.enterCreateConstraint = function(ctx) {
};

// Exit a parse tree produced by HiveParser#createConstraint.
HiveParserListener.prototype.exitCreateConstraint = function(ctx) {
};


// Enter a parse tree produced by HiveParser#alterConstraintWithName.
HiveParserListener.prototype.enterAlterConstraintWithName = function(ctx) {
};

// Exit a parse tree produced by HiveParser#alterConstraintWithName.
HiveParserListener.prototype.exitAlterConstraintWithName = function(ctx) {
};


// Enter a parse tree produced by HiveParser#tableLevelConstraint.
HiveParserListener.prototype.enterTableLevelConstraint = function(ctx) {
};

// Exit a parse tree produced by HiveParser#tableLevelConstraint.
HiveParserListener.prototype.exitTableLevelConstraint = function(ctx) {
};


// Enter a parse tree produced by HiveParser#pkUkConstraint.
HiveParserListener.prototype.enterPkUkConstraint = function(ctx) {
};

// Exit a parse tree produced by HiveParser#pkUkConstraint.
HiveParserListener.prototype.exitPkUkConstraint = function(ctx) {
};


// Enter a parse tree produced by HiveParser#checkConstraint.
HiveParserListener.prototype.enterCheckConstraint = function(ctx) {
};

// Exit a parse tree produced by HiveParser#checkConstraint.
HiveParserListener.prototype.exitCheckConstraint = function(ctx) {
};


// Enter a parse tree produced by HiveParser#createForeignKey.
HiveParserListener.prototype.enterCreateForeignKey = function(ctx) {
};

// Exit a parse tree produced by HiveParser#createForeignKey.
HiveParserListener.prototype.exitCreateForeignKey = function(ctx) {
};


// Enter a parse tree produced by HiveParser#alterForeignKeyWithName.
HiveParserListener.prototype.enterAlterForeignKeyWithName = function(ctx) {
};

// Exit a parse tree produced by HiveParser#alterForeignKeyWithName.
HiveParserListener.prototype.exitAlterForeignKeyWithName = function(ctx) {
};


// Enter a parse tree produced by HiveParser#skewedValueElement.
HiveParserListener.prototype.enterSkewedValueElement = function(ctx) {
};

// Exit a parse tree produced by HiveParser#skewedValueElement.
HiveParserListener.prototype.exitSkewedValueElement = function(ctx) {
};


// Enter a parse tree produced by HiveParser#skewedColumnValuePairList.
HiveParserListener.prototype.enterSkewedColumnValuePairList = function(ctx) {
};

// Exit a parse tree produced by HiveParser#skewedColumnValuePairList.
HiveParserListener.prototype.exitSkewedColumnValuePairList = function(ctx) {
};


// Enter a parse tree produced by HiveParser#skewedColumnValuePair.
HiveParserListener.prototype.enterSkewedColumnValuePair = function(ctx) {
};

// Exit a parse tree produced by HiveParser#skewedColumnValuePair.
HiveParserListener.prototype.exitSkewedColumnValuePair = function(ctx) {
};


// Enter a parse tree produced by HiveParser#skewedColumnValues.
HiveParserListener.prototype.enterSkewedColumnValues = function(ctx) {
};

// Exit a parse tree produced by HiveParser#skewedColumnValues.
HiveParserListener.prototype.exitSkewedColumnValues = function(ctx) {
};


// Enter a parse tree produced by HiveParser#skewedColumnValue.
HiveParserListener.prototype.enterSkewedColumnValue = function(ctx) {
};

// Exit a parse tree produced by HiveParser#skewedColumnValue.
HiveParserListener.prototype.exitSkewedColumnValue = function(ctx) {
};


// Enter a parse tree produced by HiveParser#skewedValueLocationElement.
HiveParserListener.prototype.enterSkewedValueLocationElement = function(ctx) {
};

// Exit a parse tree produced by HiveParser#skewedValueLocationElement.
HiveParserListener.prototype.exitSkewedValueLocationElement = function(ctx) {
};


// Enter a parse tree produced by HiveParser#orderSpecification.
HiveParserListener.prototype.enterOrderSpecification = function(ctx) {
};

// Exit a parse tree produced by HiveParser#orderSpecification.
HiveParserListener.prototype.exitOrderSpecification = function(ctx) {
};


// Enter a parse tree produced by HiveParser#nullOrdering.
HiveParserListener.prototype.enterNullOrdering = function(ctx) {
};

// Exit a parse tree produced by HiveParser#nullOrdering.
HiveParserListener.prototype.exitNullOrdering = function(ctx) {
};


// Enter a parse tree produced by HiveParser#columnNameOrder.
HiveParserListener.prototype.enterColumnNameOrder = function(ctx) {
};

// Exit a parse tree produced by HiveParser#columnNameOrder.
HiveParserListener.prototype.exitColumnNameOrder = function(ctx) {
};


// Enter a parse tree produced by HiveParser#columnNameCommentList.
HiveParserListener.prototype.enterColumnNameCommentList = function(ctx) {
};

// Exit a parse tree produced by HiveParser#columnNameCommentList.
HiveParserListener.prototype.exitColumnNameCommentList = function(ctx) {
};


// Enter a parse tree produced by HiveParser#columnNameComment.
HiveParserListener.prototype.enterColumnNameComment = function(ctx) {
};

// Exit a parse tree produced by HiveParser#columnNameComment.
HiveParserListener.prototype.exitColumnNameComment = function(ctx) {
};


// Enter a parse tree produced by HiveParser#columnRefOrder.
HiveParserListener.prototype.enterColumnRefOrder = function(ctx) {
};

// Exit a parse tree produced by HiveParser#columnRefOrder.
HiveParserListener.prototype.exitColumnRefOrder = function(ctx) {
};


// Enter a parse tree produced by HiveParser#columnNameType.
HiveParserListener.prototype.enterColumnNameType = function(ctx) {
};

// Exit a parse tree produced by HiveParser#columnNameType.
HiveParserListener.prototype.exitColumnNameType = function(ctx) {
};


// Enter a parse tree produced by HiveParser#columnNameTypeOrConstraint.
HiveParserListener.prototype.enterColumnNameTypeOrConstraint = function(ctx) {
};

// Exit a parse tree produced by HiveParser#columnNameTypeOrConstraint.
HiveParserListener.prototype.exitColumnNameTypeOrConstraint = function(ctx) {
};


// Enter a parse tree produced by HiveParser#tableConstraint.
HiveParserListener.prototype.enterTableConstraint = function(ctx) {
};

// Exit a parse tree produced by HiveParser#tableConstraint.
HiveParserListener.prototype.exitTableConstraint = function(ctx) {
};


// Enter a parse tree produced by HiveParser#columnNameTypeConstraint.
HiveParserListener.prototype.enterColumnNameTypeConstraint = function(ctx) {
};

// Exit a parse tree produced by HiveParser#columnNameTypeConstraint.
HiveParserListener.prototype.exitColumnNameTypeConstraint = function(ctx) {
};


// Enter a parse tree produced by HiveParser#columnConstraint.
HiveParserListener.prototype.enterColumnConstraint = function(ctx) {
};

// Exit a parse tree produced by HiveParser#columnConstraint.
HiveParserListener.prototype.exitColumnConstraint = function(ctx) {
};


// Enter a parse tree produced by HiveParser#foreignKeyConstraint.
HiveParserListener.prototype.enterForeignKeyConstraint = function(ctx) {
};

// Exit a parse tree produced by HiveParser#foreignKeyConstraint.
HiveParserListener.prototype.exitForeignKeyConstraint = function(ctx) {
};


// Enter a parse tree produced by HiveParser#colConstraint.
HiveParserListener.prototype.enterColConstraint = function(ctx) {
};

// Exit a parse tree produced by HiveParser#colConstraint.
HiveParserListener.prototype.exitColConstraint = function(ctx) {
};


// Enter a parse tree produced by HiveParser#alterColumnConstraint.
HiveParserListener.prototype.enterAlterColumnConstraint = function(ctx) {
};

// Exit a parse tree produced by HiveParser#alterColumnConstraint.
HiveParserListener.prototype.exitAlterColumnConstraint = function(ctx) {
};


// Enter a parse tree produced by HiveParser#alterForeignKeyConstraint.
HiveParserListener.prototype.enterAlterForeignKeyConstraint = function(ctx) {
};

// Exit a parse tree produced by HiveParser#alterForeignKeyConstraint.
HiveParserListener.prototype.exitAlterForeignKeyConstraint = function(ctx) {
};


// Enter a parse tree produced by HiveParser#alterColConstraint.
HiveParserListener.prototype.enterAlterColConstraint = function(ctx) {
};

// Exit a parse tree produced by HiveParser#alterColConstraint.
HiveParserListener.prototype.exitAlterColConstraint = function(ctx) {
};


// Enter a parse tree produced by HiveParser#columnConstraintType.
HiveParserListener.prototype.enterColumnConstraintType = function(ctx) {
};

// Exit a parse tree produced by HiveParser#columnConstraintType.
HiveParserListener.prototype.exitColumnConstraintType = function(ctx) {
};


// Enter a parse tree produced by HiveParser#defaultVal.
HiveParserListener.prototype.enterDefaultVal = function(ctx) {
};

// Exit a parse tree produced by HiveParser#defaultVal.
HiveParserListener.prototype.exitDefaultVal = function(ctx) {
};


// Enter a parse tree produced by HiveParser#tableConstraintType.
HiveParserListener.prototype.enterTableConstraintType = function(ctx) {
};

// Exit a parse tree produced by HiveParser#tableConstraintType.
HiveParserListener.prototype.exitTableConstraintType = function(ctx) {
};


// Enter a parse tree produced by HiveParser#constraintOptsCreate.
HiveParserListener.prototype.enterConstraintOptsCreate = function(ctx) {
};

// Exit a parse tree produced by HiveParser#constraintOptsCreate.
HiveParserListener.prototype.exitConstraintOptsCreate = function(ctx) {
};


// Enter a parse tree produced by HiveParser#constraintOptsAlter.
HiveParserListener.prototype.enterConstraintOptsAlter = function(ctx) {
};

// Exit a parse tree produced by HiveParser#constraintOptsAlter.
HiveParserListener.prototype.exitConstraintOptsAlter = function(ctx) {
};


// Enter a parse tree produced by HiveParser#columnNameColonType.
HiveParserListener.prototype.enterColumnNameColonType = function(ctx) {
};

// Exit a parse tree produced by HiveParser#columnNameColonType.
HiveParserListener.prototype.exitColumnNameColonType = function(ctx) {
};


// Enter a parse tree produced by HiveParser#colType.
HiveParserListener.prototype.enterColType = function(ctx) {
};

// Exit a parse tree produced by HiveParser#colType.
HiveParserListener.prototype.exitColType = function(ctx) {
};


// Enter a parse tree produced by HiveParser#colTypeList.
HiveParserListener.prototype.enterColTypeList = function(ctx) {
};

// Exit a parse tree produced by HiveParser#colTypeList.
HiveParserListener.prototype.exitColTypeList = function(ctx) {
};


// Enter a parse tree produced by HiveParser#type_db_col.
HiveParserListener.prototype.enterType_db_col = function(ctx) {
};

// Exit a parse tree produced by HiveParser#type_db_col.
HiveParserListener.prototype.exitType_db_col = function(ctx) {
};


// Enter a parse tree produced by HiveParser#primitiveType.
HiveParserListener.prototype.enterPrimitiveType = function(ctx) {
};

// Exit a parse tree produced by HiveParser#primitiveType.
HiveParserListener.prototype.exitPrimitiveType = function(ctx) {
};


// Enter a parse tree produced by HiveParser#listType.
HiveParserListener.prototype.enterListType = function(ctx) {
};

// Exit a parse tree produced by HiveParser#listType.
HiveParserListener.prototype.exitListType = function(ctx) {
};


// Enter a parse tree produced by HiveParser#structType.
HiveParserListener.prototype.enterStructType = function(ctx) {
};

// Exit a parse tree produced by HiveParser#structType.
HiveParserListener.prototype.exitStructType = function(ctx) {
};


// Enter a parse tree produced by HiveParser#mapType.
HiveParserListener.prototype.enterMapType = function(ctx) {
};

// Exit a parse tree produced by HiveParser#mapType.
HiveParserListener.prototype.exitMapType = function(ctx) {
};


// Enter a parse tree produced by HiveParser#unionType.
HiveParserListener.prototype.enterUnionType = function(ctx) {
};

// Exit a parse tree produced by HiveParser#unionType.
HiveParserListener.prototype.exitUnionType = function(ctx) {
};


// Enter a parse tree produced by HiveParser#setOperator.
HiveParserListener.prototype.enterSetOperator = function(ctx) {
};

// Exit a parse tree produced by HiveParser#setOperator.
HiveParserListener.prototype.exitSetOperator = function(ctx) {
};


// Enter a parse tree produced by HiveParser#queryStatementExpression.
HiveParserListener.prototype.enterQueryStatementExpression = function(ctx) {
};

// Exit a parse tree produced by HiveParser#queryStatementExpression.
HiveParserListener.prototype.exitQueryStatementExpression = function(ctx) {
};


// Enter a parse tree produced by HiveParser#queryStatementExpressionBody.
HiveParserListener.prototype.enterQueryStatementExpressionBody = function(ctx) {
};

// Exit a parse tree produced by HiveParser#queryStatementExpressionBody.
HiveParserListener.prototype.exitQueryStatementExpressionBody = function(ctx) {
};


// Enter a parse tree produced by HiveParser#withClause.
HiveParserListener.prototype.enterWithClause = function(ctx) {
};

// Exit a parse tree produced by HiveParser#withClause.
HiveParserListener.prototype.exitWithClause = function(ctx) {
};


// Enter a parse tree produced by HiveParser#cteStatement.
HiveParserListener.prototype.enterCteStatement = function(ctx) {
};

// Exit a parse tree produced by HiveParser#cteStatement.
HiveParserListener.prototype.exitCteStatement = function(ctx) {
};


// Enter a parse tree produced by HiveParser#fromStatement.
HiveParserListener.prototype.enterFromStatement = function(ctx) {
};

// Exit a parse tree produced by HiveParser#fromStatement.
HiveParserListener.prototype.exitFromStatement = function(ctx) {
};


// Enter a parse tree produced by HiveParser#singleFromStatement.
HiveParserListener.prototype.enterSingleFromStatement = function(ctx) {
};

// Exit a parse tree produced by HiveParser#singleFromStatement.
HiveParserListener.prototype.exitSingleFromStatement = function(ctx) {
};


// Enter a parse tree produced by HiveParser#regularBody.
HiveParserListener.prototype.enterRegularBody = function(ctx) {
};

// Exit a parse tree produced by HiveParser#regularBody.
HiveParserListener.prototype.exitRegularBody = function(ctx) {
};


// Enter a parse tree produced by HiveParser#atomSelectStatement.
HiveParserListener.prototype.enterAtomSelectStatement = function(ctx) {
};

// Exit a parse tree produced by HiveParser#atomSelectStatement.
HiveParserListener.prototype.exitAtomSelectStatement = function(ctx) {
};


// Enter a parse tree produced by HiveParser#selectStatement.
HiveParserListener.prototype.enterSelectStatement = function(ctx) {
};

// Exit a parse tree produced by HiveParser#selectStatement.
HiveParserListener.prototype.exitSelectStatement = function(ctx) {
};


// Enter a parse tree produced by HiveParser#setOpSelectStatement.
HiveParserListener.prototype.enterSetOpSelectStatement = function(ctx) {
};

// Exit a parse tree produced by HiveParser#setOpSelectStatement.
HiveParserListener.prototype.exitSetOpSelectStatement = function(ctx) {
};


// Enter a parse tree produced by HiveParser#selectStatementWithCTE.
HiveParserListener.prototype.enterSelectStatementWithCTE = function(ctx) {
};

// Exit a parse tree produced by HiveParser#selectStatementWithCTE.
HiveParserListener.prototype.exitSelectStatementWithCTE = function(ctx) {
};


// Enter a parse tree produced by HiveParser#body.
HiveParserListener.prototype.enterBody = function(ctx) {
};

// Exit a parse tree produced by HiveParser#body.
HiveParserListener.prototype.exitBody = function(ctx) {
};


// Enter a parse tree produced by HiveParser#insertClause.
HiveParserListener.prototype.enterInsertClause = function(ctx) {
};

// Exit a parse tree produced by HiveParser#insertClause.
HiveParserListener.prototype.exitInsertClause = function(ctx) {
};


// Enter a parse tree produced by HiveParser#destination.
HiveParserListener.prototype.enterDestination = function(ctx) {
};

// Exit a parse tree produced by HiveParser#destination.
HiveParserListener.prototype.exitDestination = function(ctx) {
};


// Enter a parse tree produced by HiveParser#limitClause.
HiveParserListener.prototype.enterLimitClause = function(ctx) {
};

// Exit a parse tree produced by HiveParser#limitClause.
HiveParserListener.prototype.exitLimitClause = function(ctx) {
};


// Enter a parse tree produced by HiveParser#deleteStatement.
HiveParserListener.prototype.enterDeleteStatement = function(ctx) {
};

// Exit a parse tree produced by HiveParser#deleteStatement.
HiveParserListener.prototype.exitDeleteStatement = function(ctx) {
};


// Enter a parse tree produced by HiveParser#columnAssignmentClause.
HiveParserListener.prototype.enterColumnAssignmentClause = function(ctx) {
};

// Exit a parse tree produced by HiveParser#columnAssignmentClause.
HiveParserListener.prototype.exitColumnAssignmentClause = function(ctx) {
};


// Enter a parse tree produced by HiveParser#setColumnsClause.
HiveParserListener.prototype.enterSetColumnsClause = function(ctx) {
};

// Exit a parse tree produced by HiveParser#setColumnsClause.
HiveParserListener.prototype.exitSetColumnsClause = function(ctx) {
};


// Enter a parse tree produced by HiveParser#updateStatement.
HiveParserListener.prototype.enterUpdateStatement = function(ctx) {
};

// Exit a parse tree produced by HiveParser#updateStatement.
HiveParserListener.prototype.exitUpdateStatement = function(ctx) {
};


// Enter a parse tree produced by HiveParser#sqlTransactionStatement.
HiveParserListener.prototype.enterSqlTransactionStatement = function(ctx) {
};

// Exit a parse tree produced by HiveParser#sqlTransactionStatement.
HiveParserListener.prototype.exitSqlTransactionStatement = function(ctx) {
};


// Enter a parse tree produced by HiveParser#startTransactionStatement.
HiveParserListener.prototype.enterStartTransactionStatement = function(ctx) {
};

// Exit a parse tree produced by HiveParser#startTransactionStatement.
HiveParserListener.prototype.exitStartTransactionStatement = function(ctx) {
};


// Enter a parse tree produced by HiveParser#transactionMode.
HiveParserListener.prototype.enterTransactionMode = function(ctx) {
};

// Exit a parse tree produced by HiveParser#transactionMode.
HiveParserListener.prototype.exitTransactionMode = function(ctx) {
};


// Enter a parse tree produced by HiveParser#transactionAccessMode.
HiveParserListener.prototype.enterTransactionAccessMode = function(ctx) {
};

// Exit a parse tree produced by HiveParser#transactionAccessMode.
HiveParserListener.prototype.exitTransactionAccessMode = function(ctx) {
};


// Enter a parse tree produced by HiveParser#isolationLevel.
HiveParserListener.prototype.enterIsolationLevel = function(ctx) {
};

// Exit a parse tree produced by HiveParser#isolationLevel.
HiveParserListener.prototype.exitIsolationLevel = function(ctx) {
};


// Enter a parse tree produced by HiveParser#levelOfIsolation.
HiveParserListener.prototype.enterLevelOfIsolation = function(ctx) {
};

// Exit a parse tree produced by HiveParser#levelOfIsolation.
HiveParserListener.prototype.exitLevelOfIsolation = function(ctx) {
};


// Enter a parse tree produced by HiveParser#commitStatement.
HiveParserListener.prototype.enterCommitStatement = function(ctx) {
};

// Exit a parse tree produced by HiveParser#commitStatement.
HiveParserListener.prototype.exitCommitStatement = function(ctx) {
};


// Enter a parse tree produced by HiveParser#rollbackStatement.
HiveParserListener.prototype.enterRollbackStatement = function(ctx) {
};

// Exit a parse tree produced by HiveParser#rollbackStatement.
HiveParserListener.prototype.exitRollbackStatement = function(ctx) {
};


// Enter a parse tree produced by HiveParser#setAutoCommitStatement.
HiveParserListener.prototype.enterSetAutoCommitStatement = function(ctx) {
};

// Exit a parse tree produced by HiveParser#setAutoCommitStatement.
HiveParserListener.prototype.exitSetAutoCommitStatement = function(ctx) {
};


// Enter a parse tree produced by HiveParser#abortTransactionStatement.
HiveParserListener.prototype.enterAbortTransactionStatement = function(ctx) {
};

// Exit a parse tree produced by HiveParser#abortTransactionStatement.
HiveParserListener.prototype.exitAbortTransactionStatement = function(ctx) {
};


// Enter a parse tree produced by HiveParser#mergeStatement.
HiveParserListener.prototype.enterMergeStatement = function(ctx) {
};

// Exit a parse tree produced by HiveParser#mergeStatement.
HiveParserListener.prototype.exitMergeStatement = function(ctx) {
};


// Enter a parse tree produced by HiveParser#whenClauses.
HiveParserListener.prototype.enterWhenClauses = function(ctx) {
};

// Exit a parse tree produced by HiveParser#whenClauses.
HiveParserListener.prototype.exitWhenClauses = function(ctx) {
};


// Enter a parse tree produced by HiveParser#whenNotMatchedClause.
HiveParserListener.prototype.enterWhenNotMatchedClause = function(ctx) {
};

// Exit a parse tree produced by HiveParser#whenNotMatchedClause.
HiveParserListener.prototype.exitWhenNotMatchedClause = function(ctx) {
};


// Enter a parse tree produced by HiveParser#whenMatchedAndClause.
HiveParserListener.prototype.enterWhenMatchedAndClause = function(ctx) {
};

// Exit a parse tree produced by HiveParser#whenMatchedAndClause.
HiveParserListener.prototype.exitWhenMatchedAndClause = function(ctx) {
};


// Enter a parse tree produced by HiveParser#whenMatchedThenClause.
HiveParserListener.prototype.enterWhenMatchedThenClause = function(ctx) {
};

// Exit a parse tree produced by HiveParser#whenMatchedThenClause.
HiveParserListener.prototype.exitWhenMatchedThenClause = function(ctx) {
};


// Enter a parse tree produced by HiveParser#updateOrDelete.
HiveParserListener.prototype.enterUpdateOrDelete = function(ctx) {
};

// Exit a parse tree produced by HiveParser#updateOrDelete.
HiveParserListener.prototype.exitUpdateOrDelete = function(ctx) {
};


// Enter a parse tree produced by HiveParser#killQueryStatement.
HiveParserListener.prototype.enterKillQueryStatement = function(ctx) {
};

// Exit a parse tree produced by HiveParser#killQueryStatement.
HiveParserListener.prototype.exitKillQueryStatement = function(ctx) {
};


// Enter a parse tree produced by HiveParser#selectClause.
HiveParserListener.prototype.enterSelectClause = function(ctx) {
};

// Exit a parse tree produced by HiveParser#selectClause.
HiveParserListener.prototype.exitSelectClause = function(ctx) {
};


// Enter a parse tree produced by HiveParser#selectList.
HiveParserListener.prototype.enterSelectList = function(ctx) {
};

// Exit a parse tree produced by HiveParser#selectList.
HiveParserListener.prototype.exitSelectList = function(ctx) {
};


// Enter a parse tree produced by HiveParser#selectTrfmClause.
HiveParserListener.prototype.enterSelectTrfmClause = function(ctx) {
};

// Exit a parse tree produced by HiveParser#selectTrfmClause.
HiveParserListener.prototype.exitSelectTrfmClause = function(ctx) {
};


// Enter a parse tree produced by HiveParser#selectItem.
HiveParserListener.prototype.enterSelectItem = function(ctx) {
};

// Exit a parse tree produced by HiveParser#selectItem.
HiveParserListener.prototype.exitSelectItem = function(ctx) {
};


// Enter a parse tree produced by HiveParser#trfmClause.
HiveParserListener.prototype.enterTrfmClause = function(ctx) {
};

// Exit a parse tree produced by HiveParser#trfmClause.
HiveParserListener.prototype.exitTrfmClause = function(ctx) {
};


// Enter a parse tree produced by HiveParser#selectExpression.
HiveParserListener.prototype.enterSelectExpression = function(ctx) {
};

// Exit a parse tree produced by HiveParser#selectExpression.
HiveParserListener.prototype.exitSelectExpression = function(ctx) {
};


// Enter a parse tree produced by HiveParser#selectExpressionList.
HiveParserListener.prototype.enterSelectExpressionList = function(ctx) {
};

// Exit a parse tree produced by HiveParser#selectExpressionList.
HiveParserListener.prototype.exitSelectExpressionList = function(ctx) {
};


// Enter a parse tree produced by HiveParser#window_clause.
HiveParserListener.prototype.enterWindow_clause = function(ctx) {
};

// Exit a parse tree produced by HiveParser#window_clause.
HiveParserListener.prototype.exitWindow_clause = function(ctx) {
};


// Enter a parse tree produced by HiveParser#window_defn.
HiveParserListener.prototype.enterWindow_defn = function(ctx) {
};

// Exit a parse tree produced by HiveParser#window_defn.
HiveParserListener.prototype.exitWindow_defn = function(ctx) {
};


// Enter a parse tree produced by HiveParser#window_specification.
HiveParserListener.prototype.enterWindow_specification = function(ctx) {
};

// Exit a parse tree produced by HiveParser#window_specification.
HiveParserListener.prototype.exitWindow_specification = function(ctx) {
};


// Enter a parse tree produced by HiveParser#window_frame.
HiveParserListener.prototype.enterWindow_frame = function(ctx) {
};

// Exit a parse tree produced by HiveParser#window_frame.
HiveParserListener.prototype.exitWindow_frame = function(ctx) {
};


// Enter a parse tree produced by HiveParser#window_range_expression.
HiveParserListener.prototype.enterWindow_range_expression = function(ctx) {
};

// Exit a parse tree produced by HiveParser#window_range_expression.
HiveParserListener.prototype.exitWindow_range_expression = function(ctx) {
};


// Enter a parse tree produced by HiveParser#window_value_expression.
HiveParserListener.prototype.enterWindow_value_expression = function(ctx) {
};

// Exit a parse tree produced by HiveParser#window_value_expression.
HiveParserListener.prototype.exitWindow_value_expression = function(ctx) {
};


// Enter a parse tree produced by HiveParser#window_frame_start_boundary.
HiveParserListener.prototype.enterWindow_frame_start_boundary = function(ctx) {
};

// Exit a parse tree produced by HiveParser#window_frame_start_boundary.
HiveParserListener.prototype.exitWindow_frame_start_boundary = function(ctx) {
};


// Enter a parse tree produced by HiveParser#window_frame_boundary.
HiveParserListener.prototype.enterWindow_frame_boundary = function(ctx) {
};

// Exit a parse tree produced by HiveParser#window_frame_boundary.
HiveParserListener.prototype.exitWindow_frame_boundary = function(ctx) {
};


// Enter a parse tree produced by HiveParser#tableAllColumns.
HiveParserListener.prototype.enterTableAllColumns = function(ctx) {
};

// Exit a parse tree produced by HiveParser#tableAllColumns.
HiveParserListener.prototype.exitTableAllColumns = function(ctx) {
};


// Enter a parse tree produced by HiveParser#tableOrColumn.
HiveParserListener.prototype.enterTableOrColumn = function(ctx) {
};

// Exit a parse tree produced by HiveParser#tableOrColumn.
HiveParserListener.prototype.exitTableOrColumn = function(ctx) {
};


// Enter a parse tree produced by HiveParser#expressionList.
HiveParserListener.prototype.enterExpressionList = function(ctx) {
};

// Exit a parse tree produced by HiveParser#expressionList.
HiveParserListener.prototype.exitExpressionList = function(ctx) {
};


// Enter a parse tree produced by HiveParser#aliasList.
HiveParserListener.prototype.enterAliasList = function(ctx) {
};

// Exit a parse tree produced by HiveParser#aliasList.
HiveParserListener.prototype.exitAliasList = function(ctx) {
};


// Enter a parse tree produced by HiveParser#fromClause.
HiveParserListener.prototype.enterFromClause = function(ctx) {
};

// Exit a parse tree produced by HiveParser#fromClause.
HiveParserListener.prototype.exitFromClause = function(ctx) {
};


// Enter a parse tree produced by HiveParser#fromSource.
HiveParserListener.prototype.enterFromSource = function(ctx) {
};

// Exit a parse tree produced by HiveParser#fromSource.
HiveParserListener.prototype.exitFromSource = function(ctx) {
};


// Enter a parse tree produced by HiveParser#atomjoinSource.
HiveParserListener.prototype.enterAtomjoinSource = function(ctx) {
};

// Exit a parse tree produced by HiveParser#atomjoinSource.
HiveParserListener.prototype.exitAtomjoinSource = function(ctx) {
};


// Enter a parse tree produced by HiveParser#joinSource.
HiveParserListener.prototype.enterJoinSource = function(ctx) {
};

// Exit a parse tree produced by HiveParser#joinSource.
HiveParserListener.prototype.exitJoinSource = function(ctx) {
};


// Enter a parse tree produced by HiveParser#joinSourcePart.
HiveParserListener.prototype.enterJoinSourcePart = function(ctx) {
};

// Exit a parse tree produced by HiveParser#joinSourcePart.
HiveParserListener.prototype.exitJoinSourcePart = function(ctx) {
};


// Enter a parse tree produced by HiveParser#uniqueJoinSource.
HiveParserListener.prototype.enterUniqueJoinSource = function(ctx) {
};

// Exit a parse tree produced by HiveParser#uniqueJoinSource.
HiveParserListener.prototype.exitUniqueJoinSource = function(ctx) {
};


// Enter a parse tree produced by HiveParser#uniqueJoinExpr.
HiveParserListener.prototype.enterUniqueJoinExpr = function(ctx) {
};

// Exit a parse tree produced by HiveParser#uniqueJoinExpr.
HiveParserListener.prototype.exitUniqueJoinExpr = function(ctx) {
};


// Enter a parse tree produced by HiveParser#uniqueJoinToken.
HiveParserListener.prototype.enterUniqueJoinToken = function(ctx) {
};

// Exit a parse tree produced by HiveParser#uniqueJoinToken.
HiveParserListener.prototype.exitUniqueJoinToken = function(ctx) {
};


// Enter a parse tree produced by HiveParser#joinToken.
HiveParserListener.prototype.enterJoinToken = function(ctx) {
};

// Exit a parse tree produced by HiveParser#joinToken.
HiveParserListener.prototype.exitJoinToken = function(ctx) {
};


// Enter a parse tree produced by HiveParser#lateralView.
HiveParserListener.prototype.enterLateralView = function(ctx) {
};

// Exit a parse tree produced by HiveParser#lateralView.
HiveParserListener.prototype.exitLateralView = function(ctx) {
};


// Enter a parse tree produced by HiveParser#tableAlias.
HiveParserListener.prototype.enterTableAlias = function(ctx) {
};

// Exit a parse tree produced by HiveParser#tableAlias.
HiveParserListener.prototype.exitTableAlias = function(ctx) {
};


// Enter a parse tree produced by HiveParser#tableBucketSample.
HiveParserListener.prototype.enterTableBucketSample = function(ctx) {
};

// Exit a parse tree produced by HiveParser#tableBucketSample.
HiveParserListener.prototype.exitTableBucketSample = function(ctx) {
};


// Enter a parse tree produced by HiveParser#splitSample.
HiveParserListener.prototype.enterSplitSample = function(ctx) {
};

// Exit a parse tree produced by HiveParser#splitSample.
HiveParserListener.prototype.exitSplitSample = function(ctx) {
};


// Enter a parse tree produced by HiveParser#tableSample.
HiveParserListener.prototype.enterTableSample = function(ctx) {
};

// Exit a parse tree produced by HiveParser#tableSample.
HiveParserListener.prototype.exitTableSample = function(ctx) {
};


// Enter a parse tree produced by HiveParser#tableSource.
HiveParserListener.prototype.enterTableSource = function(ctx) {
};

// Exit a parse tree produced by HiveParser#tableSource.
HiveParserListener.prototype.exitTableSource = function(ctx) {
};


// Enter a parse tree produced by HiveParser#uniqueJoinTableSource.
HiveParserListener.prototype.enterUniqueJoinTableSource = function(ctx) {
};

// Exit a parse tree produced by HiveParser#uniqueJoinTableSource.
HiveParserListener.prototype.exitUniqueJoinTableSource = function(ctx) {
};


// Enter a parse tree produced by HiveParser#tableName.
HiveParserListener.prototype.enterTableName = function(ctx) {
};

// Exit a parse tree produced by HiveParser#tableName.
HiveParserListener.prototype.exitTableName = function(ctx) {
};


// Enter a parse tree produced by HiveParser#viewName.
HiveParserListener.prototype.enterViewName = function(ctx) {
};

// Exit a parse tree produced by HiveParser#viewName.
HiveParserListener.prototype.exitViewName = function(ctx) {
};


// Enter a parse tree produced by HiveParser#subQuerySource.
HiveParserListener.prototype.enterSubQuerySource = function(ctx) {
};

// Exit a parse tree produced by HiveParser#subQuerySource.
HiveParserListener.prototype.exitSubQuerySource = function(ctx) {
};


// Enter a parse tree produced by HiveParser#partitioningSpec.
HiveParserListener.prototype.enterPartitioningSpec = function(ctx) {
};

// Exit a parse tree produced by HiveParser#partitioningSpec.
HiveParserListener.prototype.exitPartitioningSpec = function(ctx) {
};


// Enter a parse tree produced by HiveParser#partitionTableFunctionSource.
HiveParserListener.prototype.enterPartitionTableFunctionSource = function(ctx) {
};

// Exit a parse tree produced by HiveParser#partitionTableFunctionSource.
HiveParserListener.prototype.exitPartitionTableFunctionSource = function(ctx) {
};


// Enter a parse tree produced by HiveParser#partitionedTableFunction.
HiveParserListener.prototype.enterPartitionedTableFunction = function(ctx) {
};

// Exit a parse tree produced by HiveParser#partitionedTableFunction.
HiveParserListener.prototype.exitPartitionedTableFunction = function(ctx) {
};


// Enter a parse tree produced by HiveParser#whereClause.
HiveParserListener.prototype.enterWhereClause = function(ctx) {
};

// Exit a parse tree produced by HiveParser#whereClause.
HiveParserListener.prototype.exitWhereClause = function(ctx) {
};


// Enter a parse tree produced by HiveParser#searchCondition.
HiveParserListener.prototype.enterSearchCondition = function(ctx) {
};

// Exit a parse tree produced by HiveParser#searchCondition.
HiveParserListener.prototype.exitSearchCondition = function(ctx) {
};


// Enter a parse tree produced by HiveParser#valuesClause.
HiveParserListener.prototype.enterValuesClause = function(ctx) {
};

// Exit a parse tree produced by HiveParser#valuesClause.
HiveParserListener.prototype.exitValuesClause = function(ctx) {
};


// Enter a parse tree produced by HiveParser#valuesTableConstructor.
HiveParserListener.prototype.enterValuesTableConstructor = function(ctx) {
};

// Exit a parse tree produced by HiveParser#valuesTableConstructor.
HiveParserListener.prototype.exitValuesTableConstructor = function(ctx) {
};


// Enter a parse tree produced by HiveParser#valueRowConstructor.
HiveParserListener.prototype.enterValueRowConstructor = function(ctx) {
};

// Exit a parse tree produced by HiveParser#valueRowConstructor.
HiveParserListener.prototype.exitValueRowConstructor = function(ctx) {
};


// Enter a parse tree produced by HiveParser#virtualTableSource.
HiveParserListener.prototype.enterVirtualTableSource = function(ctx) {
};

// Exit a parse tree produced by HiveParser#virtualTableSource.
HiveParserListener.prototype.exitVirtualTableSource = function(ctx) {
};


// Enter a parse tree produced by HiveParser#groupByClause.
HiveParserListener.prototype.enterGroupByClause = function(ctx) {
};

// Exit a parse tree produced by HiveParser#groupByClause.
HiveParserListener.prototype.exitGroupByClause = function(ctx) {
};


// Enter a parse tree produced by HiveParser#groupby_expression.
HiveParserListener.prototype.enterGroupby_expression = function(ctx) {
};

// Exit a parse tree produced by HiveParser#groupby_expression.
HiveParserListener.prototype.exitGroupby_expression = function(ctx) {
};


// Enter a parse tree produced by HiveParser#groupByEmpty.
HiveParserListener.prototype.enterGroupByEmpty = function(ctx) {
};

// Exit a parse tree produced by HiveParser#groupByEmpty.
HiveParserListener.prototype.exitGroupByEmpty = function(ctx) {
};


// Enter a parse tree produced by HiveParser#rollupStandard.
HiveParserListener.prototype.enterRollupStandard = function(ctx) {
};

// Exit a parse tree produced by HiveParser#rollupStandard.
HiveParserListener.prototype.exitRollupStandard = function(ctx) {
};


// Enter a parse tree produced by HiveParser#rollupOldSyntax.
HiveParserListener.prototype.enterRollupOldSyntax = function(ctx) {
};

// Exit a parse tree produced by HiveParser#rollupOldSyntax.
HiveParserListener.prototype.exitRollupOldSyntax = function(ctx) {
};


// Enter a parse tree produced by HiveParser#groupingSetExpression.
HiveParserListener.prototype.enterGroupingSetExpression = function(ctx) {
};

// Exit a parse tree produced by HiveParser#groupingSetExpression.
HiveParserListener.prototype.exitGroupingSetExpression = function(ctx) {
};


// Enter a parse tree produced by HiveParser#groupingSetExpressionMultiple.
HiveParserListener.prototype.enterGroupingSetExpressionMultiple = function(ctx) {
};

// Exit a parse tree produced by HiveParser#groupingSetExpressionMultiple.
HiveParserListener.prototype.exitGroupingSetExpressionMultiple = function(ctx) {
};


// Enter a parse tree produced by HiveParser#groupingExpressionSingle.
HiveParserListener.prototype.enterGroupingExpressionSingle = function(ctx) {
};

// Exit a parse tree produced by HiveParser#groupingExpressionSingle.
HiveParserListener.prototype.exitGroupingExpressionSingle = function(ctx) {
};


// Enter a parse tree produced by HiveParser#havingClause.
HiveParserListener.prototype.enterHavingClause = function(ctx) {
};

// Exit a parse tree produced by HiveParser#havingClause.
HiveParserListener.prototype.exitHavingClause = function(ctx) {
};


// Enter a parse tree produced by HiveParser#havingCondition.
HiveParserListener.prototype.enterHavingCondition = function(ctx) {
};

// Exit a parse tree produced by HiveParser#havingCondition.
HiveParserListener.prototype.exitHavingCondition = function(ctx) {
};


// Enter a parse tree produced by HiveParser#expressionsInParenthesis.
HiveParserListener.prototype.enterExpressionsInParenthesis = function(ctx) {
};

// Exit a parse tree produced by HiveParser#expressionsInParenthesis.
HiveParserListener.prototype.exitExpressionsInParenthesis = function(ctx) {
};


// Enter a parse tree produced by HiveParser#expressionsNotInParenthesis.
HiveParserListener.prototype.enterExpressionsNotInParenthesis = function(ctx) {
};

// Exit a parse tree produced by HiveParser#expressionsNotInParenthesis.
HiveParserListener.prototype.exitExpressionsNotInParenthesis = function(ctx) {
};


// Enter a parse tree produced by HiveParser#expressionPart.
HiveParserListener.prototype.enterExpressionPart = function(ctx) {
};

// Exit a parse tree produced by HiveParser#expressionPart.
HiveParserListener.prototype.exitExpressionPart = function(ctx) {
};


// Enter a parse tree produced by HiveParser#expressions.
HiveParserListener.prototype.enterExpressions = function(ctx) {
};

// Exit a parse tree produced by HiveParser#expressions.
HiveParserListener.prototype.exitExpressions = function(ctx) {
};


// Enter a parse tree produced by HiveParser#columnRefOrderInParenthesis.
HiveParserListener.prototype.enterColumnRefOrderInParenthesis = function(ctx) {
};

// Exit a parse tree produced by HiveParser#columnRefOrderInParenthesis.
HiveParserListener.prototype.exitColumnRefOrderInParenthesis = function(ctx) {
};


// Enter a parse tree produced by HiveParser#columnRefOrderNotInParenthesis.
HiveParserListener.prototype.enterColumnRefOrderNotInParenthesis = function(ctx) {
};

// Exit a parse tree produced by HiveParser#columnRefOrderNotInParenthesis.
HiveParserListener.prototype.exitColumnRefOrderNotInParenthesis = function(ctx) {
};


// Enter a parse tree produced by HiveParser#orderByClause.
HiveParserListener.prototype.enterOrderByClause = function(ctx) {
};

// Exit a parse tree produced by HiveParser#orderByClause.
HiveParserListener.prototype.exitOrderByClause = function(ctx) {
};


// Enter a parse tree produced by HiveParser#clusterByClause.
HiveParserListener.prototype.enterClusterByClause = function(ctx) {
};

// Exit a parse tree produced by HiveParser#clusterByClause.
HiveParserListener.prototype.exitClusterByClause = function(ctx) {
};


// Enter a parse tree produced by HiveParser#partitionByClause.
HiveParserListener.prototype.enterPartitionByClause = function(ctx) {
};

// Exit a parse tree produced by HiveParser#partitionByClause.
HiveParserListener.prototype.exitPartitionByClause = function(ctx) {
};


// Enter a parse tree produced by HiveParser#distributeByClause.
HiveParserListener.prototype.enterDistributeByClause = function(ctx) {
};

// Exit a parse tree produced by HiveParser#distributeByClause.
HiveParserListener.prototype.exitDistributeByClause = function(ctx) {
};


// Enter a parse tree produced by HiveParser#sortByClause.
HiveParserListener.prototype.enterSortByClause = function(ctx) {
};

// Exit a parse tree produced by HiveParser#sortByClause.
HiveParserListener.prototype.exitSortByClause = function(ctx) {
};


// Enter a parse tree produced by HiveParser#functionStatement.
HiveParserListener.prototype.enterFunctionStatement = function(ctx) {
};

// Exit a parse tree produced by HiveParser#functionStatement.
HiveParserListener.prototype.exitFunctionStatement = function(ctx) {
};


// Enter a parse tree produced by HiveParser#functionName.
HiveParserListener.prototype.enterFunctionName = function(ctx) {
};

// Exit a parse tree produced by HiveParser#functionName.
HiveParserListener.prototype.exitFunctionName = function(ctx) {
};


// Enter a parse tree produced by HiveParser#castExpression.
HiveParserListener.prototype.enterCastExpression = function(ctx) {
};

// Exit a parse tree produced by HiveParser#castExpression.
HiveParserListener.prototype.exitCastExpression = function(ctx) {
};


// Enter a parse tree produced by HiveParser#caseExpression.
HiveParserListener.prototype.enterCaseExpression = function(ctx) {
};

// Exit a parse tree produced by HiveParser#caseExpression.
HiveParserListener.prototype.exitCaseExpression = function(ctx) {
};


// Enter a parse tree produced by HiveParser#whenExpression.
HiveParserListener.prototype.enterWhenExpression = function(ctx) {
};

// Exit a parse tree produced by HiveParser#whenExpression.
HiveParserListener.prototype.exitWhenExpression = function(ctx) {
};


// Enter a parse tree produced by HiveParser#floorExpression.
HiveParserListener.prototype.enterFloorExpression = function(ctx) {
};

// Exit a parse tree produced by HiveParser#floorExpression.
HiveParserListener.prototype.exitFloorExpression = function(ctx) {
};


// Enter a parse tree produced by HiveParser#floorDateQualifiers.
HiveParserListener.prototype.enterFloorDateQualifiers = function(ctx) {
};

// Exit a parse tree produced by HiveParser#floorDateQualifiers.
HiveParserListener.prototype.exitFloorDateQualifiers = function(ctx) {
};


// Enter a parse tree produced by HiveParser#extractExpression.
HiveParserListener.prototype.enterExtractExpression = function(ctx) {
};

// Exit a parse tree produced by HiveParser#extractExpression.
HiveParserListener.prototype.exitExtractExpression = function(ctx) {
};


// Enter a parse tree produced by HiveParser#timeQualifiers.
HiveParserListener.prototype.enterTimeQualifiers = function(ctx) {
};

// Exit a parse tree produced by HiveParser#timeQualifiers.
HiveParserListener.prototype.exitTimeQualifiers = function(ctx) {
};


// Enter a parse tree produced by HiveParser#constant.
HiveParserListener.prototype.enterConstant = function(ctx) {
};

// Exit a parse tree produced by HiveParser#constant.
HiveParserListener.prototype.exitConstant = function(ctx) {
};


// Enter a parse tree produced by HiveParser#stringLiteralSequence.
HiveParserListener.prototype.enterStringLiteralSequence = function(ctx) {
};

// Exit a parse tree produced by HiveParser#stringLiteralSequence.
HiveParserListener.prototype.exitStringLiteralSequence = function(ctx) {
};


// Enter a parse tree produced by HiveParser#charSetStringLiteral.
HiveParserListener.prototype.enterCharSetStringLiteral = function(ctx) {
};

// Exit a parse tree produced by HiveParser#charSetStringLiteral.
HiveParserListener.prototype.exitCharSetStringLiteral = function(ctx) {
};


// Enter a parse tree produced by HiveParser#dateLiteral.
HiveParserListener.prototype.enterDateLiteral = function(ctx) {
};

// Exit a parse tree produced by HiveParser#dateLiteral.
HiveParserListener.prototype.exitDateLiteral = function(ctx) {
};


// Enter a parse tree produced by HiveParser#timestampLiteral.
HiveParserListener.prototype.enterTimestampLiteral = function(ctx) {
};

// Exit a parse tree produced by HiveParser#timestampLiteral.
HiveParserListener.prototype.exitTimestampLiteral = function(ctx) {
};


// Enter a parse tree produced by HiveParser#timestampLocalTZLiteral.
HiveParserListener.prototype.enterTimestampLocalTZLiteral = function(ctx) {
};

// Exit a parse tree produced by HiveParser#timestampLocalTZLiteral.
HiveParserListener.prototype.exitTimestampLocalTZLiteral = function(ctx) {
};


// Enter a parse tree produced by HiveParser#intervalValue.
HiveParserListener.prototype.enterIntervalValue = function(ctx) {
};

// Exit a parse tree produced by HiveParser#intervalValue.
HiveParserListener.prototype.exitIntervalValue = function(ctx) {
};


// Enter a parse tree produced by HiveParser#intervalLiteral.
HiveParserListener.prototype.enterIntervalLiteral = function(ctx) {
};

// Exit a parse tree produced by HiveParser#intervalLiteral.
HiveParserListener.prototype.exitIntervalLiteral = function(ctx) {
};


// Enter a parse tree produced by HiveParser#intervalExpression.
HiveParserListener.prototype.enterIntervalExpression = function(ctx) {
};

// Exit a parse tree produced by HiveParser#intervalExpression.
HiveParserListener.prototype.exitIntervalExpression = function(ctx) {
};


// Enter a parse tree produced by HiveParser#intervalQualifiers.
HiveParserListener.prototype.enterIntervalQualifiers = function(ctx) {
};

// Exit a parse tree produced by HiveParser#intervalQualifiers.
HiveParserListener.prototype.exitIntervalQualifiers = function(ctx) {
};


// Enter a parse tree produced by HiveParser#atomExpression.
HiveParserListener.prototype.enterAtomExpression = function(ctx) {
};

// Exit a parse tree produced by HiveParser#atomExpression.
HiveParserListener.prototype.exitAtomExpression = function(ctx) {
};


// Enter a parse tree produced by HiveParser#precedenceUnaryOperator.
HiveParserListener.prototype.enterPrecedenceUnaryOperator = function(ctx) {
};

// Exit a parse tree produced by HiveParser#precedenceUnaryOperator.
HiveParserListener.prototype.exitPrecedenceUnaryOperator = function(ctx) {
};


// Enter a parse tree produced by HiveParser#isCondition.
HiveParserListener.prototype.enterIsCondition = function(ctx) {
};

// Exit a parse tree produced by HiveParser#isCondition.
HiveParserListener.prototype.exitIsCondition = function(ctx) {
};


// Enter a parse tree produced by HiveParser#precedenceBitwiseXorOperator.
HiveParserListener.prototype.enterPrecedenceBitwiseXorOperator = function(ctx) {
};

// Exit a parse tree produced by HiveParser#precedenceBitwiseXorOperator.
HiveParserListener.prototype.exitPrecedenceBitwiseXorOperator = function(ctx) {
};


// Enter a parse tree produced by HiveParser#precedenceStarOperator.
HiveParserListener.prototype.enterPrecedenceStarOperator = function(ctx) {
};

// Exit a parse tree produced by HiveParser#precedenceStarOperator.
HiveParserListener.prototype.exitPrecedenceStarOperator = function(ctx) {
};


// Enter a parse tree produced by HiveParser#precedencePlusOperator.
HiveParserListener.prototype.enterPrecedencePlusOperator = function(ctx) {
};

// Exit a parse tree produced by HiveParser#precedencePlusOperator.
HiveParserListener.prototype.exitPrecedencePlusOperator = function(ctx) {
};


// Enter a parse tree produced by HiveParser#precedenceConcatenateOperator.
HiveParserListener.prototype.enterPrecedenceConcatenateOperator = function(ctx) {
};

// Exit a parse tree produced by HiveParser#precedenceConcatenateOperator.
HiveParserListener.prototype.exitPrecedenceConcatenateOperator = function(ctx) {
};


// Enter a parse tree produced by HiveParser#precedenceAmpersandOperator.
HiveParserListener.prototype.enterPrecedenceAmpersandOperator = function(ctx) {
};

// Exit a parse tree produced by HiveParser#precedenceAmpersandOperator.
HiveParserListener.prototype.exitPrecedenceAmpersandOperator = function(ctx) {
};


// Enter a parse tree produced by HiveParser#precedenceBitwiseOrOperator.
HiveParserListener.prototype.enterPrecedenceBitwiseOrOperator = function(ctx) {
};

// Exit a parse tree produced by HiveParser#precedenceBitwiseOrOperator.
HiveParserListener.prototype.exitPrecedenceBitwiseOrOperator = function(ctx) {
};


// Enter a parse tree produced by HiveParser#precedenceRegexpOperator.
HiveParserListener.prototype.enterPrecedenceRegexpOperator = function(ctx) {
};

// Exit a parse tree produced by HiveParser#precedenceRegexpOperator.
HiveParserListener.prototype.exitPrecedenceRegexpOperator = function(ctx) {
};


// Enter a parse tree produced by HiveParser#precedenceSimilarOperator.
HiveParserListener.prototype.enterPrecedenceSimilarOperator = function(ctx) {
};

// Exit a parse tree produced by HiveParser#precedenceSimilarOperator.
HiveParserListener.prototype.exitPrecedenceSimilarOperator = function(ctx) {
};


// Enter a parse tree produced by HiveParser#precedenceDistinctOperator.
HiveParserListener.prototype.enterPrecedenceDistinctOperator = function(ctx) {
};

// Exit a parse tree produced by HiveParser#precedenceDistinctOperator.
HiveParserListener.prototype.exitPrecedenceDistinctOperator = function(ctx) {
};


// Enter a parse tree produced by HiveParser#precedenceEqualOperator.
HiveParserListener.prototype.enterPrecedenceEqualOperator = function(ctx) {
};

// Exit a parse tree produced by HiveParser#precedenceEqualOperator.
HiveParserListener.prototype.exitPrecedenceEqualOperator = function(ctx) {
};


// Enter a parse tree produced by HiveParser#precedenceNotOperator.
HiveParserListener.prototype.enterPrecedenceNotOperator = function(ctx) {
};

// Exit a parse tree produced by HiveParser#precedenceNotOperator.
HiveParserListener.prototype.exitPrecedenceNotOperator = function(ctx) {
};


// Enter a parse tree produced by HiveParser#precedenceAndOperator.
HiveParserListener.prototype.enterPrecedenceAndOperator = function(ctx) {
};

// Exit a parse tree produced by HiveParser#precedenceAndOperator.
HiveParserListener.prototype.exitPrecedenceAndOperator = function(ctx) {
};


// Enter a parse tree produced by HiveParser#precedenceOrOperator.
HiveParserListener.prototype.enterPrecedenceOrOperator = function(ctx) {
};

// Exit a parse tree produced by HiveParser#precedenceOrOperator.
HiveParserListener.prototype.exitPrecedenceOrOperator = function(ctx) {
};


// Enter a parse tree produced by HiveParser#expression.
HiveParserListener.prototype.enterExpression = function(ctx) {
};

// Exit a parse tree produced by HiveParser#expression.
HiveParserListener.prototype.exitExpression = function(ctx) {
};


// Enter a parse tree produced by HiveParser#subQueryExpression.
HiveParserListener.prototype.enterSubQueryExpression = function(ctx) {
};

// Exit a parse tree produced by HiveParser#subQueryExpression.
HiveParserListener.prototype.exitSubQueryExpression = function(ctx) {
};


// Enter a parse tree produced by HiveParser#precedenceSimilarExpressionPart.
HiveParserListener.prototype.enterPrecedenceSimilarExpressionPart = function(ctx) {
};

// Exit a parse tree produced by HiveParser#precedenceSimilarExpressionPart.
HiveParserListener.prototype.exitPrecedenceSimilarExpressionPart = function(ctx) {
};


// Enter a parse tree produced by HiveParser#precedenceSimilarExpressionAtom.
HiveParserListener.prototype.enterPrecedenceSimilarExpressionAtom = function(ctx) {
};

// Exit a parse tree produced by HiveParser#precedenceSimilarExpressionAtom.
HiveParserListener.prototype.exitPrecedenceSimilarExpressionAtom = function(ctx) {
};


// Enter a parse tree produced by HiveParser#precedenceSimilarExpressionIn.
HiveParserListener.prototype.enterPrecedenceSimilarExpressionIn = function(ctx) {
};

// Exit a parse tree produced by HiveParser#precedenceSimilarExpressionIn.
HiveParserListener.prototype.exitPrecedenceSimilarExpressionIn = function(ctx) {
};


// Enter a parse tree produced by HiveParser#precedenceSimilarExpressionPartNot.
HiveParserListener.prototype.enterPrecedenceSimilarExpressionPartNot = function(ctx) {
};

// Exit a parse tree produced by HiveParser#precedenceSimilarExpressionPartNot.
HiveParserListener.prototype.exitPrecedenceSimilarExpressionPartNot = function(ctx) {
};


// Enter a parse tree produced by HiveParser#booleanValue.
HiveParserListener.prototype.enterBooleanValue = function(ctx) {
};

// Exit a parse tree produced by HiveParser#booleanValue.
HiveParserListener.prototype.exitBooleanValue = function(ctx) {
};


// Enter a parse tree produced by HiveParser#booleanValueTok.
HiveParserListener.prototype.enterBooleanValueTok = function(ctx) {
};

// Exit a parse tree produced by HiveParser#booleanValueTok.
HiveParserListener.prototype.exitBooleanValueTok = function(ctx) {
};


// Enter a parse tree produced by HiveParser#tableOrPartition.
HiveParserListener.prototype.enterTableOrPartition = function(ctx) {
};

// Exit a parse tree produced by HiveParser#tableOrPartition.
HiveParserListener.prototype.exitTableOrPartition = function(ctx) {
};


// Enter a parse tree produced by HiveParser#partitionSpec.
HiveParserListener.prototype.enterPartitionSpec = function(ctx) {
};

// Exit a parse tree produced by HiveParser#partitionSpec.
HiveParserListener.prototype.exitPartitionSpec = function(ctx) {
};


// Enter a parse tree produced by HiveParser#partitionVal.
HiveParserListener.prototype.enterPartitionVal = function(ctx) {
};

// Exit a parse tree produced by HiveParser#partitionVal.
HiveParserListener.prototype.exitPartitionVal = function(ctx) {
};


// Enter a parse tree produced by HiveParser#dropPartitionSpec.
HiveParserListener.prototype.enterDropPartitionSpec = function(ctx) {
};

// Exit a parse tree produced by HiveParser#dropPartitionSpec.
HiveParserListener.prototype.exitDropPartitionSpec = function(ctx) {
};


// Enter a parse tree produced by HiveParser#dropPartitionVal.
HiveParserListener.prototype.enterDropPartitionVal = function(ctx) {
};

// Exit a parse tree produced by HiveParser#dropPartitionVal.
HiveParserListener.prototype.exitDropPartitionVal = function(ctx) {
};


// Enter a parse tree produced by HiveParser#dropPartitionOperator.
HiveParserListener.prototype.enterDropPartitionOperator = function(ctx) {
};

// Exit a parse tree produced by HiveParser#dropPartitionOperator.
HiveParserListener.prototype.exitDropPartitionOperator = function(ctx) {
};


// Enter a parse tree produced by HiveParser#sysFuncNames.
HiveParserListener.prototype.enterSysFuncNames = function(ctx) {
};

// Exit a parse tree produced by HiveParser#sysFuncNames.
HiveParserListener.prototype.exitSysFuncNames = function(ctx) {
};


// Enter a parse tree produced by HiveParser#descFuncNames.
HiveParserListener.prototype.enterDescFuncNames = function(ctx) {
};

// Exit a parse tree produced by HiveParser#descFuncNames.
HiveParserListener.prototype.exitDescFuncNames = function(ctx) {
};


// Enter a parse tree produced by HiveParser#identifier.
HiveParserListener.prototype.enterIdentifier = function(ctx) {
};

// Exit a parse tree produced by HiveParser#identifier.
HiveParserListener.prototype.exitIdentifier = function(ctx) {
};


// Enter a parse tree produced by HiveParser#functionIdentifier.
HiveParserListener.prototype.enterFunctionIdentifier = function(ctx) {
};

// Exit a parse tree produced by HiveParser#functionIdentifier.
HiveParserListener.prototype.exitFunctionIdentifier = function(ctx) {
};


// Enter a parse tree produced by HiveParser#principalIdentifier.
HiveParserListener.prototype.enterPrincipalIdentifier = function(ctx) {
};

// Exit a parse tree produced by HiveParser#principalIdentifier.
HiveParserListener.prototype.exitPrincipalIdentifier = function(ctx) {
};


// Enter a parse tree produced by HiveParser#nonReserved.
HiveParserListener.prototype.enterNonReserved = function(ctx) {
};

// Exit a parse tree produced by HiveParser#nonReserved.
HiveParserListener.prototype.exitNonReserved = function(ctx) {
};


// Enter a parse tree produced by HiveParser#sql11ReservedKeywordsUsedAsFunctionName.
HiveParserListener.prototype.enterSql11ReservedKeywordsUsedAsFunctionName = function(ctx) {
};

// Exit a parse tree produced by HiveParser#sql11ReservedKeywordsUsedAsFunctionName.
HiveParserListener.prototype.exitSql11ReservedKeywordsUsedAsFunctionName = function(ctx) {
};


// Enter a parse tree produced by HiveParser#resourcePlanDdlStatements.
HiveParserListener.prototype.enterResourcePlanDdlStatements = function(ctx) {
};

// Exit a parse tree produced by HiveParser#resourcePlanDdlStatements.
HiveParserListener.prototype.exitResourcePlanDdlStatements = function(ctx) {
};


// Enter a parse tree produced by HiveParser#rpAssign.
HiveParserListener.prototype.enterRpAssign = function(ctx) {
};

// Exit a parse tree produced by HiveParser#rpAssign.
HiveParserListener.prototype.exitRpAssign = function(ctx) {
};


// Enter a parse tree produced by HiveParser#rpAssignList.
HiveParserListener.prototype.enterRpAssignList = function(ctx) {
};

// Exit a parse tree produced by HiveParser#rpAssignList.
HiveParserListener.prototype.exitRpAssignList = function(ctx) {
};


// Enter a parse tree produced by HiveParser#rpUnassign.
HiveParserListener.prototype.enterRpUnassign = function(ctx) {
};

// Exit a parse tree produced by HiveParser#rpUnassign.
HiveParserListener.prototype.exitRpUnassign = function(ctx) {
};


// Enter a parse tree produced by HiveParser#rpUnassignList.
HiveParserListener.prototype.enterRpUnassignList = function(ctx) {
};

// Exit a parse tree produced by HiveParser#rpUnassignList.
HiveParserListener.prototype.exitRpUnassignList = function(ctx) {
};


// Enter a parse tree produced by HiveParser#createResourcePlanStatement.
HiveParserListener.prototype.enterCreateResourcePlanStatement = function(ctx) {
};

// Exit a parse tree produced by HiveParser#createResourcePlanStatement.
HiveParserListener.prototype.exitCreateResourcePlanStatement = function(ctx) {
};


// Enter a parse tree produced by HiveParser#createResourcePlanStatementLikeExisting.
HiveParserListener.prototype.enterCreateResourcePlanStatementLikeExisting = function(ctx) {
};

// Exit a parse tree produced by HiveParser#createResourcePlanStatementLikeExisting.
HiveParserListener.prototype.exitCreateResourcePlanStatementLikeExisting = function(ctx) {
};


// Enter a parse tree produced by HiveParser#createNewResourcePlanStatement.
HiveParserListener.prototype.enterCreateNewResourcePlanStatement = function(ctx) {
};

// Exit a parse tree produced by HiveParser#createNewResourcePlanStatement.
HiveParserListener.prototype.exitCreateNewResourcePlanStatement = function(ctx) {
};


// Enter a parse tree produced by HiveParser#withReplace.
HiveParserListener.prototype.enterWithReplace = function(ctx) {
};

// Exit a parse tree produced by HiveParser#withReplace.
HiveParserListener.prototype.exitWithReplace = function(ctx) {
};


// Enter a parse tree produced by HiveParser#activate.
HiveParserListener.prototype.enterActivate = function(ctx) {
};

// Exit a parse tree produced by HiveParser#activate.
HiveParserListener.prototype.exitActivate = function(ctx) {
};


// Enter a parse tree produced by HiveParser#enable.
HiveParserListener.prototype.enterEnable = function(ctx) {
};

// Exit a parse tree produced by HiveParser#enable.
HiveParserListener.prototype.exitEnable = function(ctx) {
};


// Enter a parse tree produced by HiveParser#disable.
HiveParserListener.prototype.enterDisable = function(ctx) {
};

// Exit a parse tree produced by HiveParser#disable.
HiveParserListener.prototype.exitDisable = function(ctx) {
};


// Enter a parse tree produced by HiveParser#unmanaged.
HiveParserListener.prototype.enterUnmanaged = function(ctx) {
};

// Exit a parse tree produced by HiveParser#unmanaged.
HiveParserListener.prototype.exitUnmanaged = function(ctx) {
};


// Enter a parse tree produced by HiveParser#alterResourcePlanStatement.
HiveParserListener.prototype.enterAlterResourcePlanStatement = function(ctx) {
};

// Exit a parse tree produced by HiveParser#alterResourcePlanStatement.
HiveParserListener.prototype.exitAlterResourcePlanStatement = function(ctx) {
};


// Enter a parse tree produced by HiveParser#alterResourcePlanRenameSuffix.
HiveParserListener.prototype.enterAlterResourcePlanRenameSuffix = function(ctx) {
};

// Exit a parse tree produced by HiveParser#alterResourcePlanRenameSuffix.
HiveParserListener.prototype.exitAlterResourcePlanRenameSuffix = function(ctx) {
};


// Enter a parse tree produced by HiveParser#globalWmStatement.
HiveParserListener.prototype.enterGlobalWmStatement = function(ctx) {
};

// Exit a parse tree produced by HiveParser#globalWmStatement.
HiveParserListener.prototype.exitGlobalWmStatement = function(ctx) {
};


// Enter a parse tree produced by HiveParser#replaceResourcePlanStatement.
HiveParserListener.prototype.enterReplaceResourcePlanStatement = function(ctx) {
};

// Exit a parse tree produced by HiveParser#replaceResourcePlanStatement.
HiveParserListener.prototype.exitReplaceResourcePlanStatement = function(ctx) {
};


// Enter a parse tree produced by HiveParser#dropResourcePlanStatement.
HiveParserListener.prototype.enterDropResourcePlanStatement = function(ctx) {
};

// Exit a parse tree produced by HiveParser#dropResourcePlanStatement.
HiveParserListener.prototype.exitDropResourcePlanStatement = function(ctx) {
};


// Enter a parse tree produced by HiveParser#poolPath.
HiveParserListener.prototype.enterPoolPath = function(ctx) {
};

// Exit a parse tree produced by HiveParser#poolPath.
HiveParserListener.prototype.exitPoolPath = function(ctx) {
};


// Enter a parse tree produced by HiveParser#triggerExpression.
HiveParserListener.prototype.enterTriggerExpression = function(ctx) {
};

// Exit a parse tree produced by HiveParser#triggerExpression.
HiveParserListener.prototype.exitTriggerExpression = function(ctx) {
};


// Enter a parse tree produced by HiveParser#triggerExpressionStandalone.
HiveParserListener.prototype.enterTriggerExpressionStandalone = function(ctx) {
};

// Exit a parse tree produced by HiveParser#triggerExpressionStandalone.
HiveParserListener.prototype.exitTriggerExpressionStandalone = function(ctx) {
};


// Enter a parse tree produced by HiveParser#triggerOrExpression.
HiveParserListener.prototype.enterTriggerOrExpression = function(ctx) {
};

// Exit a parse tree produced by HiveParser#triggerOrExpression.
HiveParserListener.prototype.exitTriggerOrExpression = function(ctx) {
};


// Enter a parse tree produced by HiveParser#triggerAndExpression.
HiveParserListener.prototype.enterTriggerAndExpression = function(ctx) {
};

// Exit a parse tree produced by HiveParser#triggerAndExpression.
HiveParserListener.prototype.exitTriggerAndExpression = function(ctx) {
};


// Enter a parse tree produced by HiveParser#triggerAtomExpression.
HiveParserListener.prototype.enterTriggerAtomExpression = function(ctx) {
};

// Exit a parse tree produced by HiveParser#triggerAtomExpression.
HiveParserListener.prototype.exitTriggerAtomExpression = function(ctx) {
};


// Enter a parse tree produced by HiveParser#triggerLiteral.
HiveParserListener.prototype.enterTriggerLiteral = function(ctx) {
};

// Exit a parse tree produced by HiveParser#triggerLiteral.
HiveParserListener.prototype.exitTriggerLiteral = function(ctx) {
};


// Enter a parse tree produced by HiveParser#comparisionOperator.
HiveParserListener.prototype.enterComparisionOperator = function(ctx) {
};

// Exit a parse tree produced by HiveParser#comparisionOperator.
HiveParserListener.prototype.exitComparisionOperator = function(ctx) {
};


// Enter a parse tree produced by HiveParser#triggerActionExpression.
HiveParserListener.prototype.enterTriggerActionExpression = function(ctx) {
};

// Exit a parse tree produced by HiveParser#triggerActionExpression.
HiveParserListener.prototype.exitTriggerActionExpression = function(ctx) {
};


// Enter a parse tree produced by HiveParser#triggerActionExpressionStandalone.
HiveParserListener.prototype.enterTriggerActionExpressionStandalone = function(ctx) {
};

// Exit a parse tree produced by HiveParser#triggerActionExpressionStandalone.
HiveParserListener.prototype.exitTriggerActionExpressionStandalone = function(ctx) {
};


// Enter a parse tree produced by HiveParser#createTriggerStatement.
HiveParserListener.prototype.enterCreateTriggerStatement = function(ctx) {
};

// Exit a parse tree produced by HiveParser#createTriggerStatement.
HiveParserListener.prototype.exitCreateTriggerStatement = function(ctx) {
};


// Enter a parse tree produced by HiveParser#alterTriggerStatement.
HiveParserListener.prototype.enterAlterTriggerStatement = function(ctx) {
};

// Exit a parse tree produced by HiveParser#alterTriggerStatement.
HiveParserListener.prototype.exitAlterTriggerStatement = function(ctx) {
};


// Enter a parse tree produced by HiveParser#triggerConditionExpression.
HiveParserListener.prototype.enterTriggerConditionExpression = function(ctx) {
};

// Exit a parse tree produced by HiveParser#triggerConditionExpression.
HiveParserListener.prototype.exitTriggerConditionExpression = function(ctx) {
};


// Enter a parse tree produced by HiveParser#dropTriggerStatement.
HiveParserListener.prototype.enterDropTriggerStatement = function(ctx) {
};

// Exit a parse tree produced by HiveParser#dropTriggerStatement.
HiveParserListener.prototype.exitDropTriggerStatement = function(ctx) {
};


// Enter a parse tree produced by HiveParser#poolAssign.
HiveParserListener.prototype.enterPoolAssign = function(ctx) {
};

// Exit a parse tree produced by HiveParser#poolAssign.
HiveParserListener.prototype.exitPoolAssign = function(ctx) {
};


// Enter a parse tree produced by HiveParser#poolAssignList.
HiveParserListener.prototype.enterPoolAssignList = function(ctx) {
};

// Exit a parse tree produced by HiveParser#poolAssignList.
HiveParserListener.prototype.exitPoolAssignList = function(ctx) {
};


// Enter a parse tree produced by HiveParser#createPoolStatement.
HiveParserListener.prototype.enterCreatePoolStatement = function(ctx) {
};

// Exit a parse tree produced by HiveParser#createPoolStatement.
HiveParserListener.prototype.exitCreatePoolStatement = function(ctx) {
};


// Enter a parse tree produced by HiveParser#alterPoolStatement.
HiveParserListener.prototype.enterAlterPoolStatement = function(ctx) {
};

// Exit a parse tree produced by HiveParser#alterPoolStatement.
HiveParserListener.prototype.exitAlterPoolStatement = function(ctx) {
};


// Enter a parse tree produced by HiveParser#dropPoolStatement.
HiveParserListener.prototype.enterDropPoolStatement = function(ctx) {
};

// Exit a parse tree produced by HiveParser#dropPoolStatement.
HiveParserListener.prototype.exitDropPoolStatement = function(ctx) {
};


// Enter a parse tree produced by HiveParser#createMappingStatement.
HiveParserListener.prototype.enterCreateMappingStatement = function(ctx) {
};

// Exit a parse tree produced by HiveParser#createMappingStatement.
HiveParserListener.prototype.exitCreateMappingStatement = function(ctx) {
};


// Enter a parse tree produced by HiveParser#alterMappingStatement.
HiveParserListener.prototype.enterAlterMappingStatement = function(ctx) {
};

// Exit a parse tree produced by HiveParser#alterMappingStatement.
HiveParserListener.prototype.exitAlterMappingStatement = function(ctx) {
};


// Enter a parse tree produced by HiveParser#dropMappingStatement.
HiveParserListener.prototype.enterDropMappingStatement = function(ctx) {
};

// Exit a parse tree produced by HiveParser#dropMappingStatement.
HiveParserListener.prototype.exitDropMappingStatement = function(ctx) {
};



exports.HiveParserListener = HiveParserListener;