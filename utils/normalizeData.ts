type CaseType = 'camel' | 'snake';

/**
 * Converts a string between camelCase and snake_case
 */
function convertCase(str: string, targetCase: CaseType): string {
    if (targetCase === 'camel') {
        return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    } else {
        return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    }
}

/**
 * Converts snake_case into normal text (Snake case) or (Snake Case)
 * @param str The string to convert
 * @param options Optional formatting options: capitalize, capitalizeFirst
 * capitalize: If true, capitalizes all words (e.g., "Snake Case")
 * capitalizeFirst: If true, capitalizes only the first word (e.g., "Snake case")
 * @return The formatted string
 */
export function formatSnakeCase(str: string, options?: { capitalize?: boolean; capitalizeFirst?: boolean }): string {
    const words = str.split('_').map(word => word.toLowerCase());

    if (options?.capitalize) {
        return words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    if (options?.capitalizeFirst) {
        return [words[0].charAt(0).toUpperCase() + words[0].slice(1), ...words.slice(1)].join(' ');
    }

    return words.join(' ');
}

/**
 * Recursively converts object keys between camelCase and snake_case
 */
function convertObjectKeys(obj: any, targetCase: CaseType): any {
    if (Array.isArray(obj)) {
        return obj.map(item => convertObjectKeys(item, targetCase));
    }

    if (obj !== null && typeof obj === 'object') {
        return Object.entries(obj).reduce((acc, [key, value]) => {
            const newKey = convertCase(key, targetCase);
            acc[newKey] = convertObjectKeys(value, targetCase);
            return acc;
        }, {} as Record<string, any>);
    }

    return obj;
}

/**
 * Normalizes data according to a type definition
 * @param data The data to normalize
 * @param type The type definition to match
 * @param preferredCase The preferred case style ('camel' or 'snake')
 * @returns Normalized data matching the type definition
 */
export function normalizeData<T extends object>(
    data: any,
    type: T,
    preferredCase: CaseType = 'camel'
): T {
    // First convert all keys to the preferred case
    const normalizedData = convertObjectKeys(data, preferredCase);

    // Create a new object with the same structure as the type
    const result = {} as T;

    // Copy values from normalized data to result, using type's keys
    Object.keys(type).forEach(key => {
        const normalizedKey = convertCase(key, preferredCase);
        result[key as keyof T] = normalizedData[normalizedKey] ?? null;
    });

    return result;
}

/**
 * Type guard to check if a value is an object
 */
function isObject(value: any): value is object {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Creates a type-safe normalizer function for a specific type
 * @param type The type definition to match
 * @param preferredCase The preferred case style ('camel' or 'snake')
 * @returns A function that normalizes data to match the type
 */
export function createNormalizer<T extends object>(
    type: T,
    preferredCase: CaseType = 'camel'
) {
    return (data: any): T => normalizeData(data, type, preferredCase);
}