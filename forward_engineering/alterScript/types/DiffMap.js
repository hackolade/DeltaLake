class DiffMap {
    /**
     * @type {Array<Object>}
     * */
    added = [];

    /**
     * @type {Array<Object>}
     * */
    deleted = [];

    /**
     * @type {Array<{
     *     oldItem: Object,
     *     newItem: Object,
     * }>}
     * */
    modified = [];

    appendDeleted(deleted) {
        this.deleted = [...this.deleted, deleted];
    }

    appendAdded(added) {
        this.added = [...this.added, added];
    }

    appendModified(newItem, oldItem) {
        const modified = {
            oldItem,
            newItem,
        }
        this.modified = [...this.modified, modified];
    }
}

module.exports = {
    DiffMap,
}
