'use client';

import { useAutomation } from '@/features/automation/hooks/useAutomation';
import { RuleEditor } from '@/features/automation/components/RuleEditor';
import { useState } from 'react';
import { Rule } from '@/features/automation/types/automation.types';

// New Sub-components
import { AutomationDashboardHeader } from '@/features/automation/components/automation-dashboard/AutomationDashboardHeader';
import { AutomationDashboardMacros } from '@/features/automation/components/automation-dashboard/AutomationDashboardMacros';
import { AutomationDashboardTabs } from '@/features/automation/components/automation-dashboard/AutomationDashboardTabs';
import { AutomationDashboardSidebar } from '@/features/automation/components/automation-dashboard/AutomationDashboardSidebar';

interface Props {
    productionId: string;
}

export const AutomationDashboard = ({ productionId }: Props) => {
    const {
        rules,
        logs,
        isLoading,
        createRule,
        updateRule,
        toggleRule,
        deleteRule,
        triggerRule,
    } = useAutomation(productionId);

    const manualMacros = rules.filter(r =>
        r.isEnabled && r.triggers.some(t => t.eventType === 'manual.trigger')
    );

    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingRule, setEditingRule] = useState<Rule | undefined>();
    const [activeTab, setActiveTab] = useState<'rules' | 'history' | 'hardware'>('rules');

    const handleCreate = () => {
        setEditingRule(undefined);
        setIsEditorOpen(true);
    };

    const handleEdit = (rule: Rule) => {
        setEditingRule(rule);
        setIsEditorOpen(true);
    };

    return (
        <div className="space-y-8 pb-20">
            <AutomationDashboardHeader onCreateRule={handleCreate} />

            <AutomationDashboardMacros
                macros={manualMacros}
                onTrigger={triggerRule}
            />

            <div className="grid grid-cols-1 min-[1200px]:grid-cols-12 gap-8 items-start">
                <div className="min-[1200px]:col-span-8 min-[1440px]:col-span-9 space-y-8">
                    <AutomationDashboardTabs
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        rules={rules}
                        logs={logs}
                        isLoading={isLoading}
                        productionId={productionId}
                        onEditRule={handleEdit}
                        onDeleteRule={deleteRule}
                        onToggleRule={(id, isEnabled) => toggleRule({ id, isEnabled })}
                    />
                </div>

                <div className="hidden min-[1200px]:block min-[1200px]:col-span-4 min-[1440px]:col-span-3 space-y-8">
                    <AutomationDashboardSidebar logs={logs} isLoading={isLoading} />
                </div>
            </div>

            <RuleEditor
                productionId={productionId}
                isOpen={isEditorOpen}
                onClose={() => setIsEditorOpen(false)}
                onSave={async (dto) => {
                    if (editingRule) {
                        await updateRule({ id: editingRule.id, dto });
                    } else {
                        await createRule(dto);
                    }
                    setIsEditorOpen(false);
                }}
                editingRule={editingRule}
            />
        </div>
    );
};
