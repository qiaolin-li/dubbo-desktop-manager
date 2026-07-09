import * as jq                from "jq-wasm";
import { JSONPath }           from "jsonpath-plus";
import JSONUtils              from "@/common/utils/JSONUtils";


class JSONFilter {
    filterTypeOptions(){
        return [
            { 
                label: "JavaScript",
                type: "js", 
                placeholder: "例如：this.data.map(x => x.orderType)",
            },
            { 
                label: "JQ",
                type: "jq", 
                placeholder: "例如：.data | map(.orderType)",
            },
            { 
                label: "JSONPath",
                type: "jsonPath", 
                placeholder: "例如：$.data[*].orderType",
            },

        ];
    }

    async execute(selectedFilterType, filterExpression, sourceData){
        return this.formatFilterResult(await this.executeFilter(selectedFilterType, filterExpression, sourceData));
    }

    executeFilter(selectedFilterType, filterExpression, sourceData) {
        switch (selectedFilterType) {
            case "jq":
                return this.executeJqFilter(sourceData, filterExpression);
            case "jsonPath":
                return this.executeJsonPathFilter(sourceData, filterExpression);
            case "js":
            default:
                return this.executeJsFilter(sourceData, filterExpression);
        }
    }


    executeJsFilter(sourceData, expression) {
        const source = (expression || "").trim();
        if (!source) {
            return sourceData;
        }

        const createContext = () => ({
            root: sourceData,
            data: sourceData && sourceData.data,
            value: sourceData,
        });

        try {
            const evaluator = new Function("$context", `
                const root = $context.root;
                const data = $context.data;
                const value = $context.value;
                return (function () {
                    return (${source});
                }).call(root);
            `);
            return evaluator(createContext());
        } catch (error) {
            if (!(error instanceof SyntaxError)) {
                throw error;
            }
        }

        const evaluator = new Function("$context", `
            const root = $context.root;
            const data = $context.data;
            const value = $context.value;
            return (function () {
                ${source}
            }).call(root);
        `);
        return evaluator(createContext());
    }

    async executeJqFilter(sourceData, expression) {
        const source = (expression || "").trim();
        if (!source) {
            return sourceData;
        }

        return jq.json(this.normalizeJqSourceData(sourceData), source);
    }

    normalizeJqSourceData(value) {
        if (typeof value === "bigint") {
            return value.toString();
        }

        if (Array.isArray(value)) {
            return value.map(item => this.normalizeJqSourceData(item));
        }

        if (value && typeof value === "object") {
            const normalized = {};
            Object.keys(value).forEach(key => {
                normalized[key] = this.normalizeJqSourceData(value[key]);
            });
            return normalized;
        }

        return value;
    }

    executeJsonPathFilter(sourceData, expression) {
        const source = (expression || "").trim();
        if (!source) {
            return sourceData;
        }

        return JSONPath({
            path: source,
            json: sourceData,
            wrap: true,
        });
    }


    formatFilterResult(result) {
        const normalized = this.normalizeFilterResult(result);
        return this.stringifyFilterResult(normalized);
    }

    stringifyFilterResult(result) {
        if (typeof result === "string") {
            return JSON.stringify(result, null, 2);
        }

        if (typeof result === "number" || typeof result === "boolean") {
            return JSON.stringify(result, null, 2);
        }

        if (typeof result === "bigint") {
            return result.toString();
        }

        if (result === null) {
            return "null";
        }

        try {
            return JSONUtils.formatBigIntAsBigInt(result);
        } catch (error) {
            return String(result);
        }
    }

    normalizeFilterResult(result) {
        if (typeof result === "undefined") {
            return {
                type: "undefined",
            };
        }

        if (typeof result === "function") {
            return {
                type: "function",
                source: result.toString(),
            };
        }

        if (typeof result === "symbol") {
            return result.toString();
        }

        if (typeof result === "bigint") {
            return result;
        }

        return result;
    }
}


export default new JSONFilter();
