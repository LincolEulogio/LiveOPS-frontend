'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Rule } from '@/features/automation/types/automation.types';
import { Zap, Play, Clock, Monitor, Radio, Bell } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSocket } from '@/shared/socket/socket.provider';
import { intercomService } from '@/features/intercom/api/intercom.service';
import { productionsService } from '@/features/productions/api/productions.service';
import { motion } from 'framer-motion';

// New Sub-components
import { RuleEditorHeader } from '@/features/automation/components/rule-editor/RuleEditorHeader';
import { RuleEditorCanvas } from '@/features/automation/components/rule-editor/RuleEditorCanvas';
import { RuleEditorInspector } from '@/features/automation/components/rule-editor/RuleEditorInspector';
import { RuleEditorFooter } from '@/features/automation/components/rule-editor/RuleEditorFooter';

const ruleSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    isEnabled: z.boolean().optional(),
    triggers: z.array(z.object({
        eventType: z.string().min(1, 'Event type is required'),
        condition: z.any().optional(),
    })).min(1, 'At least one trigger is required'),
    actions: z.array(z.object({
        actionType: z.string().min(1, 'Action type is required'),
        payload: z.any().optional(),
        order: z.number().optional(),
    })).min(1, 'At least one action is required'),
});

type FormValues = z.infer<typeof ruleSchema>;

interface Props {
    productionId: string;
    isOpen: boolean;
    onClose: () => void;
    onSave: (dto: any) => Promise<void>;
    editingRule?: Rule;
}

const EVENT_TYPES = [
    { value: 'manual.trigger', label: 'Manual: Trigger as Macro', icon: Play, color: 'text-indigo-400 bg-indigo-500/10' },
    { value: 'timeline.block.started', label: 'Timeline: Block started', icon: Zap, color: 'text-amber-400 bg-amber-500/10' },
    { value: 'timeline.before_end', label: 'Time: Before block ends', icon: Clock, color: 'text-emerald-400 bg-emerald-500/10' },
    { value: 'timeline.updated', label: 'Timeline: Any update', icon: Zap, color: 'text-amber-400 bg-amber-500/10' },
    { value: 'obs.scene.changed', label: 'OBS: Scene Changed', icon: Monitor, color: 'text-blue-400 bg-blue-500/10' },
    { value: 'obs.stream.state', label: 'OBS: Stream State', icon: Radio, color: 'text-red-400 bg-red-500/10' },
    { value: 'vmix.input.changed', label: 'vMix: Input Changed', icon: Monitor, color: 'text-blue-400 bg-blue-500/10' },
];

const ACTION_TYPES = [
    { value: 'intercom.send', label: 'Alert: Send Intercom', icon: Bell, color: 'text-emerald-400 border-emerald-500/50 bg-emerald-500/10' },
    { value: 'obs.changeScene', label: 'OBS: Change Scene', icon: Monitor, color: 'text-blue-400 border-blue-500/50 bg-blue-500/10' },
    { value: 'vmix.cut', label: 'vMix: Cut', icon: Zap, color: 'text-amber-400 border-amber-500/50 bg-amber-500/10' },
    { value: 'vmix.fade', label: 'vMix: Fade', icon: Zap, color: 'text-amber-400 border-amber-500/50 bg-amber-500/10' },
    { value: 'webhook.call', label: 'HTTP: Call Webhook', icon: Zap, color: 'text-fuchsia-400 border-fuchsia-500/50 bg-fuchsia-500/10' },
];

