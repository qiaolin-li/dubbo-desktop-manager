
/**
 * 生成参数
 */
 function generateParam(mateData, methodName) {
    let method = findMethodInfo(mateData, methodName);

    // 未找到方法
    if (!method) {
        return null;
    }


    let params = [];
    for (let i = 0; i < method.parameterTypes.length; i++) {
        let parameterType = method.parameterTypes[i];

        let data = generateObject(mateData.types, parameterType);

        params.push(data);
    }

    // console.log(JSON.stringify(params));
    return JSON.stringify(params, null, 2);
}


function generateObject(types, type) {
    if (isPrimitiveType(type)) {
        return generateData(type);
    } else if (isMap(type)) {
        return generateMapType(types, type);
    } else if (isArray(type)) {
        return generateArrayType(types, type);
    } else if (isCollection(type)) {
        return generateCollectionType(types, type);
    } else {
        return generateComplexType(types, type);
    }
}


function generateData(type) {
    switch (type) {
        case "byte":
        case "java.lang.Byte":
        case "short":
        case "java.lang.Short":
        case "int":
        case "java.lang.Integer":
        case "long":
        case "java.lang.Long":
            return 0;
        case "float":
        case "java.lang.Float":
        case "double":
        case "java.lang.Double":
            return 0.0;
        case "boolean":
        case "java.lang.Boolean":
            return true;
        case "void":
        case "java.lang.Void":
            return null;
        case "java.lang.String":
            return "";
        case "java.lang.Object":
            return {};
        case "java.util.Date":
            return "2022-02-24 10:00:00";
        default:
            return null;
    }
}


function generateMapType(types, type) {
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
    let valueData = generateObject(types, valueType);

    // 可能会有Map的key里面放对象，但这也没有办法了...

    let data = {};
    data[keyType] = valueData;

    return data;
}

function generateCollectionType(types, type) {

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

    return [generateObject(types, realType)];
}

function generateArrayType(types, type) {
    let offset = type.indexOf("[]");

    let realType = type.substring(0, offset);
    return [generateObject(types, realType)];
}


function generateComplexType(types, type) {

    let td = findTypeDefinition(types, type);
    if (td.properties == null || td.properties.length == 0) {
        return generateData(td.type)
    } else {
        let data = {};
        for (let property in td.properties) {
            data[property] = generateObject(types, td.properties[property].type);
        }

        return data;
    }
}

function findTypeDefinition(types, type) {
    for (let index = 0; index < types.length; index++) {
        const element = types[index];
        if (element.type == type) {
            return element;
        }
    }
}




function isPrimitiveType(type) {
    let baseTypes = [
        "byte", "java.lang.Byte", "short", "java.lang.Short",
        "int", "java.lang.Integer", "long", "java.lang.Long",
        "float", "java.lang.Float", "double", "java.lang.Double",
        "boolean", "java.lang.Boolean", "void", "java.lang.String",
        "java.lang.Void", "java.util.Date", "java.lang.Object"
    ];

    return baseTypes.find(baseType => baseType == type);
}



function isMap(type) {
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

function isCollection(type) {
    const pattern = /^java.util.*(Set|List|Queue|Collection|Deque)(<.*>)*$/;
    let offset = type.indexOf("<");

    if (offset < 0) {
        return pattern.test(type);
    }
    let newType = type.substring(0, offset);
    return pattern.test(newType);
}


function isArray(type) {
    return type.endsWith("[]");
}


function findMethodInfo(mateData, methodName) {
 
    for (let i = 0; i < mateData.methods.length; i++) {
        const method = mateData.methods[i];

        if (methodName == method.name) {
            return method;
        }

    }

    return null;
}


export default {
    generateParam
}