export type RiskLevel = 'low' | 'medium' | 'high';
export type RiskCategory = 'overconfidence' | 'fomo' | 'loss_behavior' | 'sunk_cost';

export interface RiskPatternDetails {
    actual: number;
    limit: number;
    ratio: number;
    components?: Array<{
        pattern_id: string;
        internal_id: string;
        pattern_type: string;
        severity: number;
    }>;
}

export interface CategoryWeights {
    overconfidence: number;
    fomo: number;
    loss_behavior: number;
    sunk_cost: number;
}

export interface RiskPattern {
    message: string;
    description?: string;
    details: RiskPatternDetails;
    unique: boolean;
    severity: number;
    confidence?: number;
    consumed: boolean;
    pattern_id: string;
    job_id: number[] | null;
    positions: any[] | null;
    category_weights: CategoryWeights;
    start_time: string;
    end_time: string | null;
    show_if_not_consumed: boolean;
    is_composite: boolean;
    ttl_minutes: number;
    internal_id: string;
}

export interface RiskReport {
    patterns: RiskPattern[];
    timestamp: string;
    event_type: 'RiskReport';
    user_id: number;
    top_risk_level: RiskLevel;
    top_risk_confidence: number;
    top_risk_type: RiskCategory;
    category_scores: Record<RiskCategory, number>;
    composite_patterns: RiskPattern[];
    atomic_patterns_number: number;
    composite_patterns_number: number;
    consumed_patterns_number: number;
} 