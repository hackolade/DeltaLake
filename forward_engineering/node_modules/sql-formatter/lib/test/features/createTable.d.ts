import { FormatFn } from '../../src/sqlFormatter.js';
interface CreateTableConfig {
    orReplace?: boolean;
    ifNotExists?: boolean;
    columnComment?: boolean;
    tableComment?: boolean;
}
export default function supportsCreateTable(format: FormatFn, { orReplace, ifNotExists, columnComment, tableComment }?: CreateTableConfig): void;
export {};
