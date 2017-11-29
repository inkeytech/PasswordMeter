/* tslint:disable */
export interface IRequirement {
    minLength?: number | IMessage;
    maxLength?: number | IMessage;
    uppercaseLettersMinLength?: number | IMessage;
    lowercaseLettersMinLength?: number | IMessage;
    numbersMinLength?: number | IMessage;
    symbolsMinLength?: number | IMessage;
    mustBe?: string[] | IMessage;
    mustNotBe?: string[] | IMessage;
    startsWith?: string | IMessage;
    endsWith?: string | IMessage;
}

export interface IScoreRange {
    veryWeak?: number;
    weak?: number;
    medium?: number;
    strong?: number;
    veryStrong?: number;
}

export interface IMessage {
    value: number | string | string[];
    message: string;
}

export interface IResult {
    score: number;
    status: string;
    errors?: string[];
}

export class PasswordMeter {

    private uppercaseLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private lowercaseLetters = "abcdefghijklmnopqrstuvwxyz";
    private numbers = "1234567890";
    private symbols = "~`!@#$%^&*()_+-={}[]:\"|;'\\<>?/";
    constructor(private requirements?: IRequirement, private scoreRange?: IScoreRange) {

    }

    private startsWith(str: string, word: string): boolean {
        return str.lastIndexOf(word, 0) === 0;
    }

    private endsWith(str: string, word: string): boolean {
        return str.indexOf(word, str.length - word.length) !== -1;
    }

    private chunkString(str: string, len: number): string[] {
        let _size = Math.ceil(str.length / len),
            _ret = new Array(_size),
            _offset;
        for (let _i = 0; _i < _size; _i++) {
            _offset = _i * len;
            _ret[_i] = str.substring(_offset, _offset + len);
        }
        return _ret;
    }
    private getLength(text: string): number {
        if (text) {
            return text.length;
        }
        return 0;
    }
    private doesNotContains(text: string, list: string[]): boolean {
        if (text) {
            if (list) {
                let doesnotContainsAll = list.every(x => text.indexOf(x) == -1);
                return doesnotContainsAll;
            }
            else {
                return true;

            }
        }
        else {
            return true;
        }
    }
    private contains(text: string, list: string[]): boolean {
        if (text) {
            if (list) {
                let containsAll = list.every(x => text.indexOf(x) >= 0);
                return containsAll;
            }
            else {
                return false;

            }
        }
        else {
            return false;
        }
    }

    private isIMessage(arg: any): arg is IMessage {
        let status = arg.message !== undefined;
        return status;
    }


    private isNumber(text: string): boolean {
        if (text) {
            let pattern = /^\d+$/;
            return pattern.test(text);
        }
        return false;
    }

    private isLetter(text: string): boolean {
        if (text) {
            let pattern = /^[a-zA-Z]+$/;
            return pattern.test(text);
        }
        return false;
    }

    private isUppercaseLetter(text: string): boolean {
        if (text) {
            let pattern = /^[A-Z]+$/;
            return pattern.test(text);
        }
        return false;
    }

    private isLowercaseLetter(text: string): boolean {
        if (text) {
            let pattern = /^[a-z]+$/;
            return pattern.test(text);
        }
        return false;
    }

    private isSymbol(text: string): boolean {
        if (text) {
            return !this.isNumber(text) && !this.isLetter(text);
        }
        return false;
    }

    private getLengthScore(text: string): number {
        if (text) {
            // +(n*9)
            const ratio = 9;
            return this.getLength(text) * ratio;
        }
        return 0;
    }
    private getUppercaseLettersScore(text: string): number {
        if (text) {
            // +((len-n)*2)	
            const ratio = 2;
            let n = 0;
            text.split('').forEach((value, index) => {
                if (this.isUppercaseLetter(value)) {
                    n++;
                }
            });
            if (n == 0) {
                return 0;
            }
            return (this.getLength(text) - n) * ratio;
        }
        return 0;
    }
    private getLowercaseLettersScore(text: string): number {
        if (text) {
            // +((len-n)*2)	
            const ratio = 2;
            let n = 0;
            text.split('').forEach((value, index) => {
                if (this.isLowercaseLetter(value)) {
                    n++;
                }
            });
            if (n == 0) {
                return 0;
            }
            return (this.getLength(text) - n) * ratio;
        }
        return 0;
    }
    private getNumbersScore(text: string): number {
        if (text) {
            // +((len-n)*4)	
            const ratio = 4;
            let n = 0;
            text.split('').forEach((value, index) => {
                if (this.isNumber(value)) {
                    n++;
                }
            });
            if (n == 0) {
                return 0;
            }
            return (this.getLength(text) - n) * ratio;
        }
        return 0;
    }
    private getSymbolsScore(text: string): number {
        if (text) {
            // +((len-n)*6)	
            const ratio = 6;
            let n = 0;
            text.split('').forEach((value, index) => {
                if (this.isSymbol(value)) {
                    n++;
                }
            });
            if (n == 0) {
                return 0;
            }
            return (this.getLength(text) - n) * ratio;
        }
        return 0;
    }

