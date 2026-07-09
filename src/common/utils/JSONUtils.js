import JSONbig   from 'json-bigint';

const JSONInt = JSONbig(({
    useNativeBigInt: true,
}));

const JSONString = JSONbig(({
    storeAsString: true,
}));

// const formaterArray = [];
// const formatJsonString = data => JSONInt.stringify(JSONInt.parse(data), null, 2);

// function registryFormater(fun){
//     formaterArray.push(fun);
// }

// 普通的json解析
// registryFormater(formatJsonString)


// 是不规范的json, 给有些字段或者值加上 ""
// TODO 2026年3月12日14:44:19，不知道当时写这个代码是因为什么场景，暂时注释掉，如果有需要再放开
// registryFormater((data) => {
//     data = data.replace(/(?:\s*['"]*)?([a-zA-Z0-9]+)(?:['"]*\s*)?:/g, "\"$1\":");
//     return formatJsonString(data);
//})



// 如果你有自己的实现，请默认格式化器之前
// 默认的，无法解析，直接返回原数据
// registryFormater(data => data)


class JSONUtils{

    parseBigIntAsBigInt(data){
        try {
            return JSONInt.parse(data)
        }catch(e){
            return JSON.parse(data);
        }
    }

    stringifyBigIntAsBigInt(data, replacer, space){
        try {
            return JSONInt.stringify(data, replacer, space);
        }catch(e){
            return JSON.stringify(data, replacer, space);
        }
    }

    parseBigIntAsString(data){
        try {
            return JSONString.parse(data)
        }catch(e){
            return JSON.parse(data);
        }
    }
    
    stringifyBigIntAsString(data, replacer, space){
        try {
            return JSONString.stringify(data, replacer, space);
        }catch(e){
            return JSON.stringify(data, replacer, space);
        }
    }

    formatBigIntAsBigInt(data){
        if(typeof data === "string"){
            data = this.parseBigIntAsBigInt(data);
        }
        try{
            return this.stringifyBigIntAsBigInt(data, null, 2);
        }catch(e){
            // 失败无所谓
            return this.format(data);
        }
    }
    formatBigIntAsString(data){
        if(typeof data === "string"){
            data = this.parseBigIntAsString(data);
        }
        try{
            return this.stringifyBigIntAsString(data, null, 2);
        }catch(e){
            // 失败无所谓
            return this.format(data);
        }
    }

    format(data){
        return JSON.stringify(data, null, 2);
    }

    // format(data){
    //     for(let i = 0; i < formaterArray.length; i++){
    //         try{
    //             return formaterArray[i](data);
    //         }catch(e){
    //             // 如果失败，会继续执行下一个，直到最后一个解析器会返回原数据
    //         }
    //     }
    //     return data;
    // }
}

export default new JSONUtils();