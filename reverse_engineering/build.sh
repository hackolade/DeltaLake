#!/bin/bash

# * run with `sh build.sh`

# !important: don't forget to change `import` and `export` to `require` and `module.exports` after the parser is built

# https://www.antlr.org/download/antlr-4.9.2-complete.jar
#
# set antlr4 aliases
# export CLASSPATH=".:/usr/local/lib/antlr-4.9.2-complete.jar:$CLASSPATH"
# alias antlr4='java -jar /usr/local/lib/antlr-4.9.2-complete.jar'
# alias grun='java org.antlr.v4.gui.TestRig'

# build SqlBase parser (still needed for RE from instance, table/view DDL parsing)
java -jar /usr/local/lib/antlr-4.9.2-complete.jar -Dlanguage=JavaScript \
    -lib grammars \
    -o parser/SQLBase \
    -visitor \
    -no-listener \
    -Xexact-output-dir \
    grammars/SqlBase.g4

npx prettier --write ./parser/**/*.js
