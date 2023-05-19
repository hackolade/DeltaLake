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
}

module.exports = {
    ModificationScript,
    AlterScriptDto,
}
