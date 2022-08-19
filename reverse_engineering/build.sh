#!/bin/bash

# * run with `sh build.sh`

# !important: don't forget to change `import` and `export` to `require` and `module.exports` after the parser is built

# set antlr4 aliases
# export CLASSPATH=".:/usr/local/lib/antlr-4.9.2-complete.jar:$CLASSPATH"
# alias antlr4='java -jar /usr/local/lib/antlr-4.9.2-complete.jar'
# alias grun='java org.antlr.v4.gui.TestRig'

# build parser
antlr4 -Dlanguage=JavaScript \
    -lib grammars \
    -o parser \
    -visitor \
    -no-listener \
    -Xexact-output-dir \
    grammars/HiveParser.g4 \
    grammars/HiveLexer.g4

npx prettier --write ./parser/Hive/*.js