export const getRiskColor = (severity: number): string => {
    if (severity >= 0.9) return '#EF4444';
    if (severity >= 0.7) return '#F97316';
    if (severity >= 0.3) return '#EAB308';
    if (severity > 0) return '#22C55E';
    return '#6B7280';
};

export const getRiskColorWithAlpha = (severity: number, alpha: number = 0.2): string => {
    const color = getRiskColor(severity);
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}; 