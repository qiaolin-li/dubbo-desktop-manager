import fs from "fs";
import XLSXStyle from 'xlsx-style'

// ################### 为什么要有这个类 ？
// 因为打包后出现了很奇怪的错误
//

class ExcelExporter {

    /**
     * 导出到Excel
     * @param {Header[]} headers
     * @param {*} json 导出内容
     * @param {*} fileName 文件名称
     * @param {*} type 文件类型
     */
    generateExcelAndWriterFile(headers, dataList, fileName, type) {
        // 生成excel
        let content = this.generateExcel(headers, dataList, type);

        // 写入本地文件
        fs.writeFileSync(fileName, content, "binary");
    }


    /**
     * 生成Excel
     * @param {Header[]} headers
     * @param {*} dataList 需要导出的数据列表
     * @param {*} type 文件类型
     */
    generateExcel(headers, dataList, type){
        let tmpData = [] // 用来保存转换好的json

        let cols = [];
        for (let i = 0; i < headers.length; i++) {
            const header = headers[i];

            let position = this.getCharCol(i) + 1;
            let cellData = this.buildHeaderCell(header);
            cols.push({
                wch : header.width || 20
            });
            tmpData[position] = cellData;
        }

        // 写入数据
        for (let dataIndex = 0; dataIndex < dataList.length; dataIndex++) {
            let data = dataList[dataIndex];

            for (let i = 0; i < headers.length; i++) {
                const header = headers[i];

                let content = "";
                if(header.key){
                    content = data[header.key];
                }
                
                let position = this.getCharCol(i) + (dataIndex + 2)
                let cellData = this.buildCell(content);

                tmpData[position] = cellData;
            }
        }
        let outputPos = Object.keys(tmpData)
        let tmpWB = {
            SheetNames: ['sheet'], // 保存的表标题
            Sheets: {
                sheet: Object.assign({},
                    tmpData, // 内容
                    {
                        '!ref': outputPos[0] + ':' + outputPos[outputPos.length - 1] // 设置填充区域
                    },
                    {
                        "!cols" : cols
                    }
                )
            }
        }

        const wbout = XLSXStyle.write(
            tmpWB, {
                bookType: type === undefined ? 'xlsx' : type,
                bookSST: false,
                type: 'binary'
            } // 这里的数据是用来定义导出的格式类型
        )
        return wbout;
    }

    Header(title, key, width){
        this.title = title;
        this.key = key;
        this.width = width;
    }


    /**
     * 
     * @param {Header} header 
     * @returns 
     */
    buildHeaderCell(header){
        return {
            v: header.title,
            s : {
                fill: {
                    fgColor: { rgb: 'FFA3F4B1' } // 添加背景色
                },
                font: {
                    name: '宋体', // 字体
                    sz: 12, // 字体大小
                    bold: true // 加粗
                },
                border: {
                    // 下划线
                    top: {
                        style: 'thin',
                        color: 'FF000000'
                    },
                    bottom: {
                        style: 'thin',
                        color: 'FF000000'
                    },
                    left: {
                        style: 'thin',
                        color: 'FF000000'
                    },
                    right: {
                        style: 'thin',
                        color: 'FF000000'
                    },
                }
            }
        };
    }

    buildCell(value){
        return {
            v: value,
            s : {
                fill: {
                    // fgColor: { rgb: 'FFA3F4B1' } // 添加背景色
                },
                font: {
                    name: '宋体', // 字体
                    sz: 12, // 字体大小
                    bold: true // 加粗
                },
                border: {
                    // 下划线
                    top: {
                        style: 'thin',
                        color: 'FF000000'
                    },
                    bottom: {
                        style: 'thin',
                        color: 'FF000000'
                    },
                    left: {
                        style: 'thin',
                        color: 'FF000000'
                    },
                    right: {
                        style: 'thin',
                        color: 'FF000000'
                    },
                }
            }
        };
    }

    /**
     * 将指定的自然数转换为26进制表示。映射关系：[0-25] -> [A-Z]。
     * @param {Number} n
     */
    getCharCol(n) {
        let s = ''
        let m = 0
        while (n >= 0) {
            m = (n % 26) + 1
            s = String.fromCharCode(m + 64) + s
            n = (n - m) / 26
        }
        return s
    }

}

export default new ExcelExporter();