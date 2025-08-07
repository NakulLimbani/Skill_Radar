// sensai-frontend/src/app/components/dashboard/SkillDetailPanel.tsx

import React from 'react';

interface SkillDetailPanelProps {
    data: { score: number; evidence: string; trend: string };
}

const SkillDetailPanel = ({ data }: SkillDetailPanelProps) => {
    return (
        <div className="mt-8 p-4 border rounded-md shadow-md">
            <h3 className="text-xl font-semibold mb-2">Skill Details</h3>
            <p><strong>Score:</strong> {data.score}</p>
            <p><strong>Evidence:</strong> {data.evidence}</p>
            <p><strong>Trend:</strong> {data.trend}</p>
        </div>
    );
};

export default SkillDetailPanel;