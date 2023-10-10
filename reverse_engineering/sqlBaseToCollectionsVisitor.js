const { SqlBaseVisitor } = require('./parser/SQLBase/SqlBaseVisitor');
const { dependencies } = require('./appDependencies');

global.SQL_standard_keyword_behavior = false;
global.legacy_exponent_literal_as_decimal_enabled = true;
global.legacy_setops_precedence_enabled = true;

class Visitor extends SqlBaseVisitor {
	constructor(originalText) {
		super();
		this.originalText = originalText;
	}

	visitSingleStatement(ctx) {
		return this.visit(ctx.statement())
	}

	visitCreateTable(ctx) {
		const tableHeader = this.visit(ctx.createTableHeader());
		const colList = this.visitIfExists(ctx, 'colTypeList');
		const constraints = this.visitIfExists(ctx, 'tableConstraint', []);
		const compositePrimaryKeys = constraints
			.filter(constraint => constraint.pkConstraint && constraint.pkConstraint.compositePrimaryKey.length > 1)
			.flatMap(constraint => constraint.pkConstraint);
		const pkConstraints = constraints
			.filter(constraint => constraint.pkConstraint && constraint.pkConstraint.compositePrimaryKey.length === 1)
			.flatMap(constraint => constraint.pkConstraint);
		const fkConstraints = constraints
			.filter(constraint => constraint.fkConstraint)
			.flatMap(constraint => constraint.fkConstraint);
		const tableClauses = this.visit(ctx.createTableClauses());
		const querySelectProperties = this.visitIfExists(ctx, 'query');
		const using = this.visitIfExists(ctx, 'tableProvider');
		const tableProvider = tableClauses.createFileFormat?.serDeLibrary;
		return {
			isExternal: tableHeader.isExternal,
			isTemporary: tableHeader.isTemporary,
			tableName: tableHeader.tableName,
			colList: fillColumnsWithPkConstraints(colList, pkConstraints),
			using,
			tableProvider,
			bucketsNum: tableClauses.bucketSpec?.bucketsNum,
			clusteredBy: tableClauses.bucketSpec?.clusteredBy,
			sortedBy: tableClauses.bucketSpec?.sortedBy,
			commentSpec: tableClauses.commentSpec,
			location: tableClauses.locationSpec,
			partitionBy: tableClauses.partitionBy,
			serDeLibrary: tableClauses.rowFormat?.serDeLibrary,
			serDeProperties: tableClauses.rowFormat?.serDeProperties,
			rowFormat: tableClauses.rowFormat?.format,
			fieldsTerminatedBy: tableClauses.rowFormat?.fieldsTerminatedBy,
			escapedBy: tableClauses.rowFormat?.escapedBy,
			keysTerminatedBy: tableClauses.rowFormat?.keysTerminatedBy,
			linesSeparatedBy: tableClauses.rowFormat?.linesSeparatedBy,
			nullDefinedAs: tableClauses.rowFormat?.nullDefinedAs,
			collectionItemsTerminatedBy: tableClauses.rowFormat?.collectionItemsTerminatedBy,
			skewedBy: tableClauses.skewSpec?.skewedBy,
			skewedOn: tableClauses.skewSpec?.skewedOn,
			tableProperties: tableClauses.tableProperties,
			tableOptions: tableClauses.tableOptions,
			query: querySelectProperties,
			primaryKey: compositePrimaryKeys,
			fkConstraints,
		}
	}


	visitCreateView(ctx) {
		const identifier = getName(ctx.multipartIdentifier());
		return {
			orReplace: this.visitFlagValue(ctx, 'REPLACE'),
			global: this.visitFlagValue(ctx, 'GLOBAL'),
			temporary: this.visitFlagValue(ctx, 'TEMPORARY'),
			ifNotExists: this.visitFlagValue(ctx, 'EXISTS'),
			identifier: identifier.split('.')[1],
			dbName: identifier.split('.')[0] || '',
			colList: this.visitIfExists(ctx, 'identifierCommentList'),
			comment: this.visitIfExists(ctx, 'commentSpec', '')[0] || '',
			selectStatement: this.visitIfExists(ctx, 'query'),
			tableProperties: this.visitIfExists(ctx, 'tablePropertyList', '')?.[0],
		}
	}

