import { newRange }      from "./diff";
import { histogramDiff } from "./histogram";

export class JsonEditorComparer {
    constructor(mainEditor, secondaryEditor) {
        this.mainEditor = mainEditor;
        this.secondaryEditor = secondaryEditor;
        this.leftBlankHunkIDs = [];
        this.rightBlankHunkIDs = [];
        this.leftDecorations = undefined;
        this.rightDecorations = undefined;
        this.scrollGuard = 0;
        this.disposables = [];
        this.bindScrollSync();
    }

    dispose() {
        this.reset();
        this.disposables.forEach(item => item && item.dispose && item.dispose());
        this.disposables = [];
    }

    compare(leftText, rightText) {
        return histogramDiff(leftText || "", rightText || "");
    }

    highlightDiff(diffPairs, options = {}) {
        const { revealFirstDiff = false } = options;
        this.reset();
        this.genRanges(diffPairs);

        const decorations = genHighlightDecorations(diffPairs);
        this.leftDecorations = this.mainEditor.createDecorationsCollection(decorations.left);
        this.rightDecorations = this.secondaryEditor.createDecorationsCollection(decorations.right);
        this.fillBlankHunkDoms(diffPairs);

        if (revealFirstDiff && diffPairs.length > 0) {
            diffPairs[0].left && this.revealOffset(this.mainEditor, diffPairs[0].left.offset);
            diffPairs[0].right && this.revealOffset(this.secondaryEditor, diffPairs[0].right.offset);
        }
    }

    reset() {
        this.leftDecorations && this.leftDecorations.clear();
        this.rightDecorations && this.rightDecorations.clear();

        this.mainEditor.changeViewZones(accessor => {
            (this.leftBlankHunkIDs || []).forEach(id => accessor.removeZone(id));
        });
        this.secondaryEditor.changeViewZones(accessor => {
            (this.rightBlankHunkIDs || []).forEach(id => accessor.removeZone(id));
        });

        this.leftBlankHunkIDs = [];
        this.rightBlankHunkIDs = [];
        this.leftDecorations = undefined;
        this.rightDecorations = undefined;
    }

    bindScrollSync() {
        const syncScroll = (fromEditor, toEditor, event) => {
            if (this.scrollGuard) {
                return;
            }
            if (!event.scrollTopChanged && !event.scrollLeftChanged) {
                return;
            }

            this.scrollGuard++;
            if (event.scrollTopChanged) {
                toEditor.setScrollTop(event.scrollTop);
            }
            if (event.scrollLeftChanged) {
                toEditor.setScrollLeft(event.scrollLeft);
            }
            this.scrollGuard--;
        };

        this.disposables.push(this.mainEditor.onDidScrollChange(event => {
            syncScroll(this.mainEditor, this.secondaryEditor, event);
        }));
        this.disposables.push(this.secondaryEditor.onDidScrollChange(event => {
            syncScroll(this.secondaryEditor, this.mainEditor, event);
        }));
    }

    genRanges(diffPairs) {
        const toRange = (editor, diff) => {
            const model = editor.getModel();
            const start = model.getPositionAt(diff.offset);
            const end = model.getPositionAt(diff.offset + diff.length);
            const range = {
                startLineNumber: start.lineNumber,
                startColumn: start.column,
                endLineNumber: end.lineNumber,
                endColumn: end.column,
                ...diff,
            };

            if (range.length === 1 && range.startColumn === 1 && range.endColumn === 1) {
                range.endLineNumber = range.startLineNumber;
            }

            return range;
        };

        diffPairs.forEach(({ left, right }) => {
            if (left) {
                left.range = toRange(this.mainEditor, left);
                (left.inlineDiffs || []).forEach(item => {
                    item.range = toRange(this.mainEditor, item);
                });
            }
            if (right) {
                right.range = toRange(this.secondaryEditor, right);
                (right.inlineDiffs || []).forEach(item => {
                    item.range = toRange(this.secondaryEditor, item);
                });
            }
        });
    }

    fillBlankHunkDoms(diffPairs) {
        const applyZones = (editor, ranges) => {
            let ids = [];
            editor.changeViewZones(accessor => {
                ids = ranges.map(({ startLineNumber, endLineNumber }) => accessor.addZone({
                    afterLineNumber: startLineNumber - 1,
                    heightInLines: endLineNumber - startLineNumber + 1,
                    domNode: createBlankHunkDom(),
                }));
            });
            return ids;
        };

        const fillRanges = genFillRanges(diffPairs);
        this.leftBlankHunkIDs = applyZones(this.mainEditor, fillRanges.left);
        this.rightBlankHunkIDs = applyZones(this.secondaryEditor, fillRanges.right);
    }

