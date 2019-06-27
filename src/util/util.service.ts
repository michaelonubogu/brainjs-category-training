import { Injectable } from '@nestjs/common';

@Injectable()
export class UtilService {
    public static setInputLengthToLimit(input: number[], maxLengthInput: number) {
        while (input.length < maxLengthInput) {
            input.push(0);
        }

        return input;
    }

    /**
     * tokenizes a string and returns the numbered array
     * @param text
     * @return { number[] } the tokenized array of numbers
     */
    public static tokenizeString(text: string): number[] {
        return text.split('').map(x => (x.charCodeAt(0) / 256));
    }

    /**
     * de-tokenizes a number array and returns the original string
     * @param { number[] } tokenArray the tokenized string (number) array
     * @return { string } the original string
     */
    public static deTokenizeArray(tokenArray: number[]): string {
        return tokenArray.reduce((acc, curr) => `${acc}${String.fromCharCode((curr * 256))}`, '');
    }
}
