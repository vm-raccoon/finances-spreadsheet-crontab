require("dotenv").config();
const { JsonReader } = require("./classes/json-reader");
const { GoogleServiceAccount } = require("./classes/google-service-account");
const { UpdateCurrencyRates } = require("./classes/tasks/update-currency-rates");

(new JsonReader()).read(process.env.GOOGLE_SERVICE_ACCOUNT_JSON).then(async (config) => {
    const {
        client_email: email,
        private_key: key,
    } = config;

    const googleServiceAccount = new GoogleServiceAccount(email, key);
    const spreadsheet = await googleServiceAccount.spreadsheet(process.env.SPREADSHEET_ID);

    const sheetCurrencyRates = spreadsheet.sheetsByTitle[process.env.CURRENCY_RATES_SHEET_TITLE];
    await (new UpdateCurrencyRates(sheetCurrencyRates)).run();
});
