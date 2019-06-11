module.exports = class ValidatorError extends Error {
    constructor({errorOrText, path, value, actual, expected, keyword, desc, matchDetail}) {
        super();
        this._info = {
            keyword,
            path,
            value,
            actual, 
            expected,
            desc,
            matchDetail,
            tipTemplate: typeof errorOrText === "string" ? errorOrText : errorOrText.message
        }
        this._class = typeof errorOrText === "string" ? Error : errorOrText;
    }

    get info() {
        return this._info;
    }

    get class() {
        return this._class;
    }
};