	visitIdentifierCommentList(ctx) {
		return this.visit(ctx.identifierComment())
	}

	visitIdentifierComment(ctx) {
		return {
			identifier: getName(ctx.identifier()),
			comment: this.visitIfExists(ctx, 'commentSpec', '')
		}
	}

	visitQuery(ctx) {
		return {
			select: {
				start: ctx.start.start,
				stop: ctx.stop.stop + 1,
			}
		}
	}

	visitCreateTableHeader(ctx) {
		return {
			isExternal: this.visitFlagValue(ctx, 'EXTERNAL'),
			isTemporary: this.visitFlagValue(ctx, 'TEMPORARY'),
			tableName: getName(ctx.multipartIdentifier())
		}
	}

	visitTableConstraint(ctx) {
		return {
			pkConstraint: this.visitIfExists(ctx, 'primaryKeyConstraint'),
			fkConstraint: this.visitIfExists(ctx, 'foreignKeyConstraint'),
		}
	}

	visitPrimaryKeyConstraint(ctx) {
		return {
			constraintName: this.visitIfExists(ctx, 'tableConstraintName', ''),
			compositePrimaryKey: this.visitIfExists(ctx, 'keyNameList', []),
			...this.visitIfExists(ctx, 'constraintOptions', {}),
		};
	}

	visitForeignKeyConstraint(ctx) {
		const [ catalog, parentDatabase, parentCollection ] = this.visit(ctx.multipartIdentifier()).filter(Boolean);
		const [ childField, parentField ] = this.visitIfExists(ctx, 'keyNameList', []);
		return {
			relationshipName: this.visitIfExists(ctx, 'tableConstraintName', ''),
			relationshipType: 'Foreign Key',
			dbName: parentDatabase,
			parentCollection,
			parentField,
			childDbName: parentDatabase,
			childField,
		};
	}

	visitTableConstraintName(ctx) {
		return getName(ctx.identifier());
	}

	visitKeyNameList(ctx) {
		return ctx.identifier().map(getName);
	}

	visitConstraintOptions(ctx) {
		return {
			notEnforced: this.visitFlagValue(ctx, 'ENFORCED', false),
			deferrable: this.visitFlagValue(ctx, 'DEFERRABLE', false),
			initiallyDeferrable: this.visitFlagValue(ctx, 'DEFERRED', false),
			noRely: this.visitFlagValue(ctx, 'NORELY', false)
		}
	}

	visitColTypeList(ctx) {
		return this.visit(ctx.colType());
	}

	visitColType(ctx) {
		return {
			colName: getName(ctx.errorCapturingIdentifier()),
			colType: this.visit(ctx.dataType()),
			colComment: this.visitIfExists(ctx, 'commentSpec', ''),
			...this.visitIfExists(ctx, 'columnConstraint', {}),
		}
	}

