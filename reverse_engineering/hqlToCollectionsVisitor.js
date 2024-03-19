const { HiveParserVisitor } = require('./parser/Hive/HiveParserVisitor');
const { HiveParser } = require('./parser/Hive/HiveParser');
const {
    CREATE_COLLECTION_COMMAND,
    REMOVE_COLLECTION_COMMAND,
    CREATE_BUCKET_COMMAND,
    REMOVE_BUCKET_COMMAND,
    USE_BUCKET_COMMAND,
    USE_CATALOG_COMMAND,
    ADD_FIELDS_TO_COLLECTION_COMMAND,
    UPDATE_FIELD_COMMAND,
    CREATE_VIEW_COMMAND,
    ADD_COLLECTION_LEVEL_INDEX_COMMAND,
    REMOVE_COLLECTION_LEVEL_INDEX_COMMAND,
    ADD_COLLECTION_LEVEL_BLOOMFILTER_INDEX_COMMAND,
    REMOVE_COLLECTION_LEVEL_BLOOMFILTER_INDEX_COMMAND,
    UPDATE_ENTITY_LEVEL_DATA_COMMAND,
    UPDATE_VIEW_LEVEL_DATA_COMMAND,
    RENAME_VIEW_COMMAND,
    ADD_RELATIONSHIP_COMMAND,
    UPDATE_ENTITY_COLUMN,
    CREATE_RESOURCE_PLAN,
    CREATE_MAPPING,
    REMOVE_VIEW_COMMAND,
    UPDATE_RESOURCE_PLAN,
    DROP_RESOURCE_PLAN,
    UPDATE_ITEM_IN_RESOURCE_PLAN,
    ADD_TO_RESOURCE_PLAN,
    DROP_RESOURCE_PLAN_ITEM,
    DROP_MAPPING,
    RENAME_COLLECTION_COMMAND,
} = require('./commandsService');

const schemaHelper = require('./thriftService/schemaHelper');
const { dependencies } = require('./appDependencies');
const { removeParentheses } = require('./helpers/utils');
const {
    getCheckConstraintsFromTableProperties,
    getFilteredTableProperties,
    normalizeTableProperties
} = require('./helpers/visitorsHelper');

const ALLOWED_COMMANDS = [
    HiveParser.RULE_createTableStatement,
    HiveParser.RULE_dropTableStatement,
    HiveParser.RULE_createDatabaseStatement,
    HiveParser.RULE_switchCatalogStatement,
    HiveParser.RULE_switchDatabaseStatement,
    HiveParser.RULE_dropDatabaseStatement,
    HiveParser.RULE_createViewStatement,
    HiveParser.RULE_createMaterializedViewStatement,
    HiveParser.RULE_unityTags,
    HiveParser.RULE_alterStatement,
    HiveParser.RULE_dropMaterializedViewStatement,
    HiveParser.RULE_dropViewStatement,
    HiveParser.RULE_dropIndexStatement,
    HiveParser.RULE_resourcePlanDdlStatements,
    HiveParser.RULE_createIndexStatement,
    HiveParser.RULE_dropIndexStatement,
    HiveParser.RULE_createBloomfilterIndexStatement,
    HiveParser.RULE_dropBloomfilterIndexStatement,
];

class Visitor extends HiveParserVisitor {
    constructor(originalText) {
        super();
        this.originalText = originalText;
    }

    visitStatement(ctx) {
        const execStatement = ctx.execStatement();
        if (execStatement) {
            return this.visit(execStatement);
        }

        return;
    }

    visitExecStatement(ctx) {
        const ddlStatement = ctx.ddlStatement();
        if (ddlStatement) {
            return this.visit(ddlStatement);
        }

        return;
    }

    visitDdlStatement(ctx) {
        if (ALLOWED_COMMANDS.includes(ctx.children[0].ruleIndex)) {
            return super.visitDdlStatement(ctx)[0];
        }
        return;
    }

    visitCreateTableStatement(ctx) {
        const _ = dependencies.lodash;
        const [tableName, tableLikeName] = this.visit(ctx.tableName());
        const tableDataSource = this.visitWhenExists(ctx, 'tableUsingDataSource');
        const compositePartitionKey = this.visitWhenExists(ctx, 'tablePartition', [])?.[0] || [];
        const {
            compositeClusteringKey,
            numBuckets,
            sortedByKey
        } = this.visitWhenExists(ctx, 'tableBuckets', [])?.[0] || {};
        const { skewedby, skewedOn, skewStoredAsDir } = this.visitWhenExists(ctx, 'tableSkewed', [])?.[0] || {};
        const tableRowFormat = this.visitWhenExists(ctx, 'tableRowFormat', {})?.[0] || {};
        const description = this.visitWhenExists(ctx, 'tableComment');
        const location = this.visitWhenExists(ctx, 'tableLocation');
        const rawTableProperties = this.visitWhenExists(ctx, 'tablePropertiesPrefixed');
        const tableProperties = normalizeTableProperties(rawTableProperties);
        const checkConstraints = getCheckConstraintsFromTableProperties(tableProperties);
        let tableOptions = this.visitWhenExists(ctx, 'tableOptions');
        tableOptions = Array.isArray(tableOptions) ? tableOptions?.[0] || '' : tableOptions;
        const temporaryTable = Boolean(ctx.KW_TEMPORARY());
        const externalTable = Boolean(ctx.KW_EXTERNAL());
        let storedAsTable = this.visitWhenExists(ctx, 'tableFileFormat', {});
        storedAsTable = Array.isArray(storedAsTable) ? storedAsTable?.[0] || {} : storedAsTable;
        const { database, table } = tableName;
        const { properties, foreignKeys } = this.visitWhenExists(ctx, 'columnNameTypeOrConstraintList', {
            properties: {},
            foreignKeys: [],
        });
        const tableForeignKeys = foreignKeys.map((constraint) => ({
            ...constraint,
            childDbName: database,
            childCollection: table,
        }));

        return [
            {
                type: CREATE_COLLECTION_COMMAND,
                collectionName: table,
                bucketName: database,
                schema: handleChoices({
                    collectionName: table,
                    type: 'object',
                    properties: { ...convertKeysToProperties(compositePartitionKey, properties), ...properties },
                }),
                tableLikeName: (tableLikeName || {}).table,
                entityLevelData: _.pickBy(
                    {
                        temporaryTable,
                        externalTable,
                        description: Array.isArray(description) ? description[0] || '' : String(description),
                        compositePartitionKey: compositePartitionKey.map(([name]) => ({ name })),
                        compositeClusteringKey,
                        numBuckets,
                        sortedByKey,
                        skewedby,
                        skewedOn,
                        skewStoredAsDir,
                        tableOptions,
                        location: Array.isArray(location) ? location[0] || '' : String(location),
                        tableProperties: Array.isArray(tableProperties) ? getFilteredTableProperties(tableProperties) || '' : String(tableProperties),
                        using: getUsingProperty(Array.isArray(tableDataSource) ? tableDataSource[0] || '' : String(tableDataSource)),
                        chkConstr: checkConstraints,
                        ...storedAsTable,
                        ...tableRowFormat,
                    },
                    (prop) => _.isNumber(prop) || _.isBoolean(prop) || !_.isEmpty(prop)
                ),
            },
            ...tableForeignKeys.map((fkData) => ({
                ...fkData,
                type: ADD_RELATIONSHIP_COMMAND,
            })),
        ];
    }

