
/**
 * Convert TypeScript Date object to a MySQL DATETIME string.
 *
 * @example
 * ```typescript
 * dateToSQLDate(new Date());
 * ```
 *
 * @param date - The Date object to convert
 * @returns String in 'YYYY-MM-DD hh:mm:ss' format.
 */
export function dateToSQLDate(date: Date): string {
    // calling ISOString on Date object here may be a bug, check here if client dates do not align with database!!!
    return date.toISOString().slice(0, 19).replace('T', ' ')
}
