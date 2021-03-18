const _ = require('lodash');

const getFieldsArray = (bucketColumns) => {
	try {
		return bucketColumns.match(/^\[(.*)\]$/i)[1].split(',').map(str => str.trim());
	} catch (e) {
		return [];
	}
};

const getSortColumns = (sortColumns) => {
	const keys = sortColumns.trim().match(/^\[(.*)\]$/i) || [];
	const parsedKeys = (keys[1] || "").match(/Order\((.*?)\)/ig) || [];

	return parsedKeys
		.map(str => {
			const result = str.match(/Order\(col:(.*?),\s*?order:([01])\)/i) || [];
		
			return {
				name: result[1],
				type: result[2] === '1' ? "ascending" : "descending",
			};
		});
};

const getSkewedOn = (skewedValues) => {
	return skewedValues.replace(/\[/g, '(').replace(/\]/g, ')').trim();
};

const isExternal = (detailedInfo) => (_.get(detailedInfo, 'Table Type', '').trim() === 'EXTERNAL_TABLE');

const isTemporary = (extendedDetailedInfo) => /temporary:true/i.test(extendedDetailedInfo || '');

const getStoredAs = (storageInfo) => {
	const inputFormat = _.get(storageInfo, 'InputFormat', '').trim();
	const outputFormat = _.get(storageInfo, 'OutputFormat', '').trim();
	const serDeLibrary = _.get(storageInfo, 'SerDe Library', '').trim();
	const storageParams = _.get(storageInfo, 'Storage Desc Params', {});

	const isRcFile = (
		serDeLibrary === 'org.apache.hadoop.hive.serde2.columnar.LazyBinaryColumnarSerDe'
		&&
		inputFormat === 'org.apache.hadoop.hive.ql.io.RCFileInputFormat'
		&&
		outputFormat === 'org.apache.hadoop.hive.ql.io.RCFileOutputFormat'
	);

	if (inputFormat === 'org.apache.hadoop.mapred.TextInputFormat') {
		if (serDeLibrary === 'org.apache.hadoop.hive.serde2.lazy.LazySimpleSerDe') {
			return {
				storedAsTable: 'textfile',
				rowFormat: 'delimited',
				fieldsTerminatedBy: (storageParams['field.delim'] || '').trim(),
				linesTerminatedBy: (storageParams['line.delim'] || '').trim(),
				collectionItemsTerminatedBy: (storageParams['collection.delim'] || '').trim(),
				fieldsescapedBy: (storageParams['escape.delim'] || '').trim(),
				linesTerminatedBy: (storageParams['line.delim'] || '').trim(),
				mapKeysTerminatedBy: (storageParams['mapkey.delim'] || '').trim(),
				nullDefinedAs: (storageParams['serialization.null.format'] || '').trim()
			};
		} else {
			return {
				storedAsTable: 'textfile',
				rowFormat: 'SerDe',
				serDeLibrary: serDeLibrary,
				serDeProperties: '(\n\t' + Object.keys(storageParams).map((key) => {
					return `"${key}" = "${(storageParams[key] || "").trim()}"`;
				}).join('\n\t') + '\n)'
			};
		}
	} else if (inputFormat === 'org.apache.hadoop.mapred.SequenceFileInputFormat') {
		return {
			storedAsTable: 'sequencefile'
		};
	} else if (serDeLibrary === 'org.apache.hadoop.hive.serde2.avro.AvroSerDe') {
		return {
			storedAsTable: 'Avro'
		};
	} else if (serDeLibrary === 'org.apache.hadoop.hive.ql.io.orc.OrcSerde') {
		return {
			storedAsTable: 'ORC'
		};
	} else if (serDeLibrary === 'org.apache.hadoop.hive.ql.io.parquet.serde.ParquetHiveSerDe') {
		return {
			storedAsTable: 'Parquet'
		};
	} else if (isRcFile) {
		return {
			storedAsTable: 'RCfile'
		};
	} else {
		return {
			storedAsTable: "input/output format",
			serDeLibrary: serDeLibrary,
			inputFormatClassname: inputFormat,
			outputFormatClassname: outputFormat
		}
	}
};

const getTableProperties = (tableParams) => {
	return '(\n\t' + [
		"hbase.table.name",
		"immutable",
		"orc.compress",
		"NO_AUTO_COMPACTION",
		"compactor.mapreduce.map.memory.mb",
		"compactorthreshold.hive.compactor.delta.num.threshold",
		"compactorthreshold.hive.compactor.delta.pct.threshold",
		"auto.purge",
		"EXTERNAL"
	].map((prop) => {
		if (!tableParams[prop]) {
			return;
		}

		return `"${prop}"="${(tableParams[prop] || "").trim()}"`
	})
	.filter(prop => prop)
	.join('\n\t') + '\n)';
};

const getNumBuckets = (storageInfo) => {
	const value = _.get(storageInfo, 'Num Buckets', '').trim();

	if (!value) {
		return {};
	}

	if (Number(value) < 0) {
		return {};
	}

	return { numBuckets: Number(value) };
};

const getEntityLevelData = (tableName, tableInfo, extendedTableInfo) => {
	const partitionInfo = tableInfo.partitionInfo || {};
	const detailedInfo = tableInfo.detailedInfo || {};
	const storageInfo = tableInfo.storageInfo || {};

	return Object.assign({
		code: tableName,
		location: _.get(detailedInfo, 'Location', ''),
		externalTable: isExternal(detailedInfo),
		temporaryTable: isTemporary(extendedTableInfo),
		compositePartitionKey: Object.keys(partitionInfo),
		compositeClusteringKey: getFieldsArray(_.get(storageInfo, 'Bucket Columns', "")),
		sortedByKey: getSortColumns(_.get(storageInfo, 'Sort Columns', '')),
		skewedby: getFieldsArray(_.get(storageInfo, 'Skewed Columns', '')),
		skewedOn: getSkewedOn(_.get(storageInfo, 'Skewed Values', '')),
		description: _.get(detailedInfo, 'Table Parameters.comment', ''),
		skewStoredAsDir: _.get(storageInfo, 'Stored As SubDirectories', '').trim().toLowerCase() === 'yes',
		tableProperties: getTableProperties(_.get(detailedInfo, 'Table Parameters', {}))
	}, getNumBuckets(storageInfo), getStoredAs(storageInfo));
};

module.exports = {
	getEntityLevelData
};