	visitColumnConstraint(ctx) {
		if (!Array.isArray(ctx.columnConstraintType())) {
			return {};
		}

		return ctx.columnConstraintType().reduce((result, constraint) => {
			if (constraint.columnGeneratedAs()) {
				return {
					...result,
					generatedDefaultValue: this.visit(constraint.columnGeneratedAs()),
				};
			}

			if (this.visitFlagValue(constraint, 'NULL')) {
				return { ...result, isNotNull: true };
			}

			if (this.visitFlagValue(constraint, 'PRIMARY')) {
				return { ...result, primaryKey: true };
			}

			return result;
		}, {});
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
		}
	}

	visitIdentityOptions(ctx) {
		return {
			start_num: this.visitIfExists(ctx, 'startWith'),
			step_num: this.visitIfExists(ctx, 'incrementBy'),
		};
	}

	visitStartWith(ctx) {
		return ctx.number().getText();
	}

	visitIncrementBy(ctx) {
		return ctx.number().getText();
	}

	visitMapDataType(ctx) {
		return {
			type: "map",
			key: this.visit(ctx.key),
			val: this.visit(ctx.val),
		}

	}

	visitStructDataType(ctx) {
		return {
			type: "struct",
			params: this.visitIfExists(ctx, 'complexColTypeList', '')
		}
	}

	visitArrayDataType(ctx) {
		return {
			type: "array",
			elements: this.visit(ctx.dataType()),
		}
	}

	visitPrimitiveDataType(ctx) {
		return {
			type: getName(ctx.identifier()).toLowerCase(),
			precision: getLabelValue(ctx, 'precision'),
			scale: getLabelValue(ctx, 'scale'),
		}
	}

	visitComplexColTypeList(ctx) {
		return this.visit(ctx.complexColType())
	}

	visitComplexColType(ctx) {
		return {
			colName: getName(ctx.identifier()),
			colType: this.visit(ctx.dataType()),
			isNotNull: this.visitFlagValue(ctx, 'NULL'),
			colComment: this.visitIfExists(ctx, 'commentSpec', '')
		}
	}

	visitCreateTableClauses(ctx) {
		return {
			partitionBy: this.visitIfExists(ctx, 'partitionFieldList', [])[0],
			skewSpec: this.visitIfExists(ctx, 'skewSpec', [])[0],
			bucketSpec: this.visitIfExists(ctx, 'bucketSpec', [])[0],
			rowFormat: this.visitIfExists(ctx, 'rowFormat', [])[0],
			createFileFormat: this.visitIfExists(ctx, 'createFileFormat', [])[0],
			locationSpec: this.visitIfExists(ctx, 'locationSpec', [])[0],
			commentSpec: this.visitIfExists(ctx, 'commentSpec', [])[0],
			tableProperties: this.visitIfExists(ctx, 'tableProperties', [])?.[0]?.[1],
			tableOptions: this.visitIfExists(ctx, 'tableOptions', '')?.[0] || '',
		}
	}

	visitTableOptions(ctx) {
		const options = ctx.getText();

		if (!options) {
			return '';
		}
		const regExp = /^OPTIONS\s*(\([\s\S]+\))$/i;

		if (!regExp.test(options)) {
			return '';
		}

		return options.match(regExp)[1] || '';
	}

	visitTablePropertyList(ctx){
		return this.visit(ctx.tableProperty());
	}

	visitTableProperty(ctx) {
		const propertyKey = getName(ctx.key);
		if (ctx.value) {
			const propertyValue = removeValueQuotes(ctx.value.getText());
			return { propertyKey, propertyValue };
		}
		return { propertyKey };
	}

	visitLocationSpec(ctx) {
		return getLabelValue(ctx, 'location');
	}
	visitCommentSpec(ctx) {
		return getCommentValue(ctx, 'comment');
	}

	visitCreateFileFormat(ctx) {
		return this.visit(ctx.fileFormat());
	}

	visitTableFileFormat(ctx) {
		return {
			inputFormatClassname: getLabelValue(ctx, 'inFmt'),
			outputFormatClassname: getLabelValue(ctx, 'outFmt')
		};
	}

	visitGenericFileFormat(ctx) {
		return {
			serDeLibrary: getName(ctx.identifier())
		};
	}

	visitRowFormatDelimited(ctx) {
		return {
			format: 'delimited',
			fieldsTerminatedBy: getLabelValue(ctx, 'fieldsTerminatedBy'),
			escapedBy: getLabelValue(ctx, 'escapedBy'),
			keysTerminatedBy: getLabelValue(ctx, 'keysTerminatedBy'),
			linesSeparatedBy: getLabelValue(ctx, 'linesSeparatedBy'),
			nullDefinedAs: getLabelValue(ctx, 'nullDefinedAs'),
			collectionItemsTerminatedBy: getLabelValue(ctx, 'collectionItemsTerminatedBy')
		};
	}

	visitRowFormatSerde(ctx) {
		return {
			format: 'SerDe',
			serDeLibrary: getLabelValue(ctx, 'name'),
			serDeProperties: getName(ctx.tablePropertyList())
		};
	}

	visitSkewSpec(ctx) {
		return {
			skewedBy: this.visit(ctx.identifierList()),
			skewedOn: getName(ctx.constantList()) || getName(ctx.nestedConstantList())
		};
	}

	visitBucketSpec(ctx) {
		return {
			clusteredBy: this.visit(ctx.identifierList()),
			sortedBy: this.visitIfExists(ctx, 'orderedIdentifierList'),
			bucketsNum: getName(ctx.INTEGER_VALUE())
		};
	}

	visitOrderedIdentifierList(ctx) {
		return this.visit(ctx.orderedIdentifier());
	}

	visitOrderedIdentifier(ctx) {
		const desc = this.visitFlagValue(ctx, 'DESC');
		return {
			name: getName(ctx.errorCapturingIdentifier()),
			ordering: desc ? 'DESC' : 'ASC'
		};
	}

	visitPartitionFieldList(ctx) {
		return this.visit(ctx.partitionField());
	}


	visitPartitionTransform(ctx) {
		return getName(ctx.transform());
	}

	visitIdentifierList(ctx) {
		return this.visit(ctx.identifierSeq());
	}

	visitIdentifierSeq(ctx) {
		return this.visit(ctx.errorCapturingIdentifier());
	}

	visitErrorCapturingIdentifier(ctx) {
		return getName(ctx.identifier());
	}

	visitTableProvider(ctx) {
		return getName(ctx.multipartIdentifier());
	}

	visitIfExists(ctx, funcName, defaultValue) {
		try {
			return this.visit(ctx[funcName]());
		} catch (e) {
			return defaultValue;
		}
	}

	visitFlagValue(ctx, funcName) {
		try {
			this.visit(ctx[funcName]());
			return true;
		} catch (e) {
			return false;
		}
	}

	getText(expression) {
		return this.originalText.slice(expression.start.start, expression.stop.stop + 1);
	}
}

