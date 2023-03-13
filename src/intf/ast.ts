import type { AcornNode } from 'rollup'
// extend the descriptor so we can store the scopeId on it
declare module 'rollup' {
    interface AcornNode {
        id: string
    }
}

export { AcornNode } from 'rollup'
export interface AcronNodeRoot extends AcornNode {
    body: Array<AcornNode>
}
