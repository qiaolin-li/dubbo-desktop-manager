import DEFAULT_VALUE_GENERATOR from './ValueGenerator.js';

/**
 * Dubbo3+版本 参数生成器
 */

class ParamGeneratorDubbo3 {


    /**
     * 生成参数
     */
    generateParam(mateData, methodName) {
        let method = mateData.methods.find(m => methodName == m.name);

        // 未找到方法
        if (!method) {
            return null;
        }

        const typeMap = this.typeListToTypeMap(mateData.types);

        return method.parameterTypes.map(parameterType => {
            return this.generateObject(typeMap, typeMap[parameterType]);
        });
    }


    typeListToTypeMap(types) {
        if (!types) {
            return {};
        }
        const typeMap = {};
        types.forEach(typeInfo => {
            typeMap[typeInfo.type] = typeInfo;
        });

        return typeMap;
    }

    generateObject(typeMap, typeInfo) {

        // Map 类型
        if (this.isMap(typeMap, typeInfo)) {
            return this.generateMapType(typeMap, typeInfo);
        }
        
        // 数组
        if (this.isArray(typeMap, typeInfo)) {
            return this.generateArrayType(typeMap, typeInfo);
        }
        
        // 集合
        if (this.isCollection(typeMap, typeInfo)) {
            return this.generateCollectionType(typeMap, typeInfo);
        }
        
        // 对象类型
        if (this.isComplexType(typeMap, typeInfo)) {
            return this.generateComplexType(typeMap, typeInfo);
        }

        // 基本类型
        return DEFAULT_VALUE_GENERATOR.generate("", typeInfo.type);
    }


    generateMapType(typeMap, typeInfo) {
        const { type } = typeInfo;
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
        let valueType = type.substring(valueStartOffset + 1, valueEndOffset);

        // 可能会有Map的key里面放对象，但这也没有办法了...
        let data = {};
        data[keyType] = this.generateObject(typeMap, typeMap[valueType]);

        return data;
    }

    generateCollectionType(typeMap, typeInfo) {
        const {  type } = typeInfo;

        let startOffset = type.indexOf("<");

        // 没有泛型
        if (startOffset < 0) {
            return [];
        }

        // 子类型
        const subTypeInfo = typeMap[type.substring(startOffset + 1, type.indexOf(">"))];

        // 子类型有可能不存在
        if(!subTypeInfo){
            return [];
        }

        return [ this.generateObject(typeMap, subTypeInfo) ];
    }

    generateArrayType(typeMap, typeInfo) {
        const { type } = typeInfo;
        let offset = type.indexOf("[]");

        let realType = type.substring(0, offset);
        return [ this.generateObject(typeMap, typeMap[realType]) ];
    }


    generateComplexType(typeMap, typeInfo) {
        if (typeInfo.properties == null || typeInfo.properties.length == 0) {
            return {};
        }

        let data = {};
        for (let property in typeInfo.properties) {
            const type = typeInfo.properties[property];
            data[property] = this.generateObject(typeMap, typeMap[type]);
        }

        return data;
    }


    isMap(typeMap, typeInfo) {
        const { type } = typeInfo;
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

    isCollection(typeMap, typeInfo) {
        const { type } = typeInfo;
        const pattern = /^java.util.*(Set|List|Queue|Collection|Deque)(<.*>)*$/;
        let offset = type.indexOf("<");

        if (offset < 0) {
            return pattern.test(type);
        }
        let newType = type.substring(0, offset);
        return pattern.test(newType);
    }


    isArray(typeMap, typeInfo) {
        const { type } = typeInfo;
        return type.endsWith("[]");
    }


    isComplexType(typeMap, typeInfo) {
        return typeInfo.properties && Object.keys(typeInfo.properties).length > 0;
    }
}


export default new ParamGeneratorDubbo3();