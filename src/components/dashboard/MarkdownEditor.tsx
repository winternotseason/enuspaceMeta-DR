import React, { useState, useRef } from 'react';
import { 
  Bold, Italic, Link, List, ListOrdered, ListTodo, 
  Quote, Code, Paperclip, Type
} from 'lucide-react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { useCloudinaryUpload } from '@/hooks/useCloudinary';

interface MarkdownEditorProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  noBorder?: boolean;
}

export function MarkdownEditor({ id, value, onChange, placeholder,  noBorder }: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const uploadMutation = useCloudinaryUpload();

  const insertFormat = (prefix: string, suffix: string = '') => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    
    // We must ensure the element has focus to properly select
    textarea.focus();

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    const newText = value.substring(0, start) + prefix + selectedText + suffix + value.substring(end);
    onChange(newText);
    
    // Attempt to restore cursor position after a slight delay to allow state update
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 0);
  };

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;

    const placeholderText = `\n![Uploading ${file.name}...]()\n`;
    onChange(value + placeholderText);

    try {
      // 1. Upload using React Query Mutation (Cloudinary)
      const uploadedUrl = await uploadMutation.mutateAsync(file);
      
      // 2. Replace placeholder with real URL
      if (uploadedUrl) {
        onChange((value + placeholderText).replace(placeholderText, `\n![${file.name}](${uploadedUrl})\n`));
      }
    } catch (err) {
      console.error("Error uploading image:", err);
      // Fallback or removal on error
      onChange((value + placeholderText).replace(placeholderText, `\n*(Failed to upload ${file.name})*\n`));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      Array.from(e.target.files).forEach(uploadFile);
    }
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      Array.from(e.dataTransfer.files).forEach(uploadFile);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    if (e.clipboardData.files && e.clipboardData.files.length > 0) {
      e.preventDefault(); 
      Array.from(e.clipboardData.files).forEach(uploadFile);
    }
  };

  const renderPreview = () => {
    if (!value.trim()) return '<span class="text-[#57606a] italic">Nothing to preview</span>';
    const parsed = marked.parse(value) as string;
    return DOMPurify.sanitize(parsed);
  };

  return (
    <div 
      className={`${noBorder ? '' : 'border border-[#d0d7de] rounded-md focus-within:ring-1 focus-within:ring-[#0969da] '} overflow-hidden bg-white transition-all relative ${
        isDragging && !noBorder ? 'border-[#0969da] ring-1 ring-[#0969da]' : ''
      }`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      {/* Drag Overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-10 bg-[#0969da]/5 flex items-center justify-center pointer-events-none">
          <div className="px-4 py-2 bg-white text-[#0969da] font-semibold text-[14px] rounded-md shadow-sm border border-[#0969da]/20">
            Drop images to upload
          </div>
        </div>
      )}

      {/* Header Tabs & Toolbar */}
      <div className="bg-[#f6f8fa] flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#d0d7de] px-2 py-1.5 gap-2">
        {/* Tabs */}
        <div className="flex items-center space-x-1">
          <button 
            type="button"
            onClick={() => setActiveTab('write')}
            className={`px-3 py-1.5 text-[14px] font-medium rounded-md transition-colors ${
              activeTab === 'write' 
                ? 'bg-white border text-[#24292f] border-[#d0d7de] shadow-sm' 
                : 'text-[#57606a] hover:text-[#24292f] border border-transparent hover:bg-[#eaeef2]'
            }`}
          >
            Write
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1.5 text-[14px] font-medium rounded-md transition-colors ${
              activeTab === 'preview' 
                ? 'bg-white border text-[#24292f] border-[#d0d7de] shadow-sm' 
                : 'text-[#57606a] hover:text-[#24292f] border border-transparent hover:bg-[#eaeef2]'
            }`}
          >
            Preview
          </button>
        </div>

        {/* Toolbar */}
        {activeTab === 'write' && (
          <div className="flex items-center space-x-1 lg:space-x-1.5 text-[#57606a] overflow-x-auto no-scrollbar">
            <button type="button" onClick={() => insertFormat('### ')} className="p-1 hover:text-[#0969da] rounded hover:bg-[#eaeef2] transition-colors" title="Heading"><Type className="w-3.75 h-3.75" /></button>
            <button type="button" onClick={() => insertFormat('**', '**')} className="p-1 hover:text-[#0969da] rounded hover:bg-[#eaeef2] transition-colors" title="Bold"><Bold className="w-3.75 h-3.75" /></button>
            <button type="button" onClick={() => insertFormat('*', '*')} className="p-1 hover:text-[#0969da] rounded hover:bg-[#eaeef2] transition-colors" title="Italic"><Italic className="w-3.75 h-3.75" /></button>
            
            <div className="w-px h-4 bg-[#d0d7de] mx-1"></div>
            
            <button type="button" onClick={() => insertFormat('- ')} className="p-1 hover:text-[#0969da] rounded hover:bg-[#eaeef2] transition-colors" title="Unordered List"><List className="w-3.75 h-3.75" /></button>
            <button type="button" onClick={() => insertFormat('1. ')} className="p-1 hover:text-[#0969da] rounded hover:bg-[#eaeef2] transition-colors" title="Ordered List"><ListOrdered className="w-3.75 h-3.75" /></button>
            <button type="button" onClick={() => insertFormat('- [ ] ')} className="p-1 hover:text-[#0969da] rounded hover:bg-[#eaeef2] transition-colors" title="Task List"><ListTodo className="w-3.75 h-3.75" /></button>
            
            <div className="w-px h-4 bg-[#d0d7de] mx-1"></div>
            
            <button type="button" onClick={() => insertFormat('> ')} className="p-1 hover:text-[#0969da] rounded hover:bg-[#eaeef2] transition-colors" title="Quote"><Quote className="w-3.75 h-3.75" /></button>
            <button type="button" onClick={() => insertFormat('`', '`')} className="p-1 hover:text-[#0969da] rounded hover:bg-[#eaeef2] transition-colors" title="Code"><Code className="w-3.75 h-3.75" /></button>
            <button type="button" onClick={() => insertFormat('[](', ')')} className="p-1 hover:text-[#0969da] rounded hover:bg-[#eaeef2] transition-colors" title="Link"><Link className="w-3.75 h-3.75" /></button>
            
           
          </div>
        )}
      </div>

      {/* Editor Area */}
      <div className="flex flex-col relative w-full bg-white group">
        {activeTab === 'write' ? (
          <textarea
            id={id}
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onPaste={handlePaste}
            className="w-full min-h-30 max-h-125 p-3 text-[14px] bg-white focus:bg-white resize-y outline-none text-[#24292f] placeholder:text-[#57606a]/70 font-mono leading-relaxed"
            placeholder={placeholder}
          />
        ) : (
          <div 
            className="w-full min-h-30 p-4 text-[14px] bg-white border-b border-[#d0d7de] text-[#24292f] prose prose-sm max-w-none prose-a:text-[#0969da] prose-a:no-underline hover:prose-a:underline prose-code:bg-[#f3f4f6] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none"
            dangerouslySetInnerHTML={{ __html: renderPreview() }}
          />
        )}

        {/* Attachment Footer */}
        <label className="px-3 py-2 flex items-center text-[13px] text-[#57606a] bg-white border-t border-dashed border-[#d0d7de] rounded-b-md cursor-pointer hover:text-[#0969da] transition-colors">
          <Paperclip className="w-3.5 h-3.5 mr-1.5" />
          <span>Paste, drop, or click to add files</span>
          <input 
            type="file" 
            ref={fileInputRef}
            className="hidden" 
            multiple 
            accept="image/*,video/*,.pdf,.zip" 
            onChange={handleFileChange}
          />
        </label>
      </div>
    </div>
  );
}
