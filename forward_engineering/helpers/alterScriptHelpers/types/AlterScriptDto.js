class ModificationScript {
    /**
     * @type string
     * */
    script

    /**
     * @type boolean
     * */
    isDropScript
}

class AlterScriptDto {
    /**
     * @type {boolean | undefined}
     * */
    isActivated

    /**
     * @type {Array<ModificationScript>}
     * */
    scripts

    /**
     * @param scripts {Array<string>}
     * @param isActivated {boolean}
     * @param isDropScripts {boolean}
     * @return {Array<AlterScriptDto>}
     * */
    static getInstances(scripts, isActivated, isDropScripts) {
        return (scripts || [])
            .filter(Boolean)
            .map(script => ({
                isActivated,
                scripts: [{
                    isDropScript: isDropScripts,
                    script
                }]
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
            scripts: scripts
                .filter(Boolean)
                .map(script => ({
                    isDropScript: isDropScripts,
                    script,
                }))
        }
    }
}

module.exports = {
    ModificationScript,
    AlterScriptDto,
}