    private getLettersOnlyScore(text: string): number {
        if (text) {
            // -n	
            const ratio = -1;
            if (this.isLetter(text)) {
                return this.getLength(text) * ratio;
            }
        }
        return 0;
    }

    private getNumbersOnlyScore(text: string): number {
        if (text) {
            // -n	
            const ratio = -1;
            if (this.isNumber(text)) {
                return this.getLength(text) * ratio;
            }
        }
        return 0;
    }

    private getConsecutiveUppercaseLettersScore(text: string): number {
        if (text) {
            let pattern = /[A-Z]+/g;
            let results = <RegExpMatchArray>text.match(pattern);
            if (!results) {
                return 0;
            }
            let score = 0;
            const ratio = -2;
            results.forEach((value, index) => {
                if (this.getLength(value) > 1) {
                    // -(n*2)	
                    score += (this.getLength(value) - 1)
                        /*There is no problem with a character, but the remaining repetition creates the problem.*/
                        * ratio;
                }
            });
            return score;

        }
        return 0;
    }
    private getConsecutiveLowercaseLettersScore(text: string): number {
        if (text) {
            let pattern = /[a-z]+/g;
            let results = <RegExpMatchArray>text.match(pattern);
            if (!results) {
                return 0;
            }
            let score = 0;
            const ratio = -2;
            results.forEach((value, index) => {
                if (this.getLength(value) > 1) {
                    // -(n*2)	
                    score += (this.getLength(value) - 1)
                        /*There is no problem with a character, but the remaining repetition creates the problem.*/
                        * ratio;
                }
            });
            return score;

        }
        return 0;
    }
    private getConsecutiveNumbersScore(text: string): number {
        if (text) {
            let pattern = /[0-9]+/g;
            let results = <RegExpMatchArray>text.match(pattern);
            if (!results) {
                return 0;
            }
            let score = 0;
            const ratio = -2;
            results.forEach((value, index) => {
                if (this.getLength(value) > 1) {
                    // -(n*2)	
                    score += (this.getLength(value) - 1)
                        /*There is no problem with a character, but the remaining repetition creates the problem.*/
                        * ratio;
                }
            });
            return score;

        }
        return 0;
    }
    private reverseString(str: string): string {
        return str.split("").reverse().join("");
    }

    private sequentialBuilder(text: string, minChunk: number): string[] {
        if (text) {
            let list: string[] = [];
            const len = text.split('').length - minChunk;
            for (let i = 0; i < len; i++) {
                for (let index = 0; index < len; index++) {
                    let newText = text.substring(index, text.length);
                    let arr = this.chunkString(newText, i + minChunk);
                    for (let j = 0; j < arr.length; j++) {
                        list.push(arr[j]);
                        list.push(this.reverseString(arr[j]));
                    }
                }
            }
            let result = this.distinctArray(this.sortByLength(list, minChunk));
            return result;
        }
        return [];
    }

    private distinctArray(arr: string[]): string[] {
        let a = [];
        for (let i = 0, l = arr.length; i < l; i++)
            if (a.indexOf(arr[i]) === -1 && arr[i] !== '')
                a.push(arr[i]);
        return a;
    }

    private sortByLength(arr: string[], limit?: number): string[] {
        arr.sort(function (a, b) {
            return b.length - a.length;
        });
        let list: string[] = [];
        for (let index = 0; index < arr.length; index++) {
            if (limit) {
                if (arr[index].length >= limit) {
                    list.push(arr[index]);
                }
            }
            else {
                list.push(arr[index]);
            }
        }
        return list;
    }

