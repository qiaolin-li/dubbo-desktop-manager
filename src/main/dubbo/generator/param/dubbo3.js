import DEFAULT_VALUE_GENERATOR from './generator.js';

/**
 * 生成参数
 */
function generateParam(mateData, methodName) {
    let method = mateData.methods.find(m => methodName == m.name);

    // 未找到方法
    if (!method) {
        return null;
    }

    const typeMap = typeListToTypeMap(mateData.types);

    return method.parameterTypes.map(parameterType => {
        return generateObject(typeMap, typeMap[parameterType]);
    });
}


function typeListToTypeMap(types) {
    if (!types) {
        return {};
    }
    const typeMap = {};
    types.forEach(typeInfo => {
        typeMap[typeInfo.type] = typeInfo;
    });

    return typeMap;
}

function generateObject(typeMap, typeInfo) {

    // Map 类型
    if (isMap(typeMap, typeInfo)) {
        return generateMapType(typeMap, typeInfo);
    }
    
    // 数组
    if (isArray(typeMap, typeInfo)) {
        return generateArrayType(typeMap, typeInfo);
    }
    
    // 集合
    if (isCollection(typeMap, typeInfo)) {
        return generateCollectionType(typeMap, typeInfo);
    }
    
    // 对象类型
    if (isComplexType(typeMap, typeInfo)) {
        return generateComplexType(typeMap, typeInfo);
    }

    // 基本类型
    return DEFAULT_VALUE_GENERATOR.generate("", typeInfo.type);
}


function generateMapType(typeMap, typeInfo) {
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
    let valueType = type.substring(valueStartOffset, valueEndOffset);

    // 可能会有Map的key里面放对象，但这也没有办法了...
    let data = {};
    data[keyType] = generateObject(typeMap, typeMap[valueType]);

    return data;
}

function generateCollectionType(typeMap, typeInfo) {
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

    return [generateObject(typeMap, subTypeInfo)];
}

function generateArrayType(typeMap, typeInfo) {
    const { type } = typeInfo;
    let offset = type.indexOf("[]");

    let realType = type.substring(0, offset);
    return [generateObject(typeMap, typeMap[realType])];
}


function generateComplexType(typeMap, typeInfo) {
    if (typeInfo.properties == null || typeInfo.properties.length == 0) {
        return {};
    }

    let data = {};
    for (let property in typeInfo.properties) {
        const type = typeInfo.properties[property];
        data[property] = generateObject(typeMap, typeMap[type]);
    }

    return data;
}


function isMap(typeMap, typeInfo) {
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

function isCollection(typeMap, typeInfo) {
    const { type } = typeInfo;
    const pattern = /^java.util.*(Set|List|Queue|Collection|Deque)(<.*>)*$/;
    let offset = type.indexOf("<");

    if (offset < 0) {
        return pattern.test(type);
    }
    let newType = type.substring(0, offset);
    return pattern.test(newType);
}


function isArray(typeMap, typeInfo) {
    const { type } = typeInfo;
    return type.endsWith("[]");
}


function isComplexType(typeMap, typeInfo) {
    return typeInfo.properties && Object.keys(typeInfo.properties).length > 0;
}

export default {
    generateParam
}