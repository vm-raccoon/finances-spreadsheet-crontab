class BaseTask {

    #sheet = null;

    get sheet() {
        return this.#sheet;
    }

    set sheet(sheet) {
        this.#sheet = sheet;
    }

    async run() {
        // do something
    }

}

exports.BaseTask = BaseTask;
