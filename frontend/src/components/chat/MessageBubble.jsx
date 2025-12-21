import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, User, Copy, Check, Sparkles } from 'lucide-react';
import { useState } from 'react';

const MessageBubble = ({ role, content }) => {
  const isUser = role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isUser) {
    return (
      <div className="flex justify-end mb-6">
        <div className="flex items-start gap-3 max-w-[80%]">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white px-5 py-3 rounded-2xl rounded-tr-sm shadow-md">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center flex-shrink-0 shadow-sm">
            <User className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-6 group">
      <div className="flex items-start gap-3 max-w-[85%]">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0 shadow-md">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        
        <div className="relative">
          <div className="bg-white border border-slate-200 px-5 py-4 rounded-2xl rounded-tl-sm shadow-sm">
            <div className="prose prose-slate prose-sm max-w-none">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  // Custom styling for markdown elements
                  h1: ({node, ...props}) => <h1 className="text-xl font-bold text-slate-800 mt-4 mb-2" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-lg font-bold text-slate-800 mt-3 mb-2" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-base font-semibold text-slate-800 mt-2 mb-1" {...props} />,
                  p: ({node, ...props}) => <p className="text-slate-700 leading-relaxed mb-2 last:mb-0" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-2 space-y-1" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-2 space-y-1" {...props} />,
                  li: ({node, ...props}) => <li className="text-slate-700" {...props} />,
                  strong: ({node, ...props}) => <strong className="font-semibold text-slate-800" {...props} />,
                  em: ({node, ...props}) => <em className="italic text-slate-600" {...props} />,
                  code: ({node, inline, ...props}) => 
                    inline ? (
                      <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-sm font-mono" {...props} />
                    ) : (
                      <code className="block bg-slate-900 text-slate-100 p-4 rounded-lg text-sm font-mono overflow-x-auto my-2" {...props} />
                    ),
                  pre: ({node, ...props}) => <pre className="bg-slate-900 rounded-lg overflow-hidden my-2" {...props} />,
                  a: ({node, ...props}) => <a className="text-blue-600 hover:text-blue-700 underline" {...props} />,
                  blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-blue-400 pl-4 italic text-slate-600 my-2" {...props} />,
                  table: ({node, ...props}) => <table className="min-w-full border-collapse my-2" {...props} />,
                  th: ({node, ...props}) => <th className="border border-slate-300 px-3 py-2 bg-slate-100 font-semibold text-left" {...props} />,
                  td: ({node, ...props}) => <td className="border border-slate-300 px-3 py-2" {...props} />,
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          </div>
          
          {/* Copy button */}
          <button 
            onClick={handleCopy}
            className="absolute -bottom-2 right-2 p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 hover:border-slate-300 opacity-0 group-hover:opacity-100 transition-all shadow-sm"
            title="Copy message"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