    visitTableUsingDataSource(ctx) {
        return ctx.tableDataSource().getText();
    }

    visitAtomSelectStatement(ctx) {
        return this.visitWhenExists(ctx, 'fromClause', {});
    }

    visitSelectStatement(ctx) {
        return this.visit(ctx.atomSelectStatement());
    }

    visitFromClause(ctx) {
        return this.visit(ctx.fromSource());
    }

    visitFromSource(ctx) {
        return this.visitWhenExists(ctx, 'joinSource') || this.visitWhenExists(ctx, 'uniqueJoinSource');
    }

    visitUniqueJoinSource(ctx) {
        return this.visit(ctx.uniqueJoinTableSource());
    }

    visitUniqueJoinTableSource(ctx) {
        return this.visit(ctx.tableName());
    }

    visitJoinSource(ctx) {
        return this.visit(ctx.atomjoinSource());
    }

    visitAtomjoinSource(ctx) {
        return this.visitWhenExists(ctx, 'tableSource') || this.visitWhenExists(ctx, 'joinSource');
    }

    visitTableSource(ctx) {
        return this.visit(ctx.tableName());
    }

    visitTablePartition(ctx) {
        return this.visit(ctx.partitionedColumnNameTypeConstraint());
    }

    visitTableComment(ctx) {
        return getTextFromStringLiteral(ctx);
    }

    visitTableBuckets(ctx) {
        const hasNumber = Boolean(ctx.Number());
        const hasSort = Boolean(ctx.columnNameOrderList());

        return {
            compositeClusteringKey: ctx
                .columnNameList()
                .getText()
                .split(',')
                .map((name) => ({ name })),
            ...(hasSort ? { sortedByKey: this.visit(ctx.columnNameOrderList()) } : {}),
            ...(hasNumber ? { numBuckets: Number(ctx.Number().getText()) } : {}),
        };
    }

    visitColumnNameOrderList(ctx) {
        return this.visit(ctx.columnNameOrder());
    }

    visitColumnNameOrder(ctx) {
        return {
            name: ctx.identifier().getText(),
            type: getOrderType(this.visitWhenExists(ctx, 'orderSpecification')),
        };
    }

    visitOrderSpecification(ctx) {
        return ctx.getText();
    }

    visitTableSkewed(ctx) {
        return {
            skewedby: this.visit(ctx.columnNameList()),
            skewedOn: `(${ctx.skewedValueElement().getText()})`,
            ...(ctx.storedAsDirs() ? { skewStoredAsDir: true } : {}),
        };
    }

    visitTableRowFormat(ctx) {
        const isDelimited = Boolean(ctx.rowFormatDelimited());

        if (isDelimited) {
            return {
                rowFormat: 'delimited',
                ...this.visit(ctx.rowFormatDelimited()),
            };
        } else {
            return {
                rowFormat: 'SerDe',
                ...this.visit(ctx.rowFormatSerde()),
            };
        }
    }

    visitRowFormatDelimited(ctx) {
        const { fieldsTerminatedBy, fieldsescapedBy } = this.visitWhenExists(ctx, 'tableRowFormatFieldIdentifier', {});
        return {
            fieldsTerminatedBy,
            fieldsescapedBy,
            collectionItemsTerminatedBy: this.visitWhenExists(ctx, 'tableRowFormatCollItemsIdentifier'),
            mapKeysTerminatedBy: this.visitWhenExists(ctx, 'tableRowFormatMapKeysIdentifier'),
            linesTerminatedBy: this.visitWhenExists(ctx, 'tableRowFormatLinesIdentifier'),
            nullDefinedAs: this.visitWhenExists(ctx, 'tableRowNullFormat'),
        };
    }

    visitTableRowFormatFieldIdentifier(ctx) {
        return {
            fieldsTerminatedBy: getTextFromStringLiteral(ctx),
            fieldsescapedBy: this.visitWhenExists(ctx, 'tableRowFormatFieldIdentifierEcapedBy'),
        };
    }

    visitTableRowFormatCollItemsIdentifier(ctx) {
        return getTextFromStringLiteral(ctx);
    }

    visitTableRowFormatMapKeysIdentifier(ctx) {
        return getTextFromStringLiteral(ctx);
    }

    visitTableRowFormatLinesIdentifier(ctx) {
        return getTextFromStringLiteral(ctx);
    }

    visitTableRowNullFormat(ctx) {
        return getTextFromStringLiteral(ctx);
    }

    visitTableRowFormatFieldIdentifierEcapedBy(ctx) {
        return getTextFromStringLiteral(ctx);
    }

    visitRowFormatSerde(ctx) {
        return {
            serDeLibrary: getTextFromStringLiteral(ctx),
            serDeProperties: ctx.KW_SERDEPROPERTIES() ? ctx.tableProperties().getText() : '',
        };
    }

    visitTableLocation(ctx) {
        return getTextFromStringLiteral(ctx);
    }

    visitTablePropertiesPrefixed(ctx) {
        return this.visit(ctx.tableProperties());
    }

    visitTableProperties(ctx) {
        return this.visit(ctx.tablePropertiesList());
    }

    visitTablePropertiesList(ctx) {
        const keyValueProperties = this.visitWhenExists(ctx, 'keyValueProperty', []);
        const keyProperties = this.visitWhenExists(ctx, 'keyProperty', []);
        return [
            ...keyValueProperties,
            ...keyProperties.map(propertyKey => ({ propertyKey })),
        ];
    }

    visitKeyValueProperty(ctx) {
        const propertyKey = this.visit(ctx.keyProperty());
        const propertyValue = removeValueQuotes(ctx.keyValue().getText());
        return { propertyKey, propertyValue };
    }

    visitKeyProperty(ctx) {
        return ctx.getText();
    }

    visitTableOptions(ctx) {
        return ctx.tableProperties().getText();
    }

