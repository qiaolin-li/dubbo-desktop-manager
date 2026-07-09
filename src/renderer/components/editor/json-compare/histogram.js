import { classify, newDiff } from "./diff";
import { myersDiff }         from "./myers";

export function histogramDiff(a, b) {
    if (a.length + b.length === 0) {
        return [];
    }
    if (a.length === 0) {
        return [{ right: newDiff(0, b.length, "ins") }];
    }
    if (b.length === 0) {
        return [{ left: newDiff(0, a.length, "del") }];
    }

    return new HistogramDiffer(a.split("\n"), b.split("\n")).solve();
}

class Histogram {
    constructor() {
        this.lines = new Map();
    }

    static fromLines(array, start, end) {
        const histogram = new Histogram();
        for (let i = start; i < end; i++) {
            histogram.add(array[i], i);
        }
        return histogram;
    }

    add(line, index) {
        const normalizedLine = line.trim();
        if (!this.lines.has(normalizedLine)) {
            this.lines.set(normalizedLine, []);
        }
        this.lines.get(normalizedLine).push(index);
    }

    get(line) {
        return this.lines.get(line.trim()) || [];
    }

    num(line) {
        return this.get(line).length;
    }

    first(line) {
        return this.get(line)[0];
    }

    delFirst(line) {
        this.lines.set(line.trim(), this.get(line).slice(1));
    }
}

class HistogramDiffer {
    constructor(leftLines, rightLines) {
        this.leftLines = leftLines;
        this.rightLines = rightLines;
    }

    eq(leftIndex, rightIndex) {
        return this.leftLines[leftIndex].trim() === this.rightLines[rightIndex].trim();
    }

    longestSubstring(leftStart, leftEnd, rightStart, rightEnd) {
        const histogram = Histogram.fromLines(this.leftLines, leftStart, leftEnd);
        let bestMatch = null;
        let bestMatchScore = leftEnd - leftStart;
        let rightIndex = rightStart;

        while (rightIndex < rightEnd) {
            let nextRightIndex = rightIndex + 1;
            const rightLine = this.rightLines[rightIndex].trim();

            if (histogram.num(rightLine) > bestMatchScore) {
                rightIndex = nextRightIndex;
                continue;
            }

            let prevLeftIndex = leftStart;
            for (const leftIndex of histogram.get(rightLine)) {
                if (leftIndex < prevLeftIndex) {
                    continue;
                }

                const region = new MatchRegion(leftIndex, leftIndex + 1, rightIndex, rightIndex + 1, leftEnd - leftStart);

                while (region.validStart(leftStart, rightStart) && this.eq(region.leftStart - 1, region.rightStart - 1)) {
                    region.leftStart--;
                    region.rightStart--;
                    if (region.matchScore > 1) {
                        region.matchScore = Math.min(region.matchScore, histogram.num(this.leftLines[region.leftStart].trim()));
                    }
                }

                while (region.validEnd(leftEnd, rightEnd) && this.eq(region.leftEnd, region.rightEnd)) {
                    if (region.matchScore > 1) {
                        region.matchScore = Math.min(region.matchScore, histogram.num(this.leftLines[region.leftEnd].trim()));
                    }
                    region.leftEnd++;
                    region.rightEnd++;
                }

                if ((bestMatch && bestMatch.length() < region.length()) || region.matchScore < bestMatchScore) {
                    bestMatch = region;
                    bestMatchScore = region.matchScore;
                }

                if (nextRightIndex < region.rightEnd) {
                    nextRightIndex = region.rightEnd;
                }
                prevLeftIndex = region.leftEnd;
            }

            rightIndex = nextRightIndex;
        }

        return bestMatch;
    }

    solveRange(leftStart, leftEnd, rightStart, rightEnd) {
        if (rightEnd - rightStart <= 1 || leftEnd - leftStart <= 1) {
            return [];
        }

        const region = this.longestSubstring(leftStart, leftEnd, rightStart, rightEnd);
        if (!region) {
            return [];
        }

        return [
            ...this.solveRange(leftStart, region.leftStart, rightStart, region.rightStart),
            region,
            ...this.solveRange(region.leftEnd, leftEnd, region.rightEnd, rightEnd),
        ];
    }

