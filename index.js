const {sugar} = require("@qtk/schema");
const Validator = require('./src/validator');
const globalErrorTipConfig = {
    schema: "路径:{PATH} , schema有误, {DESC}",
    boolean: {
        type: "路径:{PATH} , 数据类型有误, 当前值:{VALUE}, 当前类型:{ACTUAL}, 期望类型:{EXPECTED}",
        enum: "路径:{PATH} , 不在枚举值范围, 当前值:{VALUE},　期望:{EXPECTED}"
    },
    number: {
        type: "路径:{PATH} , 数据类型有误, 当前值:{VALUE}, 当前类型:{ACTUAL}, 期望类型:{EXPECTED}",
        enum: "路径:{PATH} , 不在枚举值范围, 当前值:{VALUE},　期望:{EXPECTED}",
        range: "路径:{PATH} , 不在值范围内, 当前值:{VALUE},　期望:{EXPECTED}",
    },
    integer: {
        type: "路径:{PATH} , 数据类型有误, 当前值:{VALUE}, 当前类型:{ACTUAL}, 期望类型:{EXPECTED}",
        enum: "路径:{PATH} , 不在枚举值范围, 当前值:{VALUE},　期望:{EXPECTED}",
        range: "路径:{PATH} , 不在值范围内, 当前值:{VALUE},　期望:{EXPECTED}",
    },
    string: {
        type: "路径:{PATH} , 数据类型有误, 当前值:{VALUE}, 当前类型:{ACTUAL}, 期望类型:{EXPECTED}",
        enum: "路径:{PATH} , 不在枚举值范围, 当前值:{VALUE},　期望:{EXPECTED}",
        length: "路径:{PATH} , 字符串长度不在范围内, 当前值:{VALUE},　当前长度:{ACTUAL}, 期望长度:{EXPECTED}",
        pattern: "路径:{PATH} , 字符串不符合正则, 当前值:{VALUE}, 期望正则:{EXPECTED}",
    },
    null: {
        enum: "路径:{PATH} , 不在枚举值范围, 当前值:{VALUE},　期望:{EXPECTED}"
    },
    object: {
        type: "路径:{PATH} , 数据类型有误, 当前值:{VALUE}, 当前类型:{ACTUAL}, 期望类型:{EXPECTED}",
        patternKey: "路径:{PATH} , Object Key不符合正则，　当前Key:{ACTUAL}, 期望Key符合正则:{EXPECTED}",
        required: "路径:{PATH} , Object缺少Key：{EXPECTED}",
        unexpectedKey: "路径:{PATH} , Object出现非schema允许出现的Key:{ACTUAL}",
        // enum: "路径:{PATH} , 不在枚举值范围, 当前值:{VALUE},　期望:{EXPECTED}",
        branchMatch: "路径:{PATH} , {DESC}, 匹配详情：\n{MATCH_DETAIL}",
    },
    array: {
        type: "路径:{PATH} , 数据类型有误, 当前值:{VALUE}, 当前类型:{ACTUAL}, 期望类型:{EXPECTED}",
        length: "路径:{PATH} , 数组长度不在范围内,　当前长度:{ACTUAL}, 期望长度:{EXPECTED}",
    },
    oneOf: {
        branchMatch: "路径:{PATH} , {DESC}, 匹配详情：\n{MATCH_DETAIL}",
    }
}

module.exports = class {
    constructor(schema, globalErrorTip = {}) {
        this._schema = sugar.resolve(schema).normalize().normalize();
        this._globalErrorTipConfig = Object.assign({}, globalErrorTipConfig);
        
        Object.keys(globalErrorTip)
            .forEach(key => {
                if (typeof this._globalErrorTipConfig[key] === "string") {
                    this._globalErrorTipConfig[key] = globalErrorTip[key];
                }
                else {
                    this._globalErrorTipConfig[key] = Object.assign({}, this._globalErrorTipConfig[key], globalErrorTip[key]);
                }
            });
        this._errors = [];
        this._validator = Validator;
    }

    static from(schema, globalErrorTip = {}) {
        return new this(schema, globalErrorTip);
    }

    validate(instance) {
        if (this._errors.length !== 0) this._errors = [];
        return this._validator(this._schema, instance, ".", this._globalErrorTipConfig, this._errors);
    }

    get errors() {
        return this._errors.map(({info}) => {
            return Object.keys(info).reduce((prev, curr) => {
                if (info[curr] !== undefined) {
                    prev[curr] = info[curr];
                }
                return prev;
            }, {});
        });
    }

    get errorsText() {
        const tipsMap = (errors) => errors.map(error => {
            let value = error.info.value;
            if(typeof value === "string") {
                value = `"${value}"`;
            }
            else if (Array.isArray(value)) {
                value = JSON.stringify(value);
            }
            else if (value === null) {
                value = null;
            }
            else if (typeof value === "object") {
                value = JSON.stringify(value);
            }

            let tip = error.info.tipTemplate
                .replace(/\{PATH\}/g, error.info.path)
                .replace(/\{VALUE\}/g, value)
                .replace(/\{ACTUAL\}/g, error.info.actual)
                .replace(/\{EXPECTED\}/g, error.info.expected)
                .replace(/\{KEYWORD\}/g, error.info.keyword)
                .replace(/\{DESC\}/g, error.info.desc)
                .replace(/\{MATCH_DETAIL\}/g, 
                    error.info.matchDetail === undefined ?
                        "" :
                        JSON.stringify(
                            error.info.matchDetail.mismatch !== undefined ?
                                error.info.matchDetail.mismatch.map(branch => tipsMap(branch)) : 
                                error.info.matchDetail.match.map(
                                    match => Object.keys(match).reduce((prev, curr) => {
                                        prev[curr] = match[curr]//.enum.join('/');
                                        return prev;
                                    }, {})
                                ),
                            null,
                            4
                        )
                )
            return tip;
        })
            .join('\n');
        return tipsMap(this._errors)
    }
}