    visitCreateViewStatement(ctx) {
        const { database, table: name } = this.visit(ctx.tableName());
        const description = this.visitWhenExists(ctx, 'tableComment');
        const select = {
            start: ctx.selectStatementWithCTE().start.start,
            stop: ctx.selectStatementWithCTE().stop.stop + 1,
        };
        const { table } = this.visitWhenExists(ctx, 'selectStatementWithCTE', {});
        const columns = this.visitWhenExists(ctx, 'columnNameCommentList', []);
        const jsonSchema = convertColumnsToJsonSchema(columns);
        const columnList = columns.map(column => column.name + (column.comment ? ` COMMENT '${column.comment}'` : '')).join(', ');
        const columnNames = columns.map(column => column.name).join(', ');
        const tableProperties = this.visitWhenExists(ctx, 'tablePropertiesPrefixed');

        return {
            type: CREATE_VIEW_COMMAND,
            name,
            bucketName: database,
            collectionName: table,
            select,
            jsonSchema,
            columnNames,
            data: {
                description,
                tableProperties,
                columnList,
            },
        };
    }

    visitColumnNameCommentList(ctx) {
        if (typeof ctx.columnNameComment !== 'function') {
            return [];
        }

        return (ctx.columnNameComment() || []).map(column => {
            const name = column.identifier()?.getText() || '';
            const comment = column.KW_COMMENT() && column.StringLiteral() ? removeSingleDoubleQuotes(column.StringLiteral().getText()) : '';

            return {
                name,
                comment,
            };
        });
    }

    visitCreateMaterializedViewStatement(ctx) {
        const { database, table: name } = this.visit(ctx.tableName());
        const description = this.visitWhenExists(ctx, 'tableComment');
        const select = {
            start: ctx.selectStatementWithCTE().start.start,
            stop: ctx.selectStatementWithCTE().stop.stop,
        };
        const { table } = this.visitWhenExists(ctx, 'selectStatementWithCTE', {});

        return {
            type: CREATE_VIEW_COMMAND,
            name,
            bucketName: database,
            collectionName: table,
            jsonSchema: { properties: {} },
            select,
            data: {
                description,
                materialized: true,
            },
        };
    }

    visitAlterStatement(ctx) {
        const isAlterTable = ctx.KW_TABLE();
        if (isAlterTable) {
            const { database, table } = this.visit(ctx.tableName());
            return {
                childDbName: database,
                childCollection: table,
                bucketName: database,
                collectionName: table,
                ...this.visit(ctx.alterTableStatementSuffix()),
            };
        }

        if (ctx.KW_VIEW()) {
            const { database, table } = this.visit(ctx.tableName());

            return {
                bucketName: database,
                viewName: table,
                ...this.visit(ctx.alterViewStatementSuffix()),
            };
        }

        return;
    }

    visitAlterTableStatementSuffix(ctx) {
        const constraint = ctx.alterStatementSuffixAddConstraint();
        if (constraint) {
            return this.visit(constraint);
        }

        return [
            'alterStatementSuffixRename',
            'alterStatementSuffixProperties',
            'alterStatementSuffixSkewedby',
            'alterTblPartitionStatementSuffix',
        ]
            .map((statement) => this.visitWhenExists(ctx, statement))
            .filter(Boolean)[0];
    }

    visitAlterStatementSuffixRename(ctx) {
        const { database, table } = this.visit(ctx.tableName());

        return {
            type: RENAME_COLLECTION_COMMAND,
            newCollectionName: table,
        };
    }

    visitAlterStatementSuffixProperties(ctx) {
        return {};
    }

    visitAlterStatementSuffixSkewedby(ctx) {
        return {
            type: UPDATE_ENTITY_LEVEL_DATA_COMMAND,
            data: {
                ...this.visitWhenExists(ctx, 'tableSkewed', {}),
                ...(Boolean(ctx.KW_NOT() && ctx.KW_SKEWED()) ? { skewedby: [], skewedOn: '' } : {}),
                ...(Boolean(ctx.storedAsDirs()) ? { skewStoredAsDir: false } : {}),
            },
        };
    }

    visitAlterTblPartitionStatementSuffix(ctx) {
        return [
            'alterStatementSuffixFileFormat',
            'alterStatementSuffixLocation',
            'alterStatementSuffixBucketNum',
            'alterStatementSuffixClusterbySortby',
            'alterStatementSuffixRenameCol',
            'alterStatementSuffixAddCol',
        ]
            .map((statement) => this.visitWhenExists(ctx, statement))
            .filter(Boolean)[0];
    }

    visitAlterStatementSuffixFileFormat(ctx) {
        return {
            type: UPDATE_ENTITY_LEVEL_DATA_COMMAND,
            data: {
                ...this.visit(ctx.fileFormat()),
            },
        };
    }

    visitFileFormat(ctx) {
        if (ctx.KW_INPUTFORMAT()) {
            return {
                storedAsTable: 'input/output format',
                inputFormatClassname: removeSingleDoubleQuotes(ctx.StringLiteral()[0].getText()),
                outputFormatClassname: removeSingleDoubleQuotes(ctx.StringLiteral()[1].getText()),
                serDeLibrary: removeSingleDoubleQuotes(ctx.StringLiteral()[2].getText()),
            };
        }

        return {
            storedAsTable: getStoredAsTable(ctx.tableFileFormatStoredAsFormat().getText()),
        };
    }

    visitAlterStatementSuffixLocation(ctx) {
        return {
            type: UPDATE_ENTITY_LEVEL_DATA_COMMAND,
            data: {
                location: getTextFromStringLiteral(ctx),
            },
        };
    }

    visitAlterStatementSuffixBucketNum(ctx) {
        return {
            type: UPDATE_ENTITY_LEVEL_DATA_COMMAND,
            data: {
                numBuckets: Number(ctx.Number().getText()),
            },
        };
    }

    visitAlterStatementSuffixClusterbySortby(ctx) {
        return {
            type: UPDATE_ENTITY_LEVEL_DATA_COMMAND,
            data: {
                ...(Boolean(ctx.KW_CLUSTERED()) ? { compositeClusteringKey: [] } : {}),
                ...(Boolean(ctx.KW_SORTED()) ? { sortedByKey: [] } : {}),
                ...this.visitWhenExists(ctx, 'tableBuckets', {}),
            },
        };
    }

    visitAlterStatementSuffixRenameCol(ctx) {
        const columnConstraint = this.visitWhenExists(ctx, 'alterColumnConstraint', {});

        return {
            type: UPDATE_FIELD_COMMAND,
            name: this.visit(ctx.identifier()[0]),
            nameTo: this.visit(ctx.identifier()[1]),
            data: {
                ...this.visit(ctx.colType()),
                ...(Boolean(ctx.KW_COMMENT()) ? { description: getTextFromStringLiteral(ctx) } : {}),
                ...columnConstraint,
            },
        };
    }

