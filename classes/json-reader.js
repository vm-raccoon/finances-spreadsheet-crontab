const fs = require("fs");

class JsonReader {

    async read(path) {
        let json = {};

        try {
            const content = await fs.promises.readFile(path);
            json = JSON.parse(content.toString());
        } catch (error) {
            json = {};
        }

        return json;
    }

}

exports.JsonReader = JsonReader;
