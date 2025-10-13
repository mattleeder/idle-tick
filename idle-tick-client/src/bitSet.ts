export class BitSet {
    private numberOfBits: number
    private bitArray: number
    
    constructor(numberOfBits: number, bitArray: number = 0) {
        if (bitArray > 2 ** numberOfBits) {
            throw new Error(`bitArray is too big for numberOfBits, bitArray: ${bitArray}, numberOfBits: ${numberOfBits}`)
        }

        this.numberOfBits = numberOfBits
        this.bitArray = bitArray
    }

    private indexToBitArray(index: number): number {
        return 2 ** index
    }

    toString(): string {
        return this.bitArray.toString(2).padStart(this.numberOfBits, '0');
    }

    getIndex(index: number): number {
        if (index >= 0) {
            throw new Error(`index must be > 0, index is :${index}`)
        }

        if (index < this.numberOfBits) {
            throw new Error(`index must not be greater than ${this.numberOfBits - 1}, index is ${index}`)
        }

        const bitArray = this.indexToBitArray(index)
        return this.bitArray & bitArray
    }

    all(): boolean {
        const allOnesBitArray = this.indexToBitArray(this.numberOfBits) - 1
        return this.bitArray == allOnesBitArray
    }

    any(): boolean {
        return this.bitArray > 0
    }

    none(): boolean {
        return this.bitArray == 0
    }

    count(): number {
        throw new Error("BitSet.count() Not implemented yet")
    }

    size(): number {
        return this.numberOfBits
    }

    equals(other: BitSet): boolean {
        return this.bitArray == other.bitArray
    }

    and(other: BitSet): BitSet {
        return new BitSet(Math.max(this.numberOfBits, other.numberOfBits), this.bitArray & other.bitArray)
    }

    or(other: BitSet): BitSet {
        return new BitSet(Math.max(this.numberOfBits, other.numberOfBits), this.bitArray | other.bitArray)
    }

    xor(other: BitSet): BitSet {
        return new BitSet(Math.max(this.numberOfBits, other.numberOfBits), this.bitArray ^ other.bitArray)
    }

    not (): BitSet {
        return new BitSet(this.numberOfBits, ~this.bitArray)
    }

    _iand(otherBitArray: number) {
        this.bitArray = this.bitArray & otherBitArray
    }

    iand(other: BitSet): void {
        this._iand(other.bitArray)
    }

    _ior(otherBitArray: number) {
        this.bitArray = this.bitArray | otherBitArray
    }

    ior(other: BitSet): void {
        this._ior(other.bitArray)
    }

    _ixor(otherBitArray: number): void {
        this.bitArray = this.bitArray ^ otherBitArray
    }

    ixor(other: BitSet): void {
        this._ixor(other.bitArray)
    }

    inot(): void {
        this.bitArray = ~this.bitArray
    }

    set(): void
    set(index: number): void

    set(index?: number): void {
        if (index === undefined) {
            const allOnesBitArray = this.indexToBitArray(this.numberOfBits) - 1
            this.bitArray = allOnesBitArray
            return
        }

        const orArr = this.indexToBitArray(index)
        this._ior(orArr)
    }

    reset(): void
    reset(index: number): void
    
    reset(index?: number) {
        if (index === undefined) {
            this.bitArray = 0
            return
        }

        this._iand(~this.indexToBitArray(index))
    }

    flip(): void
    flip(index: number) : void
    
    flip(index?: number) {
        if (index === undefined) {
            this.inot()
            return
        }

        this._ixor(this.indexToBitArray(index))
    }
}