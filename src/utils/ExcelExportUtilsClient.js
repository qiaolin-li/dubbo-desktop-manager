import consumer from "@/main/communication/consumer.js";



// 这里只是一个空壳
let data = {
    name: "excelUtils",
    generateExcel() {},
    generateExcelAndWriterFile() {

    }
}

let ExcelExportUtils = consumer.wrapper(data);


/**
 * 导出到Excel
 * @param {Header[]} headers
 * @param {*} json 导出内容
 * @param {*} fileName 文件名称
 * @param {*} type 文件类型
 */
function generateExcelAndWriterFile(headers, dataList, fileName, type) {

    // 先将函数转为数据
    let tempKeyIndex = 0;
    for (let i = 0; i < headers.length; i++) {
        const header = headers[i];

        if (header.key && header.getContent) {
            throw new Error("不可同时设置key和getContent()函数");
        }

        if (header.getContent) {
            header.key = `excel_temp_variable_${tempKeyIndex}`;
        }

    }

    let datas = [];
    // 写入数据
    for (let dataIndex = 0; dataIndex < dataList.length; dataIndex++) {
        let data = dataList[dataIndex];
        let realData = {};

        for (let i = 0; i < headers.length; i++) {
            const header = headers[i];

            if (header.getContent) {
                realData[header.key] = header.getContent(data);
            } else if (header.key) {
                realData[header.key] = data[header.key] || "";
            } else {
                // 有可能想导入一个空列？？？
                continue;
            }
        }

        datas.push(realData);
    }

    for (let i = 0; i < headers.length; i++) {
        const header = headers[i];

        // 删除
        if (header.getContent) {
            delete header.getContent;
        }

    }

    // 交给主进程导出
    ExcelExportUtils.generateExcelAndWriterFile(headers, datas, fileName, type);
}


export default {
    generateExcelAndWriterFile
};