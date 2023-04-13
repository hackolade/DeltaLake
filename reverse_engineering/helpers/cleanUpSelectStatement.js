
const antlr4 = require('antlr4');
const HiveLexer = require('../parser/Hive/HiveLexer.js');
const { HiveParser } = require('../parser/Hive/HiveParser.js');
const { HiveParserVisitor } = require('../parser/Hive/HiveParserVisitor.js');

const deeplyFlatten = (arr) => {
    if (Array.isArray(arr)) {
        return arr.flatMap(item => deeplyFlatten(item));
    } else {
        return arr;
    }
};

const ALLOWED_COMMANDS = [
    HiveParser.RULE_selectStatement
];

class Visitor extends HiveParserVisitor {
    visitStatement(ctx) {
        const execStatement = ctx.execStatement();
        if (execStatement) {
            return this.visit(execStatement);
        }

        return;
    }

    visitDdlStatement(ctx) {
        if (ALLOWED_COMMANDS.includes(ctx.children[0].ruleIndex)) {
            return super.visitDdlStatement(ctx)[0];
        }
        return;
    }

    visitCastExpression(ctx) {
        const structType = ctx.structType();

        if (!structType) {
            return;
        }

        return {
            start: structType.start.start,
            stop: structType.stop.stop,
        };
    }
}

const cleanUpSelectStatement = (statement) => {
    if (!statement) {
        return statement;
    }

    const chars = new antlr4.InputStream(statement);
    const lexer = new HiveLexer.HiveLexer(chars);
    
    const tokens = new antlr4.CommonTokenStream(lexer);
    const parser = new HiveParser(tokens);
    
    const tree = parser.statements();
    
    const hqlToCollectionsGenerator = new Visitor();
    
    const commands = deeplyFlatten(tree.accept(hqlToCollectionsGenerator)).filter(Boolean);

    return commands.reduce((statement, item) => {
        return statement.slice(0, item.start) + ' STRING ' + statement.slice(item.stop + 1);
    }, statement);
};

module.exports = cleanUpSelectStatement;
