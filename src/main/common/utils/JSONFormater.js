import jsonBigInt from 'json-bigint';

let JSONString = jsonBigInt(({"storeAsString": true}));

const formaterArray = [];
const formatJsonString = data => JSON.stringify(JSONString.parse(data), null, 2);

function registryFormater(fun){
    formaterArray.push(fun);
}

// 普通的json解析
registryFormater(formatJsonString)


// 是不规范的json, 给有些字段或者值加上 ""
registryFormater((data) => {
    data = data.replace(/(?:\s*['"]*)?([a-zA-Z0-9]+)(?:['"]*\s*)?:/g, "\"$1\":");
    return formatJsonString(data);
})



// 如果你有自己的实现，请默认格式化器之前
// 默认的，无法解析，直接返回原数据
registryFormater(data => data)


function executeFormatJsonString(data){
    for(let i = 0; i < formaterArray.length; i++){
        try{
            return formaterArray[i](data);
        }catch(e){
            // 如果失败，会继续执行下一个，直到最后一个解析器会返回原数据
        }
    }
    return data;
}

export default executeFormatJsonString