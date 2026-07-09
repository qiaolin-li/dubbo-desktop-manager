import { newDiff } from "./diff";

export const MAX_EDIT_LENGTH = 1000;

export function myersDiff(a, b, options = {}) {
    let leftOffset = 0;
    let rightOffset = 0;
    const diffs = (diff(a, b, options) || [])
        .map(item => {
            const count = item.value ? item.value.length : 0;

            if (item.removed) {
                const currentDiff = newDiff(leftOffset, count, "del");
                leftOffset += count;
                return currentDiff;
            }

            if (item.added) {
                const currentDiff = newDiff(rightOffset, count, "ins");
                rightOffset += count;
                return currentDiff;
            }

            leftOffset += count;
            rightOffset += count;
            return null;
        })
        .filter(Boolean);

    let index = 0;
    while (index < diffs.length) {
        const current = diffs[index];
        const next = diffs[index + 1];

        if (current && next && current.type === "del" && next.type === "ins") {
            let sharedLength = Math.min(current.length, next.length);
            for (let i = 0; i < sharedLength && a[current.offset] === b[next.offset]; i++) {
                current.offset++;
                next.offset++;
                current.length--;
                next.length--;
            }

            sharedLength = Math.min(current.length, next.length);
            for (let i = 0; i < sharedLength && a[current.offset + current.length - 1] === b[next.offset + next.length - 1]; i++) {
                current.length--;
                next.length--;
            }

            index += 2;
        } else {
            index++;
        }
    }

    return diffs.filter(item => item && item.length);
}

function diff(oldString, newString, options = {}) {
    const oldArray = tokenize(oldString).filter(Boolean);
    const newArray = tokenize(newString).filter(Boolean);

    const newLength = newArray.length;
    const oldLength = oldArray.length;
    let editLength = 1;
    const maxEditLength = Math.min(newLength + oldLength, options.maxEditLength || MAX_EDIT_LENGTH);
    const bestPath = [{ newPos: -1, lastComponent: undefined }];

    const oldPos = extractCommon(bestPath[0], newArray, oldArray, 0);
    if (bestPath[0].newPos + 1 >= newLength && oldPos + 1 >= oldLength) {
        return [{ value: newArray.join(""), count: newArray.length }];
    }

    const runEditLength = () => {
        for (let diagonal = -1 * editLength; diagonal <= editLength; diagonal += 2) {
            let basePath;
            const addPath = bestPath[diagonal - 1];
            const removePath = bestPath[diagonal + 1];
            let localOldPos = (removePath ? removePath.newPos : 0) - diagonal;

            if (addPath) {
                bestPath[diagonal - 1] = undefined;
            }

            const canAdd = addPath && addPath.newPos + 1 < newLength;
            const canRemove = removePath && 0 <= localOldPos && localOldPos < oldLength;
            if (!canAdd && !canRemove) {
                bestPath[diagonal] = undefined;
                continue;
            }

            if (!canAdd || (canRemove && addPath.newPos < removePath.newPos)) {
                basePath = addToPath(removePath, undefined, true, 0);
            } else {
                basePath = addToPath(addPath, true, undefined, 1);
            }

            localOldPos = extractCommon(basePath, newArray, oldArray, diagonal);
            if (basePath.newPos + 1 >= newLength && localOldPos + 1 >= oldLength) {
                return buildValues(basePath.lastComponent, newArray, oldArray);
            }

            bestPath[diagonal] = basePath;
        }

        editLength++;
        return undefined;
    };

    while (editLength <= maxEditLength) {
        const result = runEditLength();
        if (result) {
            return result;
        }
    }

    return [
        { value: oldArray.join(""), removed: true, count: 0 },
        { value: newArray.join(""), added: true, count: 0 },
    ];
}

function addToPath(path, added, removed, newPosInc) {
    const last = path.lastComponent;
    return last && last.added === added && last.removed === removed
        ? {
            newPos: path.newPos + newPosInc,
            lastComponent: {
                count: last.count + 1,
                added,
                removed,
                previousComponent: last.previousComponent,
            },
        }
        : {
            newPos: path.newPos + newPosInc,
            lastComponent: {
                count: 1,
                added,
                removed,
                previousComponent: last,
            },
        };
}

function extractCommon(basePath, newString, oldString, diagonalPath) {
    const newLength = newString.length;
    const oldLength = oldString.length;
    let newPos = basePath.newPos;
    let oldPos = newPos - diagonalPath;
    let commonCount = 0;

    while (newPos + 1 < newLength && oldPos + 1 < oldLength && newString[newPos + 1] === oldString[oldPos + 1]) {
        newPos++;
        oldPos++;
        commonCount++;
    }

    if (commonCount) {
        basePath.lastComponent = { count: commonCount, previousComponent: basePath.lastComponent };
    }

    basePath.newPos = newPos;
    return oldPos;
}

function tokenize(value) {
    const extendedWordChars = /^[a-zA-Z\u{C0}-\u{FF}\u{D8}-\u{F6}\u{F8}-\u{2C6}\u{2C8}-\u{2D7}\u{2DE}-\u{2FF}\u{1E00}-\u{1EFF}]+$/u;
    const tokens = value.split(/([^\S\r\n]+|[()[\]{}'"\r\n]|\b)/);

    for (let i = 0; i < tokens.length - 1; i++) {
        if (!tokens[i + 1] && tokens[i + 2] && extendedWordChars.test(tokens[i]) && extendedWordChars.test(tokens[i + 2])) {
            tokens[i] += tokens[i + 2];
            tokens.splice(i + 1, 2);
            i--;
        }
    }

    return tokens;
}

function buildValues(lastComponent, newString, oldString) {
    const components = [];

    while (lastComponent) {
        components.push(lastComponent);
        const next = lastComponent.previousComponent;
        delete lastComponent.previousComponent;
        lastComponent = next;
    }
    components.reverse();

    let newPos = 0;
    let oldPos = 0;

    for (let componentPos = 0; componentPos < components.length; componentPos++) {
        const component = components[componentPos];

        if (!component.removed) {
            if (!component.added) {
                const value = newString.slice(newPos, newPos + component.count).map((item, index) => {
                    const oldValue = oldString[oldPos + index];
                    return oldValue.length > item.length ? oldValue : item;
                });
                component.value = value.join("");
            } else {
                component.value = newString.slice(newPos, newPos + component.count).join("");
            }

            newPos += component.count;

            if (!component.added) {
                oldPos += component.count;
            }
        } else {
            component.value = oldString.slice(oldPos, oldPos + component.count).join("");
            oldPos += component.count;
        }
    }

    return components;
}