    revealOffset(editor, offset) {
        const model = editor.getModel();
        const position = model.getPositionAt(offset);
        editor.revealPositionInCenter(position);
        editor.setPosition(position);
    }
}

function createBlankHunkDom() {
    const node = document.createElement("div");
    node.className = "app-json-editor__blank-hunk";
    return node;
}

function genFillRanges(pairs) {
    const left = [];
    const right = [];
    let leftAggr = 0;
    let rightAggr = 0;

    const addLeft = fill => {
        left.push(rangeMinus(fill, leftAggr));
        leftAggr += countRange(fill);
    };
    const addRight = fill => {
        right.push(rangeMinus(fill, rightAggr));
        rightAggr += countRange(fill);
    };

    for (const { left: leftDiff, right: rightDiff } of pairs) {
        const leftStart = leftDiff?.range?.startLineNumber ?? 0;
        const leftEnd = leftDiff?.range?.endLineNumber ?? 0;
        const rightStart = rightDiff?.range?.startLineNumber ?? 0;
        const rightEnd = rightDiff?.range?.endLineNumber ?? 0;
        const leftFillStart = leftDiff ? leftStart + leftAggr : 0;
        const leftFillEnd = leftDiff ? leftEnd + leftAggr : 0;
        const rightFillStart = rightDiff ? rightStart + rightAggr : 0;
        const rightFillEnd = rightDiff ? rightEnd + rightAggr : 0;

        if (leftFillEnd < rightFillStart || rightFillEnd < leftFillStart) {
            if (leftDiff) {
                addRight(newRange(leftStart + leftAggr, leftEnd + leftAggr));
            }
            if (rightDiff) {
                addLeft(newRange(rightStart + rightAggr, rightEnd + rightAggr));
            }
        } else if (leftFillEnd <= rightFillEnd) {
            addLeft(newRange(Math.max(leftFillEnd + 1, rightFillStart), rightFillEnd));
        } else if (rightFillEnd < leftFillEnd) {
            addRight(newRange(Math.max(rightFillEnd + 1, leftFillStart), leftFillEnd));
        }
    }

    return { left, right };
}

function genHighlightDecorations(diffPairs) {
    const leftHunks = [];
    const rightHunks = [];
    const leftInline = [];
    const rightInline = [];

    for (const { left, right } of diffPairs) {
        const leftDecorations = genDecorations(left);
        const rightDecorations = genDecorations(right);
        if (leftDecorations.hunk) {
            leftHunks.push(leftDecorations.hunk);
        }
        if (rightDecorations.hunk) {
            rightHunks.push(rightDecorations.hunk);
        }
        leftInline.push(...leftDecorations.inlines);
        rightInline.push(...rightDecorations.inlines);
    }

    const compare = (a, b) => a.range.startLineNumber - b.range.startLineNumber;
    return {
        left: leftInline.concat(mergeDecorations(leftHunks.sort(compare))),
        right: rightInline.concat(mergeDecorations(rightHunks.sort(compare))),
    };
}

function mergeDecorations(decorations) {
    if (decorations.length === 0) {
        return [];
    }
    const merged = [decorations[0]];

    for (const decoration of decorations.slice(1)) {
        const prev = merged[merged.length - 1];
        if (decoration.range.startLineNumber <= prev.range.endLineNumber) {
            prev.range.endLineNumber = Math.max(decoration.range.endLineNumber, prev.range.endLineNumber);
        } else {
            merged.push(decoration);
        }
    }

    return merged;
}

function genDecorations(diff) {
    if (!diff) {
        return { inlines: [] };
    }
    return {
        hunk: newDecoration(diff.range, false, diff.type),
        inlines: (diff.inlineDiffs || []).map(item => newDecoration(item.range, true, diff.type)),
    };
}

function newDecoration(range, isInlineDiff, diffType) {
    if (isInlineDiff) {
        return {
            range,
            options: {
                inlineClassName: diffType === "del"
                    ? "app-json-editor__diff-inline--main"
                    : "app-json-editor__diff-inline--secondary",
            },
        };
    }

    return {
        range,
        options: {
            isWholeLine: true,
            className: diffType === "del"
                ? "app-json-editor__diff-line--main"
                : "app-json-editor__diff-line--secondary",
        },
    };
}

function rangeMinus(range, count) {
    return {
        ...range,
        startLineNumber: range.startLineNumber - count,
        endLineNumber: range.endLineNumber - count,
    };
}

function countRange(range) {
    return range.endLineNumber > 0 ? range.endLineNumber - range.startLineNumber + 1 : 0;
}
