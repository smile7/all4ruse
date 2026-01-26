import * as React from "react";
import type { VariantProps } from "class-variance-authority";
import type { Editor } from "@tiptap/react";
import { AlignCenter, AlignLeft, AlignRight } from "lucide-react";

import type { toggleVariants } from "@/components/ui/toggle";

import type { FormatAction } from "../../types";
import { ToolbarSection } from "../toolbar-section";

type AlignAction = "left" | "center" | "right";

interface AlignmentAction extends FormatAction {
  value: AlignAction;
}

const formatActions: AlignmentAction[] = [
  {
    value: "left",
    label: "Align left",
    icon: <AlignLeft className="size-5" />,
    action: (editor) => editor.chain().focus().setTextAlign("left").run(),
    isActive: (editor) => editor.isActive({ textAlign: "left" }),
    canExecute: (editor) => editor.isEditable && !editor.isActive("codeBlock"),
    shortcuts: ["mod", "shift", "L"],
  },
  {
    value: "center",
    label: "Align center",
    icon: <AlignCenter className="size-5" />,
    action: (editor) => editor.chain().focus().setTextAlign("center").run(),
    isActive: (editor) => editor.isActive({ textAlign: "center" }),
    canExecute: (editor) => editor.isEditable && !editor.isActive("codeBlock"),
    shortcuts: ["mod", "shift", "E"],
  },
  {
    value: "right",
    label: "Align right",
    icon: <AlignRight className="size-5" />,
    action: (editor) => editor.chain().focus().setTextAlign("right").run(),
    isActive: (editor) => editor.isActive({ textAlign: "right" }),
    canExecute: (editor) => editor.isEditable && !editor.isActive("codeBlock"),
    shortcuts: ["mod", "shift", "R"],
  },
];

interface AlignSectionProps extends VariantProps<typeof toggleVariants> {
  editor: Editor;
  activeActions?: AlignAction[];
  mainActionCount?: number;
}

export const AlignSection: React.FC<AlignSectionProps> = ({
  editor,
  activeActions = formatActions.map((action) => action.value),
  mainActionCount = 3,
  size,
  variant,
}) => {
  return (
    <ToolbarSection
      editor={editor}
      actions={formatActions}
      activeActions={activeActions}
      mainActionCount={mainActionCount}
      dropdownTooltip="Text alignment"
      size={size}
      variant={variant}
    />
  );
};

AlignSection.displayName = "AlignSection";

export default AlignSection;
