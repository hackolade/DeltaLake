class PluginError {
    /**
     * @type string
     */
    message

    /**
     * @type {string | undefined}
     */
    stack
}

class App {

    /**
     * @type {(library: string) => any}
     * */
    require
}

class Logger {

    /**
     * @type {(level: string, additionalInfoDto: Object, message: string, hiddenKeys?: any) => void}
     * */
    log

    /**
     * @type {() => void}
     * */
    clear
}

class CoreData {
    /**
     * @type {string}
     */
    jsonSchema

    /**
     * @type {string}
     */
    modelDefinitions

    /**
     * @type {string}
     */
    internalDefinitions

    /**
     * @type {string}
     */
    externalDefinitions

    /**
     * @type {any}
     */
    containerData

    /**
     * @type {any}
     */
    entityData

    /**
     * @type {any}
     */
    entities

    /**
     * @type {Array<any>}
     */
    views

    /**
     * @type {Object | undefined}
     */
    viewData

    /**
     * @type {Array<any>}
     */
    relationships

    /**
     * @type {Object | undefined}
     */
    collectionRefsDefinitionsMap

    /**
     * @type {boolean}
     */
    isUpdateScript

    /**
     * @type {'container' | 'entity'}
     */
    level

    /**
     * @type {string | undefined}
     */
    host

    /**
     * @type {string | undefined}
     */
    clusterId

    /**
     * @type {string | undefined}
     */
    accessToken

    /**
     * @type {string | number | undefined}
     */
    applyToInstanceQueryRequestTimeout

    /**
     * @type {string | undefined}
     */
    script

    /**
     * @type {any | undefined}
     */
    hiddenKeys

    /**
     * @type {Array<{
     *     id: string,
     *     value: any,
     * }> | {separateBucket: boolean}}
     */
    options

    /**
     * @type {[
     *     {
     *          modelName: string,
     *          dbVendor: string,
     *          dbVersion: string,
     *          isLineageEnabled: boolean
     *     },
     *     { relationships: [] },
     *     { sources: [] }
     * ]}
     * */
    modelData
}

module.exports = {
    App,
    CoreData,
    Logger,
    PluginError,
}
