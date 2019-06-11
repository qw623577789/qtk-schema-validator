module.exports = {
    get: (value) => {
        let type = typeof value;
        if(require('isobject')(value) && !(value instanceof RegExp)) type = "object";
        if (Array.isArray(value)) type = "array";
        if (value === null) type = "null";
        if (value instanceof RegExp) type = "regexp";
        if (typeof value == "number" && Number.isInteger(value)) type = "integer";
        return type;
    }
};