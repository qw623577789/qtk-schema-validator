# qtk-schema-validator

此库为[@qtk/schema](https://www.npmjs.com/package/@qtk/schema)体系中的一环,其为json schema校验器，旨在对数据进行校验，当数据有误时提供一个更加人性化的错误提示文案帮助开发者定位错误。同时配合qtk/schema库使用时，可以自定义错误文案．例如：
```js
const QtkSchema = require('@qtk/schema');
const {object, string, integer} = QtkSchema.schema;
const Validator = require('@qtk/schema-validator');

//schema定义，描述一个对象，里面含有foo、bar、foobar三个字段，foo字段类型为string, bar字段类型为integer，foobar为对象类型，且三个字段必须存在
let schema = object().properties({
    foo: string(),
    bar: integer(),
    foobar: object({
        a: string(),
        b: integer()
    })
}).requireAll();
let validator = Validator.from(schema);
console.log(validator.validate({foo: 'foo', bar: 'bar'})); //使用{foo: 'foo', bar: 'bar'}进行校验
console.log(validator.errors);
console.log(validator.errorsText);
```
输出结果
```bash
#console.log(validator.validate({foo: 'foo', bar: 'bar'}))输出结果
false

#console.log(validator.errors)输出结果
[
    {
        keyword: 'type',
        path: '.bar',
        value: 'bar',
        actual: 'string',
        expected: 'integer',
        tipTemplate:　'路径:{PATH} , 数据类型有误, 当前值:{VALUE}, 当前类型:{ACTUAL}, 期望类型:{EXPECTED}'
    },
    {
        keyword: 'required',
        path: '.',
        expected: 'foobar',
        tipTemplate: '路径:{PATH} , Object缺少Key：{EXPECTED}'
    }
]


#console.log(validator.errorsText)输出结果
路径:.bar , 数据类型有误, 当前值:"bar", 当前类型:string, 期望类型:integer
路径:. , Object缺少Key：foobar

```

## 特性
- 支持string、boolean、null、integer、number、object、array数据类型
- 支持**oneOf、if...elseif...else...endif**自动判断分支
- 支持自定义错误提示文案

## 支持schema关键字

数据类型|关键字
--|--
number|enum、min、max、exclusiveMin、exclusiveMax
integer|enum、min、max、exclusiveMin、exclusiveMax
boolean|enum
string|enum、pattern、minLength、maxLength、length
null/empty|enum(只有null一个值)
object|properties、patternProperties、if...then...elseif...then...else...endif、require、requireAll
array|item、minItems、maxItems、length
oneOf|其无关键字

## 数据校验器
数据校验功能主要根据事先定义好的schema，对数据进行校验，返回一个布尔值表明是否通过校验。

### Boolean
```js
const assert = require('power-assert');
const {schema: {boolean}} = require('@qtk/schema');
const Validator = require('@qtk/schema-validator');

describe('boolean', function() {
    it('boolean()', function() {
        let schema = boolean();
        let validator = Validator.from(schema);
        assert.equal(validator.validate(true),      true);
        assert.equal(validator.validate(false),     true);
        assert.equal(validator.validate('foo'),     false);
        assert.equal(validator.validate(1.1),       false);
        assert.equal(validator.validate(null),      false);
        assert.equal(validator.validate(undefined), false);
        assert.equal(validator.validate({}),        false);
        assert.equal(validator.validate([]),        false);
    });
    it('.enum()', function() {
        let schema = boolean().enum(true);
        let validator = Validator.from(schema);
        assert.equal(true, validator.validate(true));
        assert.equal(false, validator.validate(false));
    });
});
```

### Integer
```js
const assert = require('power-assert');
const {schema: {integer}} = require('@qtk/schema');
const Validator = require('@qtk/schema-validator');

describe('integer', function() {
    it('integer()', function() {
        let schema = integer();
        let validator = Validator.from(schema);
        assert.equal(validator.validate(0)         ,true);
        assert.equal(validator.validate(1)         ,true);
        assert.equal(validator.validate(1.1)       ,false);
        assert.equal(validator.validate(Infinity)  ,false);
        assert.equal(validator.validate('1')       ,false);
        assert.equal(validator.validate(true)      ,false);
        assert.equal(validator.validate(null)      ,false);
        assert.equal(validator.validate(undefined) ,false);
        assert.equal(validator.validate({})        ,false);
        assert.equal(validator.validate([])        ,false);
    });
    it('.enum()', function() {
        let schema = integer().enum(1, 2);
        let validator = Validator.from(schema);
        assert.equal(validator.validate(1) ,true);
        assert.equal(validator.validate(2) ,true);
        assert.equal(validator.validate(3) ,false);
    });
    it('.min() & .max()', function() {
        let schema = integer().min(1).max(5);
        let validator = Validator.from(schema);
        assert.equal(validator.validate(1) ,true);
        assert.equal(validator.validate(2) ,true);
        assert.equal(validator.validate(5) ,true);
        assert.equal(validator.validate(0) ,false);
        assert.equal(validator.validate(6) ,false);
    });
    it('.exclusiveMin() & .exclusiveMax()', function() {
        let schema = integer().exclusiveMin(1).exclusiveMax(5);
        let validator = Validator.from(schema);
        assert.equal(validator.validate(2) ,true);
        assert.equal(validator.validate(4) ,true);
        assert.equal(validator.validate(1) ,false);
        assert.equal(validator.validate(6) ,false);
        assert.equal(validator.validate(0) ,false);
        assert.equal(validator.validate(6) ,false);
    });
});
```

### Number
```js
const assert = require('power-assert');
const {schema: {number}} = require('@qtk/schema');
const Validator = require('@qtk/schema-validator');

describe('number', function() {
    it('number()', function() {
        let schema = number();
        let validator = Validator.from(schema);
        assert.equal(validator.validate(0)         ,true);
        assert.equal(validator.validate(1)         ,true);
        assert.equal(validator.validate(1.1)       ,true);
        assert.equal(validator.validate(-1.1)      ,true);
        assert.equal(validator.validate(Infinity)  ,true);
        assert.equal(validator.validate('1.1')     ,false);
        assert.equal(validator.validate(true)      ,false);
        assert.equal(validator.validate(null)      ,false);
        assert.equal(validator.validate(undefined) ,false);
        assert.equal(validator.validate({})        ,false);
        assert.equal(validator.validate([])        ,false);
    });
    it('.enum()', function() {
        let schema = number().enum(1, 2, 3.3);
        let validator = Validator.from(schema);
        assert.equal(validator.validate(1)   ,true);
        assert.equal(validator.validate(3.3) ,true);
        assert.equal(validator.validate(4)   ,false);
    });
    it('.min() & .max()', function() {
        let schema = number().min(0.9).max(3.1);
        let validator = Validator.from(schema);
        assert.equal(validator.validate(0.9) ,true);
        assert.equal(validator.validate(2.2) ,true);
        assert.equal(validator.validate(3.1) ,true);
        assert.equal(validator.validate(0)   ,false);
        assert.equal(validator.validate(4)   ,false);
    });
    it('.exclusiveMin() & .exclusiveMax()', function() {
        let schema = number().exclusiveMin(0.9).exclusiveMax(3.1);
        let validator = Validator.from(schema);
        assert.equal(validator.validate(2.2) ,true);
        assert.equal(validator.validate(0)   ,false);
        assert.equal(validator.validate(0.9) ,false);
        assert.equal(validator.validate(3.1) ,false);
        assert.equal(validator.validate(4)   ,false);
    });
});
```

### String
```js
const assert = require('power-assert');
const {schema: {string}} = require('@qtk/schema');
const Validator = require('@qtk/schema-validator');

describe('string', function() {
    it('string()', function() {
        let schema = string();
        let validator = Validator.from(schema);
        assert.equal(validator.validate('')        ,true);
        assert.equal(validator.validate('1234')    ,true);
        assert.equal(validator.validate(1)         ,false);
        assert.equal(validator.validate(1.1)       ,false);
        assert.equal(validator.validate(true)      ,false);
        assert.equal(validator.validate(null)      ,false);
        assert.equal(validator.validate(undefined) ,false);
        assert.equal(validator.validate({})        ,false);
        assert.equal(validator.validate([])        ,false);
    });
    it('.pattern()', function() {
        let schema = string().pattern(/^foo|bar$/);
        let validator = Validator.from(schema);
        assert.equal(validator.validate('foo') ,true);
        assert.equal(validator.validate('bar') ,true);
        assert.equal(validator.validate('oof') ,false);
    });
    it('.enum()', function() {
        let schema = string().enum('foo', 'bar');
        let validator = Validator.from(schema);
        assert.equal(validator.validate('foo') ,true);
        assert.equal(validator.validate('bar') ,true);
        assert.equal(validator.validate('oof') ,false);
    });
    it('.minLength() & maxLength()', function() {
        let schema = string().minLength(1).maxLength(5);
        let validator = Validator.from(schema);
        assert.equal(validator.validate('1')      ,true);
        assert.equal(validator.validate('123')    ,true);
        assert.equal(validator.validate('12345')  ,true);
        assert.equal(validator.validate('')       ,false);
        assert.equal(validator.validate('123456') ,false);
    });
    it('.length()', function() {
        let schema = string().length(5);
        let validator = Validator.from(schema);
        assert.equal(validator.validate('hello')  ,true);
        assert.equal(validator.validate('hi')     ,false);
        assert.equal(validator.validate('')       ,false);
        assert.equal(validator.validate('hello ') ,false);
    });
});
```

### Null
```js
const assert = require('power-assert');
const {schema: {empty}} = require('@qtk/schema');
const Validator = require('@qtk/schema-validator');

describe('null', function() {
    it('NULL() or empty()', function() {
        let schema = empty();
        let validator = Validator.from(schema);
        assert.equal(validator.validate(null)      ,true);
        assert.equal(validator.validate(undefined) ,false);
        assert.equal(validator.validate(false)     ,false);
        assert.equal(validator.validate(0)         ,false);
        assert.equal(validator.validate('1.1')     ,false);
        assert.equal(validator.validate({})        ,false);
        assert.equal(validator.validate([])        ,false);
    });
});
```

### Invalid
```js
const assert = require('power-assert');
const {schema: {invalid}} = require('@qtk/schema');
const Validator = require('@qtk/schema-validator');

describe('invalid', function() {
    it('invalid()', function() {
        let schema = invalid();
        let validator = Validator.from(schema);
        assert(validator.validate(null)      === false);
        assert(validator.validate(undefined) === false);
        assert(validator.validate(false)     === false);
        assert(validator.validate(0)         === false);
        assert(validator.validate('1.1')     === false);
        assert(validator.validate({})        === false);
        assert(validator.validate([])        === false);
    });
});
```

### Object
```js
const assert = require('assert');
const QtkSchema = require('@qtk/schema');
const {object, string, integer} = QtkSchema.schema;
const Validator = require('@qtk/schema-validator');

describe('object', function() {

    it('object()', function() {
        let schema = object({});
        let validator = Validator.from(schema);
        assert(validator.validate({})        === true);
        assert(validator.validate({foo: ''}) === true);
        assert(validator.validate(null)      === false);
        assert(validator.validate(undefined) === false);
        assert(validator.validate(false)     === false);
        assert(validator.validate(0)         === false);
        assert(validator.validate('1.1')     === false);
        assert(validator.validate([])        === false);
    });

    it('.properties()', function() {
        let schema = object().properties({
            foo: string(),
            bar: integer(),
            foo1: object({
                a: string(),
                b: integer()
            })
        });
        let validator = Validator.from(schema);
        assert(validator.validate({foo: 'foo', foo1: {a: "1", b: 2}})                     === true);
        assert(validator.validate({foo: 'foo', bar: 123})           === true);
        assert(validator.validate({foo: 'foo', bar: 123, tar: 123}) === true);
        assert(validator.validate({foo: 'foo', bar: 'bar'})         === false);
    });

    it('.require()', function() {
        let schema = object({
            foo: string()
        }).require('foo');
        let validator = Validator.from(schema);
        assert(validator.validate({foo: 'foo'}) === true);
        assert(validator.validate({}) === false);
        assert(validator.validate({bar: 'bar'}) === false);
    });
    
    it('.requireAll()', function() {
        let schema = object().properties({
            foo: string(),
            bar: integer()
        }).requireAll();
        let validator = Validator.from(schema);
        assert(validator.validate({foo: 'foo', bar: 123})           === true);
        assert(validator.validate({foo: 'foo'})                     === false);
        assert(validator.validate({bar: 'bar'})                     === false);
        assert(validator.validate({foo: 'foo', bar: 123, tar: 123}) === true);
        assert(validator.validate({foo: 'foo', bar: 'bar'})         === false);
    });

    it('.patternProperties()', function() {
        let schema = object().patternProperties({
            '^foo|bar$': string()
        });
        let validator = Validator.from(schema);
        assert(validator.validate({})                               === true);
        assert(validator.validate({foo: 'foo', bar: 'bar'})         === true);
        assert(validator.validate({foo: 'foo'})                     === true);
        assert(validator.validate({bar: 'bar'})                     === true);
        assert(validator.validate({foo: 'foo', bar: 123})           === false);
        assert(validator.validate({foo: 'foo', bar: 'bar', tar: 1}) === true);
    });

    it('.additionalProperties()', function() {
        let schema = object().properties({
            foo: string(),
            bar: string()
        }).additionalProperties(false);
        let validator = Validator.from(schema);
        assert(validator.validate({foo: 'foo', bar: 'bar', tar: 123}) === false);
        assert(validator.validate({foo: 'foo', bar: 'bar'})           === true);
    });

    describe('if statement', function() {
        it('.if.properties().then.properties()', function() {
            let schema = object()
                .if.properties({type: string().enum('student')}) 
                .then.properties({
                    type: string().enum('student'),
                    grade: integer(),
                }).requireAll()
                .elseIf.properties({type: string().enum('staff')})
                .then.properties({
                    type: string().enum('staff'),
                    salary: integer(),
                }).requireAll()
                .else.invalid()
                .endIf;
            let validator = Validator.from(schema);
            assert(validator.validate({type: 'student', grade: 12})              === true);
            assert(validator.validate({type: 'staff', salary: 12000})            === true);
            assert(validator.validate({type: 'staff', salary: '12000'})          === false);
            assert(validator.validate({type: 'student', grade: 12, major: 'cs'}) === true);
            assert(validator.validate({type: 'housewife', salary: 12000})        === false);
        });
    
        it('.if.properties().then.require()', function() {
            let schema = object().properties({
                type: string().enum('student', 'staff'),
                grade: integer(),
                salary: integer(),
            })
                .if.properties({type: 'student'})
                .then.require('type', 'grade')
                .elseIf.properties({type: 'staff'})
                .then.require('type', 'salary')
                .else.invalid()
                .endIf;
            let validator = Validator.from(schema);
            assert(validator.validate({type: 'student', grade: 12})              === true);
            assert(validator.validate({type: 'staff', salary: 12000})            === true);
            assert(validator.validate({type: 'staff', salary: '12000'})          === false);
            assert(validator.validate({type: 'student', grade: 12, major: 'cs'}) === true);
            assert(validator.validate({type: 'housewife', salary: 12000})        === false);
        });
    });
    
});
```

### Array
```js
const assert = require('assert');
const QtkSchema = require('@qtk/schema');
const {object, string, integer, array} = QtkSchema.schema;
const Validator = require('@qtk/schema-validator');

describe('array', function() {
    it('array()', function() {
        let schema = array();
        let validator = Validator.from(schema);
        assert(validator.validate([])        === true);
        assert(validator.validate([1, '2'])  === true);
        assert(validator.validate(null)      === false);
        assert(validator.validate(undefined) === false);
        assert(validator.validate(false)     === false);
        assert(validator.validate(0)         === false);
        assert(validator.validate('1.1')     === false);
        assert(validator.validate({})        === false);
    });

    it('.item()', function() {
        let schema = array().item(string());
        let validator = Validator.from(schema);
        assert(validator.validate([])         === true);
        assert(validator.validate(['1', '2']) === true);
        assert(validator.validate(['1', 2])   === false);

        schema = array(
            object().properties({
                foo: string(),
                bar: integer()
            }).requireAll()
        );
        assert(validator.validate([{foo: "1"}]) === false);
    });
    
    it('.minItems().maxItems()', function() {
        let schema = array().minItems(1).maxItems(3);
        let validator = Validator.from(schema);
        assert(validator.validate([1])          === true);
        assert(validator.validate([1, 2])       === true);
        assert(validator.validate([1, 2, 3])    === true);
        assert(validator.validate([])           === false);
        assert(validator.validate([1, 2, 3, 4]) === false);
    });
    it('.length()', function() {
        let schema = array().length(3);
        let validator = Validator.from(schema);
        assert(validator.validate([1, 2, 3])    === true);
        assert(validator.validate([1])          === false);
        assert(validator.validate([1, 2, 3, 4]) === false);
    });
});
```

### OneOf
```js
const assert = require('assert');
const QtkSchema = require('@qtk/schema');
const {object, string, integer, oneOf} = QtkSchema.schema;
const Validator = require('@qtk/schema-validator');

describe('oneOf', function() {

    it('.oneOf()', function() {
        let schema = oneOf(
            object().properties({
                foo: string(),
                bar: integer(),
                foo1: object({
                    a: string(),
                    b: integer()
                })
            }),
            string()
        )

        let validator = Validator.from(schema);
        assert(validator.validate({foo: 'foo', foo1: {a: "1", b: 2}})   === true);
        assert(validator.validate("qqqqqq")                             === true);
        assert(validator.validate({foo: 'foo', bar: 'bar'})             === false);
    });
    
});
```

## 错误提示
当数据校验不通过时，校验器的``errors``、``errorsText``属性会含有错误信息．
**``errors``**: 数组，存储原始错误信息，开发者可以根据原始错误信息做二次开发
**``errorText``**: 字符串，将``errors``信息根据系统错误提示模板（可自定义模板）渲染成字符串

### Boolean
#### 错误类型
- **type**
    - **error对象拥有的属性:**
        - path: 节点路径
        - value: 节点当前值
        - actual: 当前的情况值，此情况为当前值的类型
        - expected: 期望的情况值,此情况为值为boolean
        - keyword: schema关键字，此情况为值为type
        - tipTemplate: 错误提示文案，默认为此情况的系统提示模板
    - **模板变量:**
        - ``PATH``、``VALUE``、``ACTUAL``、``EXPECTED``、``KEYWORD``
    - **系统默认错误提示模板:** 
        - 路径:{PATH} , 数据类型有误, 当前值:{VALUE}, 当前类型:{ACTUAL}, 期望类型:{EXPECTED}
- **enum**
    - **error对象拥有的属性:**
        - path: 节点路径
        - value: 节点当前值
        - actual: 当前的情况值，此情况为节点当前值
        - expected: 期望的情况值,此情况为值为*enum数组的值用"、"拼接而成的字符串*
        - keyword: schema关键字，此情况为值为enum
        - tipTemplate: 错误提示文案，默认为此情况的系统提示模板
    - **模板变量:**
        - ``PATH``、``VALUE``、``ACTUAL``、``EXPECTED``、``KEYWORD``
    - **系统默认错误提示模板:** 
        - 路径:{PATH} , 不在枚举值范围, 当前值:{VALUE},　期望:{EXPECTED}

#### 例子
```js
const assert = require('power-assert');
const {schema: {boolean}} = require('@qtk/schema');
const Validator = require('@qtk/schema-validator');

describe('boolean', function() {
    it('typeError', function() {
        let schema = boolean();
        let validator = Validator.from(schema);
        validator.validate('foo');
        assert(/路径:\. , 数据类型有误, 当前值:(.*), 当前类型:string, 期望类型:boolean/.test(validator.errorsText), "type错误提示有误");
    });
    it('enumError', function() {
        let schema = boolean().enum(true);
        let validator = Validator.from(schema);
        validator.validate(false);
        assert(/路径:\. , 不在枚举值范围, 当前值:false,　期望:true/.test(validator.errorsText), "enum错误提示有误");
    });
});
```

### Integer
#### 错误类型
- **type**
    - **error对象拥有的属性:**
        - path: 节点路径
        - value: 节点当前值
        - actual: 当前的情况值，此情况为当前值的类型
        - expected: 期望的情况值,此情况为值为boolean
        - keyword: schema关键字，此情况为值为type
        - tipTemplate: 错误提示文案，默认为此情况的系统提示模板
    - **模板变量:**
        - ``PATH``、``VALUE``、``ACTUAL``、``EXPECTED``、``KEYWORD``
    - **系统默认错误提示模板:** 
        - 路径:{PATH} , 数据类型有误, 当前值:{VALUE}, 当前类型:{ACTUAL}, 期望类型:{EXPECTED}
- **enum**
    - **error对象拥有的属性:**
        - path: 节点路径
        - value: 节点当前值
        - actual: 当前的情况值，此情况为节点当前值
        - expected: 期望的情况值,此情况为值为*enum数组的值用"、"拼接而成的字符串*
        - keyword: schema关键字，此情况为值为enum
        - tipTemplate: 错误提示文案，默认为此情况的系统提示模板
    - **模板变量:**
        - ``PATH``、``VALUE``、``ACTUAL``、``EXPECTED``、``KEYWORD``
    - **系统默认错误提示模板:** 
        - 路径:{PATH} , 不在枚举值范围, 当前值:{VALUE},　期望:{EXPECTED}
- **range**
    - **error对象拥有的属性:**
        - path: 节点路径
        - value: 节点当前值
        - actual: 当前的情况值，此情况为节点当前值
        - expected: 期望的情况值,格式为：**比较运算符 边界值**,如: < 10
        - keyword: schema关键字，此情况为值可为``maximum``、``minimum``、``exclusiveMaximum``、``exclusiveMinimum``
        - tipTemplate: 错误提示文案，默认为此情况的系统提示模板
    - **模板变量:**
        - ``PATH``、``VALUE``、``ACTUAL``、``EXPECTED``、``KEYWORD``
    - **系统默认错误提示模板:** 
        - 路径:{PATH} , 不在值范围内, 当前值:{VALUE},　期望:{EXPECTED}
#### 例子
```js
const assert = require('power-assert');
const {schema: {integer}} = require('@qtk/schema');
const Validator = require('@qtk/schema-validator');

describe('integer', function() {
    it('typeError', function() {
        let schema = integer();
        let validator = Validator.from(schema);
        validator.validate('foo');
        assert(/路径:\. , 数据类型有误, 当前值:(.*), 当前类型:string, 期望类型:integer/.test(validator.errorsText), "type错误提示有误");
    });
    it('enumError', function() {
        let schema = integer().enum(1, 2, 3);
        let validator = Validator.from(schema);
        validator.validate(4);
        assert(/路径:\. , 不在枚举值范围, 当前值:4,　期望:1、2、3/.test(validator.errorsText), "enum错误提示有误");
    });
    it('rangeError | min', function() {
        let schema = integer().min(1);
        let validator = Validator.from(schema);
        validator.validate(0);
        assert(/路径:\. , 不在值范围内, 当前值:0,　期望:>= 1/.test(validator.errorsText), "range错误提示有误");
    });
    it('rangeError | max', function() {
        let schema = integer().max(0);
        let validator = Validator.from(schema);
        validator.validate(1);
        assert(/路径:\. , 不在值范围内, 当前值:1,　期望:<= 0/.test(validator.errorsText), "range错误提示有误");
    });
    it('rangeError | exclusiveMin', function() {
        let schema = integer().exclusiveMin(1);
        let validator = Validator.from(schema);
        validator.validate(1);
        assert(/路径:\. , 不在值范围内, 当前值:1,　期望:> 1/.test(validator.errorsText), "range错误提示有误");
    });
    it('rangeError | exclusiveMax', function() {
        let schema = integer().exclusiveMax(1);
        let validator = Validator.from(schema);
        validator.validate(1);
        assert(/路径:\. , 不在值范围内, 当前值:1,　期望:< 1/.test(validator.errorsText), "range错误提示有误");
    });
});
```

### Number
#### 错误类型
- **type**
    - **error对象拥有的属性:**
        - path: 节点路径
        - value: 节点当前值
        - actual: 当前的情况值，此情况为当前值的类型
        - expected: 期望的情况值,此情况为值为boolean
        - keyword: schema关键字，此情况为值为type
        - tipTemplate: 错误提示文案，默认为此情况的系统提示模板
    - **模板变量:**
        - ``PATH``、``VALUE``、``ACTUAL``、``EXPECTED``、``KEYWORD``
    - **系统默认错误提示模板:** 
        - 路径:{PATH} , 数据类型有误, 当前值:{VALUE}, 当前类型:{ACTUAL}, 期望类型:{EXPECTED}
- **enum**
    - **error对象拥有的属性:**
        - path: 节点路径
        - value: 节点当前值
        - actual: 当前的情况值，此情况为节点当前值
        - expected: 期望的情况值,此情况为值为*enum数组的值用"、"拼接而成的字符串*
        - keyword: schema关键字，此情况为值为enum
        - tipTemplate: 错误提示文案，默认为此情况的系统提示模板
    - **模板变量:**
        - ``PATH``、``VALUE``、``ACTUAL``、``EXPECTED``、``KEYWORD``
    - **系统默认错误提示模板:** 
        - 路径:{PATH} , 不在枚举值范围, 当前值:{VALUE},　期望:{EXPECTED}
- **range**
    - **error对象拥有的属性:**
        - path: 节点路径
        - value: 节点当前值
        - actual: 当前的情况值，此情况为节点当前值
        - expected: 期望的情况值,格式为：**比较运算符 边界值**,如: < 10
        - keyword: schema关键字，此情况为值可为``maximum``、``minimum``、``exclusiveMaximum``、``exclusiveMinimum``
        - tipTemplate: 错误提示文案，默认为此情况的系统提示模板
    - **模板变量:**
        - ``PATH``、``VALUE``、``ACTUAL``、``EXPECTED``、``KEYWORD``
    - **系统默认错误提示模板:** 
        - 路径:{PATH} , 不在值范围内, 当前值:{VALUE},　期望:{EXPECTED}
#### 例子
```js
const assert = require('power-assert');
const {schema: {number}} = require('@qtk/schema');
const Validator = require('@qtk/schema-validator');

describe('number', function() {
    it('typeError', function() {
        let schema = number();
        let validator = Validator.from(schema);
        validator.validate('foo');
        assert(/路径:\. , 数据类型有误, 当前值:(.*), 当前类型:string, 期望类型:number/.test(validator.errorsText), "type错误提示有误");
    });
    it('enumError', function() {
        let schema = number().enum(1, 2, 3.3);
        let validator = Validator.from(schema);
        validator.validate(4);
        assert(/路径:\. , 不在枚举值范围, 当前值:4,　期望:1、2、3.3/.test(validator.errorsText), "enum错误提示有误");
    });
    it('rangeError | min', function() {
        let schema = number().min(0.9);
        let validator = Validator.from(schema);
        validator.validate(0);
        assert(/路径:\. , 不在值范围内, 当前值:0,　期望:>= 0\.9/.test(validator.errorsText), "range错误提示有误");
    });
    it('rangeError | max', function() {
        let schema = number().max(0.9);
        let validator = Validator.from(schema);
        validator.validate(1);
        assert(/路径:\. , 不在值范围内, 当前值:1,　期望:<= 0\.9/.test(validator.errorsText), "range错误提示有误");
    });
    it('rangeError | exclusiveMin', function() {
        let schema = number().exclusiveMin(0.9);
        let validator = Validator.from(schema);
        validator.validate(0.9);
        assert(/路径:\. , 不在值范围内, 当前值:0\.9,　期望:> 0\.9/.test(validator.errorsText), "range错误提示有误");
    });
    it('rangeError | exclusiveMax', function() {
        let schema = number().exclusiveMax(0.9);
        let validator = Validator.from(schema);
        validator.validate(0.9);
        assert(/路径:\. , 不在值范围内, 当前值:0\.9,　期望:< 0\.9/.test(validator.errorsText), "range错误提示有误");
    });
});
```

### String
#### 错误类型
- **type**
    - **error对象拥有的属性:**
        - path: 节点路径
        - value: 节点当前值
        - actual: 当前的情况值，此情况为当前值的类型
        - expected: 期望的情况值,此情况为值为boolean
        - keyword: schema关键字，此情况为值为type
        - tipTemplate: 错误提示文案，默认为此情况的系统提示模板
    - **模板变量:**
        - ``PATH``、``VALUE``、``ACTUAL``、``EXPECTED``、``KEYWORD``
    - **系统默认错误提示模板:** 
        - 路径:{PATH} , 数据类型有误, 当前值:{VALUE}, 当前类型:{ACTUAL}, 期望类型:{EXPECTED}
- **enum**
    - **error对象拥有的属性:**
        - path: 节点路径
        - value: 节点当前值
        - actual: 当前的情况值，此情况为节点当前值
        - expected: 期望的情况值,此情况为值为*enum数组的值用"、"拼接而成的字符串*
        - keyword: schema关键字，此情况为值为enum
        - tipTemplate: 错误提示文案，默认为此情况的系统提示模板
    - **模板变量:**
        - ``PATH``、``VALUE``、``ACTUAL``、``EXPECTED``、``KEYWORD``
    - **系统默认错误提示模板:** 
        - 路径:{PATH} , 不在枚举值范围, 当前值:{VALUE},　期望:{EXPECTED}
- **length**
    - **error对象拥有的属性:**
        - path: 节点路径
        - value: 节点当前值
        - actual: 当前的情况值，此情况为节点当前值的长度
        - expected: 期望的情况值,格式为：**比较运算符 边界值**,如: < 10
        - keyword: schema关键字，此情况为值可为``maxLength``、``minLength``
        - tipTemplate: 错误提示文案，默认为此情况的系统提示模板
    - **模板变量:**
        - ``PATH``、``VALUE``、``ACTUAL``、``EXPECTED``、``KEYWORD``
    - **系统默认错误提示模板:** 
        - 路径:{PATH} , 字符串长度不在范围内, 当前值:{VALUE},　当前长度:{ACTUAL}, 期望长度:{EXPECTED}
- **pattern**
    - **error对象拥有的属性:**
        - path: 节点路径
        - value: 节点当前值
        - actual: 当前的情况值，此情况为节点当前值
        - expected: 期望的情况值,此情况为正则表达式
        - keyword: schema关键字，此情况为值为``pattern``
        - tipTemplate: 错误提示文案，默认为此情况的系统提示模板
    - **模板变量:**
        - ``PATH``、``VALUE``、``ACTUAL``、``EXPECTED``、``KEYWORD``
    - **系统默认错误提示模板:** 
        - 路径:{PATH} , 字符串不符合正则, 当前值:{VALUE}, 期望正则:{EXPECTED}      
#### 例子
```js
const assert = require('power-assert');
const {schema: {string}} = require('@qtk/schema');
const Validator = require('@qtk/schema-validator');

describe('string', function() {
    it('typeError', function() {
        let schema = string();
        let validator = Validator.from(schema);
        validator.validate(1);
        assert(/路径:\. , 数据类型有误, 当前值:(.*), 当前类型:integer, 期望类型:string/.test(validator.errorsText), "type错误提示有误");
    });
    it('enumError', function() {
        let schema = string().enum("1", "2");
        let validator = Validator.from(schema);
        validator.validate("3");
        assert(/路径:\. , 不在枚举值范围, 当前值:"3",　期望:"1"、"2"/.test(validator.errorsText), "enum错误提示有误");
    });
    it('lengthError | minLength', function() {
        let schema = string().minLength(5);
        let validator = Validator.from(schema);
        validator.validate("1234");
        assert(/路径:\. , 字符串长度不在范围内, 当前值:"1234",　当前长度:4, 期望长度:>= 5/.test(validator.errorsText), "length错误提示有误");
    });
    it('lengthError | maxLength', function() {
        let schema = string().maxLength(5);
        let validator = Validator.from(schema);
        validator.validate("123456");
        assert(/路径:\. , 字符串长度不在范围内, 当前值:"123456",　当前长度:6, 期望长度:<= 5/.test(validator.errorsText), "length错误提示有误");
    });
    it('patternError', function() {
        let schema = string().pattern(/^foo|bar$/);
        let validator = Validator.from(schema);
        validator.validate("1");
        assert(/路径:\. , 字符串不符合正则, 当前值:"1", 期望正则:\^foo\|bar\$/.test(validator.errorsText), "pattern错误提示有误");
    });
});
```

### Null
#### 错误类型
- **enum**
    - **error对象拥有的属性:**
        - path: 节点路径
        - value: 节点当前值
        - actual: 当前的情况值，此情况为节点当前值
        - expected: 期望的情况值,此情况为值为null
        - keyword: schema关键字，此情况为值为enum
        - tipTemplate: 错误提示文案，默认为此情况的系统提示模板
    - **模板变量:**
        - ``PATH``、``VALUE``、``ACTUAL``、``EXPECTED``、``KEYWORD``
    - **系统默认错误提示模板:** 
        - 路径:{PATH} , 不在枚举值范围, 当前值:{VALUE},　期望:{EXPECTED}

#### 例子
```js
const assert = require('power-assert');
const {schema: {empty}} = require('@qtk/schema');
const Validator = require('@qtk/schema-validator');

describe('NULL() or empty()', function() {
    it('enumError', function() {
        let schema = empty();
        let validator = Validator.from(schema);
        validator.validate(false);
        assert(/路径:\. , 不在枚举值范围, 当前值:false,　期望:null/.test(validator.errorsText), "enum错误提示有误");
    });
});
```

### Invalid
#### 错误类型
- 无私有错误类型

```js
const assert = require('power-assert');
const {schema: {invalid}} = require('@qtk/schema');
const Validator = require('@qtk/schema-validator');

describe('invalid', function() {
    it('schema', function() {
        let schema = invalid();
        let validator = Validator.from(schema);
        validator.validate(null);
        assert.equal('路径:. , schema有误, 实际值不符合预期的情况', validator.errorsText, "schema错误提示有误");
    });
});
```

### Object
#### 错误类型
- **type**
    - **error对象拥有的属性:**
        - path: 节点路径
        - value: 节点当前值
        - actual: 当前的情况值，此情况为当前值的类型
        - expected: 期望的情况值,此情况为值为boolean
        - keyword: schema关键字，此情况为值为type
        - tipTemplate: 错误提示文案，默认为此情况的系统提示模板
    - **模板变量:**
        - ``PATH``、``VALUE``、``ACTUAL``、``EXPECTED``、``KEYWORD``
    - **系统默认错误提示模板:** 
        - 路径:{PATH} , 数据类型有误, 当前值:{VALUE}, 当前类型:{ACTUAL}, 期望类型:{EXPECTED}
- **required**
    - **error对象拥有的属性:**
        - path: 节点路径
        - value: 节点当前值,此处为undefined
        - actual: 当前的情况值，此情况为节点当前值,即undefined
        - expected: 期望的情况key名字
        - keyword: schema关键字，此情况为值为required
        - tipTemplate: 错误提示文案，默认为此情况的系统提示模板
    - **模板变量:**
        - ``PATH``、``VALUE``、``ACTUAL``、``EXPECTED``、``KEYWORD``
    - **系统默认错误提示模板:** 
        - 路径:{PATH} , Object缺少Key：{EXPECTED}
- **unexpectedKey**
    - **error对象拥有的属性:**
        - path: 节点路径
        - value: 节点当前值
        - actual: 当前不期望的key名字
        - expected: 期望的情况值,此情况值为undefined
        - keyword: schema关键字，此情况为值为unexpectedKey
        - tipTemplate: 错误提示文案，默认为此情况的系统提示模板
    - **模板变量:**
        - ``PATH``、``VALUE``、``ACTUAL``、``EXPECTED``、``KEYWORD``
    - **系统默认错误提示模板:** 
        - 路径:{PATH} , Object出现非schema允许出现的Key:{ACTUAL}
- **patternKey**
    - **error对象拥有的属性:**
        - path: 节点路径
        - value: 节点当前值
        - actual: 当前的情况值，此情况为节点当前值
        - expected: 期望的情况值,此情况为正则表达式
        - keyword: schema关键字，此情况为值为``pattern``
        - tipTemplate: 错误提示文案，默认为此情况的系统提示模板
    - **模板变量:**
        - ``PATH``、``VALUE``、``ACTUAL``、``EXPECTED``、``KEYWORD``
    - **系统默认错误提示模板:** 
        - 路径:{PATH} , Object Key不符合正则，　当前Key:{ACTUAL}, 期望Key符合正则:{EXPECTED}
- **branchMatch**
    - **error对象拥有的属性:**
        - path: 节点路径
        - desc: 错误描述
        - matchDetail: 输出匹配情况，列出每个分支的匹配错误情况
        - keyword: schema关键字，此情况为值为``branchMatch``
        - tipTemplate: 错误提示文案，默认为此情况的系统提示模板
    - **模板变量:**
        - ``PATH``、``DESC``、``MATCH_DETAIL``
    - **系统默认错误提示模板:** 
        - 路径:{PATH} , {DESC}, 匹配详情：\n{MATCH_DETAIL}                        
#### 例子
```js
const assert = require('power-assert');
const {schema: {string, object, integer}} = require('@qtk/schema');
const Validator = require('@qtk/schema-validator');

describe('object', function() {

    it('typeError', function() {
        let schema = object({});
        let validator = Validator.from(schema);
        validator.validate(null);
        assert(/路径:\. , 数据类型有误, 当前值:(.*), 当前类型:null, 期望类型:object/.test(validator.errorsText), "type错误提示有误");
    });

    it('requiredError', function() {
        let schema = object({
            foo: string()
        }).require('foo');
        let validator = Validator.from(schema);
        validator.validate({});
        assert(/路径:\. , Object缺少Key：foo/.test(validator.errorsText), "required错误提示有误");
    });
    
    it('requiredError | requireAll', function() {
        let schema = object().properties({
            foo: string(),
            bar: integer()
        }).requireAll();
        let validator = Validator.from(schema);
        validator.validate({foo: 'foo'});
        assert(/路径:\. , Object缺少Key：bar/.test(validator.errorsText), "required错误提示有误");
    });

    it('unexpectedError', function() {
        let schema = object().properties({
            foo: string(),
            bar: string()
        }).additionalProperties(false);
        let validator = Validator.from(schema);
        validator.validate({foo: 'foo', bar: 'bar', tar: 123});
        assert(/路径:\. , Object出现非schema允许出现的Key:tar/.test(validator.errorsText), "unexpected错误提示有误");
    });

    it('patternKeyError', function() {
        let schema = object().patternProperties({
            '^(foo|bar)$': string()
        }).additionalProperties(false);
        let validator = Validator.from(schema);
        validator.validate({foo: 'foo', bar1: '123'});
        assert(/路径:\. , Object Key不符合正则，　当前Key:bar1, 期望Key符合正则:\^\(foo\|bar\)\$/.test(validator.errorsText), "patternKey错误提示有误");
    });

    it('多个.patternProperties', function() {
        let schema = object().patternProperties({
            '^[foo|bar]$': string(),
            '^[bar1]$': string()
        });
        let validator = Validator.from(schema);
        validator.validate({foo: 'foo', bar: 123});
        assert.equal('路径:. , schema有误, 不支持patternProperties有多个key正则', validator.errorsText, "patternKey错误提示有误");
    });

    describe('branchMatchError', function() {
        it('第一种写法.if.properties().then.properties()', function() {
            let schema = object()
                .if.properties({type: string().enum('student')}) 
                .then.properties({
                    type: string().enum('student'),
                    grade: integer(),
                }).requireAll()
                .elseIf.properties({type: string().enum('staff')})
                .then.properties({
                    type: string().enum('staff'),
                    salary: integer(),
                }).requireAll()
                .else.invalid()
                .endIf;
            let validator = Validator.from(schema);
            validator.validate({type: 'housewife', salary: 12000});
            assert.equal(
                `路径:. , 实际值不符合任何一个if条件, 匹配详情：
                [
                    "路径:.type , 不在枚举值范围, 当前值:\\"housewife\\",　期望:\\"student\\"",
                    "路径:.type , 不在枚举值范围, 当前值:\\"housewife\\",　期望:\\"staff\\""
                ]`.replace(/\s/g, "")              
                ,validator.errorsText.replace(/\s/g, ""), "branchMatchError错误提示有误");

            validator.validate({type: 'staff', salary: '12000'});
            assert.equal(
                `路径:.salary , 数据类型有误, 当前值:"12000", 当前类型:string, 期望类型:integer`,              
                validator.errorsText, 
                "branchMatchError错误提示有误(自动判断分支)"
            );
        });
    
        it('第二种写法.if.properties().then.require()', function() {
            let schema = object().properties({
                type: string().enum('student', 'staff'),
                grade: integer(),
                salary: integer(),
            })
                .if.properties({type: 'student'})
                .then.require('type', 'grade')
                .elseIf.properties({type: 'staff'})
                .then.require('type', 'salary')
                .else.invalid()
                .endIf;
            let validator = Validator.from(schema);
            validator.validate({type: 'housewife', salary: 12000});
            assert.equal(
                `路径:. , 实际值不符合任何一个if条件, 匹配详情：
                [
                    "路径:.type , 不在枚举值范围, 当前值:\\"housewife\\",　期望:\\"student\\"",
                    "路径:.type , 不在枚举值范围, 当前值:\\"housewife\\",　期望:\\"staff\\""
                ]`.replace(/\s/g, "")              
                ,validator.errorsText.replace(/\s/g, ""), "branchMatchError错误提示有误");

            validator.validate({type: 'staff', salary: '12000'});
            assert.equal(
                `路径:.salary , 数据类型有误, 当前值:"12000", 当前类型:string, 期望类型:integer`,              
                validator.errorsText, 
                "branchMatchError错误提示有误(自动判断分支)"
            );
        });

        it('.if.properties().then.require()匹配多个if条件', function() {
            let schema = object().properties({
                type: string().enum('student', 'staff'),
                grade: integer(),
                salary: integer(),
            })
                .if.properties({type: 'student'})
                .then.require('type', 'grade')
                .elseIf.properties({type: 'student', 'salary': [111, 222]})
                .then.require('type', 'salary')
                .else.invalid()
                .endIf;
            let validator = Validator.from(schema);
            validator.validate({type: 'student', 'salary': 111});
            assert.equal(
                `路径:. , 实际值不能同时符合多个if条件, 匹配详情：
                [
                    {
                        "type": {
                            "type": "string",
                            "enum": [
                                "student"
                            ],
                            "errorTip": {}
                        }
                    },
                    {
                        "type": {
                            "type": "string",
                            "enum": [
                                "student"
                            ],
                            "errorTip": {}
                        },
                        "salary": {
                            "type": "integer",
                            "enum": [
                                111,
                                222
                            ],
                            "errorTip": {}
                        }
                    }
                ]`.replace(/\s/g, "")              
                ,validator.errorsText.replace(/\s/g, ""), "branchMatchError错误提示有误");

        });
    });
    
});
```

### Array
#### 错误类型
- **type**
    - **error对象拥有的属性:**
        - path: 节点路径
        - value: 节点当前值
        - actual: 当前的情况值，此情况为当前值的类型
        - expected: 期望的情况值,此情况为值为array
        - keyword: schema关键字，此情况为值为type
        - tipTemplate: 错误提示文案，默认为此情况的系统提示模板
    - **模板变量:**
        - ``PATH``、``VALUE``、``ACTUAL``、``EXPECTED``、``KEYWORD``
    - **系统默认错误提示模板:** 
        - 路径:{PATH} , 数据类型有误, 当前值:{VALUE}, 当前类型:{ACTUAL}, 期望类型:{EXPECTED}
- **length**
    - **error对象拥有的属性:**
        - path: 节点路径
        - value: 节点当前值
        - actual: 当前的情况值，此情况为节点当前值的长度
        - expected: 期望的情况值,格式为：**比较运算符 边界值**,如: <= 10
        - keyword: schema关键字，此情况为值可为``maxItems``、``minItems``
        - tipTemplate: 错误提示文案，默认为此情况的系统提示模板
    - **模板变量:**
        - ``PATH``、``VALUE``、``ACTUAL``、``EXPECTED``、``KEYWORD``
    - **系统默认错误提示模板:** 
        - 路径:{PATH} , 数组长度不在范围内,　当前长度:{ACTUAL}, 期望长度:{EXPECTED}

#### 例子
```js
const assert = require('assert');
const QtkSchema = require('@qtk/schema');
const {object, string, integer, array} = QtkSchema.schema;
const Validator = require('@qtk/schema-validator');

describe('array', function() {
    it('typeError', function() {
        let schema = array();
        let validator = Validator.from(schema);
        validator.validate(null);
        assert(/路径:\. , 数据类型有误, 当前值:(.*), 当前类型:null, 期望类型:array/.test(validator.errorsText), "type错误提示有误");
    });
    it('item错误', function() {
        let schema = array().item(string());
        let validator = Validator.from(schema);
        validator.validate(['1', 2]);
        assert.equal('路径:.[1] , 数据类型有误, 当前值:2, 当前类型:integer, 期望类型:string', validator.errorsText, "item错误提示有误");
    });
    it('lengthError | minItems', function() {
        let schema = array().minItems(1);
        let validator = Validator.from(schema);
        validator.validate([]);
        assert(/路径:\. , 数组长度不在范围内,　当前长度:0, 期望长度:>= 1/.test(validator.errorsText), "length错误提示有误");
    });
    it('lengthError | maxItems', function() {
        let schema = array().maxItems(3);
        let validator = Validator.from(schema);
        validator.validate([1, 2, 3, 4]);
        assert(/路径:\. , 数组长度不在范围内,　当前长度:4, 期望长度:<= 3/.test(validator.errorsText), "length错误提示有误");
    });
    it('lengthError | length', function() {
        let schema = array().length(3);
        let validator = Validator.from(schema);
        validator.validate([1]);
        assert(/路径:\. , 数组长度不在范围内,　当前长度:1, 期望长度:= 3/.test(validator.errorsText), "length错误提示有误");
    });
});
```

### OneOf
- **branchMatch**
    - **error对象拥有的属性:**
        - path: 节点路径
        - desc: 错误描述
        - matchDetail: 输出匹配情况，列出每个分支的匹配错误情况
        - keyword: schema关键字，此情况为值为``branchMatch``
        - tipTemplate: 错误提示文案，默认为此情况的系统提示模板
    - **模板变量:**
        - ``PATH``、``DESC``、``MATCH_DETAIL``
    - **系统默认错误提示模板:** 
        - 路径:{PATH} , {DESC}, 匹配详情：\n{MATCH_DETAIL}          

```js
const assert = require('assert');
const QtkSchema = require('@qtk/schema');
const {object, string, integer, oneOf} = QtkSchema.schema;
const Validator = require('@qtk/schema-validator');

describe('oneOf', function() {

    it('branchMatchError | 实际值不符合任何一个oneOf情况', function() {
        let schema = oneOf(
            object().properties({
                foo: string(),
                bar: integer(),
                foo1: object({
                    a: string(),
                    b: integer()
                })
            }),
            string()
        )

        let validator = Validator.from(schema);
        validator.validate({foo: 'foo', bar: 'bar'});
        assert.equal(
            `路径:. , 实际值不符合任何一个oneOf情况, 匹配详情：
            [
                "路径:.bar , 数据类型有误, 当前值:\\"bar\\", 当前类型:string, 期望类型:integer",
                "路径:. , 数据类型有误, 当前值:{\\"foo\\":\\"foo\\",\\"bar\\":\\"bar\\"}, 当前类型:object, 期望类型:string"
            ]`.replace(/\s/g, "")              
            ,validator.errorsText.replace(/\s/g, ""), "branchMatchError错误提示有误");

    });
    
    it('branchMatchError | 实际值不能同时符合多个oneOf情况', function() {
        let schema = oneOf(
            object().properties({
                foo: string(),
                bar: integer(),
                foo1: object({
                    a: string(),
                    b: integer()
                })
            }),
            object().properties({
                foo: string(),
                bar: integer(),
                foo2: object({
                    a: string(),
                    b: integer()
                })
            }),
        )

        let validator = Validator.from(schema);
        validator.validate({foo: 'foo', bar: 1});
        assert.equal(
            `路径:. , 实际值不能同时符合多个oneOf情况, 匹配详情：
            [
                {
                    "type": "object",
                    "properties": {
                        "foo": {
                            "type": "string",
                            "errorTip": {}
                        },
                        "bar": {
                            "type": "integer",
                            "errorTip": {}
                        },
                        "foo1": {
                            "type": "object",
                            "properties": {
                                "a": {
                                    "type": "string"
                                },
                                "b": {
                                    "type": "integer"
                                }
                            }
                        }
                    },
                    "errorTip": {}
                },
                {
                    "type": "object",
                    "properties": {
                        "foo": {
                            "type": "string",
                            "errorTip": {}
                        },
                        "bar": {
                            "type": "integer",
                            "errorTip": {}
                        },
                        "foo2": {
                            "type": "object",
                            "properties": {
                                "a": {
                                    "type": "string"
                                },
                                "b": {
                                    "type": "integer"
                                }
                            }
                        }
                    },
                    "errorTip": {}
                }
            ]`.replace(/\s/g, "")              
            ,validator.errorsText.replace(/\s/g, ""), "branchMatchError错误提示有误");

    });
});
```

### Schema错误
#### 错误类型
- **schema**
    - **error对象拥有的属性:**
        - path: 节点路径
        - desc: 错误描述
        - keyword: schema关键字，此情况为值为``schema``
        - tipTemplate: 错误提示文案，默认为此情况的系统提示模板
    - **模板变量:**
        - ``PATH``、``DESC``
    - **系统默认错误提示模板:** 
        - 路径:{PATH} , schema有误, {DESC}

### 通用的模板变量
库提供两个通用的模板变量能够输出schema/数据实例，系统默认提示文案不输出此信息，若要展示，请使用下小节的``自定义错误提示``功能
``**SCHEMA**``: 输出json字符串形式的schema
``**INSTANCE**``: 输出json字符串形式的数据实例（待校验的数据)

