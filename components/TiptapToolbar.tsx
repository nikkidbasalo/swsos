'use client'

import { LinkIcon } from '@heroicons/react/20/solid'
import { type Editor } from '@tiptap/react'
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Heading2,
  ImageIcon,
  Italic,
  List,
  ListOrdered,
  Quote,
  Redo,
  Underline,
  Undo
} from 'lucide-react'
import { useCallback } from 'react'

type Props = {
  editor: Editor | null
  content: string
}

const TipTapToolbar = ({ editor, content }: Props) => {
  const setLink = useCallback(() => {
    if (!editor) {
      return
    }
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)

    // cancelled
    if (url === null) {
      return
    }

    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()

      return
    }

    // update link
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  const addImage = useCallback(() => {
    if (!editor) {
      return
    }
    const url = window.prompt('URL')

    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }, [editor])

  if (!editor) {
    return null
  }
  return (
    <div
      className="px-4 py-3 rounded-tl-md rounded-tr-md flex justify-between items-start
    gap-5 w-full flex-wrap border border-gray-700"
    >
      <div className="flex justify-start items-center gap-5 w-full lg:w-10/12 flex-wrap ">
        <button
          onClick={(e) => {
            e.preventDefault()
            editor.chain().focus().toggleBold().run()
          }}
          className={
            editor.isActive('bold')
              ? 'bg-sky-700 text-white p-2 rounded-lg'
              : 'text-gray-400'
          }
        >
          <Bold className="w-5 h-5" />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault()
            editor.chain().focus().toggleItalic().run()
          }}
          className={
            editor.isActive('italic')
              ? 'bg-sky-700 text-white p-2 rounded-lg'
              : 'text-gray-400'
          }
        >
          <Italic className="w-5 h-5" />
        </button>

        <button
          onClick={(e) => {
            e.preventDefault()
            editor.chain().focus().toggleUnderline().run()
          }}
          className={
            editor.isActive('underline')
              ? 'bg-sky-700 text-white p-2 rounded-lg'
              : 'text-gray-400'
          }
        >
          <Underline className="w-5 h-5" />
        </button>
        {/* Align Left */}
        <button
          onClick={(e) => {
            e.preventDefault()
            editor.chain().focus().setTextAlign('left').run()
          }}
          className={
            editor.isActive({ textAlign: 'left' })
              ? 'bg-sky-700 text-white p-2 rounded-lg'
              : 'text-gray-400'
          }
        >
          <AlignLeft className="w-5 h-5" />
        </button>

        {/* Align Center */}
        <button
          onClick={(e) => {
            e.preventDefault()
            editor.chain().focus().setTextAlign('center').run()
          }}
          className={
            editor.isActive({ textAlign: 'center' })
              ? 'bg-sky-700 text-white p-2 rounded-lg'
              : 'text-gray-400'
          }
        >
          <AlignCenter className="w-5 h-5" />
        </button>

        {/* Align Right */}
        <button
          onClick={(e) => {
            e.preventDefault()
            editor.chain().focus().setTextAlign('right').run()
          }}
          className={
            editor.isActive({ textAlign: 'right' })
              ? 'bg-sky-700 text-white p-2 rounded-lg'
              : 'text-gray-400'
          }
        >
          <AlignRight className="w-5 h-5" />
        </button>

        {/* Align Justify */}
        <button
          onClick={(e) => {
            e.preventDefault()
            editor.chain().focus().setTextAlign('justify').run()
          }}
          className={
            editor.isActive({ textAlign: 'justify' })
              ? 'bg-sky-700 text-white p-2 rounded-lg'
              : 'text-gray-400'
          }
        >
          <AlignJustify className="w-5 h-5" />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault()
            setLink()
          }}
          className={
            editor.isActive('link')
              ? 'bg-sky-700 text-white p-2 rounded-lg'
              : 'text-gray-400'
          }
        >
          <LinkIcon className="w-5 h-5" />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault()
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }}
          className={
            editor.isActive('heading', { level: 2 })
              ? 'bg-sky-700 text-white p-2 rounded-lg'
              : 'text-gray-400'
          }
        >
          <Heading2 className="w-5 h-5" />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault()
            addImage()
          }}
          className="text-gray-400"
        >
          <ImageIcon className="w-5 h-5" />
        </button>

        <button
          onClick={(e) => {
            e.preventDefault()
            editor.chain().focus().toggleBulletList().run()
          }}
          className={
            editor.isActive('bulletList')
              ? 'bg-sky-700 text-white p-2 rounded-lg'
              : 'text-gray-400'
          }
        >
          <List className="w-5 h-5" />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault()
            editor.chain().focus().toggleOrderedList().run()
          }}
          className={
            editor.isActive('orderedList')
              ? 'bg-sky-700 text-white p-2 rounded-lg'
              : 'text-gray-400'
          }
        >
          <ListOrdered className="w-5 h-5" />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault()
            editor.chain().focus().toggleBlockquote().run()
          }}
          className={
            editor.isActive('blockquote')
              ? 'bg-sky-700 text-white p-2 rounded-lg'
              : 'text-gray-400'
          }
        >
          <Quote className="w-5 h-5" />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault()
            editor.chain().focus().setCode().run()
          }}
          className={
            editor.isActive('code')
              ? 'bg-sky-700 text-white p-2 rounded-lg'
              : 'text-gray-400'
          }
        >
          <Code className="w-5 h-5" />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault()
            editor.chain().focus().undo().run()
          }}
          className={
            editor.isActive('undo')
              ? 'bg-sky-700 text-white p-2 rounded-lg'
              : 'text-gray-400 hover:bg-sky-700 hover:text-white p-1 hover:rounded-lg'
          }
        >
          <Undo className="w-5 h-5" />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault()
            editor.chain().focus().redo().run()
          }}
          className={
            editor.isActive('redo')
              ? 'bg-sky-700 text-white p-2 rounded-lg'
              : 'text-gray-400 hover:bg-sky-700 hover:text-white p-1 hover:rounded-lg'
          }
        >
          <Redo className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

export default TipTapToolbar
