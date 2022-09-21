const SqlBaseLexer = require('../parser/SQLBase/SqlBaseLexer')
const SqlBaseParser = require('../parser/SQLBase/SqlBaseParser')
const SqlBaseToCollectionVisitor = require('../sqlBaseToCollectionsVisitor')
const ExprErrorListener = require('../antlrErrorListener');
const antlr4 = require('antlr4');
const { dependencies } = require('../appDependencies');
const schemaHelper = require('./schemaHelper');

const getViewDataFromDDl = statement => {
	const chars = new antlr4.InputStream(statement);
	const lexer = new SqlBaseLexer.SqlBaseLexer(chars);
	lexer.removeErrorListeners();
	lexer.addErrorListener(new ExprErrorListener());
	const tokens = new antlr4.CommonTokenStream(lexer);
	const parser = new SqlBaseParser.SqlBaseParser(tokens);
	parser.removeErrorListeners();
	parser.addErrorListener(new ExprErrorListener());
	const tree = parser.singleStatement();

	const sqlBaseToCOllectionVisitor = new SqlBaseToCollectionVisitor();
	let parsedViewData = tree.accept(sqlBaseToCOllectionVisitor);
	if (!dependencies.lodash.isEmpty(parsedViewData.selectStatement)) {
		parsedViewData.selectStatement = statement.substring(parsedViewData.selectStatement.select.start, parsedViewData.selectStatement.select.stop)
	}
	return {
		code: parsedViewData.identifier,
		global: parsedViewData.global,
		viewOrReplace: parsedViewData.orReplace,
		viewIfNotExist: parsedViewData.ifNotExists,
		viewTemporary: parsedViewData.temporary,
		description: parsedViewData.comment,
		selectStatement: parsedViewData.selectStatement,
		tableProperties: parsedViewData.tblProperties
	}
}

const getJsonSchema = (viewSchema, viewSample) => {
	const COL_NAME = 0;
	const COL_TYPE = 1;
	const COL_COMMENT = 2;

	const properties = viewSchema.reduce((result, row, i) => {
		return {
			...result,
			[row[COL_NAME]]: {
				comments: row[COL_COMMENT],
				...schemaHelper.getJsonSchema(row[COL_TYPE], viewSample?.[i])
			},
		};
	}, {});

	return { properties };
};

module.exports = {
	getViewDataFromDDl,
	getJsonSchema,
};