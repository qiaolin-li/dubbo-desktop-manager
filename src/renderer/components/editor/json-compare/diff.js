export function newRange(startLineNumber, endLineNumber, startColumn = 1, endColumn = 1) {
    return {
        startLineNumber,
        endLineNumber,
        startColumn,
        endColumn,
        offset: 0,
        length: 0,
    };
}

export function newDiff(offset, length, type) {
    return { offset, length, type };
}

export function classify(diffs) {
    const left = sort(diffs.filter(item => item.type === "del"));
    const right = sort(diffs.filter(item => item.type === "ins"));
    return { left, right };
}

export function sort(diffs) {
    return diffs.sort((a, b) => {
        if (a.type !== b.type) {
            return a.type === "del" ? -1 : 1;
        }
        return a.offset - b.offset;
    });
}
