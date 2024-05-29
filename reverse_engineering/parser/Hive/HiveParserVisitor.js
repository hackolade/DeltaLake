// Generated from grammars/HiveParser.g4 by ANTLR 4.9.2
// jshint ignore: start
const antlr4 = require('antlr4');

// This class defines a complete generic visitor for a parse tree produced by HiveParser.

class HiveParserVisitor extends antlr4.tree.ParseTreeVisitor {
	// Visit a parse tree produced by HiveParser#statements.
	visitStatements(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#statementSeparator.
	visitStatementSeparator(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#empty.
	visitEmpty(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#statement.
	visitStatement(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#explainStatement.
	visitExplainStatement(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#explainOption.
	visitExplainOption(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#vectorizationOnly.
	visitVectorizationOnly(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#vectorizatonDetail.
	visitVectorizatonDetail(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#execStatement.
	visitExecStatement(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#loadStatement.
	visitLoadStatement(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#replicationClause.
	visitReplicationClause(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#exportStatement.
	visitExportStatement(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#importStatement.
	visitImportStatement(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#replDumpStatement.
	visitReplDumpStatement(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#replLoadStatement.
	visitReplLoadStatement(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#replConfigs.
	visitReplConfigs(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#replConfigsList.
	visitReplConfigsList(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#replStatusStatement.
	visitReplStatusStatement(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#ddlStatement.
	visitDdlStatement(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#ifExists.
	visitIfExists(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#restrictOrCascade.
	visitRestrictOrCascade(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#ifNotExists.
	visitIfNotExists(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#rewriteEnabled.
	visitRewriteEnabled(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#rewriteDisabled.
	visitRewriteDisabled(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#storedAsDirs.
	visitStoredAsDirs(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#orReplace.
	visitOrReplace(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#createDatabaseStatement.
	visitCreateDatabaseStatement(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#dbLocation.
	visitDbLocation(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#dbProperties.
	visitDbProperties(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#dbPropertiesList.
	visitDbPropertiesList(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#switchCatalogStatement.
	visitSwitchCatalogStatement(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#switchDatabaseStatement.
	visitSwitchDatabaseStatement(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#dropDatabaseStatement.
	visitDropDatabaseStatement(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#databaseComment.
	visitDatabaseComment(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#createTableStatement.
	visitCreateTableStatement(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#truncateTableStatement.
	visitTruncateTableStatement(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#dropTableStatement.
	visitDropTableStatement(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#tagValue.
	visitTagValue(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#tagsPair.
	visitTagsPair(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#unityTags.
	visitUnityTags(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#alterStatement.
	visitAlterStatement(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#alterTableStatementSuffix.
	visitAlterTableStatementSuffix(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#alterTblPartitionStatementSuffix.
	visitAlterTblPartitionStatementSuffix(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#alterStatementPartitionKeyType.
	visitAlterStatementPartitionKeyType(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#alterViewStatementSuffix.
	visitAlterViewStatementSuffix(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#alterMaterializedViewStatementSuffix.
	visitAlterMaterializedViewStatementSuffix(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#alterDatabaseStatementSuffix.
	visitAlterDatabaseStatementSuffix(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#alterDatabaseSuffixProperties.
	visitAlterDatabaseSuffixProperties(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#alterDatabaseSuffixSetOwner.
	visitAlterDatabaseSuffixSetOwner(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#alterDatabaseSuffixSetLocation.
	visitAlterDatabaseSuffixSetLocation(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#alterStatementSuffixRename.
	visitAlterStatementSuffixRename(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#alterStatementSuffixAddCol.
	visitAlterStatementSuffixAddCol(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#alterStatementSuffixAddConstraint.
	visitAlterStatementSuffixAddConstraint(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#alterStatementSuffixUpdateColumns.
	visitAlterStatementSuffixUpdateColumns(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#alterStatementSuffixDropConstraint.
	visitAlterStatementSuffixDropConstraint(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#alterStatementSuffixRenameCol.
	visitAlterStatementSuffixRenameCol(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#alterStatementSuffixUpdateStatsCol.
	visitAlterStatementSuffixUpdateStatsCol(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#alterStatementSuffixUpdateStats.
	visitAlterStatementSuffixUpdateStats(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#alterStatementChangeColPosition.
	visitAlterStatementChangeColPosition(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#alterStatementSuffixAddPartitions.
	visitAlterStatementSuffixAddPartitions(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#alterStatementSuffixAddPartitionsElement.
	visitAlterStatementSuffixAddPartitionsElement(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#alterStatementSuffixTouch.
	visitAlterStatementSuffixTouch(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#alterStatementSuffixArchive.
	visitAlterStatementSuffixArchive(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#alterStatementSuffixUnArchive.
	visitAlterStatementSuffixUnArchive(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#partitionLocation.
	visitPartitionLocation(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#alterStatementSuffixDropPartitions.
	visitAlterStatementSuffixDropPartitions(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#alterStatementSuffixProperties.
	visitAlterStatementSuffixProperties(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#alterViewSuffixProperties.
	visitAlterViewSuffixProperties(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#alterMaterializedViewSuffixRewrite.
	visitAlterMaterializedViewSuffixRewrite(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#alterMaterializedViewSuffixRebuild.
	visitAlterMaterializedViewSuffixRebuild(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#alterStatementSuffixSerdeProperties.
	visitAlterStatementSuffixSerdeProperties(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#alterIndexStatementSuffix.
	visitAlterIndexStatementSuffix(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#alterStatementSuffixFileFormat.
	visitAlterStatementSuffixFileFormat(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#alterStatementSuffixClusterbySortby.
	visitAlterStatementSuffixClusterbySortby(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#alterTblPartitionStatementSuffixSkewedLocation.
	visitAlterTblPartitionStatementSuffixSkewedLocation(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#skewedLocations.
	visitSkewedLocations(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#skewedLocationsList.
	visitSkewedLocationsList(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#skewedLocationMap.
	visitSkewedLocationMap(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#alterStatementSuffixLocation.
	visitAlterStatementSuffixLocation(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#alterStatementSuffixSkewedby.
	visitAlterStatementSuffixSkewedby(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#alterStatementSuffixExchangePartition.
	visitAlterStatementSuffixExchangePartition(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#alterStatementSuffixRenamePart.
	visitAlterStatementSuffixRenamePart(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#alterStatementSuffixStatsPart.
	visitAlterStatementSuffixStatsPart(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#alterStatementSuffixMergeFiles.
	visitAlterStatementSuffixMergeFiles(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#alterStatementSuffixBucketNum.
	visitAlterStatementSuffixBucketNum(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#createIndexStatement.
	visitCreateIndexStatement(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#createIndexMainStatement.
	visitCreateIndexMainStatement(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#dropIndexStatement.
	visitDropIndexStatement(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#createBloomfilterIndexStatement.
	visitCreateBloomfilterIndexStatement(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#createBloomfilterIndexMainStatement.
	visitCreateBloomfilterIndexMainStatement(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#bloomfilterColumnParenthesesList.
	visitBloomfilterColumnParenthesesList(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#bloomfilterColumnNameList.
	visitBloomfilterColumnNameList(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#bloomfilterColumnName.
	visitBloomfilterColumnName(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#bloomfilterIndexOptions.
	visitBloomfilterIndexOptions(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#dropBloomfilterIndexStatement.
	visitDropBloomfilterIndexStatement(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#dropBloomfilterIndexMainStatement.
	visitDropBloomfilterIndexMainStatement(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#tablePartitionPrefix.
	visitTablePartitionPrefix(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#blocking.
	visitBlocking(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#alterStatementSuffixCompact.
	visitAlterStatementSuffixCompact(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#alterStatementSuffixSetOwner.
	visitAlterStatementSuffixSetOwner(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#fileFormat.
	visitFileFormat(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#inputFileFormat.
	visitInputFileFormat(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#tabTypeExpr.
	visitTabTypeExpr(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#partTypeExpr.
	visitPartTypeExpr(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#tabPartColTypeExpr.
	visitTabPartColTypeExpr(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#descStatement.
	visitDescStatement(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#analyzeStatement.
	visitAnalyzeStatement(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#showStatement.
	visitShowStatement(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#lockStatement.
	visitLockStatement(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#lockDatabase.
	visitLockDatabase(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#lockMode.
	visitLockMode(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#unlockStatement.
	visitUnlockStatement(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#unlockDatabase.
	visitUnlockDatabase(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#createRoleStatement.
	visitCreateRoleStatement(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#dropRoleStatement.
	visitDropRoleStatement(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#grantPrivileges.
	visitGrantPrivileges(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#revokePrivileges.
	visitRevokePrivileges(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#grantRole.
	visitGrantRole(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#revokeRole.
	visitRevokeRole(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#showRoleGrants.
	visitShowRoleGrants(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#showRoles.
	visitShowRoles(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#showCurrentRole.
	visitShowCurrentRole(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#setRole.
	visitSetRole(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#showGrants.
	visitShowGrants(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#showRolePrincipals.
	visitShowRolePrincipals(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#privilegeIncludeColObject.
	visitPrivilegeIncludeColObject(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#privilegeObject.
	visitPrivilegeObject(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#privObject.
	visitPrivObject(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#privObjectCols.
	visitPrivObjectCols(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#privilegeList.
	visitPrivilegeList(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#privlegeDef.
	visitPrivlegeDef(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#privilegeType.
	visitPrivilegeType(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#principalSpecification.
	visitPrincipalSpecification(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#principalName.
	visitPrincipalName(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#withGrantOption.
	visitWithGrantOption(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#grantOptionFor.
	visitGrantOptionFor(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#adminOptionFor.
	visitAdminOptionFor(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#withAdminOption.
	visitWithAdminOption(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#metastoreCheck.
	visitMetastoreCheck(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#resourceList.
	visitResourceList(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#resource.
	visitResource(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#resourceType.
	visitResourceType(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#createFunctionStatement.
	visitCreateFunctionStatement(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#dropFunctionStatement.
	visitDropFunctionStatement(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#reloadFunctionStatement.
	visitReloadFunctionStatement(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#createMacroStatement.
	visitCreateMacroStatement(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#dropMacroStatement.
	visitDropMacroStatement(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#createViewStatement.
	visitCreateViewStatement(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#createMaterializedViewStatement.
	visitCreateMaterializedViewStatement(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#viewPartition.
	visitViewPartition(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#dropViewStatement.
	visitDropViewStatement(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#dropMaterializedViewStatement.
	visitDropMaterializedViewStatement(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#showFunctionIdentifier.
	visitShowFunctionIdentifier(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#showStmtIdentifier.
	visitShowStmtIdentifier(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#tableComment.
	visitTableComment(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#tableUsingDataSource.
	visitTableUsingDataSource(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#tableDataSource.
	visitTableDataSource(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#tablePartition.
	visitTablePartition(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#tableBuckets.
	visitTableBuckets(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#tableSkewed.
	visitTableSkewed(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#rowFormat.
	visitRowFormat(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#recordReader.
	visitRecordReader(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#recordWriter.
	visitRecordWriter(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#rowFormatSerde.
	visitRowFormatSerde(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#rowFormatDelimited.
	visitRowFormatDelimited(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#tableRowFormat.
	visitTableRowFormat(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#tableOptions.
	visitTableOptions(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#tablePropertiesPrefixed.
	visitTablePropertiesPrefixed(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#tableProperties.
	visitTableProperties(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#tablePropertiesList.
	visitTablePropertiesList(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#keyValueProperty.
	visitKeyValueProperty(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#keyValue.
	visitKeyValue(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#keyProperty.
	visitKeyProperty(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#tableRowFormatFieldIdentifier.
	visitTableRowFormatFieldIdentifier(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#tableRowFormatFieldIdentifierEcapedBy.
	visitTableRowFormatFieldIdentifierEcapedBy(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#tableRowFormatCollItemsIdentifier.
	visitTableRowFormatCollItemsIdentifier(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#tableRowFormatMapKeysIdentifier.
	visitTableRowFormatMapKeysIdentifier(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#tableRowFormatLinesIdentifier.
	visitTableRowFormatLinesIdentifier(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#tableRowNullFormat.
	visitTableRowNullFormat(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#tableFileFormat.
	visitTableFileFormat(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#tableFileFormatStoredBy.
	visitTableFileFormatStoredBy(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#tableFileFormatStoredAs.
	visitTableFileFormatStoredAs(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#tableFileFormatStoredAsFormat.
	visitTableFileFormatStoredAsFormat(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#tableInputOutputFileFormat.
	visitTableInputOutputFileFormat(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#tableInputLiteral.
	visitTableInputLiteral(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#tableOutputLiteral.
	visitTableOutputLiteral(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#tableLocation.
	visitTableLocation(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#columnNameTypeList.
	visitColumnNameTypeList(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#columnNameTypeOrConstraintList.
	visitColumnNameTypeOrConstraintList(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#columnNameColonTypeList.
	visitColumnNameColonTypeList(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#columnNameList.
	visitColumnNameList(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#columnName.
	visitColumnName(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#extColumnName.
	visitExtColumnName(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#columnNameOrderList.
	visitColumnNameOrderList(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#columnParenthesesList.
	visitColumnParenthesesList(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#enableValidateSpecification.
	visitEnableValidateSpecification(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#enableSpecification.
	visitEnableSpecification(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#validateSpecification.
	visitValidateSpecification(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#enforcedSpecification.
	visitEnforcedSpecification(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#relySpecification.
	visitRelySpecification(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#createConstraint.
	visitCreateConstraint(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#alterConstraintWithName.
	visitAlterConstraintWithName(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#tableLevelConstraint.
	visitTableLevelConstraint(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#pkUkConstraint.
	visitPkUkConstraint(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#checkConstraint.
	visitCheckConstraint(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#createForeignKey.
	visitCreateForeignKey(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#alterForeignKeyWithName.
	visitAlterForeignKeyWithName(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#skewedValueElement.
	visitSkewedValueElement(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#skewedColumnValuePairList.
	visitSkewedColumnValuePairList(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#skewedColumnValuePair.
	visitSkewedColumnValuePair(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#skewedColumnValues.
	visitSkewedColumnValues(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#skewedColumnValue.
	visitSkewedColumnValue(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#skewedValueLocationElement.
	visitSkewedValueLocationElement(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#orderSpecification.
	visitOrderSpecification(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#nullOrdering.
	visitNullOrdering(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#columnNameOrder.
	visitColumnNameOrder(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#columnNameCommentList.
	visitColumnNameCommentList(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#columnNameComment.
	visitColumnNameComment(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#columnRefOrder.
	visitColumnRefOrder(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#columnNameType.
	visitColumnNameType(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#columnNameTypeOrConstraint.
	visitColumnNameTypeOrConstraint(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#tableConstraint.
	visitTableConstraint(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#columnNameTypeConstraint.
	visitColumnNameTypeConstraint(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#columnGeneratedAs.
	visitColumnGeneratedAs(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#generatedAsExpression.
	visitGeneratedAsExpression(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#generatedAsIdentity.
	visitGeneratedAsIdentity(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#identityOptions.
	visitIdentityOptions(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#startWith.
	visitStartWith(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#incrementBy.
	visitIncrementBy(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#partitionedColumnNameTypeConstraint.
	visitPartitionedColumnNameTypeConstraint(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#columnConstraint.
	visitColumnConstraint(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#foreignKeyConstraint.
	visitForeignKeyConstraint(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#colConstraint.
	visitColConstraint(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#alterColumnConstraint.
	visitAlterColumnConstraint(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#alterForeignKeyConstraint.
	visitAlterForeignKeyConstraint(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#alterColConstraint.
	visitAlterColConstraint(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#columnConstraintType.
	visitColumnConstraintType(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#defaultVal.
	visitDefaultVal(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#tableConstraintType.
	visitTableConstraintType(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#constraintOptsCreate.
	visitConstraintOptsCreate(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#constraintOptsAlter.
	visitConstraintOptsAlter(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#columnNameColonType.
	visitColumnNameColonType(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#colType.
	visitColType(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#colTypeList.
	visitColTypeList(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#type_db_col.
	visitType_db_col(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#primitiveType.
	visitPrimitiveType(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#listType.
	visitListType(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#structType.
	visitStructType(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#mapType.
	visitMapType(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#unionType.
	visitUnionType(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#setOperator.
	visitSetOperator(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#queryStatementExpression.
	visitQueryStatementExpression(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#queryStatementExpressionBody.
	visitQueryStatementExpressionBody(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#withClause.
	visitWithClause(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#cteStatement.
	visitCteStatement(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#fromStatement.
	visitFromStatement(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#singleFromStatement.
	visitSingleFromStatement(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#regularBody.
	visitRegularBody(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#atomSelectStatement.
	visitAtomSelectStatement(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#selectStatement.
	visitSelectStatement(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#setOpSelectStatement.
	visitSetOpSelectStatement(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#selectStatementWithCTE.
	visitSelectStatementWithCTE(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#body.
	visitBody(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#insertClause.
	visitInsertClause(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#destination.
	visitDestination(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#limitClause.
	visitLimitClause(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#deleteStatement.
	visitDeleteStatement(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#columnAssignmentClause.
	visitColumnAssignmentClause(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#setColumnsClause.
	visitSetColumnsClause(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#updateStatement.
	visitUpdateStatement(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#sqlTransactionStatement.
	visitSqlTransactionStatement(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#startTransactionStatement.
	visitStartTransactionStatement(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#transactionMode.
	visitTransactionMode(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#transactionAccessMode.
	visitTransactionAccessMode(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#isolationLevel.
	visitIsolationLevel(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#levelOfIsolation.
	visitLevelOfIsolation(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#commitStatement.
	visitCommitStatement(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#rollbackStatement.
	visitRollbackStatement(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#setAutoCommitStatement.
	visitSetAutoCommitStatement(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#abortTransactionStatement.
	visitAbortTransactionStatement(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#mergeStatement.
	visitMergeStatement(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#whenClauses.
	visitWhenClauses(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#whenNotMatchedClause.
	visitWhenNotMatchedClause(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#whenMatchedAndClause.
	visitWhenMatchedAndClause(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#whenMatchedThenClause.
	visitWhenMatchedThenClause(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#updateOrDelete.
	visitUpdateOrDelete(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#killQueryStatement.
	visitKillQueryStatement(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#selectClause.
	visitSelectClause(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#selectList.
	visitSelectList(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#selectTrfmClause.
	visitSelectTrfmClause(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#selectItem.
	visitSelectItem(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#trfmClause.
	visitTrfmClause(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#selectExpression.
	visitSelectExpression(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#selectExpressionList.
	visitSelectExpressionList(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#window_clause.
	visitWindow_clause(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#window_defn.
	visitWindow_defn(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#window_specification.
	visitWindow_specification(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#window_frame.
	visitWindow_frame(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#window_range_expression.
	visitWindow_range_expression(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#window_value_expression.
	visitWindow_value_expression(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#window_frame_start_boundary.
	visitWindow_frame_start_boundary(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#window_frame_boundary.
	visitWindow_frame_boundary(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#tableAllColumns.
	visitTableAllColumns(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#tableOrColumn.
	visitTableOrColumn(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#expressionList.
	visitExpressionList(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#aliasList.
	visitAliasList(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#fromClause.
	visitFromClause(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#fromSource.
	visitFromSource(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#atomjoinSource.
	visitAtomjoinSource(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#joinSource.
	visitJoinSource(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#joinSourcePart.
	visitJoinSourcePart(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#uniqueJoinSource.
	visitUniqueJoinSource(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#uniqueJoinExpr.
	visitUniqueJoinExpr(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#uniqueJoinToken.
	visitUniqueJoinToken(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#joinToken.
	visitJoinToken(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#lateralView.
	visitLateralView(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#tableAlias.
	visitTableAlias(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#tableBucketSample.
	visitTableBucketSample(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#splitSample.
	visitSplitSample(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#tableSample.
	visitTableSample(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#tableSource.
	visitTableSource(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#uniqueJoinTableSource.
	visitUniqueJoinTableSource(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#tableName.
	visitTableName(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#viewName.
	visitViewName(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#subQuerySource.
	visitSubQuerySource(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#partitioningSpec.
	visitPartitioningSpec(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#partitionTableFunctionSource.
	visitPartitionTableFunctionSource(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#partitionedTableFunction.
	visitPartitionedTableFunction(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#whereClause.
	visitWhereClause(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#searchCondition.
	visitSearchCondition(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#valuesClause.
	visitValuesClause(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#valuesTableConstructor.
	visitValuesTableConstructor(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#valueRowConstructor.
	visitValueRowConstructor(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#virtualTableSource.
	visitVirtualTableSource(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#groupByClause.
	visitGroupByClause(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#groupby_expression.
	visitGroupby_expression(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#groupByEmpty.
	visitGroupByEmpty(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#rollupStandard.
	visitRollupStandard(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#rollupOldSyntax.
	visitRollupOldSyntax(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#groupingSetExpression.
	visitGroupingSetExpression(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#groupingSetExpressionMultiple.
	visitGroupingSetExpressionMultiple(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#groupingExpressionSingle.
	visitGroupingExpressionSingle(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#havingClause.
	visitHavingClause(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#havingCondition.
	visitHavingCondition(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#expressionsInParenthesis.
	visitExpressionsInParenthesis(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#expressionsNotInParenthesis.
	visitExpressionsNotInParenthesis(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#expressionPart.
	visitExpressionPart(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#expressions.
	visitExpressions(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#columnRefOrderInParenthesis.
	visitColumnRefOrderInParenthesis(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#columnRefOrderNotInParenthesis.
	visitColumnRefOrderNotInParenthesis(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#orderByClause.
	visitOrderByClause(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#clusterByClause.
	visitClusterByClause(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#partitionByClause.
	visitPartitionByClause(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#distributeByClause.
	visitDistributeByClause(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#sortByClause.
	visitSortByClause(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#functionStatement.
	visitFunctionStatement(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#functionName.
	visitFunctionName(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#castExpression.
	visitCastExpression(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#caseExpression.
	visitCaseExpression(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#whenExpression.
	visitWhenExpression(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#floorExpression.
	visitFloorExpression(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#floorDateQualifiers.
	visitFloorDateQualifiers(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#extractExpression.
	visitExtractExpression(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#timeQualifiers.
	visitTimeQualifiers(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#constant.
	visitConstant(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#stringLiteralSequence.
	visitStringLiteralSequence(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#charSetStringLiteral.
	visitCharSetStringLiteral(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#dateLiteral.
	visitDateLiteral(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#timestampLiteral.
	visitTimestampLiteral(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#timestampLocalTZLiteral.
	visitTimestampLocalTZLiteral(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#intervalValue.
	visitIntervalValue(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#intervalLiteral.
	visitIntervalLiteral(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#intervalExpression.
	visitIntervalExpression(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#intervalQualifiers.
	visitIntervalQualifiers(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#atomExpression.
	visitAtomExpression(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#precedenceUnaryOperator.
	visitPrecedenceUnaryOperator(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#isCondition.
	visitIsCondition(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#precedenceBitwiseXorOperator.
	visitPrecedenceBitwiseXorOperator(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#precedenceStarOperator.
	visitPrecedenceStarOperator(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#precedencePlusOperator.
	visitPrecedencePlusOperator(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#precedenceConcatenateOperator.
	visitPrecedenceConcatenateOperator(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#precedenceAmpersandOperator.
	visitPrecedenceAmpersandOperator(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#precedenceBitwiseOrOperator.
	visitPrecedenceBitwiseOrOperator(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#precedenceRegexpOperator.
	visitPrecedenceRegexpOperator(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#precedenceSimilarOperator.
	visitPrecedenceSimilarOperator(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#precedenceDistinctOperator.
	visitPrecedenceDistinctOperator(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#precedenceEqualOperator.
	visitPrecedenceEqualOperator(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#precedenceNotOperator.
	visitPrecedenceNotOperator(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#precedenceAndOperator.
	visitPrecedenceAndOperator(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#precedenceOrOperator.
	visitPrecedenceOrOperator(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#expression.
	visitExpression(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#subQueryExpression.
	visitSubQueryExpression(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#precedenceSimilarExpressionPart.
	visitPrecedenceSimilarExpressionPart(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#precedenceSimilarExpressionAtom.
	visitPrecedenceSimilarExpressionAtom(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#precedenceSimilarExpressionIn.
	visitPrecedenceSimilarExpressionIn(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#precedenceSimilarExpressionPartNot.
	visitPrecedenceSimilarExpressionPartNot(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#booleanValue.
	visitBooleanValue(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#booleanValueTok.
	visitBooleanValueTok(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#tableOrPartition.
	visitTableOrPartition(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#partitionSpec.
	visitPartitionSpec(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#partitionVal.
	visitPartitionVal(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#dropPartitionSpec.
	visitDropPartitionSpec(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#dropPartitionVal.
	visitDropPartitionVal(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#dropPartitionOperator.
	visitDropPartitionOperator(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#sysFuncNames.
	visitSysFuncNames(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#descFuncNames.
	visitDescFuncNames(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#identifier.
	visitIdentifier(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#functionIdentifier.
	visitFunctionIdentifier(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#principalIdentifier.
	visitPrincipalIdentifier(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#nonReserved.
	visitNonReserved(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#sql11ReservedKeywordsUsedAsFunctionName.
	visitSql11ReservedKeywordsUsedAsFunctionName(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#databricksAllowedReservedNames.
	visitDatabricksAllowedReservedNames(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#resourcePlanDdlStatements.
	visitResourcePlanDdlStatements(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#rpAssign.
	visitRpAssign(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#rpAssignList.
	visitRpAssignList(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#rpUnassign.
	visitRpUnassign(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#rpUnassignList.
	visitRpUnassignList(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#createResourcePlanStatement.
	visitCreateResourcePlanStatement(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#createResourcePlanStatementLikeExisting.
	visitCreateResourcePlanStatementLikeExisting(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#createNewResourcePlanStatement.
	visitCreateNewResourcePlanStatement(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#withReplace.
	visitWithReplace(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#activate.
	visitActivate(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#enable.
	visitEnable(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#disable.
	visitDisable(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#unmanaged.
	visitUnmanaged(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#alterResourcePlanStatement.
	visitAlterResourcePlanStatement(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#alterResourcePlanRenameSuffix.
	visitAlterResourcePlanRenameSuffix(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#globalWmStatement.
	visitGlobalWmStatement(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#replaceResourcePlanStatement.
	visitReplaceResourcePlanStatement(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#dropResourcePlanStatement.
	visitDropResourcePlanStatement(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#poolPath.
	visitPoolPath(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#triggerExpression.
	visitTriggerExpression(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#triggerExpressionStandalone.
	visitTriggerExpressionStandalone(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#triggerOrExpression.
	visitTriggerOrExpression(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#triggerAndExpression.
	visitTriggerAndExpression(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#triggerAtomExpression.
	visitTriggerAtomExpression(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#triggerLiteral.
	visitTriggerLiteral(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#comparisionOperator.
	visitComparisionOperator(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#triggerActionExpression.
	visitTriggerActionExpression(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#triggerActionExpressionStandalone.
	visitTriggerActionExpressionStandalone(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#createTriggerStatement.
	visitCreateTriggerStatement(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#alterTriggerStatement.
	visitAlterTriggerStatement(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#triggerConditionExpression.
	visitTriggerConditionExpression(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#dropTriggerStatement.
	visitDropTriggerStatement(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#poolAssign.
	visitPoolAssign(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#poolAssignList.
	visitPoolAssignList(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#createPoolStatement.
	visitCreatePoolStatement(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#alterPoolStatement.
	visitAlterPoolStatement(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#dropPoolStatement.
	visitDropPoolStatement(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#createMappingStatement.
	visitCreateMappingStatement(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#alterMappingStatement.
	visitAlterMappingStatement(ctx) {
		return this.visitChildren(ctx);
	}

	// Visit a parse tree produced by HiveParser#dropMappingStatement.
	visitDropMappingStatement(ctx) {
		return this.visitChildren(ctx);
	}
}

module.exports = { HiveParserVisitor };