const getLabelValue = (context, label) => {
	return context[label]?.text ? removeQuotes(context[label]?.text) : '';
}

const getCommentValue = (context, label) => {
	const comment = context[label]?.text ? removeValueQuotes(context[label]?.text) : '';

	return removeEscapingBackSlash(comment);
}

const getName = context => {
	if (!context || dependencies.lodash.isEmpty(context)) {
		return '';
	}
	return removeQuotes(context.getText());
};

const removeQuotes = (string = '') => string.replace(/['`"]+/gm, '');

const removeValueQuotes = (string = '') => string.replace(/^(['"`])([\s\S]*)\1$/, '$2')

const removeEscapingBackSlash = (string = '') => string.replace(/\\(['\\])/g, '$1');

const fillColumnsWithPkConstraints = (columns = [], pkConstraints = []) => {
	return columns.map(column => {
		const columnConstraint = pkConstraints.find(pkConstr => pkConstr.compositePrimaryKey[0] === column.colName);

		if (!columnConstraint) {
			return column;
		}

		return {
			...column,
			primaryKey: true,
			primaryKeyOptions: {
				constraintName: columnConstraint.constraintName || false,
				notEnforced: columnConstraint.notEnforced || false,
				deferrable: columnConstraint.deferrable || false,
				initiallyDeferrable: columnConstraint.initiallyDeferrable || false,
				noRely: columnConstraint.noRely || false
			}
		}
	});
}

module.exports = Visitor;
