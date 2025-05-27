import { ViewPlugin, type DecorationSet, type ViewUpdate, EditorView } from '@codemirror/view';
export declare const hideTagsExtension: () => ViewPlugin<{
    decorations: DecorationSet;
    update(update: ViewUpdate): void;
    buildDecorations(view: EditorView): DecorationSet;
}>;