    visitAlterColumnConstraint(ctx) {
        if (ctx.alterForeignKeyConstraint()) {
            return this.visit(ctx.alterForeignKeyConstraint());
        }

        return this.visit(ctx.alterColConstraint());
    }

    visitAlterForeignKeyConstraint(ctx) {
        return {};
    }

    visitAlterColConstraint(ctx) {
        return this.visit(ctx.columnConstraintType());
    }

    visitAlterStatementSuffixAddCol(ctx) {
        return {
            type: ADD_FIELDS_TO_COLLECTION_COMMAND,
            data: this.visit(ctx.columnNameTypeList()),
        };
    }

    visitColumnNameTypeList(ctx) {
        const columns = this.visit(ctx.columnNameType());

        return columns.reduce((data, column) => {
            const { name, ...columnData } = column;

            return {
                ...data,
                [name]: columnData,
            };
        }, {});
    }

    visitColumnNameType(ctx) {
        return {
            name: this.visit(ctx.identifier()),
            ...this.visit(ctx.colType()),
            ...this(ctx.KW_COMMENT() ? { description: getTextFromStringLiteral(ctx) } : {}),
        };
    }

    visitAlterViewStatementSuffix(ctx) {
        if (ctx.selectStatementWithCTE()) {
            const select = {
                start: ctx.selectStatementWithCTE().start.start,
                stop: ctx.selectStatementWithCTE().stop.stop,
            };

            return {
                type: UPDATE_VIEW_LEVEL_DATA_COMMAND,
                select,
            };
        }

        if (ctx.alterStatementSuffixRename()) {
            return {
                type: RENAME_VIEW_COMMAND,
                newViewName: this.visit(ctx.alterStatementSuffixRename()),
            };
        }
    }

    visitAlterStatementSuffixRename(ctx) {
        return this.visit(ctx.tableName()).table;
    }

    visitAlterStatementSuffixAddConstraint(ctx) {
        const foreignKey = ctx.alterForeignKeyWithName();
        if (foreignKey) {
            return {
                type: ADD_RELATIONSHIP_COMMAND,
                ...this.visit(foreignKey),
            };
        }

        const alterConstraintWithName = ctx.alterConstraintWithName();
        if (alterConstraintWithName) {
            const { fields, type } = this.visit(alterConstraintWithName);
            return {
                type: UPDATE_ENTITY_COLUMN,
                data: {
                    type: type === 'primary' ? 'primaryKey' : type,
                    fields,
                    value: true,
                },
            };
        }

        return {};
    }

    visitAlterForeignKeyWithName(ctx) {
        const [childField, parentField] = this.visit(ctx.columnParenthesesList());
        const { database: dbName, table: parentCollection } = this.visit(ctx.tableName());

        return {
            relationshipName: this.visit(ctx.identifier()),
            parentCollection,
            dbName,
            childField,
            parentField,
        };
    }

    visitAlterConstraintWithName(ctx) {
        return this.visit(ctx.tableLevelConstraint());
    }

    visitSelectStatementWithCTE(ctx) {
        return this.visit(ctx.selectStatement());
    }

    visitColumnNameTypeOrConstraintList(ctx) {
        return this.visit(ctx.columnNameTypeOrConstraint()).reduce(
            ({ properties, foreignKeys }, column) => {
                if (!column) {
                    return { properties, foreignKeys };
                }
                if (column.isForeignKey) {
                    return {
                        foreignKeys: [...foreignKeys, column],
                        properties,
                    };
                }

                if (column.isConstraint) {
                    return {
                        foreignKeys,
                        properties,
                    };
                }

                const columnForeignKeys = column.foreignKey ? [column.foreignKey] : [];

                return {
                    properties: {
                        ...properties,
                        [column.name]: column.type,
                    },
                    foreignKeys: [...foreignKeys, ...columnForeignKeys],
                };
            },
            { properties: {}, foreignKeys: [] }
        );
    }

    visitColumnGeneratedAs(ctx) {
        if (ctx.generatedAsExpression()) {
            const expression = this.getText(ctx.generatedAsExpression().expression());
            return {
                generatedType: 'always',
                asIdentity: false,
                expression,
            };
        }

        if (ctx.generatedAsIdentity()) {
            return this.visit(ctx.generatedAsIdentity());
        }

        return;
    }

    visitGeneratedAsIdentity(ctx) {
        const hasIdentityOptions = ctx.identityOptions();
        return {
            generatedType: ctx.KW_DEFAULT() ? 'by default' : 'always',
            asIdentity: true,
            ...(hasIdentityOptions && { identity: this.visit(ctx.identityOptions()) }),
        };
    }

    visitIdentityOptions(ctx) {
        return {
            start_num: this.visitWhenExists(ctx, 'startWith'),
            step_num: this.visitWhenExists(ctx, 'incrementBy'),
        };
    }

    visitStartWith(ctx) {
        return ctx.Number().getText();
    }

    visitIncrementBy(ctx) {
        return ctx.Number().getText();
    }

    visitColumnNameTypeOrConstraint(ctx) {
        const nameTypeConstraint = ctx.columnNameTypeConstraint();
        if (nameTypeConstraint) {
            return this.visit(nameTypeConstraint);
        }

        return this.visit(ctx.tableConstraint());
    }

    visitTableConstraint(ctx) {
        const fkConstraint = ctx.createForeignKey();
        if (fkConstraint) {
            return this.visit(fkConstraint);
        }

        return this.visit(ctx.createConstraint());
    }

    visitCreateConstraint(ctx) {
        const nameContext = ctx.identifier();
        const constraintName = nameContext ? this.visit(nameContext) : '';
        return {
            constraintName,
            ...this.visit(ctx.tableLevelConstraint()),
            isConstraint: true,
        };
    }

    visitTableLevelConstraint(ctx) {
        const pkUkConstraint = ctx.pkUkConstraint();
        return pkUkConstraint ? this.visit(pkUkConstraint) : {};
    }

    visitPkUkConstraint(ctx) {
        return {
            type: this.visit(ctx.tableConstraintType()),
            fields: this.visit(ctx.columnParenthesesList()),
        };
    }

    visitTableConstraintType(ctx) {
        return ctx.KW_PRIMARY() ? 'primary' : 'unique';
    }

    visitCreateForeignKey(ctx) {
        const nameContext = ctx.identifier();
        const { database: dbName, table: parentCollection } = this.visit(ctx.tableName());
        const [childField, parentField] = this.visit(ctx.columnParenthesesList());
        const relationshipName = nameContext ? this.visit(nameContext) : '';

        return {
            isForeignKey: true,
            relationshipName,
            parentCollection,
            dbName,
            childField,
            parentField,
        };
    }

    visitColumnParenthesesList(ctx) {
        return this.visit(ctx.columnNameList());
    }

