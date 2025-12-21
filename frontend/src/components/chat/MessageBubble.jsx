import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, User, Copy, Check } from 'lucide-react';
import { useState } from 'react';

const MessageBubble = ({ role, content }) => {
  const isUser = role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6 group`}>
      <div className={`flex max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-4`}>
        
        {/* Avatar */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
          isUser 
            ? 'bg-gradient-to-br from-primary to-blue-600 text-white' 
            : 'bg-white border border-gray-100 text-primary'
        }`}>
          {isUser ? <User className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
        </div>

        {/* Message Content */}
        <div className={`relative px-6 py-4 rounded-2xl shadow-sm ${
          isUser
            ? 'bg-primary text-white rounded-tr-none'
            : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
        }`}>
          
          {/* Copy Button (only for AI) */}
          {!isUser && (
            <button 
              onClick={handleCopy}
              className="absolute top-2 right-2 p-1 text-gray-400 hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          )}

          <div className={`prose ${isUser ? 'prose-invert' : 'prose-slate'} max-w-none text-sm leading-relaxed break-words`}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
