import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RiskReport, RiskPattern, RiskLevel, RiskCategory } from '@/types/risk';

export interface RiskState {
    patterns: RiskPattern[];
    lastUpdated: string;
    topRiskLevel: RiskLevel;
    topRiskConfidence: number;
    topRiskType: RiskCategory;
    categoryScores: Record<RiskCategory, number>;
    atomicPatternsCount: number;
    compositePatternsCount: number;
    consumedPatternsCount: number;
}

const initialState: RiskState = {
    patterns: [],
    lastUpdated: '',
    topRiskLevel: 'low',
    topRiskConfidence: 0,
    topRiskType: 'overconfidence',
    categoryScores: {
        overconfidence: 0,
        fomo: 0,
        loss_behavior: 0,
        sunk_cost: 0
    },
    atomicPatternsCount: 0,
    compositePatternsCount: 0,
    consumedPatternsCount: 0
};

const riskSlice = createSlice({
    name: 'risk',
    initialState,
    reducers: {
        updateRiskReport: (state, action: PayloadAction<RiskReport>) => {
            const {
                patterns,
                timestamp,
                top_risk_level,
                top_risk_confidence,
                top_risk_type,
                category_scores,
                atomic_patterns_number,
                composite_patterns_number,
                consumed_patterns_number
            } = action.payload;

            state.patterns = patterns;
            state.lastUpdated = timestamp;
            state.topRiskLevel = top_risk_level;
            state.topRiskConfidence = top_risk_confidence;
            state.topRiskType = top_risk_type;
            state.categoryScores = category_scores;
            state.atomicPatternsCount = atomic_patterns_number;
            state.compositePatternsCount = composite_patterns_number;
            state.consumedPatternsCount = consumed_patterns_number;
        },
        clearRiskReport: (state) => {
            return initialState;
        },
        updatePatternConsumed: (state, action: PayloadAction<{ patternId: string; consumed: boolean }>) => {
            const { patternId, consumed } = action.payload;
            const pattern = state.patterns.find(p => p.internal_id === patternId);
            if (pattern) {
                pattern.consumed = consumed;
                if (consumed) {
                    state.consumedPatternsCount += 1;
                } else {
                    state.consumedPatternsCount = Math.max(0, state.consumedPatternsCount - 1);
                }
            }
        }
    }
});

export const { updateRiskReport, clearRiskReport, updatePatternConsumed } = riskSlice.actions;
export default riskSlice.reducer; 