    visitColumnNameList(ctx) {
        return this.visit(ctx.columnName());
    }

    visitColumnName(ctx) {
        return this.visit(ctx.identifier());
    }

    visitColumnNameTypeConstraint(ctx) {
        const name = this.visit(ctx.identifier());
        const type = this.visit(ctx.colType());
        const constraintContext = ctx.columnConstraint();
        const constraints = constraintContext && this.visit(constraintContext);
        const description = ctx.KW_COMMENT() ? getTextFromStringLiteral(ctx) : '';

        return {
            name,
            type: {
                ...type,
                description,
                ...mergeConstraints(constraints),
            },
        };
    }

    visitColType(ctx) {
        return this.visit(ctx.type_db_col());
    }

    visitType_db_col(ctx) {
        const primitiveType = ctx.primitiveType();
        const listType = ctx.listType();
        const structType = ctx.structType();
        const mapType = ctx.mapType();
        const unionType = ctx.unionType();

        if (primitiveType) {
            return this.visit(primitiveType);
        }

        if (listType) {
            return this.visit(listType);
        }

        if (structType) {
            return this.visit(structType);
        }

        if (mapType) {
            return this.visit(mapType);
        }

        if (unionType) {
            return this.visit(unionType);
        }
    }

    visitListType(ctx) {
        const items = this.visit(ctx.type_db_col());
        const isUnion = !items.type || Array.isArray(items.type);
        const itemType = isUnion ? 'union' : items.type;

        return {
            type: 'array',
            subtype: schemaHelper.getArraySubtypeByType(itemType),
            ...(!items.oneOf && { items }),
            ...(items.oneOf && { oneOf: getOneOf(items.oneOf, 'New column') }),
        };
    }

    visitUnionType(ctx) {
        const types = this.visit(ctx.colTypeList());
        const isComplex = (type) => ['struct', 'map', 'array'].indexOf(type) !== -1;
        const complexTypes = types.some((schema) => isComplex(schema.type));

        if (!complexTypes) {
            return {
                type: dependencies.lodash.uniq(types.map((schema) => schema.type)),
            };
        }

        return {
            oneOf: types,
        };
    }

    visitColTypeList(ctx) {
        return this.visit(ctx.colType());
    }

    visitStructType(ctx) {
        return handleChoices({
            type: 'struct',
            properties: this.visit(ctx.columnNameColonTypeList()),
        });
    }

    visitColumnNameColonTypeList(ctx) {
        return this.visit(ctx.columnNameColonType()).reduce((properties, column) => {
            return {
                ...properties,
                [column.name]: column.type,
            };
        }, {});
    }

    visitColumnNameColonType(ctx) {
        return {
            name: this.visit(ctx.identifier()),
            type: this.visit(ctx.colType()),
        };
    }

    visitMapType(ctx) {
        const items = this.visit(ctx.type_db_col());
        const isUnion = !items.type || Array.isArray(items.type);
        const itemType = isUnion ? 'union' : items.type;
        const key = this.visit(ctx.primitiveType());
        const properties = Boolean(items?.properties) || Boolean(items?.items) ? { 'new_column': items } : {};

        return {
            type: 'map',
            subtype: schemaHelper.getMapSubtype(itemType),
            properties: items.oneOf ? {} : properties,
            ...(items.oneOf && { oneOf: getOneOf(items.oneOf, 'New column') }),
            ...schemaHelper.getMapKeyType(key),
        };
    }

    visitPrimitiveType(ctx) {
        const timestampLocal = ctx.KW_TIMESTAMPLOCALTZ() || ctx.KW_LOCAL() || ctx.KW_TIMESTAMP_NTZ();
        const decimal = ctx.KW_DECIMAL();
        const varchar = ctx.KW_VARCHAR();
        const char = ctx.KW_CHAR();
        if (timestampLocal) {
            return { type: 'timestamp', mode: Boolean(ctx.KW_TIMESTAMP_NTZ()) ? 'timestamp_ntz' : '' };
        }
        if (decimal) {
            const decimalType = { type: 'numeric', mode: 'decimal' };
            const decimalData = ctx.Number();
            if (!decimalData) {
                return decimalType;
            }
            const { precision, scale } = this.visit(decimalData).map((number) => (isNaN(number) ? Number(number) : ''));

            return { ...decimalType, precision, scale };
        }
        if (varchar || char) {
            const charType = { type: 'text', mode: char ? 'char' : 'varchar' };
            let maxLength = this.visit(ctx.Number());
            if (Array.isArray(maxLength)) {
                maxLength = maxLength[0];
            }

            return { ...charType, maxLength };
        }

        const hiveType = ctx.getText().toLowerCase();

        switch (hiveType) {
            case 'string':
                return {
                    type: 'text',
                    mode: hiveType,
                };
            case 'int':
            case 'tinyint':
            case 'smallint':
            case 'bigint':
            case 'float':
            case 'double':
            case 'double precision':
                return {
                    type: 'numeric',
                    mode: hiveType,
                };
            case 'boolean':
                return {
                    type: 'bool',
                };
            case 'interval_day_time':
            case 'interval_year_month':
                return {
                    type: 'interval',
                };
            case 'timestamp':
                return { type: 'timestamp', mode: '' }
            case "timestamp_ntz":
                return {
                    type: 'timestamp',
                    mode: hiveType
                };
            case 'binary':
            case 'date':
            case 'interval':
            default:
                return {
                    type: hiveType,
                };
        }
    }

    visitColumnConstraint(ctx) {
        return this.visit(ctx.colConstraint());
    }

    visitColConstraint(ctx) {
        return this.visit(ctx.columnConstraintType());
    }

    visitDefaultVal(ctx) {
        return ctx.getText();
    }

    visitColumnConstraintType(ctx) {
        return {
            ...(Boolean(ctx.KW_NOT() && ctx.KW_NULL()) ? { required: true } : {}),
            ...(Boolean((ctx.tableConstraintType() || {}).KW_UNIQUE) ? { unique: true } : {}),
            ...(Boolean((ctx.tableConstraintType() || {}).KW_PRIMARY) ? { primaryKey: true } : {}),
            ...(Boolean(ctx.KW_DEFAULT()) ? { default: this.visit(ctx.defaultVal()) } : {}),
            ...(Boolean(ctx.checkConstraint()) ? { check: this.visitWhenExists(ctx, 'checkConstraint', '') } : {}),
            ...(Boolean(ctx.columnGeneratedAs()) ? { generatedDefaultValue: this.visit(ctx.columnGeneratedAs()) } : {}),
        };
    }

    visitCheckConstraint(ctx) {
        return ctx.expression().getText();
    }

    visitNumber(ctx) {
        const value = ctx.getText();
        if (isNaN(value)) {
            return;
        }

        return Number(value);
    }

