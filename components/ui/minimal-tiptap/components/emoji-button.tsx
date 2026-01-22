"use client";

import * as React from "react";
import type { Editor } from "@tiptap/react";
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ToolbarButton } from "./toolbar-button";

interface EmojiButtonProps {
  editor: Editor;
}

export const EmojiButton: React.FC<EmojiButtonProps> = ({ editor }) => {
  const handleEmojiClick = React.useCallback(
    (emojiData: EmojiClickData) => {
      if (!emojiData?.emoji) return;
      editor.chain().focus().insertContent(emojiData.emoji).run();
    },
    [editor],
  );

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton
          tooltip="Insert emoji"
          aria-label="Insert emoji"
          pressed={false}
        >
          <span className="text-lg leading-none">😊</span>
        </ToolbarButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="p-0" align="start" sideOffset={4}>
        <EmojiPicker
          onEmojiClick={handleEmojiClick}
          width={280}
          height={360}
          lazyLoadEmojis
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

EmojiButton.displayName = "EmojiButton";

export default EmojiButton;