## 自定义错误提示
当不满意系统的错误提示时，可以自定义提示信息。自定义错误信息分两种情况：**系统级**、**业务级**，这两者可以同时使用，优先级：业务级>系统级.
错误文案中可以使用每个数据类型提供``模板变量``(具体看上一小结)，**顺序可以随意调整，提示内容可以随意删减**．库会根据实际情况替换为具体的值

### 系统级
系统级自定义错误提示意味着全局更新提示，数据结构如下：
```js
{
    数据类型: {
        错误类型: 错误提示文案
    }
}
```

具体用法如下(以object错误为例):
```js
const assert = require('assert');
const QtkSchema = require('@qtk/schema');
const {object, string, integer} = QtkSchema.schema;
const Validator = require('@qtk/schema-validator');

describe('object', function() {
    it('.if.properties().then.require()', function() {
        let schema = object().properties({
            type: string(),
            grade: integer(),
            salary: integer()
        })
            .requireAll()
            .additionalProperties(true)

        let validator = Validator.from(schema, {
            integer: {
                type: "大王不好啦～　路径:{PATH} , 数据类型有误,　当前的数据类型为{ACTUAL}, 期望的类型为{EXPECTED}"
            }
        });
        validator.validate({type: 'staff', salary: '12000', grade: '12000'});
        console.log(validator.errorsText);
    });
});
```

