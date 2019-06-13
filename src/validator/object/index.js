const ValidatorError =  require('../../error');
const Type = require('../../module/type');
// const hash = require('json-hash');
let Validator = null;

module.exports = (schema, value, path, globalErrorTipConfig, errorCollection) => {
    schema.errorTip = schema.errorTip || {};
    let errorTips = {
        type: schema.errorTip.type !== undefined ? schema.errorTip.type : globalErrorTipConfig.object.type,
        // enum: schema.errorTip.enum !== undefined ? schema.errorTip.enum : globalErrorTipConfig.object.enum,
        required: schema.errorTip.required !== undefined ? schema.errorTip.required : globalErrorTipConfig.object.required,
        patternKey: schema.errorTip.patternKey !== undefined ? schema.errorTip.patternKey : globalErrorTipConfig.object.patternKey,
        unexpectedKey: schema.errorTip.unexpectedKey !== undefined ? schema.errorTip.unexpectedKey : globalErrorTipConfig.object.unexpectedKey,
        schema: globalErrorTipConfig.schema,
        branchMatch: schema.errorTip.branchMatch !== undefined ? schema.errorTip.branchMatch : globalErrorTipConfig.object.branchMatch,
    }

    return ObjectValidator(schema, value, path, errorTips, errorCollection, globalErrorTipConfig);
};

function _listIfObjectSchema(schema, collection = []) {
    let ifObject = {
        type: "object",
        required: schema.then.required || [],
        additionalProperties: schema.then.additionalProperties === undefined ? true : schema.then.additionalProperties
    }

    //处理properties
    if (schema.then.properties !== undefined) {
        ifObject.properties = Object.assign(schema.then.properties, schema.if.properties);
    }
    else if (schema.properties !== undefined) {
        ifObject.properties = Object.assign(
            ifObject.required.reduce((prev, curr) => {
                prev[curr] = schema.properties[curr];
                return prev;
            },{}),
            schema.if.properties
        );
    }
    else {
        ifObject.properties = undefined;
    }

    //处理patternProperties
    if (schema.then.patternProperties !== undefined) {
        ifObject.patternProperties = Object.assign(schema.then.patternProperties, schema.if.patternProperties);
    }
    else if (schema.patternProperties !== undefined) {
        ifObject.patternProperties = Object.assign(
            ifObject.required.reduce((prev, curr) => {
                prev[curr] = schema.patternProperties[curr];
                return prev;
            },{}),
            schema.if.patternProperties
        );
    }
    else {
        ifObject.patternProperties = undefined;
    }

    collection.push(
        Object.assign({
            _if: schema.if.properties || true
        }, ifObject)
    );

    //处理else
    if (schema.else === false) { //endif情况
        return collection;
    }
    else if (schema.else.if !== undefined) { //elseif情况
        _listIfObjectSchema(
            Object.assign({
                properties: schema.properties,
                patternProperties: schema.propertiesObject
            }, schema.else),
            collection
        );
    }
    else {
        _listIfObjectSchema( //else情况(排除)
            {
                if: true,
                else: false,
                properties: schema.properties,
                patternProperties: schema.propertiesObject,
                then: schema.else
            }, 
            collection
        );
    }

    return collection;
}

function _getIfObjectBranch(schemas, value, path, errorTips, errorCollection, globalErrorTipConfig) {
    let matchErrors = [];
    let matchBranches = schemas.filter(schema => {
        let errors = [];
        let ifObjectSchema = {
            type: "object",
            properties: schema._if,
            required: Object.keys(schema._if || {}),
            additionalProperties: true
        };
        ObjectValidator(ifObjectSchema, value, path, errorTips, errors, globalErrorTipConfig);
        if (errors.length !== 0) matchErrors.push(errors);
        return errors.length === 0;
    });
    if (matchBranches.length === 0) {
        errorCollection.push(
            new ValidatorError({
                errorOrText: errorTips.branchMatch, 
                path, 
                desc: '实际值不符合任何一个if条件',
                keyword: 'branchMatch',
                matchDetail: {
                    mismatch: matchErrors
                }
            })
        )
        return false;
    }
    else if (matchBranches.length > 1) {
        errorCollection.push(
            new ValidatorError({
                errorOrText: errorTips.branchMatch, 
                path, 
                desc: '实际值不能同时符合多个if条件',
                keyword: 'branchMatch',
                matchDetail: {
                    match: matchBranches.map(_ => _._if)
                }
            })
        )
        return false;
    }
    return matchBranches[0];
}