export const RuleEditor = ({ productionId, isOpen, onClose, onSave, editingRule }: Props) => {
    const { socket } = useSocket();
    const [activeNodeIndex, setActiveNodeIndex] = useState<number | null>(null);

    // Fetch dependencies
    const { data: templates = [] } = useQuery({
        queryKey: ['intercom-templates', productionId],
        queryFn: () => intercomService.getTemplates(productionId),
        enabled: isOpen,
    });

    const { data: production } = useQuery({
        queryKey: ['production', productionId],
        queryFn: () => productionsService.getProduction(productionId),
        enabled: isOpen,
    });

    const roles = useMemo(() => {
        if (!production?.users) return [];
        const uniqueRoles = new Map();
        production.users.forEach(u => {
            if (u.role) uniqueRoles.set(u.role.id, u.role.name);
        });
        return Array.from(uniqueRoles.entries()).map(([id, name]) => ({ id, name }));
    }, [production]);

    const {
        register,
        control,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        resolver: zodResolver(ruleSchema),
        defaultValues: {
            name: '',
            description: '',
            isEnabled: true,
            triggers: [{ eventType: 'timeline.before_end', condition: { secondsBefore: 30 } }],
            actions: [{ actionType: 'intercom.send', order: 0, payload: { requiresAck: true } }],
        },
    });

    const { fields: triggerFields, append: appendTrigger, remove: removeTrigger } = useFieldArray({
        control,
        name: 'triggers',
    });

    const { fields: actionFields, append: appendAction, remove: removeAction } = useFieldArray({
        control,
        name: 'actions',
    });

    const watchedTriggers = watch('triggers');
    const watchedActions = watch('actions');

    useEffect(() => {
        if (editingRule && isOpen) {
            reset({
                name: editingRule.name,
                description: editingRule.description || '',
                isEnabled: editingRule.isEnabled,
                triggers: editingRule.triggers.map(t => ({ eventType: t.eventType, condition: t.condition || {} })),
                actions: editingRule.actions.map(a => ({ actionType: a.actionType, payload: a.payload || {}, order: a.order })),
            });
        } else if (!editingRule && isOpen) {
            reset({
                name: '',
                description: '',
                isEnabled: true,
                triggers: [{ eventType: 'timeline.before_end', condition: { secondsBefore: 30 } }],
                actions: [{ actionType: 'intercom.send', order: 0, payload: { requiresAck: true } }],
            });
        }
    }, [editingRule, reset, isOpen]);

    const handleTest = async () => {
        const values = watch();
        if (!socket) return;
        socket.emit('rule.test', {
            productionId,
            rule: {
                ...values,
                id: editingRule?.id || 'new-rule-test',
            }
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-6 lg:p-12 overflow-hidden">
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-background/80 backdrop-blur-xl"
                onClick={onClose}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 40 }}
                className="relative w-full h-full md:h-auto md:max-h-[80vh] max-w-[1400px] bg-card-bg/60 backdrop-blur-2xl border border-card-border md:rounded-[3rem]  overflow-hidden flex flex-col"
            >
                {/* Visual Header Decoration */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />

                <RuleEditorHeader
                    editingRule={editingRule}
                    productionId={productionId}
                    onClose={onClose}
                />

                <form onSubmit={handleSubmit(onSave)} className="flex-1 overflow-hidden flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-card-border/50 bg-background/20 relative z-10">
                    <RuleEditorCanvas
                        triggerFields={triggerFields}
                        actionFields={actionFields}
                        watchedTriggers={watchedTriggers}
                        watchedActions={watchedActions}
                        activeNodeIndex={activeNodeIndex}
                        setActiveNodeIndex={setActiveNodeIndex}
                        removeTrigger={removeTrigger}
                        removeAction={removeAction}
                        appendAction={appendAction}
                        EVENT_TYPES={EVENT_TYPES}
                        ACTION_TYPES={ACTION_TYPES}
                    />

                    <RuleEditorInspector
                        register={register}
                        errors={errors}
                        watchedTriggers={watchedTriggers}
                        watchedActions={watchedActions}
                        activeNodeIndex={activeNodeIndex}
                        EVENT_TYPES={EVENT_TYPES}
                        ACTION_TYPES={ACTION_TYPES}
                        triggerFields={triggerFields}
                        templates={templates}
                        roles={roles}
                    />
                </form>

                <RuleEditorFooter
                    onTest={handleTest}
                    onClose={onClose}
                    onSave={handleSubmit(onSave)}
                    isSubmitting={isSubmitting}
                    editingRule={editingRule}
                    actionCount={actionFields.length}
                />
            </motion.div>
        </div>
    );
};
