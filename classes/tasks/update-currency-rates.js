const { BaseTask } = require("./base-task");
const NodeHtmlParser = require("node-html-parser");

class UpdateCurrencyRates extends BaseTask {

    constructor(sheet) {
        super();
        this.sheet = sheet;
    }

    // region Last datetime updated
    async #updateDateTime() {
        await this.sheet.loadCells("A1:A2");

        const cellTime = await this.sheet.getCellByA1("A1");
        const cellDate = await this.sheet.getCellByA1("A2");

        const dateInstance = new Date();

        const hours = `${String(dateInstance.getHours()).padStart(2, "0")}`;
        const minutes = `${String(dateInstance.getMinutes()).padStart(2, "0")}`;
        const seconds = `${String(dateInstance.getSeconds()).padStart(2, "0")}`;

        const date = `${String(dateInstance.getDate()).padStart(2, "0")}`;
        const month = `${String(dateInstance.getMonth() + 1).padStart(2, "0")}`;
        const year = dateInstance.getFullYear();

        cellTime.value = `${hours}:${minutes}:${seconds}`;
        cellDate.value = `${date}.${month}.${year}`;

        await this.sheet.saveUpdatedCells();
    }
    // endregion

    // region Update currency rates NBU
    async #fetchNbuCurrencyRates(codes = []) {
        const rates = {};
        const { data = [] } = await fetch("https://api.minfin.com.ua/currency/rates/nbu/?locale=uk").then(r => r.json());

        if (Array.isArray(data)) {
            data.forEach(currency => {
                const code = String(currency?.code || "").toLowerCase();
                if (code.length > 0 && (codes.length === 0 || codes.includes(code))) {
                    rates[code] = currency;
                }
            });
        }

        return rates;
    }

    async #updateRatesNbu() {
        const rates = await this.#fetchNbuCurrencyRates(["usd", "eur"]);

        await this.sheet.loadCells("E5:E6");

        const cellUsd = await this.sheet.getCellByA1("E5");
        const cellEur = await this.sheet.getCellByA1("E6");

        cellUsd.value = Number(rates?.usd?.rate || 0);
        cellEur.value = Number(rates?.eur?.rate || 0);

        await this.sheet.saveUpdatedCells();
    }
    // endregion

    // region Update currency rates PUMB
    async #fetchPumbCurrencyRates() {
        const rates = {
            usd: {
                buy: 0,
                sell: 0,
            },
            eur: {
                buy: 0,
                sell: 0,
            },
        };

        const html = await fetch("https://about.pumb.ua/info/currency_converter", {
            muteHttpExceptions: true,
            headers: {
                "Content-Type": "text/html",
                "Accept": "text/html",
            },
        }).then(r => r.text());

        const root = NodeHtmlParser.parse(html);

        Object.entries(rates).forEach(([currency, options]) => {
            Object.keys(options).forEach(option => {
                const node = root.querySelector(`td[data-currency-${currency}${option}]`);
                if (node) {
                    rates[currency][option] = Number(node.text);
                }
            })
        });

        return rates;
    }

    async #updateRatesPumb() {
        const rates = await this.#fetchPumbCurrencyRates();

        await this.sheet.loadCells("F5:G6");

        const cellUsdBuy = await this.sheet.getCellByA1("F5");
        const cellUsdSell = await this.sheet.getCellByA1("G5");

        const cellEurBuy = await this.sheet.getCellByA1("F6");
        const cellEurSell = await this.sheet.getCellByA1("G6");

        cellUsdBuy.value = Number(rates.usd.buy || 0);
        cellUsdSell.value = Number(rates.usd.sell || 0);

        cellEurBuy.value = Number(rates.eur.buy || 0);
        cellEurSell.value = Number(rates.eur.sell || 0);

        await this.sheet.saveUpdatedCells();
    }
    // endregion

    async run() {
        await Promise.all([
            this.#updateDateTime(),
            this.#updateRatesNbu(),
            this.#updateRatesPumb(),
        ])
    }

}

exports.UpdateCurrencyRates = UpdateCurrencyRates;
