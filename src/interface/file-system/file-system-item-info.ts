export interface FileSystemItemInfo {
    name: string;
    isDirectory(): boolean;
    isFile(): boolean;
}
