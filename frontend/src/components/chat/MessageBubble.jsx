import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, User, Copy, Check, ThumbsUp, ThumbsDown, RotateCcw } from 'lucide-react';
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
      <div className="flex gap-4 mb-6 justify-end">
        <div className="max-w-[80%]">
          <div className="bg-emerald-600 text-white px-4 py-3 rounded-xl rounded-tr-sm">
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{content}</p>
          </div>
        </div>
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-white" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 mb-6 group">
      <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center flex-shrink-0">
        <Bot className="w-5 h-5 text-white" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="bg-[#161b22] border border-[#30363d] px-4 py-3 rounded-xl rounded-tl-sm overflow-hidden">
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({node, ...props}) => <h1 className="text-xl font-bold text-white mt-4 mb-2" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-lg font-bold text-white mt-3 mb-2" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-base font-semibold text-white mt-2 mb-1" {...props} />,
                p: ({node, ...props}) => <p className="text-gray-300 leading-relaxed mb-3 last:mb-0" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-3 space-y-1 text-gray-300" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-3 space-y-1 text-gray-300" {...props} />,
                li: ({node, ...props}) => <li className="text-gray-300" {...props} />,
                strong: ({node, ...props}) => <strong className="font-semibold text-white" {...props} />,
                em: ({node, ...props}) => <em className="italic text-gray-400" {...props} />,
                code: ({node, inline, className, children, ...props}) => {
                  if (inline) {
                    return (
                      <code className="bg-[#21262d] text-emerald-400 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                        {children}
                      </code>
                    );
                  }
                  return (
                    <code className="block bg-[#0d1117] text-gray-300 p-4 rounded-lg text-sm font-mono overflow-x-auto my-3" {...props}>
                      {children}
                    </code>
                  );
                },
                pre: ({node, children, ...props}) => (
                  <pre className="bg-[#0d1117] rounded-lg overflow-hidden my-3 border border-[#30363d]" {...props}>
                    {children}
                  </pre>
                ),
                a: ({node, ...props}) => <a className="text-emerald-400 hover:text-emerald-300 underline break-all" {...props} />,
                blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-emerald-500 pl-4 italic text-gray-400 my-3" {...props} />,
                table: ({node, ...props}) => (
                  <div className="overflow-x-auto my-3">
                    <table className="min-w-full border-collapse text-sm" {...props} />
                  </div>
                ),
                th: ({node, ...props}) => <th className="border border-[#30363d] px-3 py-2 bg-[#21262d] font-semibold text-left text-white" {...props} />,
                td: ({node, ...props}) => <td className="border border-[#30363d] px-3 py-2 text-gray-300" {...props} />,
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={handleCopy}
            className="p-1.5 hover:bg-[#21262d] rounded-lg text-gray-500 hover:text-white transition-colors"
            title="Copy"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
          <button 
            className="p-1.5 hover:bg-[#21262d] rounded-lg text-gray-500 hover:text-white transition-colors"
            title="Good response"
          >
            <ThumbsUp className="w-4 h-4" />
          </button>
          <button 
            className="p-1.5 hover:bg-[#21262d] rounded-lg text-gray-500 hover:text-white transition-colors"
            title="Bad response"
          >
            <ThumbsDown className="w-4 h-4" />
          </button>
          <button 
            className="p-1.5 hover:bg-[#21262d] rounded-lg text-gray-500 hover:text-white transition-colors"
            title="Regenerate"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