    private getSequentialLettersScore(text: string): number {
        const minChunk = 3;
        if (text) {
            const uStr = this.sequentialBuilder(this.uppercaseLetters, minChunk);
            const lStr = this.sequentialBuilder(this.lowercaseLetters, minChunk);
            let score: number = 0;
            let uTxt = text;
            let lTxt = text;
            uStr.forEach(value => {
                if (uTxt.indexOf(value) != -1) {
                    score += value.length - (minChunk - 1);
                    uTxt = uTxt.replace(value, "");
                }
            });
            lStr.forEach(value => {
                if (lTxt.indexOf(value) != -1) {
                    score += value.length - (minChunk - 1);
                    lTxt = lTxt.replace(value, "");
                }
            });
            // -(n*3)	
            const ratio = -3;
            return score * ratio;
        }
        return 0;
    }

    private getSequentialNumbersScore(text: string): number {
        const minChunk = 3;
        if (text) {
            const num = this.sequentialBuilder(this.numbers, minChunk);
            let score: number = 0;
            let txt = text;
            num.forEach(value => {
                if (txt.indexOf(value) != -1) {
                    score += value.length - (minChunk - 1);
                    txt = txt.replace(value, "");
                }
            });
            // -(n*3)	
            const ratio = -3;
            return score * ratio;
        }
        return 0;
    }

    private getSequentialSymbolsScore(text: string): number {
        const minChunk = 3;
        if (text) {
            const num = this.sequentialBuilder(this.symbols, minChunk);
            let score: number = 0;
            let txt = text;
            num.forEach(value => {
                if (txt.indexOf(value) != -1) {
                    score += value.length - (minChunk - 1);
                    txt = txt.replace(value, "");
                }
            });
            // -(n*3)	
            const ratio = -3;
            return score * ratio;
        }
        return 0;
    }

    private getRepeatCharactersScore(text: string): number {
        let pattern = /(.+)(?=.*?\1)/g;
        if (text) {
            let matches = <RegExpMatchArray>text.match(pattern);
            if (!matches) {
                return 0;
            }
            let maxResultLength = this.sortByLength(matches)[0].length;
            let ratio = 0;
            if (maxResultLength >= 1 && maxResultLength <= 5)
                ratio = -8
            if (maxResultLength >= 6 && maxResultLength <= 10)
                ratio = -5
            if (maxResultLength >= 11)
                ratio = -2
            // (-X * maxRegexResultLength) + (textLength - (maxRegexResultLength *2))
            let score = (ratio * maxResultLength) + (text.length - (maxResultLength * 2));
            return score;
        }
        return 0;
    }

