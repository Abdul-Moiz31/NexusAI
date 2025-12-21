import { useState, useRef, useEffect } from 'react';
import { Send, Menu, X, Plus, MessageSquare, Search, Database } from 'lucide-react';
import { Link } from 'react-router-dom';
import MessageBubble from './MessageBubble';
// We will implement API calls later, for now mock data or basic fetch can serve as placeholder logic
// import axios from 'axios'; 

const ChatInterface = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am NexusAI. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Using relative path - Vite proxy will forward to backend
      const response = await fetch('/api/v1/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      });

      // Simple streaming handler (placeholder for complex streaming)
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiMessage = { role: 'assistant', content: '' };
      
      setMessages(prev => [...prev, aiMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        
        // Basic accumulation logic
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMsg = newMessages[newMessages.length - 1];
          lastMsg.content += chunk;
          return newMessages;
        });
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "**Error:** Could not connect to the backend." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed md:relative z-30 w-72 h-full bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out flex flex-col`}
      >
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
              <Database className="w-5 h-5" />
            </span>
            NexusAI
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-xl hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20 font-medium">
            <Plus className="w-5 h-5" />
            <span>New Chat</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">History</div>
          {/* Mock History Items */}
          {[1, 2, 3].map((i) => (
            <button key={i} className="w-full flex items-center gap-3 px-3 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg group transition-colors">
              <MessageSquare className="w-4 h-4 text-gray-400 group-hover:text-primary" />
              <span className="truncate text-sm">Previous Conversation {i}</span>
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-gray-100">
             {/* User Profile or Settings could go here */}
             <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-xs">U</div>
                <div className="text-sm font-medium text-gray-700">User</div>
             </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col w-full h-full relative">
        {/* Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="font-semibold text-gray-800">New Conversation</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">Model: GPT-4o</span>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-4xl mx-auto">
            {messages.map((msg, idx) => (
              <MessageBubble key={idx} role={msg.role} content={msg.content} />
            ))}
            {loading && (
              <div className="flex justify-start mb-6">
                 <div className="bg-white border border-gray-100 px-6 py-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100" />
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200" />
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-200">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSend} className="relative flex items-center">
              <div className="absolute left-4 flex items-center gap-2 text-gray-400">
                 {/* Tool Buttons could go here */}
                 <button type="button" className="hover:text-primary transition-colors">
                    <Search className="w-5 h-5" />
                 </button>
              </div>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything..."
                className="w-full pl-14 pr-14 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm text-gray-800 placeholder-gray-400"
              />
              <button 
                type="submit"
                disabled={!input.trim() || loading}
                className="absolute right-3 p-2 bg-primary text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-500/20"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
            <div className="text-center text-xs text-gray-400 mt-3">
              NexusAI can make mistakes. Consider checking important information.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatInterface;
