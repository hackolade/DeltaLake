const antlr4 = require('antlr4');

class ExprErrorListener extends antlr4.error.ErrorListener {
	syntaxError(recognizer, offendingSymbol, line, column, msg, err) {
		throw new Error(`line ${line}:${column} ${msg}`);
	}
}

module.exports = ExprErrorListener;