    private getRequirementsScore(text: string): string[] {
        let req = this.requirements;
        let errors: string[] = [];
        if (req) {
            let minLengthMsg = "The minimum password length is " + req.minLength + ".";
            let maxLengthMsg = "The maximum password length is " + req.maxLength + ".";;
            let uppercaseLettersMinLengthMsg = "You must use at least " + req.uppercaseLettersMinLength + " uppercase letter(s).";
            let lowercaseLettersMinLengthMsg = "You must use at least " + req.uppercaseLettersMinLength + " lowercase letter(s).";
            let numbersMinLengthMsg = "You must use at least " + req.uppercaseLettersMinLength + " number(s).";
            let symbolsMinLengthMsg = "You must use at least " + req.uppercaseLettersMinLength + " symbol(s).";
            let mustBeMsg = "The Password must include all the items specified.";
            let mustNotBeMsg = "The password should not contain any of the items specified.";
            let startsWithMsg = "The password must start with " + req.startsWith + ".";
            let endsWithMsg = "The password must end with " + req.endsWith + ".";

            let upperCount = (text.match(/[A-Z]/g) || []).length;
            let lowerCount = (text.match(/[a-z]/g) || []).length;
            let numbersCount = (text.match(/[0-9]/g) || []).length;
            let symbolsCount = text.length - (upperCount + lowerCount + numbersCount);

            if (req.minLength) {
                let val: number;
                let msg = minLengthMsg;
                if (this.isIMessage(req.minLength)) {
                    val = <number>req.minLength.value;
                    msg = <string>req.minLength.message;
                }
                else {
                    val = <number>req.minLength;
                }
                if (req.minLength && text.length < val) {
                    errors.push(msg);
                }
            }
            if (req.maxLength) {
                let val: number;
                let msg = maxLengthMsg;
                if (this.isIMessage(req.maxLength)) {
                    val = <number>req.maxLength.value;
                    msg = <string>req.maxLength.message;
                }
                else {
                    val = <number>req.maxLength;
                }
                if (req.maxLength && text.length > val) {
                    errors.push(msg);
                }
            }
            if (req.startsWith) {
                let val: string;
                let msg = startsWithMsg;
                if (this.isIMessage(req.startsWith)) {
                    val = <string>req.startsWith.value;
                    msg = <string>req.startsWith.message;
                }
                else {
                    val = <string>req.startsWith;
                }
                if (!this.startsWith(text, val)) {
                    errors.push(msg);
                }
            }
            if (req.endsWith) {
                let val: string;
                let msg = endsWithMsg;
                if (this.isIMessage(req.endsWith)) {
                    val = <string>req.endsWith.value;
                    msg = <string>req.endsWith.message;
                }
                else {
                    val = <string>req.endsWith;
                }
                if (!this.endsWith(text, val)) {
                    errors.push(msg);
                }
            }

            if (req.uppercaseLettersMinLength) {
                let val: number;
                let msg = uppercaseLettersMinLengthMsg;
                if (this.isIMessage(req.uppercaseLettersMinLength)) {
                    val = <number>req.uppercaseLettersMinLength.value;
                    msg = <string>req.uppercaseLettersMinLength.message;
                }
                else {
                    val = <number>req.uppercaseLettersMinLength;
                }
                if (val > upperCount) {
                    errors.push(msg);
                }
            }

            if (req.lowercaseLettersMinLength) {
                let val: number;
                let msg = lowercaseLettersMinLengthMsg;
                if (this.isIMessage(req.lowercaseLettersMinLength)) {
                    val = <number>req.lowercaseLettersMinLength.value;
                    msg = <string>req.lowercaseLettersMinLength.message;
                }
                else {
                    val = <number>req.lowercaseLettersMinLength;
                }
                if (val > lowerCount) {
                    errors.push(msg);
                }
            }
            if (req.numbersMinLength) {
                let val: number;
                let msg = numbersMinLengthMsg;
                if (this.isIMessage(req.numbersMinLength)) {
                    val = <number>req.numbersMinLength.value;
                    msg = <string>req.numbersMinLength.message;
                }
                else {
                    val = <number>req.numbersMinLength;
                }
                if (val > numbersCount) {
                    errors.push(msg);
                }
            }
            if (req.symbolsMinLength) {
                let val: number;
                let msg = symbolsMinLengthMsg;
                if (this.isIMessage(req.symbolsMinLength)) {
                    val = <number>req.symbolsMinLength.value;
                    msg = <string>req.symbolsMinLength.message;
                }
                else {
                    val = <number>req.symbolsMinLength;
                }
                if (val > symbolsCount) {
                    errors.push(msg);
                }
            }
            if (req.mustBe) {
                let val: string[];
                let msg = mustBeMsg;
                if (this.isIMessage(req.mustBe)) {
                    val = <string[]>req.mustBe.value;
                    msg = <string>req.mustBe.message;
                }
                else {
                    val = <string[]>req.mustBe;
                }
                if (!this.contains(text, val)) {
                    errors.push(msg);
                }
            }
            if (req.mustNotBe) {
                let val: string[];
                let msg = mustNotBeMsg;
                if (this.isIMessage(req.mustNotBe)) {
                    val = <string[]>req.mustNotBe.value;
                    msg = <string>req.mustNotBe.message;
                }
                else {
                    val = <string[]>req.mustNotBe;
                }
                if (!this.doesNotContains(text, val)) {
                    errors.push(msg);
                }
            }
            return errors;
        }
        return [];
    }


    public getScores(passwords: string[]): IResult[] {
        let results = [];
        if (passwords && passwords.length > 0) {
            for (let index = 0; index < passwords.length; index++) {
                results.push(this.getScore(passwords[index]));
            }
            return results;
        }
        return [];
    }

