import * as React from "react";
import { TextStyle } from "@tiptap/extension-text-style";
import { TextAlign } from "@tiptap/extension-text-align";
import { Typography } from "@tiptap/extension-typography";
import { Placeholder, Selection } from "@tiptap/extensions";
import {
  type Content,
  type Editor,
  useEditor,
  type UseEditorOptions,
} from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";

import { cn } from "@/lib/utils";

import {
  CodeBlockLowlight,
  HorizontalRule,
  ResetMarksOnEnter,
  UnsetAllMarks,
} from "../extensions";
import { useThrottle } from "../hooks/use-throttle";
import { getOutput } from "../utils";

export interface UseMinimalTiptapEditorProps extends UseEditorOptions {
  value?: Content;
  output?: "html" | "json" | "text";
  placeholder?: string;
  editorClassName?: string;
  throttleDelay?: number;
  onUpdate?: (content: Content) => void;
  onBlur?: (content: Content) => void;
  uploader?: (file: File) => Promise<string>;
}

// async function fakeuploader(file: File): Promise<string> {
//   // NOTE: This is a fake upload function. Replace this with your own upload logic.
//   // This function should return the uploaded image URL.

//   // wait 3s to simulate upload
//   await new Promise((resolve) => setTimeout(resolve, 3000));

//   const src = await fileToBase64(file);

//   return src;
// }

const createExtensions = ({
  placeholder,
  // uploader,
}: {
  placeholder: string;
  // uploader?: (file: File) => Promise<string>;
}) => [
  StarterKit.configure({
    blockquote: { HTMLAttributes: { class: "block-node" } },
    // bold
    bulletList: { HTMLAttributes: { class: "list-node" } },
    code: { HTMLAttributes: { class: "inline", spellcheck: "false" } },
    codeBlock: false,
    // document
    dropcursor: { width: 2, class: "ProseMirror-dropcursor border" },
    // gapcursor
    // hardBreak
    heading: { HTMLAttributes: { class: "heading-node" } },
    // undoRedo
    horizontalRule: false,
    // italic
    // listItem
    // listKeymap
    link: {
      enableClickSelection: true,
      openOnClick: false,
      HTMLAttributes: {
        class: "link",
      },
    },
    orderedList: { HTMLAttributes: { class: "list-node" } },
    paragraph: { HTMLAttributes: { class: "text-node" } },
    // strike
    // text
    // underline
    // trailingNode
  }),
  TextAlign.configure({
    types: ["heading", "paragraph"],
  }),
  // Image.configure({
  //   allowedMimeTypes: ["image/jpeg", "image/png", "image/gif"],
  //   maxFileSize: 1 * 1024 * 1024,
  //   allowBase64: true,
  //   uploadFn: async (file) => {
  //     return uploader ? await uploader(file) : await fakeuploader(file);
  //   },
  //   onToggle(editor, files, pos) {
  //     editor.commands.insertContentAt(
  //       pos,
  //       files.map((image) => {
  //         const blobUrl = URL.createObjectURL(image);
  //         const id = randomId();

  //         return {
  //           type: "image",
  //           attrs: {
  //             id,
  //             src: blobUrl,
  //             alt: image.name,
  //             title: image.name,
  //             fileName: image.name,
  //           },
  //         };
  //       })
  //     );
  //   },
  //   onImageRemoved({ id, src }) {
  //     console.log("Image removed", { id, src });
  //   },
  //   onValidationError(errors) {
  //     errors.forEach((error) => {
  //       toast.error("Image validation error", {
  //         position: "bottom-right",
  //         description: error.reason,
  //       });
  //     });
  //   },
  //   onActionSuccess({ action }) {
  //     const mapping = {
  //       copyImage: "Copy Image",
  //       copyLink: "Copy Link",
  //       download: "Download",
  //     };
  //     toast.success(mapping[action], {
  //       position: "bottom-right",
  //       description: "Image action success",
  //     });
  //   },
  //   onActionError(error, { action }) {
  //     const mapping = {
  //       copyImage: "Copy Image",
  //       copyLink: "Copy Link",
  //       download: "Download",
  //     };
  //     toast.error(`Failed to ${mapping[action]}`, {
  //       position: "bottom-right",
  //       description: error.message,
  //     });
  //   },
  // }),
  // FileHandler.configure({
  //   allowBase64: true,
  //   allowedMimeTypes: ["image/*"],
  //   maxFileSize: 5 * 1024 * 1024,
  //   onDrop: (editor, files, pos) => {
  //     files.forEach(async (file) => {
  //       const src = await fileToBase64(file);
  //       editor.commands.insertContentAt(pos, {
  //         type: "image",
  //         attrs: { src },
  //       });
  //     });
  //   },
  //   onPaste: (editor, files) => {
  //     files.forEach(async (file) => {
  //       const src = await fileToBase64(file);
  //       editor.commands.insertContent({
  //         type: "image",
  //         attrs: { src },
  //       });
  //     });
  //   },
  //   onValidationError: (errors) => {
  //     errors.forEach((error) => {
  //       toast.error("Image validation error", {
  //         position: "bottom-right",
  //         description: error.reason,
  //       });
  //     });
  //   },
  // }),
  // Color,
  TextStyle,
  Selection,
  Typography,
  UnsetAllMarks,
  HorizontalRule,
  ResetMarksOnEnter,
  CodeBlockLowlight,
  Placeholder.configure({ placeholder: () => placeholder }),
];