    visitTableName(ctx) {
        let names = this.visit(ctx.identifier());
        if (names.length === 1) {
            return {
                database: '',
                table: names[0],
            };
        }

        return {
            database: names[0],
            table: names[1],
        };
    }

    visitViewName(ctx) {
        let names = this.visit(ctx.identifier());
        if (names.length === 1) {
            return {
                database: '',
                view: names[0],
            };
        }

        return {
            database: names[0],
            view: names[1],
        };
    }

    visitIdentifier(ctx) {
        return removeQuotes(ctx.getText());
    }

    visitStatementSeparator() {
        return;
    }

    visitTableFileFormat(ctx) {
        if (Boolean(ctx.tableInputOutputFileFormat())) {
            return {
                storedAsTable: 'input/output format',
                ...this.visit(ctx.tableInputOutputFileFormat()),
            };
        } else if (Boolean(ctx.tableFileFormatStoredBy())) {
            return {
                storedAsTable: 'by',
                ...this.visit(ctx.tableFileFormatStoredBy()),
            };
        } else if (Boolean(ctx.tableFileFormatStoredAs())) {
            return {
                storedAsTable: this.visit(ctx.tableFileFormatStoredAs()),
            };
        } else {
            return {};
        }
    }

    visitTableInputOutputFileFormat(ctx) {
        return {
            inputFormatClassname: this.visit(ctx.tableInputLiteral()),
            outputFormatClassname: this.visit(ctx.tableOutputLiteral()),
        };
    }

    visitTableInputLiteral(ctx) {
        return getTextFromStringLiteral(ctx);
    }

    visitTableOutputLiteral(ctx) {
        return getTextFromStringLiteral(ctx);
    }

    visitTableFileFormatStoredBy(ctx) {
        return {
            serDeLibrary: getTextFromStringLiteral(ctx),
        };
    }

    visitTableFileFormatStoredAs(ctx) {
        return getStoredAsTable(ctx.tableFileFormatStoredAsFormat().getText());
    }

    visitWhenExists(ctx, funcName, defaultValue = '') {
        return Boolean(ctx[funcName]) && ctx[funcName]() ? this.visit(ctx[funcName]()) : defaultValue;
    }

    visitSwitchCatalogStatement(ctx) {
        if (ctx.KW_CATALOG()) {
            return {
                type: USE_CATALOG_COMMAND,
                catalogName: this.visit(ctx.identifier())
            };
        }
    }

    visitCreateDatabaseStatement(ctx) {
        const name = this.visit(ctx.identifier());
        const description = this.visitWhenExists(ctx, 'databaseComment');
        const locationPropertyName = Boolean(ctx?.dbLocation()?.KW_MANAGED()) ? 'managedLocation' : 'location';
        const locationValue = removeSingleDoubleQuotes(ctx?.dbLocation()?.StringLiteral()?.getText() || '');
        const dbProperties = removeParentheses(ctx?.dbProperties()?.getText() || '');

        return {
            type: CREATE_BUCKET_COMMAND,
            name,
            data: {
                description,
                dbProperties,
                [locationPropertyName]: locationValue,
            },
        };
    }

    visitDatabaseComment(ctx) {
        return removeSingleDoubleQuotes(ctx.StringLiteral().getText());
    }

    visitSwitchDatabaseStatement(ctx) {
        return {
            type: USE_BUCKET_COMMAND,
            bucketName: this.visit(ctx.identifier()),
        };
    }

    dropDatabaseStatement(ctx) {
        return {
            type: REMOVE_BUCKET_COMMAND,
            bucketName: this.visit(ctx.identifier()),
        };
    }

    visitCreateIndexStatement(ctx) {
        const _ = dependencies.lodash;
        const { name, database, table, columns, SecIndxHandler } = this.visit(ctx.createIndexMainStatement());
        const SecIndxWithDeferredRebuild = Boolean(ctx.KW_WITH() && ctx.KW_DEFERRED() && ctx.KW_REBUILD());
        const SecIndxProperties = this.visitWhenExists(ctx, 'tableProperties');
        const SecIndxTable = ctx.tableName() ? removeQuotes(ctx.tableName().getText()) : '';
        const SecIndxComments = this.visitWhenExists(ctx, 'tableComment');

        return {
            type: ADD_COLLECTION_LEVEL_INDEX_COMMAND,
            bucketName: database,
            collectionName: table,
            name,
            columns,
            data: _.pickBy(
                {
                    SecIndxWithDeferredRebuild,
                    SecIndxHandler,
                    SecIndxProperties,
                    SecIndxTable,
                    SecIndxComments,
                },
                (prop) => _.isBoolean(prop) || !_.isEmpty(prop)
            ),
        };
    }

    visitCreateIndexMainStatement(ctx) {
        return {
            name: this.visit(ctx.identifier()),
            ...this.visit(ctx.tableName()),
            columns: this.visit(ctx.columnParenthesesList()),
            SecIndxHandler: getTextFromStringLiteral(ctx),
        };
    }

    visitColumnParenthesesList(ctx) {
        return this.visit(ctx.columnNameList());
    }

    visitDropIndexStatement(ctx) {
        const { database, table } = this.visit(ctx.tableName());
        return {
            type: REMOVE_COLLECTION_LEVEL_INDEX_COMMAND,
            indexName: this.visit(ctx.identifier()),
            collectionName: table,
            bucketName: database,
        };
    }

    visitCreateBloomfilterIndexStatement(ctx) {
        const { collectionName, bucketName } = this.visit(ctx.createBloomfilterIndexMainStatement());
        const columns = this.visitWhenExists(ctx, 'bloomfilterColumnParenthesesList');
        const options = this.visitWhenExists(ctx, 'bloomfilterIndexOptions');

        return {
            type: ADD_COLLECTION_LEVEL_BLOOMFILTER_INDEX_COMMAND,
            bucketName,
            collectionName,
            columns,
            options,
        };
    }

    visitCreateBloomfilterIndexMainStatement(ctx) {
        const { database, table } = this.visit(ctx.tableName());
        return {
            collectionName: table,
            bucketName: database,
        };
    }

    visitBloomfilterColumnParenthesesList(ctx) {
        return this.visit(ctx.bloomfilterColumnNameList());
    }

    visitBloomfilterColumnNameList(ctx) {
        return this.visit(ctx.bloomfilterColumnName());
    }

    visitBloomfilterColumnName(ctx) {
        return {
            name: this.visit(ctx.identifier()),
            options: this.visitWhenExists(ctx, 'bloomfilterIndexOptions'),
        };
    }

    visitBloomfilterIndexOptions(ctx) {
        return removeParentheses(ctx.tableProperties().getText());
    }