    public getScore(password: string): IResult {

        if (password) {
            // Requirements
            let req = this.getRequirementsScore(password);
            if (req.length != 0) {
                return {
                    "score": -1,
                    "status": "needs requirement(s)",
                    "errors": req
                }
            }
            // Additions
            let len = this.getLengthScore(password);
            let upper = this.getUppercaseLettersScore(password);
            let lower = this.getLowercaseLettersScore(password);
            let num = this.getNumbersScore(password);
            let symbol = this.getSymbolsScore(password);
            // Deductions
            let letterOnly = this.getLettersOnlyScore(password);
            let numberOnly = this.getNumbersOnlyScore(password);
            let repetition = this.getRepeatCharactersScore(password);
            let consecutiveUpper = this.getConsecutiveUppercaseLettersScore(password);
            let consecutiveLower = this.getConsecutiveLowercaseLettersScore(password);
            let consecutiveNumber = this.getConsecutiveNumbersScore(password);
            let seqLetters = this.getSequentialLettersScore(password);
            let seqNumbers = this.getSequentialNumbersScore(password);
            let seqSymbols = this.getSequentialSymbolsScore(password);

            let score = len + upper + lower + num + symbol + letterOnly
                + numberOnly + repetition + consecutiveUpper + consecutiveLower
                + consecutiveNumber + seqLetters + seqNumbers + seqSymbols;


            let stat = "";
            if (this.scoreRange && this.scoreRange.veryWeak) {
                if (score >= 1 && score < this.scoreRange.veryWeak)
                    stat = "very weak";
            }
            else {
                if (score >= 1 && score < 40)
                    stat = "very weak";
            }
            if (this.scoreRange && this.scoreRange.veryWeak && this.scoreRange.weak) {
                if (score >= this.scoreRange.veryWeak && score < this.scoreRange.weak)
                    stat = "weak";
            }
            else {
                if (score >= 40 && score < 80)
                    stat = "weak";
            }
            if (this.scoreRange && this.scoreRange.weak && this.scoreRange.medium) {
                if (score >= this.scoreRange.weak && score < this.scoreRange.medium)
                    stat = "medium";
            }
            else {
                if (score >= 80 && score < 120)
                    stat = "medium";
            }
            if (this.scoreRange && this.scoreRange.medium && this.scoreRange.strong) {
                if (score >= this.scoreRange.medium && score < this.scoreRange.strong)
                    stat = "strong";
            }
            else {
                if (score >= 120 && score < 180)
                    stat = "strong";
            }
            if (this.scoreRange && this.scoreRange.veryStrong) {
                if (score >= 180)
                    stat = "very strong";
            }
            else {
                if (score >= 180)
                    stat = "very strong";
            }
            return {
                "score": score,
                "status": stat

            }
        }
        return { "score": 0, "status": "Empty" };
    }
}

console.log(JSON.stringify(new PasswordMeter({
    minLength: { value: 5, message: "Hey!, check minLength" },
    maxLength: { value: 10, message: "Hey!, check maxLength" },
    uppercaseLettersMinLength: { value: 1, message: "Hey!, check uppercaseLettersMinLength" },
    lowercaseLettersMinLength: { value: 2, message: "Hey!, check lowercaseLettersMinLength" },
    numbersMinLength: { value: 1, message: "Hey!, check numbersMinLength" },
    symbolsMinLength: { value: 1, message: "Hey!, check symbolsMinLength" },
    mustBe: { value: ['a', '$'], message: "Hey!, check mustBe" },
    mustNotBe: { value: ['1baA$', '0xaZ$'], message: "Hey!, check mustNotBe" },
    startsWith: { value: '1', message: "Hey!, check startsWith" },
    endsWith: { value: '$', message: "Hey!, check endsWith" }
}, {
        veryWeak: 40,    // 1>=   , <40
        weak: 80,        // 40>=  , <80
        medium: 120,     // 80>=  , <120
        strong: 180,     // 120>= , <200
        veryStrong: 200  // 200>=
    }).getScores(['1baAe$', '0xaZ$', 'ERT', '1pwQvF@87$', '12a4A6rx90$'])));