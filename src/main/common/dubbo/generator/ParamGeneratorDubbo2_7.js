import DEFAULT_VALUE_GENERATOR from './ValueGenerator.js';


/**
 * Dubbo2.7+版本 参数生成器
 */
class ParamGeneratorDubbo2_7 {

    /**
     * 生成参数
     */
    generateParam(mateData, methodName) {
        const method = this.findMethodInfo(mateData, methodName);

        // 未找到方法
        if (!method) {
            return null;
        }

        const params = [];
        for (let i = 0; i < method.parameterTypes.length; i++) {
            let parameterType = method.parameterTypes[i];

            params.push(this.generateObject(mateData.types, parameterType));
        }

        return params;
    }


    generateObject(types, type) {
        if (this.isPrimitiveType(type)) {
            return DEFAULT_VALUE_GENERATOR.generate("", type);
        } else if (this.isMap(type)) {
            return this.generateMapType(types, type);
        } else if (this.isArray(type)) {
            return this.generateArrayType(types, type);
        } else if (this.isCollection(type)) {
            return this.generateCollectionType(types, type);
        } else {
            return this.generateComplexType(types, type);
        }
    }


    generateMapType(types, type) {
        let keyStartOffset = type.indexOf("<");
        let keyEndOffset = type.indexOf(",");

        // 没有泛型
        if (keyStartOffset < 0 || keyEndOffset < 0) {
            return {};
        }

        let valueStartOffset = type.indexOf(",");
        let valueEndOffset = type.indexOf(">");
        if (valueStartOffset < 0 || valueEndOffset < 0) {
            return {};
        }

        // 解析key与value
        let keyType = type.substring(keyStartOffset + 1, keyEndOffset);
        let valueType = type.substring(valueStartOffset, valueEndOffset);
        let valueData = this.generateObject(types, valueType);

        // 可能会有Map的key里面放对象，但这也没有办法了...

        let data = {};
        data[keyType] = valueData;

        return data;
    }

    generateCollectionType(types, type) {

        let startOffset = type.indexOf("<");
        let endOffset = type.indexOf(">");

        // 没有泛型
        if (startOffset < 0 || endOffset < 0) {
            return [];
        }

        let realType = type.substring(startOffset + 1, endOffset);

        if (!realType) {
            return [];
        }

        return [ this.generateObject(types, realType) ];
    }

    generateArrayType(types, type) {
        let offset = type.indexOf("[]");

        let realType = type.substring(0, offset);
        return [ this.generateObject(types, realType) ];
    }


    generateComplexType(types, type) {

        let td = this.findTypeDefinition(types, type);

        // 有可能是泛型，解析不出来
        if(!td){
            return {};
        }

        // 枚举类型
        if(td.typeBuilderName === 'org.apache.dubbo.metadata.definition.builder.EnumTypeBuilder'){
            return null;
        }

        if (td.properties == null || td.properties.length == 0) {
            return DEFAULT_VALUE_GENERATOR.generate("", td.type);
        } 
    
        let data = {};
        for (let property in td.properties) {
            data[property] = this.generateObject(types, td.properties[property].type);
        }
        return data;
    }

    findTypeDefinition(types, type) {
        for (let index = 0; index < types.length; index++) {
            const element = types[index];
            if (element.type == type) {
                return element;
            }
        }
    }




    isPrimitiveType(type) {
        let baseTypes = [
            "byte", "java.lang.Byte", "short", "java.lang.Short",
            "int", "java.lang.Integer", "long", "java.lang.Long",
            "float", "java.lang.Float", "double", "java.lang.Double",
            "boolean", "java.lang.Boolean", "void", "java.lang.String",
            "java.lang.Void", "java.util.Date", "java.lang.Object"
        ];

        return baseTypes.find(baseType => baseType == type);
    }



    isMap(type) {
        const pattern = /^java.util.*Map.*(<.*>)*$/;
        let offset = type.indexOf("<");

        // 没有找到<，可能还是map,只是没有泛型
        if (offset < 0) {
            return pattern.test(type);
        }

        // 找到了< ，可能是map，也可能是其他的
        let newType = type.substring(0, offset);
        return pattern.test(newType);
    }

    isCollection(type) {
        const pattern = /^java.util.*(Set|List|Queue|Collection|Deque)(<.*>)*$/;
        let offset = type.indexOf("<");

        if (offset < 0) {
            return pattern.test(type);
        }
        let newType = type.substring(0, offset);
        return pattern.test(newType);
    }

    isArray(type) {
        return type.endsWith("[]");
    }

    findMethodInfo(mateData, methodName) {
    
        for (let i = 0; i < mateData.methods.length; i++) {
            const method = mateData.methods[i];

            if (methodName == method.name) {
                return method;
            }

        }

        return null;
    }
}

export default new ParamGeneratorDubbo2_7();