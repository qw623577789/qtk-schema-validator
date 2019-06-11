const ValidatorError =  require('../../error');
const Type = require('../../module/type');
// const hash = require('json-hash');

module.exports = (schema, value, path, globalErrorTipConfig, errorCollection) => {
    schema.errorTip = schema.errorTip || {};
    let errorTips = {
        type: schema.errorTip.type !== undefined ? schema.errorTip.type : globalErrorTipConfig.array.type,
        // enum: schema.errorTip.enum !== undefined ? schema.errorTip.enum : globalErrorTipConfig.array.enum,
        length: schema.errorTip.length !== undefined ? schema.errorTip.length : globalErrorTipConfig.array.length
    }

    let type = Type.get(value);
    if(type !== "array") {
        errorCollection.push(new ValidatorError({
            errorOrText: errorTips.type, 
            path, 
            value, 
            actual: type, 
            expected: 'array', 
            keyword: 'type'
        }));
        return false;
    }

    // if(schema.enum !== undefined) {
    //     let valueHash = hash.digest(value);
    //     if (!schema.enum.some(_ => hash.digest(_) === valueHash)) {
    //         errorCollection.push(new ValidatorError({
    //             errorOrText: errorTips.enum, 
    //             path, 
    //             value, 
    //             actual: value, 
    //             expected: schema.enum.map(_ => JSON.stringify(_)).join('、'), 
    //             keyword: 'enum'
    //         }));
    //         return false;
    //     }
    // }

    let hasError = false;
    if (
        schema.maxItems !== undefined && 
        schema.minItems !== undefined &&
        schema.maxItems === schema.minItems
    ) {
        if (schema.minItems !== value.length) {
            errorCollection.push(new ValidatorError({
                errorOrText: errorTips.length, 
                path, 
                value, 
                actual: value.length, 
                expected: `= ${schema.minItems}`, 
                keyword: 'length'
            }));
            hasError = true;
        }
    }
    else {
        if (schema.maxItems !== undefined && schema.maxItems < value.length) {
            errorCollection.push(new ValidatorError({
                errorOrText: errorTips.length, 
                path, 
                value, 
                actual: value.length, 
                expected: `<= ${schema.maxItems}`, 
                keyword: 'maxItems'
            }));
            hasError = true;
        }
        if (schema.minItems !== undefined && schema.minItems > value.length) {
            errorCollection.push(new ValidatorError({
                errorOrText: errorTips.length, 
                path, 
                value, 
                actual: value.length, 
                expected: `>= ${schema.minItems}`, 
                keyword: 'minItems'
            }));
            hasError = true;
        }
    }

    if (schema.items !== undefined) {
        value.every((item, index) => {
            return require('../')(schema.items, item, `${path}[${index}]`, globalErrorTipConfig, errorCollection);
        }) || (hasError = true);
    }
    return !hasError;
};