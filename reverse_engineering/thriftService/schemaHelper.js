const getMapKeyType = (childItem) => {
	if ([ "numeric", "text" ].indexOf(childItem.type) !== -1) {
		return {
			keyType: childItem.type,
			keySubtype: childItem.mode,

		};
	} else {
		return {
			keyType: "text",
			keySubtype: "string"
		};
	}
};

const getMapSubtype = (type) => {
	const subtype = type => `map<${type}>`;

	switch(type) {
		case "text": return subtype("txt");
		case "numeric": return subtype("num");
		case "bool": return subtype("bool");
		case "timestamp": return subtype("ts");
		case "date": return subtype("date");
		case "interval": return subtype("intrvl");
		case "array": return subtype("array");
		case "map": return subtype("map");
		case "struct": return subtype("struct");
		case "union": return subtype("union");
	}
};

const getArraySubtypeByType = (type) => {
	const subtype = (type) => `array<${type}>`;
	switch(type) {
		case "text": return subtype("txt");
		case "numeric": return subtype("num");
		case "timestamp": return subtype("ts");
		case "date": return subtype("date");
		case "interval": return subtype("intrvl");
		case "array": return subtype("array");
		case "map": return subtype("map");
		case "struct": return subtype("struct");
		case "union": return subtype("union");
	}
};

module.exports = {
	getArraySubtypeByType,
	getMapSubtype,
	getMapKeyType,
};
