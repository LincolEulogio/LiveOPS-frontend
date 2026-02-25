import { Node, mergeAttributes, InputRule } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { TimelineTagView } from '@/features/script/extensions/TimelineTagView';

export interface TimelineTagOptions {
    onTrigger?: (blockId: string) => void;
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        timelineTag: {
            insertTimelineTag: (attributes: { blockId: string; blockTitle: string }) => ReturnType;
        };
    }
}

export const TimelineTag = Node.create<TimelineTagOptions>({
    name: 'timelineTag',
    group: 'inline',
    inline: true,
    selectable: true,
    atom: true,

    addAttributes() {
        return {
            blockId: {
                default: '',
                parseHTML: element => element.getAttribute('data-block-id'),
                renderHTML: attributes => ({
                    'data-block-id': attributes.blockId,
                }),
            },
            blockTitle: {
                default: '',
                parseHTML: element => element.getAttribute('data-block-title'),
                renderHTML: attributes => ({
                    'data-block-title': attributes.blockTitle,
                }),
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'span[data-block-id]',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['span', mergeAttributes(HTMLAttributes, { class: 'timeline-tag' }), 0];
    },

    addNodeView() {
        return ReactNodeViewRenderer(TimelineTagView);
    },

    addCommands() {
        return {
            insertTimelineTag: attributes => ({ chain }) => {
                return chain()
                    .insertContent({
                        type: this.name,
                        attrs: attributes,
                    })
                    .run();
            },
        };
    },

    addInputRules() {
        return [
            // Rule for [BLOCK:Title]
            // Note: blockId will need to be matched later or we use Title as a fuzzy link
            // For now, let's stick to a simpler [BLOCK:Title] that we can resolve
            new InputRule({
                find: /\[BLOCK:(.+?)\]\s$/,
                handler: ({ state, range, match }) => {
                    const blockTitle = match[1];
                    const { tr } = state;
                    const start = range.from;
                    const end = range.to;

                    tr.replaceWith(start, end, this.type.create({ blockTitle }));
                },
            }),
        ];
    },
});
