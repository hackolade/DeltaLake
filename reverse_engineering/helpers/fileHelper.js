const fs = require('fs');
const readline = require('readline');

/**
 * @param filePath {string}
 * @return {Promise<number>}
 * */
const getCountOfLines = filePath => {
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
        input: fileStream,
        output: process.stdout,
        terminal: false
    });

    return new Promise((resolve, reject) => {
        let lines = 0;

        rl.on('line', (l) => {
            lines = lines + 1;
        });

        rl.on('close', () => {
            resolve(lines);
        });
    });

}

/**
 * @param filePath {string}
 * @param batchSize {number}
 * @param parseLine {(line: string) => any}
 * @param logProgress {(lineIndex: number, amountOfLines: number) => {}}
 * @param batchHandler {(batch: Array<any>) => Promise<void>}
 * */
const batchProcessFile = async ({
                                    filePath,
                                    batchSize,
                                    parseLine = (l) => l,
                                    batchHandler = async (batch) => {},
                                    logProgress = (lineIndex, amountOfLines) => {},
                                }) => {
    if (!filePath) {
        return;
    }

    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
        input: fileStream,
        output: process.stdout,
        terminal: false
    });

    let batch = [];
    let lineIndex = 0;

    try {
        const amountOfLines = await getCountOfLines(filePath);
        for await (const line of rl) {
            logProgress(lineIndex, amountOfLines);
            try {
                batch.push(parseLine(line));
            } catch (e) {
                throw new Error(`Could not parse line at index ${lineIndex}. Check if the file is valid`);
            }
            if (batch.length === batchSize) {
                await batchHandler(batch);
                batch = [];
            }
            lineIndex = lineIndex + 1;
        }

        if (batch.length !== 0) {
            await batchHandler(batch);
            batch = [];
        }
    } catch (e) {
        const batchNumber = Math.floor(lineIndex / batch) + 1;
        throw new Error(`Error processing batch number ${batchNumber}: ${e.message}`);
    }
}

module.exports = {
    batchProcessFile,
}
