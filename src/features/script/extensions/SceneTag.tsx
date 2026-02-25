import { Node, mergeAttributes, InputRule } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { SceneTagView } from '@/features/script/extensions/SceneTagView';

export interface SceneTagOptions {
    onTrigger?: (sceneName: string) => void;
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        sceneTag: {
            insertSceneTag: (attributes: { sceneName: string }) => ReturnType;
        };
    }
}

export const SceneTag = Node.create<SceneTagOptions>({
    name: 'sceneTag',
    group: 'inline',
    inline: true,
    selectable: true,
    atom: true,

    addOptions() {
        return {
            onTrigger: undefined,
        };
    },

    addAttributes() {
        return {
            sceneName: {
                default: '',
                parseHTML: element => element.getAttribute('data-scene'),
                renderHTML: attributes => ({
                    'data-scene': attributes.sceneName,
                }),
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'span[data-scene]',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['span', mergeAttributes(HTMLAttributes, { class: 'scene-tag' }), 0];
    },

    addNodeView() {
        return ReactNodeViewRenderer(SceneTagView);
    },

    addCommands() {
        return {
            insertSceneTag: attributes => ({ chain }) => {
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
            new InputRule({
                find: /\[ESCENA:(.+?)\]\s$/,
                handler: ({ state, range, match }) => {
                    const sceneName = match[1];
                    const { tr } = state;
                    const start = range.from;
                    const end = range.to;

                    tr.replaceWith(start, end, this.type.create({ sceneName }));
                },
            }),
        ];
    },
});
