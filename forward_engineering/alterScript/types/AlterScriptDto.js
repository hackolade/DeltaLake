class ModificationScript {
	/**
	 * @type string
	 * */
	script;

	/**
	 * @type boolean
	 * */
	isDropScript;
}

class AlterScriptDto {
	/**
	 * @type {boolean | undefined}
	 * */
	isActivated;

	/**
	 * @type {Array<ModificationScript>}
	 * */
	scripts;

	/**
	 * @param scripts {Array<string>}
	 * @param isActivated {boolean}
	 * @param isDropScripts {boolean}
	 * @return {Array<AlterScriptDto>}
	 * */
	static getInstances(scripts, isActivated, isDropScripts) {
		return (scripts || []).filter(Boolean).map(script => ({
			isActivated,
			scripts: [
				{
					isDropScript: isDropScripts,
					script,
				},
			],
		}));
	}

	/**
	 * @param scripts {Array<string>}
	 * @param isActivated {boolean}
	 * @param isDropScripts {boolean}
	 * @return {AlterScriptDto | undefined}
	 * */
	static getInstance(scripts, isActivated, isDropScripts) {
		if (!scripts?.filter(Boolean)?.length) {
			return undefined;
		}
		return {
			isActivated,
			scripts: scripts.filter(Boolean).map(script => ({
				isDropScript: isDropScripts,
				script,
			})),
		};
	}

	/**
	 * @param dropScript {string | undefined}
	 * @param createScript {string | undefined}
	 * @param isActivated {boolean}
	 * @return {AlterScriptDto | undefined}
	 * */
	static getDropAndRecreateInstance(dropScript, createScript, isActivated) {
		/**
		 * @type {ModificationScript[]}
		 * */
		const scriptModificationDtos = [];
		if (Boolean(dropScript)) {
			scriptModificationDtos.push({
				isDropScript: true,
				script: dropScript,
			});
		}
		if (Boolean(createScript)) {
			scriptModificationDtos.push({
				isDropScript: false,
				script: createScript,
			});
		}
		if (!scriptModificationDtos?.length) {
			return undefined;
		}
		return {
			isActivated,
			scripts: scriptModificationDtos,
		};
	}
}

module.exports = {
	ModificationScript,
	AlterScriptDto,
};
