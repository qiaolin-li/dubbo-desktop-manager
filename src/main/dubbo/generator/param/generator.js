import moment from 'moment'

class ValueGenerator {
    generate(){}
}


class MultiTypeValueGenerator extends ValueGenerator{
    constructor(types, value) {
        super();
        this.types = types;
        this.value = value;
    }

    support(filedName, filedType){
        return this.types.find(item => item === filedType) != null;
    }

    generate(filedName, filedType){
        if(typeof this.value == 'function'){
            return this.value(filedType);
        }
        return this.value;
    }
}

// 值生成器列表
const GENERATOR_LIST = [];

// 整数类型-值生成器
const NUMBER_TYPE = ["byte", "java.lang.Byte",   "short", "java.lang.Short", 
                     "int", "java.lang.Integer", "long", "java.lang.Long"   ]
const NUMBER_VALUE_GENERATOR = new MultiTypeValueGenerator(NUMBER_TYPE, 0);
GENERATOR_LIST.push(NUMBER_VALUE_GENERATOR);


// 浮点数类型-值生成器
const DECIMAL_NUMBER_TYPE = ["float", "java.lang.Float",   "double", "java.lang.Double"]
const DECIMAL_VALUE_GENERATOR = new MultiTypeValueGenerator(DECIMAL_NUMBER_TYPE, 0.0);
GENERATOR_LIST.push(DECIMAL_VALUE_GENERATOR);


// 布尔类型-值生成器
const BOOLEAN_VALUE_GENERATOR = new MultiTypeValueGenerator(["boolean", "java.lang.Boolean"], true);
GENERATOR_LIST.push(BOOLEAN_VALUE_GENERATOR);



// 字符串值生成器
const STRING_VALUE_GENERATOR = new MultiTypeValueGenerator(["java.lang.String"], "");
GENERATOR_LIST.push(STRING_VALUE_GENERATOR);

// 日期类型-值生成器
const DATE_VALUE_GENERATOR = new MultiTypeValueGenerator(["java.util.Date"], () => {
    return moment(new Date()).format(
        "YYYY-MM-DD HH:mm:ss"
      );
});
GENERATOR_LIST.push(DATE_VALUE_GENERATOR);

// Void类型-值生成器
const VOID_VALUE_GENERATOR = new MultiTypeValueGenerator(["void", "java.lang.Void"], null);
GENERATOR_LIST.push(VOID_VALUE_GENERATOR);

// Object 值生成器
const OBJECT_VALUE_GENERATOR = new MultiTypeValueGenerator(["java.lang.Object"], {});
GENERATOR_LIST.push(OBJECT_VALUE_GENERATOR);


class TypeValueGeneratorWapper extends ValueGenerator{
    constructor(generatorList) {
        super();
        this.generatorList = generatorList;
    }

    generate(filedName, filedType){
        for (let index = 0; index < this.generatorList.length; index++) {
            const generator = this.generatorList[index];
            if(generator.support(filedName, filedType)){
                return generator.generate(filedName, filedType);
            }
        }
        return null;
    }
}


export default new TypeValueGeneratorWapper(GENERATOR_LIST);