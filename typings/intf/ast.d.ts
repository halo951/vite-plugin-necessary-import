import type { AcornNode } from 'rollup';
declare module 'rollup' {
    interface AcornNode {
        id: string;
    }
}
export { AcornNode } from 'rollup';
export interface AcronNodeRoot extends AcornNode {
    body: Array<AcornNode>;
}
