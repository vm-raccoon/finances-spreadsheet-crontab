const { JWT } = require("google-auth-library");
const { GoogleSpreadsheet } = require("google-spreadsheet");

class GoogleServiceAccount {

    static SCOPES = [
        "https://www.googleapis.com/auth/spreadsheets",
    ];

    #jwt = null;

    constructor(email, key) {
        this.#jwt = new JWT({
            email: email,
            key: key,
            scopes: GoogleServiceAccount.SCOPES,
        });
    }

    async spreadsheet(spreadsheetId) {
        const doc = new GoogleSpreadsheet(spreadsheetId, this.#jwt);
        await doc.loadInfo();
        return doc;
    }

}

exports.GoogleServiceAccount = GoogleServiceAccount;
