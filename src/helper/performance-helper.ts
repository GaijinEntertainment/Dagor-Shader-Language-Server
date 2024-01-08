import { DocumentUri } from 'vscode-languageserver';

import { collectAndLogPerformance, log } from '../core/debug';

export class PerformanceHelper {
    private static lastId = 0;

    private id = ++PerformanceHelper.lastId;
    private uri: DocumentUri;

    public constructor(uri: DocumentUri = '') {
        this.uri = uri;
    }

    public static now(): number {
        return performance.now();
    }

    public start(name: string): void {
        if (!collectAndLogPerformance) {
            return;
        }
        performance.mark(`[${name}] start ${this.id}`);
    }

    public end(name: string): void {
        if (!collectAndLogPerformance) {
            return;
        }
        performance.mark(`[${name}] end ${this.id}`);
        performance.measure(
            `[${name}] ${this.id}`,
            `[${name}] start ${this.id}`,
            `[${name}] end ${this.id}`
        );
    }

    public getLast(name: string): number {
        if (!collectAndLogPerformance) {
            return 0;
        }
        const entries = performance.getEntriesByName(`[${name}] ${this.id}`);
        if (!entries.length) {
            return 0;
        }
        return entries[entries.length - 1].duration;
    }

    public static getGlobalLast(name: string): number {
        if (!collectAndLogPerformance) {
            return 0;
        }
        const entries = performance
            .getEntriesByType('measure')
            .filter((e) => e.name.startsWith(`[${name}]`));
        if (!entries.length) {
            return 0;
        }
        return entries[entries.length - 1].duration;
    }

    public getAverage(name: string): number {
        if (!collectAndLogPerformance) {
            return 0;
        }
        const entries = performance
            .getEntriesByName(`[${name}] ${this.id}`, 'measure')
            .map((e) => e.duration);
        return entries.reduce((prev, curr) => prev + curr, 0) / entries.length;
    }

    public static getGlobalAverage(name: string): number {
        if (!collectAndLogPerformance) {
            return 0;
        }
        const entries = performance
            .getEntriesByType('measure')
            .filter((e) => e.name.startsWith(`[${name}]`))
            .map((e) => e.duration);
        return entries.reduce((prev, curr) => prev + curr, 0) / entries.length;
    }

    public static getGlobalSum(name: string): number {
        if (!collectAndLogPerformance) {
            return 0;
        }
        return performance
            .getEntriesByType('measure')
            .filter((e) => e.name.startsWith(`[${name}]`))
            .map((e) => e.duration)
            .reduce((prev, curr) => prev + curr, 0);
    }

    public log(displayName: string, name: string): void {
        if (!collectAndLogPerformance) {
            return;
        }
        log(
            `${displayName}: ${this.getLast(name).toFixed(
                3
            )} ms (average: ${PerformanceHelper.getGlobalAverage(name).toFixed(
                3
            )} ms)          ${this.uri}`
        );
    }

    public clear(name: string): void {
        if (!collectAndLogPerformance) {
            return;
        }
        performance.clearMarks(`[${name}] start ${this.id}`);
        performance.clearMarks(`[${name}] end ${this.id}`);
        performance.clearMeasures(`[${name}] ${this.id}`);
    }
}
