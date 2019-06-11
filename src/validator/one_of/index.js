const ValidatorError =  require('../../error');

module.exports = (schema, value, path, globalErrorTipConfig, errorCollection) => {
    schema.errorTip = schema.errorTip || {};
    let errorTips = {
        branchMatch: schema.errorTip.branchMatch !== undefined ? schema.errorTip.branchMatch : globalErrorTipConfig.oneOf.branchMatch,
    }

    let matchErrors = [];
    let matchBranches = schema.oneOf.filter((item, index) => {
        let errors = [];
        require('../')(item, value, path, globalErrorTipConfig, errors);
        if (errors.length !== 0) matchErrors.push(errors);
        return errors.length === 0;
    });

    if (matchBranches.length === 0) {
        errorCollection.push(
            new ValidatorError({
                errorOrText: errorTips.branchMatch, 
                path, 
                desc: '实际值不符合任何一个oneOf情况',
                keyword: 'branchMatch',
                matchDetail: {
                    mismatch: matchErrors
                }
            })
        );
        return false;
    }
    else if (matchBranches.length > 1) {
        errorCollection.push(
            new ValidatorError({
                errorOrText: errorTips.branchMatch, 
                path, 
                desc: '实际值不能同时符合多个oneOf情况',
                keyword: 'branchMatch',
                matchDetail: {
                    match: matchBranches
                }
            })
        )
        return false;
    }

    return true;
};