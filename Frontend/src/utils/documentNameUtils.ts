/**
 * Utility functions for handling document names
 */

/**
 * Truncates a document name if it exceeds the specified length
 * @param name - The original document name
 * @param maxLength - Maximum allowed length (default: 50)
 * @returns Truncated name with ellipsis if it was truncated
 */
export const truncateDocumentName = (name: string, maxLength: number = 30): string => {
    if (!name) return '';

    if (name.length <= maxLength) {
        return name;
    }

    // Find the last dot to preserve file extension
    const lastDotIndex = name.lastIndexOf('.');

    if (lastDotIndex === -1) {
        // No extension, just truncate
        return name.substring(0, maxLength - 3) + '...';
    }

    const extension = name.substring(lastDotIndex);
    const nameWithoutExtension = name.substring(0, lastDotIndex);

    // Calculate available space for the name part (accounting for extension and ellipsis)
    const availableLength = maxLength - extension.length - 3; // 3 for '...'

    if (availableLength <= 0) {
        // Extension is too long, just truncate the whole thing
        return name.substring(0, maxLength - 3) + '...';
    }

    return nameWithoutExtension.substring(0, availableLength) + '...' + extension;
};

/**
 * Gets the appropriate max length based on the display context
 * @param context - The UI context where the name will be displayed
 * @returns Recommended max length for the context
 */
export const getMaxLengthForContext = (context: 'list' | 'header' | 'card' | 'compact'): number => {
    switch (context) {
        case 'header':
            return 50; // More space in headers but still reasonable
        case 'card':
            return 35; // Card views need moderate truncation
        case 'list':
            return 30; // List views get more aggressive truncation to prevent layout issues
        case 'compact':
            return 20; // Compact views need very aggressive truncation
        default:
            return 30;
    }
};

/**
 * Smart truncation that considers word boundaries when possible
 * @param name - The original document name
 * @param maxLength - Maximum allowed length
 * @returns Truncated name respecting word boundaries when possible
 */
export const smartTruncateDocumentName = (name: string, maxLength: number = 50): string => {
    if (!name || name.length <= maxLength) {
        return name;
    }

    // Try to truncate at word boundaries first
    const words = name.split(/[\s\-_]/);
    if (words.length > 1) {
        let result = '';
        for (const word of words) {
            const potential = result ? `${result} ${word}` : word;
            if (potential.length <= maxLength - 3) {
                result = potential;
            } else {
                break;
            }
        }

        if (result && result.length > 10) { // Only use word boundary if we got a reasonable length
            return result + '...';
        }
    }

    // Fall back to character truncation
    return truncateDocumentName(name, maxLength);
};

/**
 * Gets responsive max length based on both context and estimated screen size
 * @param context - The UI context where the name will be displayed
 * @param screenSize - Estimated screen size ('mobile' | 'tablet' | 'desktop')
 * @returns Recommended max length for the context and screen size
 */
export const getResponsiveMaxLength = (
    context: 'list' | 'header' | 'card' | 'compact',
    screenSize: 'mobile' | 'tablet' | 'desktop' = 'desktop'
): number => {
    const baseLength = getMaxLengthForContext(context);

    switch (screenSize) {
        case 'mobile':
            return Math.floor(baseLength * 0.6); // 60% of base length for mobile
        case 'tablet':
            return Math.floor(baseLength * 0.8); // 80% of base length for tablet
        case 'desktop':
        default:
            return baseLength;
    }
};

/**
 * Detects screen size category based on window width
 * @returns Screen size category
 */
export const detectScreenSize = (): 'mobile' | 'tablet' | 'desktop' => {
    if (typeof window === 'undefined') return 'desktop';

    const width = window.innerWidth;
    if (width < 640) return 'mobile';    // sm breakpoint
    if (width < 1024) return 'tablet';   // lg breakpoint
    return 'desktop';
};

/**
 * Quick truncation specifically for upload sections to prevent UI overflow
 * @param name - The original document name
 * @returns Truncated name optimized for upload displays
 */
export const truncateUploadName = (name: string): string => {
    if (!name) return '';

    // For upload sections, use a conservative 25 character limit
    return truncateDocumentName(name, 25);
};