    visitDropBloomfilterIndexStatement(ctx) {
        const { collectionName, bucketName } = this.visit(ctx.dropBloomfilterIndexMainStatement());
        const columns = this.visitWhenExists(ctx, 'bloomfilterColumnParenthesesList');

        return {
            type: REMOVE_COLLECTION_LEVEL_BLOOMFILTER_INDEX_COMMAND,
            bucketName,
            collectionName,
            columns,
        };
    }

    visitDropBloomfilterIndexMainStatement(ctx) {
        const { database, table } = this.visit(ctx.tableName());
        return {
            collectionName: table,
            bucketName: database,
        };
    }

    visitResourcePlanDdlStatements(ctx) {
        return [
            'createResourcePlanStatement',
            'createTriggerStatement',
            'createPoolStatement',
            'createMappingStatement',
            'alterResourcePlanStatement',
            'dropResourcePlanStatement',
            'alterTriggerStatement',
            'dropTriggerStatement',
            'alterPoolStatement',
            'dropPoolStatement',
            'dropMappingStatement',
        ].map((statement) => this.visitWhenExists(ctx, statement));
    }

    visitCreateResourcePlanStatement(ctx) {
        const resourcePlan = this.visitWhenExists(ctx, 'createNewResourcePlanStatement');

        if (resourcePlan) {
            return resourcePlan;
        }

        return this.visitWhenExists(ctx, 'createResourcePlanStatementLikeExisting', {});
    }

    visitCreateNewResourcePlanStatement(ctx) {
        return {
            type: CREATE_RESOURCE_PLAN,
            name: this.visit(ctx.identifier()),
            parallelism: (this.visitWhenExists(ctx, 'rpAssignList', {}) || {}).parallelism,
        };
    }

    visitRpAssignList(ctx) {
        return this.visit(ctx.rpAssign()).find(({ parallelism }) => !dependencies.lodash.isEmpty(parallelism));
    }

    visitRpAssign(ctx) {
        if (ctx.Number()) {
            return {
                parallelism: ctx.Number().getText(),
            };
        }

        return {};
    }

    visitCreateResourcePlanStatementLikeExisting(ctx) {
        return {
            type: CREATE_RESOURCE_PLAN,
            name: this.visit(ctx.identifier())[0],
            like: this.visit(ctx.identifier())[1],
        };
    }

    visitCreateTriggerStatement(ctx) {
        return {
            type: ADD_TO_RESOURCE_PLAN,
            identifier: 'trigger',
            resourceName: this.visit(ctx.identifier()[0]),
            trigger: {
                name: this.visit(ctx.identifier()[1]),
                ...this.visit(ctx.triggerConditionExpression()),
            },
        };
    }

    visitTriggerActionExpression(ctx) {
        if (ctx.KW_KILL()) {
            return 'KILL';
        }

        return `MOVE TO ${this.visit(ctx.poolPath())}`;
    }

    visitCreatePoolStatement(ctx) {
        return {
            type: ADD_TO_RESOURCE_PLAN,
            identifier: 'pool',
            resourceName: this.visit(ctx.identifier()),
            pool: {
                name: this.visit(ctx.poolPath()),
                ...this.visit(ctx.poolAssignList()),
            },
        };
    }

    visitPoolAssignList(ctx) {
        return Object.assign({}, ...this.visit(ctx.poolAssign()));
    }

    visitPoolAssign(ctx) {
        if (ctx.KW_ALLOC_FRACTION()) {
            return { allocFraction: ctx.Number().getText() };
        } else if (ctx.KW_QUERY_PARALLELISM()) {
            return { parallelism: ctx.Number().getText() };
        } else if (ctx.KW_SCHEDULING_POLICY()) {
            return { schedulingPolicy: getTextFromStringLiteral(ctx) };
        } else {
            return {};
        }
    }

    visitCreateMappingStatement(ctx) {
        return {
            type: CREATE_MAPPING,
            resourceName: this.visit(ctx.identifier()),
            poolName: ctx.KW_TO() ? this.visit(ctx.poolPath()) : '',
            mapping: {
                name: getTextFromStringLiteral(ctx),
                mappingType: getMappingType(ctx),
            },
        };
    }

    visitDropIndexStatement(ctx) {
        const { database, table } = this.visit(ctx.tableName());

        return {
            type: REMOVE_COLLECTION_LEVEL_INDEX_COMMAND,
            indexName: this.visit(ctx.identifier()),
            bucketName: database,
            collectionName: table,
        };
    }

    visitDropViewStatement(ctx) {
        const { database, view } = this.visit(ctx.viewName());

        return {
            type: REMOVE_VIEW_COMMAND,
            bucketName: database,
            viewName: view,
        };
    }

    visitDropMaterializedViewStatement(ctx) {
        const { database, view } = this.visit(ctx.viewName());

        return {
            type: REMOVE_VIEW_COMMAND,
            bucketName: database,
            viewName: view,
        };
    }

    visitAlterResourcePlanStatement(ctx) {
        return {
            type: UPDATE_RESOURCE_PLAN,
            resourceName: this.visit(ctx.identifier()),
            renameTo: this.visitWhenExists(ctx, 'alterResourcePlanRenameSuffix'),
            data: {
                ...this.visitWhenExists(ctx, 'rpAssignList', {}),
                ...this.visitWhenExists(ctx, 'rpUnassignList', {}),
            },
        };
    }

    visitRpUnassignList(ctx) {
        if (this.visit(ctx.rpUnassign()).includes(true)) {
            return {
                parallelism: '',
            };
        }

        return {};
    }

    visitRpUnassign(ctx) {
        return Boolean(ctx.KW_QUERY_PARALLELISM());
    }

    visitAlterResourcePlanRenameSuffix(ctx) {
        return this.visit(ctx.identifier());
    }

    visitDropResourcePlanStatement(ctx) {
        return {
            type: DROP_RESOURCE_PLAN,
            resourceName: this.visit(ctx.identifier()),
        };
    }

    visitAlterTriggerStatement(ctx) {
        return {
            type: UPDATE_ITEM_IN_RESOURCE_PLAN,
            identifier: 'trigger',
            resourceName: this.visit(ctx.identifier()[0]),
            trigger: this.visit(ctx.identifier()[1]),
            data: {
                ...this.visitWhenExists(ctx, 'triggerConditionExpression', {}),
            },
        };
    }

    visitTriggerConditionExpression(ctx) {
        return {
            condition: ctx.triggerExpression().getText(),
            action: this.visit(ctx.triggerActionExpression()),
        };
    }

    visitDropTriggerStatement(ctx) {
        return {
            type: DROP_RESOURCE_PLAN_ITEM,
            identifier: 'trigger',
            resourceName: this.visit(ctx.identifier()[0]),
            trigger: this.visit(ctx.identifier()[1]),
        };
    }