export const useMinimalTiptapEditor = ({
  value,
  output = "html",
  placeholder = "",
  editorClassName,
  throttleDelay = 0,
  onUpdate,
  onBlur,
  // uploader,
  ...props
}: UseMinimalTiptapEditorProps) => {
  const serializeContent = React.useCallback(
    (content: Content | object | string | undefined) => {
      if (content == null) return "";
      return typeof content === "string" ? content : JSON.stringify(content);
    },
    [],
  );

  const throttledSetValue = useThrottle(
    (value: Content) => onUpdate?.(value),
    throttleDelay,
  );

  const handleUpdate = React.useCallback(
    (editor: Editor) => throttledSetValue(getOutput(editor, output)),
    [output, throttledSetValue],
  );

  const handleCreate = React.useCallback(
    (editor: Editor) => {
      if (value && editor.isEmpty) {
        editor.commands.setContent(value);
      }
    },
    [value],
  );

  const handleBlur = React.useCallback(
    (editor: Editor) => onBlur?.(getOutput(editor, output)),
    [output, onBlur],
  );

  const editorRef = React.useRef<Editor | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: createExtensions({ placeholder }),
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        class: cn("focus:outline-hidden", editorClassName),
      },
      handlePaste: (_view, event) => {
        const html = event.clipboardData?.getData("text/html");
        if (!html || !/<img/i.test(html)) return false;

        const domDoc = new DOMParser().parseFromString(html, "text/html");
        let modified = false;

        domDoc.querySelectorAll("img").forEach((img) => {
          const emoji = img.getAttribute("alt");
          if (emoji) {
            img.replaceWith(document.createTextNode(emoji));
            modified = true;
          }
        });

        if (!modified) return false;

        editorRef.current?.commands.insertContent(domDoc.body.innerHTML);
        return true;
      },
    },
    onUpdate: ({ editor }) => handleUpdate(editor),
    onCreate: ({ editor }) => handleCreate(editor),
    onBlur: ({ editor }) => handleBlur(editor),
    ...props,
  });

  React.useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  React.useEffect(() => {
    if (!editor || value === undefined) return;

    const currentValue = serializeContent(getOutput(editor, output));
    const nextValue = serializeContent(value);

    if (currentValue === nextValue) {
      return;
    }

    if (nextValue === "") {
      if (!editor.isEmpty) {
        editor.commands.clearContent(false);
      }
      return;
    }

    editor.commands.setContent(value, { emitUpdate: false });
  }, [editor, output, serializeContent, value]);

  return editor;
};

export default useMinimalTiptapEditor;
