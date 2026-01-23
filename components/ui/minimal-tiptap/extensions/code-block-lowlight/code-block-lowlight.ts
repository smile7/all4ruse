import { common, createLowlight } from "lowlight";
import { CodeBlockLowlight as TiptapCodeBlockLowlight } from "@tiptap/extension-code-block-lowlight";

export const CodeBlockLowlight = TiptapCodeBlockLowlight.extend({
  addOptions() {
    return {
      ...this.parent?.(),
      // required options from CodeBlockLowlightOptions / CodeBlockOptions
      lowlight: createLowlight(common),
      languageClassPrefix: "language-",
      exitOnTripleEnter: true,
      exitOnArrowDown: true,
      defaultLanguage: null,
      enableTabIndentation: false,
      tabSize: 4,
      HTMLAttributes: {
        class: "block-node",
      },
    };
  },
});

export default CodeBlockLowlight;