    visitAlterPoolStatement(ctx) {
        return {
            type: UPDATE_ITEM_IN_RESOURCE_PLAN,
            identifier: 'pool',
            resourceName: this.visit(ctx.identifier()[0]),
            pool: this.visit(ctx.poolPath()),
            data: {
                ...(ctx.KW_UNSET() && ctx.KW_SCHEDULING_POLICY() ? { schedulingPolicy: 'default' } : {}),
                ...this.visitWhenExists(ctx, 'poolAssignList', {}),
            },
        };
    }

    visitDropPoolStatement(ctx) {
        return {
            type: DROP_RESOURCE_PLAN_ITEM,
            identifier: 'pool',
            resourceName: this.visit(ctx.identifier()),
            pool: this.visit(ctx.poolPath()),
        };
    }

    visitPoolPath(ctx) {
        return this.visit(ctx.identifier()).join('');
    }

    visitDropMappingStatement(ctx) {
        return {
            type: DROP_MAPPING,
            resourceName: this.visit(ctx.identifier()),
            name: getTextFromStringLiteral(ctx),
        };
    }

    visitDropTableStatement(ctx) {
        const { database, table } = this.visit(ctx.tableName());

        return {
            type: REMOVE_COLLECTION_COMMAND,
            bucketName: database,
            collectionName: table,
        };
    }

    visitTagsPair(ctx) {
        const unityTagKey = getTextFromStringLiteral(ctx);
        const unityTagValueCtx = ctx.tagValue();
        const unityTagValue =unityTagValueCtx ? getTextFromStringLiteral(unityTagValueCtx) : '';

        return {
            unityTagKey,
            unityTagValue
        }
    }

    visitUnityTags(ctx) {
        const { database, table } = this.visit(ctx.tableName());
        const columnName = this.visitWhenExists(ctx, 'identifier', '');
        const tagsPairs = this.visit(ctx.tagsPair());
        const isCatalogTags = !!ctx.KW_CATALOG();
        const isSchemaTags = !!ctx.KW_SCHEMA();
        const isViewTags = !!ctx.KW_VIEW();
        const isTableTags = !!ctx.KW_TABLE() && !ctx.KW_COLUMN();
        const isColumnTags = !!ctx.KW_TABLE() && !!ctx.KW_COLUMN();

        return tagsPairs.map(pair => ({
            ...pair,
            ...(isCatalogTags && { catalogName: table }),
            ...(isSchemaTags && { schemaName: table }),
            ...(isViewTags && { schemaName: database, tableName: table }),
            ...(isTableTags && { schemaName: database, tableName: table }),
            ...(isColumnTags && {schemaName: database, tableName: table,  name: columnName })
        }));
    }

    getText(expression) {
        return this.originalText.slice(expression.start.start, expression.stop.stop + 1);
    }
}

const removeQuotes = (string = '') => string.replace(/^(`)(.*)\1$/, '$2');

const removeValueQuotes = (string = '') => string.replace(/^(['"])([\s\S]*)\1$/, '$2');

const removeSingleDoubleQuotes = (string = '') => string.replace(/['"]+/g, '');

const getOneOf = (subSchemas, columnName) => {
    return subSchemas.map((subSchema) => {
        return {
            type: 'object',
            properties: {
                [columnName]: subSchema,
            },
        };
    });
};

const getStoredAsTable = (storedAsTable) => {
    switch (storedAsTable.toLowerCase()) {
        case 'textfile':
            return 'textfile';
        case 'sequencefile':
            return 'sequencefile';
        case 'orc':
            return 'ORC';
        case 'parquet':
            return 'Parquet';
        case 'avro':
            return 'Avro';
        case 'rcfile':
            return 'RCfile';
        case 'jsonfile':
            return 'JSONfile';
    }
};

const getUsingProperty = (using) => {
    return {
        delta: 'delta',
        csvfile: 'CSVfile',
        csv: 'CSVfile',
        hive: 'Hive',
        jsonfile: 'JSONfile',
        jdbc: 'JDBC',
        orc: 'ORC',
        parquet: 'Parquet',
        libsvm: 'LIBSVM',
        textfile: 'textfile',
    }[String(using).toLowerCase()] || 'delta';
};

const handleChoices = (field) => {
    const { properties, choices } = Object.keys(field.properties).reduce(
        ({ properties, choices }, key) => {
            const property = field.properties[key];
            if (!property.oneOf || property.type) {
                return {
                    properties: { ...properties, [key]: property },
                    choices,
                };
            }
            return {
                choices: [...choices, getOneOf(property.oneOf, key)],
                properties,
            };
        },
        { properties: {}, choices: [] }
    );
    if (choices.length === 0) {
        return field;
    }

    if (choices.length === 1) {
        return {
            ...field,
            properties,
            oneOf: choices[0],
        };
    }

    return {
        ...field,
        properties,
        allOf: choices.map((choice) => ({ oneOf: choice })),
    };
};

const convertKeysToProperties = (keys = [], existed) => {
    return keys.reduce((properties, [name, type]) => {
        if (existed?.[name]) {
            return properties;
        }

        return {
            ...properties,
            [name]: type || {},
        };
    }, {});
};

const getOrderType = (type) => {
    if (type === 'DESC') {
        return 'descending';
    }

    return 'ascending';
};

const getTextFromStringLiteral = (ctx) => {
    return removeSingleDoubleQuotes(ctx.StringLiteral().getText());
};

const mergeConstraints = (constraints) => {
    return Object.values(constraints || []).reduce((mergedConstraint, constraint) => {
        if (constraint.required) {
            return { ...mergedConstraint, required: true };
        }
        if (constraint.unique) {
            return { ...mergedConstraint, unique: true };
        }
        if (constraint.primaryKey) {
            return { ...mergedConstraint, primaryKey: true };
        }
        if (constraint.default) {
            return { ...mergedConstraint, default: constraint.default };
        }
        if (constraint.check) {
            return { ...mergedConstraint, check: constraint.check };
        }
        if (constraint.generatedDefaultValue) {
            return { ...mergedConstraint, generatedDefaultValue: constraint.generatedDefaultValue };
        }

        return mergedConstraint;
    }, {});
};

const getMappingType = (ctx) => {
    if (ctx.KW_USER()) {
        return 'user';
    } else if (ctx.KW_GROUP()) {
        return 'group';
    } else if (ctx.KW_APPLICATION()) {
        return 'application';
    }
};

const convertColumnsToJsonSchema = (columns) => {
    const properties = columns.reduce((schema, column) => {
        return {
            ...schema,
            [column.name]: {
                description: column.comment,
            },
        };
    }, {});

    return {
        properties,
    };
};

module.exports = Visitor;
