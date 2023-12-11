export interface DefineStatement {
    position: number;
    objectLike: boolean;
    name: string;
    parameters: string[];
    content: string;
    undefPosition: number | null;
}