```shell
大王不好啦～　路径:.salary , 数据类型有误,　当前的数据类型为string, 期望的类型为integer
大王不好啦～　路径:.grade , 数据类型有误,　当前的数据类型为string, 期望的类型为integer
```

### 业务级
有时只需要自定义某个字段的错误提示，其他默认使用系统的/全局的。那么可以使用qtk/schema库提供的``errorTip``函数进行自定义，数据结构如下：
```js
{
    错误类型: 错误提示文案
}
```

具体用法如下(以object错误为例):
```js
const assert = require('assert');
const QtkSchema = require('@qtk/schema');
const {object, string, integer} = QtkSchema.schema;
const Validator = require('@qtk/schema-validator');

describe('object', function() {
    it('.if.properties().then.require()', function() {
        let schema = object().properties({
            type: string(),
            grade: integer(),
            salary: integer()
                .errorTip({
                    type: "大王不好啦～　路径:{PATH} , 数据类型有误,　当前的数据类型为{ACTUAL}, 期望的类型为{EXPECTED}"
                }),
        })
            .requireAll()
            .additionalProperties(true)

        let validator = Validator.from(schema);
        validator.validate({type: 'staff', salary: '12000', grade: '12000'});
        console.log(validator.errorsText);
    });
});
```
```shell
大王不好啦～　路径:.salary , 数据类型有误,　当前的数据类型为string, 期望的类型为integer
路径:.grade , 数据类型有误, 当前值:"12000", 当前类型:string, 期望类型:integer
```

## 备注
不支持多个.patternProperties