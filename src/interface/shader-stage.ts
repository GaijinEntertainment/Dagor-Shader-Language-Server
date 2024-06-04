export enum ShaderStage {
    VERTEX = 'VERTEX',
    HULL = 'HULL',
    DOMAIN = 'DOMAIN',
    GEOMETRY = 'GEOMETRY',
    PIXEL = 'PIXEL',
    COMPUTE = 'COMPUTE',
    MESH = 'MESH',
    AMPLIFICATION = 'AMPLIFICATION',
}

export function shaderStageKeywordToEnum(stage: string): ShaderStage | null {
    switch (stage) {
        case 'vs':
            return ShaderStage.VERTEX;
        case 'hs':
            return ShaderStage.HULL;
        case 'ds':
            return ShaderStage.DOMAIN;
        case 'gs':
            return ShaderStage.GEOMETRY;
        case 'ps':
            return ShaderStage.PIXEL;
        case 'cs':
            return ShaderStage.COMPUTE;
        case 'ms':
            return ShaderStage.MESH;
        case 'as':
            return ShaderStage.AMPLIFICATION;
        default:
            return null;
    }
}
