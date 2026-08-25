"use client";

import React, { useRef, useState } from "react";
import { Bold, Italic, Heading1, Heading2, List, AlignLeft, AlignCenter, AlignRight, Copy, Check, Download } from "lucide-react";

interface EditorProps {
  initialContent: string;
  generationId?: string | null;
  onContentChange?: (text: string) => void;
}

export default function Editor({ initialContent, generationId, onContentChange }: EditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const formatDoc = (cmd: string, value: string | undefined = undefined) => {
    document.execCommand(cmd, false, value);
    if (editorRef.current && onContentChange) {
      onContentChange(editorRef.current.innerText);
    }
  };

  const handleCopy = () => {
    if (editorRef.current) {
      navigator.clipboard.writeText(editorRef.current.innerText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExport = async (format: "docx" | "pdf") => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    if (generationId) {
      try {
        const token = localStorage.getItem("sb-access-token") || "mock-dev-token";
        const res = await fetch(`${API_URL}/sop/export/${generationId}?format=${format}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (!res.ok) {
          throw new Error("Failed to export document. Make sure you are authenticated.");
        }
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `sop_export_${generationId.slice(0, 8)}.${format}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } catch (err: any) {
        alert("Export failed: " + err.message);
      }
    } else {
      alert("No active generation ID found for download.");
    }
  };

  return (
    <div className="w-full glass-card rounded-2xl border border-slate-200/80 shadow-md overflow-hidden bg-white/90">
      
      {/* Formatting Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-1">
          <button
            onClick={() => formatDoc("bold")}
            title="Bold"
            className="p-2 rounded-lg hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => formatDoc("italic")}
            title="Italic"
            className="p-2 rounded-lg hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <Italic className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-5 bg-slate-300 mx-1" />

          <button
            onClick={() => formatDoc("formatBlock", "<h1>")}
            title="Heading 1"
            className="p-2 rounded-lg hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            onClick={() => formatDoc("formatBlock", "<h2>")}
            title="Heading 2"
            className="p-2 rounded-lg hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <Heading2 className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-5 bg-slate-300 mx-1" />

          <button
            onClick={() => formatDoc("insertUnorderedList")}
            title="Bullet List"
            className="p-2 rounded-lg hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <List className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-5 bg-slate-300 mx-1" />

          <button
            onClick={() => formatDoc("justifyLeft")}
            title="Align Left"
            className="p-2 rounded-lg hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => formatDoc("justifyCenter")}
            title="Align Center"
            className="p-2 rounded-lg hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            onClick={() => formatDoc("justifyRight")}
            title="Align Right"
            className="p-2 rounded-lg hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <AlignRight className="w-4 h-4" />
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
          
          <button
            onClick={() => handleExport("docx")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1e3a8a] hover:bg-blue-900 text-white font-bold text-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Word (.docx)
          </button>
          
          <button
            onClick={() => handleExport("pdf")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> PDF (.pdf)
          </button>
        </div>
      </div>

      {/* Editable Text Body */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={() => {
          if (editorRef.current && onContentChange) {
            onContentChange(editorRef.current.innerText);
          }
        }}
        className="p-6 min-h-[350px] max-h-[600px] overflow-y-auto text-slate-800 text-sm leading-relaxed focus:outline-none whitespace-pre-wrap font-sans"
        dangerouslySetInnerHTML={{ __html: initialContent }}
      />
    </div>
  );
}
