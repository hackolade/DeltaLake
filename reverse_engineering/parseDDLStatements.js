const _ = require('lodash');
const antlr4 = require('antlr4');
const HiveLexer = require('./parser/Hive/HiveLexer.js');
const HiveParser = require('./parser/Hive/HiveParser.js');
const hqlToCollectionsVisitor = require('./hqlToCollectionsVisitor.js');
const commandsService = require('./commandsService');
const ExprErrorListener = require('./antlrErrorListener');

module.exports = {
	parseDDLStatements(input) {
		const chars = new antlr4.InputStream(input);
		const lexer = new HiveLexer.HiveLexer(chars);

		const tokens = new antlr4.CommonTokenStream(lexer);
		const parser = new HiveParser.HiveParser(tokens);
		parser.removeErrorListeners();
		parser.addErrorListener(new ExprErrorListener());

		const tree = parser.statements();

		const hqlToCollectionsGenerator = new hqlToCollectionsVisitor(input);

		const commands = tree.accept(hqlToCollectionsGenerator);
		return commandsService.convertCommandsToReDocs(_.flatten(commands).filter(Boolean), input);
	},
};