    findCommonLines(leftLines, rightLines) {
        const histogram = Histogram.fromLines(leftLines, 0, leftLines.length);
        const regions = [];

        for (let rightIndex = 0; rightIndex < rightLines.length; rightIndex++) {
            const leftIndex = histogram.first(rightLines[rightIndex]);
            if (leftIndex !== undefined) {
                regions.push(new MatchRegion(leftIndex, leftIndex + 1, rightIndex, rightIndex + 1));
                histogram.delFirst(rightLines[rightIndex]);
            }
        }

        return regions;
    }

    fineSolveRegion(regions) {
        const result = [];
        let prevRegion = null;

        for (let i = 0; i <= regions.length; i++) {
            const region = regions[i];
            const leftOffset = prevRegion?.leftEnd || 0;
            const rightOffset = prevRegion?.rightEnd || 0;
            const leftSlice = this.leftLines.slice(leftOffset, region ? region.leftStart : this.leftLines.length);
            const rightSlice = this.rightLines.slice(rightOffset, region ? region.rightStart : this.rightLines.length);

            if (prevRegion) {
                result.push(prevRegion);
            }
            prevRegion = region;

            if (leftSlice.length > 0 && rightSlice.length > 0 && leftSlice.length + rightSlice.length > 2) {
                this.findCommonLines(leftSlice, rightSlice).forEach(item => {
                    item.leftStart += leftOffset;
                    item.leftEnd += leftOffset;
                    item.rightStart += rightOffset;
                    item.rightEnd += rightOffset;
                    result.push(item);
                });
            }
        }

        return result;
    }

    solve() {
        const joinLines = (lines, start, end) => {
            if (start >= end) {
                return "";
            }
            const text = lines.slice(start, end).join("\n");
            return `${text}\n`;
        };
        const lineLength = line => (line === "" ? 0 : Math.max(1, line.length - 1));

        let leftOffset = 0;
        let rightOffset = 0;
        let prevRegion = new MatchRegion(0, 0, 0, 0, 0);
        const regions = this.fineSolveRegion(this.solveRange(0, this.leftLines.length, 0, this.rightLines.length));
        const pairs = [];

        for (let i = 0; i <= regions.length; i++) {
            const region = regions[i];
            const leftEnd = region ? region.leftStart : this.leftLines.length;
            const rightEnd = region ? region.rightStart : this.rightLines.length;
            const leftText = joinLines(this.leftLines, prevRegion.leftEnd, leftEnd);
            const rightText = joinLines(this.rightLines, prevRegion.rightEnd, rightEnd);
            const leftDiff = newDiff(leftOffset, lineLength(leftText), "del");
            const rightDiff = newDiff(rightOffset, lineLength(rightText), "ins");

            pairs.push({
                left: leftDiff.length > 0 ? leftDiff : undefined,
                right: rightDiff.length > 0 ? rightDiff : undefined,
            });

            if (leftText.length > 0 && rightText.length > 0) {
                const { left, right } = classify(myersDiff(leftText, rightText, { maxEditLength: 100 }));
                left.forEach(item => {
                    item.offset += leftDiff.offset;
                });
                right.forEach(item => {
                    item.offset += rightDiff.offset;
                });
                leftDiff.inlineDiffs = left;
                rightDiff.inlineDiffs = right;
            }

            if (region) {
                const leftCommonText = joinLines(this.leftLines, region.leftStart, region.leftEnd);
                const rightCommonText = joinLines(this.rightLines, region.rightStart, region.rightEnd);
                leftOffset += leftText.length + leftCommonText.length;
                rightOffset += rightText.length + rightCommonText.length;
                prevRegion = region;
            }
        }

        return pairs.filter(pair => pair.left || pair.right);
    }
}

class MatchRegion {
    constructor(leftStart, leftEnd, rightStart, rightEnd, matchScore = 0) {
        this.leftStart = leftStart;
        this.leftEnd = leftEnd;
        this.rightStart = rightStart;
        this.rightEnd = rightEnd;
        this.matchScore = matchScore;
    }

    validStart(leftStart, rightStart) {
        return leftStart < this.leftStart && rightStart < this.rightStart;
    }

    validEnd(leftEnd, rightEnd) {
        return this.leftEnd < leftEnd && this.rightEnd < rightEnd;
    }

    length() {
        return this.leftEnd - this.leftStart;
    }
}