function ObjectValidator(schema, value, path, errorTips, errorCollection, globalErrorTipConfig) {
    let type = Type.get(value);
    if(type !== "object") {
        errorCollection.push(new ValidatorError({
            errorOrText: errorTips.type, 
            path, 
            value, 
            actual: type, 
            expected: 'object', 
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

    if (schema.if !== undefined) {
        let listIfObjectSchema = _listIfObjectSchema(schema);
        let branchSchema = _getIfObjectBranch(
            listIfObjectSchema,
            value,
            path,
            errorTips,
            errorCollection,
            globalErrorTipConfig
        );
        if (branchSchema === false) return false;
        schema = branchSchema;
    }

    if (schema.patternProperties !== undefined) {
        if (Object.keys(schema.patternProperties).length !== 1) {
            errorCollection.push(
                new ValidatorError({
                    errorOrText: errorTips.schema, 
                    path, 
                    desc: '不支持patternProperties有多个key正则',
                    keyword: 'schema'
                })
            );
            return false;
        }
        let patternKey = Object.keys(schema.patternProperties)[0];
        let patternSchema = schema.patternProperties[patternKey];
        let instanceKeys = Object.keys(value);
        if (instanceKeys.length === 0) { //空对象情况
            if ((schema.required || []).length !== 0) {
                errorCollection.push(new ValidatorError({
                    errorOrText: errorTips.patternKey, 
                    path, 
                    value: undefined, 
                    actual: undefined, 
                    expected: patternKey, 
                    keyword: 'patternKey'
                }));
                return false;
            } 
            return true;
        }
        else {
            return Object.keys(value).filter(key => {
                if (new RegExp(patternKey).test(key)) {
                    if (Validator === null) Validator = require('../');
                    return !Validator(patternSchema, value[key], path === '.' ? `${path}${key}` : `${path}.${key}`, globalErrorTipConfig, errorCollection);
                }
                else {
                    if (schema.additionalProperties === false) {
                        errorCollection.push(new ValidatorError({
                            errorOrText: errorTips.patternKey, 
                            path, 
                            value, 
                            actual: key, 
                            expected: patternKey, 
                            keyword: 'patternKey'
                        })); 
                        return true;
                    }
                    return false;
                }
                
            })
                .length === 0;
        }

    }
    else {
        //从值角度过滤出不符合的key
        let notMatchPropertiesKeys = Object.keys(value).filter(key => {
            if (schema.properties[key] === undefined) {
                if (schema.additionalProperties === false) {
                    errorCollection.push(new ValidatorError({
                        errorOrText: errorTips.unexpectedKey, 
                        path, 
                        value: value[key], 
                        actual: key, 
                        expected: undefined, 
                        keyword: 'unexpectedKey'
                    }));
                    return true;
                }
                else {
                    return false;
                }
            }
            let propertySchema = schema.properties[key];
            if (Validator === null) Validator = require('../');
            return !Validator(propertySchema, value[key], path === '.' ? `${path}${key}` : `${path}.${key}`, globalErrorTipConfig, errorCollection);
        });
        //从schema角度过滤出不符合的key
        let instanceKey = Object.keys(value);
        Object.keys(schema.properties)
            .filter(_ => !instanceKey.includes(_))
            .filter(propertiesKey => {
                if (value[propertiesKey] === undefined && (schema.required || []).includes(propertiesKey)) {
                    errorCollection.push(new ValidatorError({
                        errorOrText: errorTips.required, 
                        path, 
                        value: undefined, 
                        actual: undefined, 
                        expected: propertiesKey, 
                        keyword: 'required'
                    }));
                    return true;
                }
                return false;
            })
            .forEach(_ => notMatchPropertiesKeys.push(_));

        return notMatchPropertiesKeys.length === 0;
    }
}