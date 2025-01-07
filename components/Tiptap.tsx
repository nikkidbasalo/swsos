'use client'

import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import ImageResize from 'tiptap-extension-resize-image'
import TipTapToolbar from './TiptapToolbar'

const Tiptap = ({ onChange, content }: any) => {
  const handleChange = (newContent: string) => {
    onChange(newContent)
  }

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Image,
      ImageResize,
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: 'https'
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'] // Ensure that text alignment is applied to these types
      })
    ],
    content,
    editorProps: {
      attributes: {
        class:
          'px-4 py-3 border-b border-r border-l border-gray-700 text-gray-800 items-start w-full gap-3 font-medium text-[16px] pt-4 rounded-bl-md rounded-br-md outline-none'
      }
    },
    onUpdate: ({ editor }) => {
      handleChange(editor.getHTML())
    }
  })

  return (
    <div className="w-full px-4">
      <TipTapToolbar editor={editor} content={content} />
      <EditorContent style={{ whiteSpace: 'pre-line' }} editor={editor} />
    </div>
  )
}

export default Tiptap
