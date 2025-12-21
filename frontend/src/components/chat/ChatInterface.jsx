import { useState, useRef, useEffect } from 'react';
import { 
  Send, Menu, X, Plus, MessageSquare, Upload, FileText, 
  Bot, Brain, Network, BookOpen, ChevronDown, Check, Trash2,
  Sparkles, Zap, Settings, Home
} from 'lucide-react';
import { Link } from 'react-router-dom';
import MessageBubble from './MessageBubble';

// Mode configurations
const MODES = [
  { 
    id: 'chat', 
    name: 'Basic Chat', 
    icon: MessageSquare, 
    color: 'blue',
    description: 'Simple conversation with GPT-4o',
    endpoint: '/api/v1/chat/stream',
    streaming: true
  },
  { 
    id: 'agent', 
    name: 'Agent (Tools)', 
    icon: Zap, 
    color: 'amber',
    description: 'AI with Calculator, Search & Knowledge Base',
    endpoint: '/api/v1/agent/chat',
    streaming: false
  },
  { 
    id: 'graph', 
    name: 'Multi-Agent', 
    icon: Network, 
    color: 'purple',
    description: 'Supervisor routes to Researcher or Tutor',
    endpoint: '/api/v1/agent/graph',
    streaming: false
  },
  { 
    id: 'rag', 
    name: 'RAG (Docs)', 
    icon: BookOpen, 
    color: 'emerald',
    description: 'Query your uploaded documents',
    endpoint: '/api/v1/rag/query',
    streaming: false
  }
];

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [currentMode, setCurrentMode] = useState(MODES[0]);
  const [modeDropdownOpen, setModeDropdownOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Welcome message based on mode
  useEffect(() => {
    const welcomeMessages = {
      chat: "👋 Hello! I'm NexusAI. Ask me anything and I'll help you out!",
      agent: "🛠️ Agent Mode activated! I can use tools like Calculator, Web Search, and Knowledge Base to help you.",
      graph: "🤖 Multi-Agent System ready! I'll route your request to the best specialist - Researcher or Tutor.",
      rag: "📚 RAG Mode enabled! Upload documents first, then ask questions about them."
    };
    setMessages([{ role: 'assistant', content: welcomeMessages[currentMode.id] }]);
  }, [currentMode]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setModeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle file upload for RAG
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/v1/rag/ingest', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      
      setUploadedFiles(prev => [...prev, { 
        name: file.name, 
        chunks: data.chunks,
        uploadedAt: new Date().toLocaleTimeString()
      }]);
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `✅ **Document uploaded successfully!**\n\n📄 **File:** ${file.name}\n📊 **Chunks processed:** ${data.chunks}\n\nYou can now ask questions about this document.`
      }]);
    } catch (error) {
      console.error("Upload error:", error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `❌ **Upload failed:** ${error.message}. Make sure the backend is running.`
      }]);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Handle sending messages
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      if (currentMode.streaming) {
        // Streaming mode (Basic Chat)
        const response = await fetch(currentMode.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: currentInput })
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        
        // Add empty assistant message first
        setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMsg = newMessages[newMessages.length - 1];
            if (lastMsg.role === 'assistant') {
              lastMsg.content += chunk;
            }
            return [...newMessages];
          });
        }
      } else {
        // Non-streaming modes (Agent, Graph, RAG)
        let response;
        
        if (currentMode.id === 'rag') {
          response = await fetch(`${currentMode.endpoint}?query=${encodeURIComponent(currentInput)}`, {
            method: 'POST'
          });
        } else {
          response = await fetch(currentMode.endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              message: currentInput,
              history: chatHistory
            })
          });
        }
        
        const data = await response.json();
        let reply = data.response || JSON.stringify(data);
        
        // Add sources for RAG
        if (currentMode.id === 'rag' && data.sources) {
          reply += `\n\n📎 **Sources:** ${data.sources.join(', ')}`;
        }
        
        setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
        
        // Update chat history for agent mode
        setChatHistory(prev => [
          ...prev,
          { role: 'user', content: currentInput },
          { role: 'assistant', content: reply }
        ]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `❌ **Error:** Could not connect to the backend.\n\nMake sure the FastAPI server is running on port 8000.`
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Start new chat
  const handleNewChat = () => {
    setMessages([{ 
      role: 'assistant', 
      content: `🔄 Starting fresh! How can I help you in **${currentMode.name}** mode?`
    }]);
    setChatHistory([]);
  };

  // Get mode color classes
  const getModeColors = (mode, type = 'bg') => {
    const colors = {
      blue: { bg: 'bg-blue-500', light: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
      amber: { bg: 'bg-amber-500', light: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
      purple: { bg: 'bg-purple-500', light: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
      emerald: { bg: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' }
    };
    return colors[mode.color][type];
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed lg:relative z-30 w-72 h-full bg-slate-900 text-white transition-transform duration-300 ease-in-out flex flex-col`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-700 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Brain className="w-5 h-5" />
            </span>
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              NexusAI
            </span>
          </Link>
          <button 
            onClick={() => setSidebarOpen(false)} 
            className="lg:hidden p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <button 
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl transition-all group"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            <span className="font-medium">New Chat</span>
          </button>
        </div>

        {/* Mode Selector */}
        <div className="px-4 mb-4">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Mode</div>
          <div className="space-y-1">
            {MODES.map((mode) => {
              const Icon = mode.icon;
              const isActive = currentMode.id === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => setCurrentMode(mode)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    isActive 
                      ? `${getModeColors(mode, 'bg')} text-white shadow-lg` 
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{mode.name}</span>
                  {isActive && <Check className="w-4 h-4 ml-auto" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Document Upload (for RAG mode) */}
        {currentMode.id === 'rag' && (
          <div className="px-4 mb-4">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Knowledge Base</div>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.txt"
              className="hidden"
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-600 hover:border-emerald-500 hover:bg-slate-800 rounded-xl transition-all text-slate-300 hover:text-emerald-400 disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm">Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span className="text-sm">Upload PDF / TXT</span>
                </>
              )}
            </button>
            
            {/* Uploaded files list */}
            {uploadedFiles.length > 0 && (
              <div className="mt-3 space-y-2">
                {uploadedFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-slate-800 rounded-lg text-xs">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span className="truncate flex-1 text-slate-300">{file.name}</span>
                    <span className="text-slate-500">{file.chunks} chunks</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto px-4 py-2">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">History</div>
          <div className="space-y-1">
            {[1, 2, 3].map((i) => (
              <button 
                key={i} 
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-slate-300 hover:bg-slate-800 rounded-lg group transition-colors"
              >
                <MessageSquare className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />
                <span className="truncate text-sm">Conversation {i}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
              U
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">User</div>
              <div className="text-xs text-slate-400">Free Plan</div>
            </div>
            <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className={`flex-1 flex flex-col w-full h-full transition-all duration-300`}>
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Mode Dropdown in Header */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setModeDropdownOpen(!modeDropdownOpen)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${getModeColors(currentMode, 'light')} ${getModeColors(currentMode, 'border')} ${getModeColors(currentMode, 'text')}`}
              >
                <currentMode.icon className="w-4 h-4" />
                <span className="font-medium text-sm hidden sm:block">{currentMode.name}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${modeDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {modeDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                  {MODES.map((mode) => {
                    const Icon = mode.icon;
                    const isActive = currentMode.id === mode.id;
                    return (
                      <button
                        key={mode.id}
                        onClick={() => {
                          setCurrentMode(mode);
                          setModeDropdownOpen(false);
                        }}
                        className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors ${isActive ? 'bg-slate-50' : ''}`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getModeColors(mode, 'light')} ${getModeColors(mode, 'text')}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="text-left flex-1">
                          <div className="font-medium text-slate-800 text-sm">{mode.name}</div>
                          <div className="text-xs text-slate-500">{mode.description}</div>
                        </div>
                        {isActive && <Check className={`w-4 h-4 mt-1 ${getModeColors(mode, 'text')}`} />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Link 
              to="/" 
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-700 transition-colors"
            >
              <Home className="w-5 h-5" />
            </Link>
            <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${getModeColors(currentMode, 'light')} ${getModeColors(currentMode, 'text')}`}>
              GPT-4o
            </span>
          </div>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-8">
            {messages.length === 0 ? (
              <div className="text-center py-20">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${getModeColors(currentMode, 'light')}`}>
                  <currentMode.icon className={`w-8 h-8 ${getModeColors(currentMode, 'text')}`} />
                </div>
                <h2 className="text-xl font-semibold text-slate-800 mb-2">Welcome to {currentMode.name}</h2>
                <p className="text-slate-500">{currentMode.description}</p>
              </div>
            ) : (
              <>
                {messages.map((msg, idx) => (
                  <MessageBubble key={idx} role={msg.role} content={msg.content} />
                ))}
              </>
            )}
            
            {loading && (
              <div className="flex justify-start mb-6">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getModeColors(currentMode, 'light')} ${getModeColors(currentMode, 'text')}`}>
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="bg-white border border-slate-200 px-5 py-4 rounded-2xl rounded-tl-none shadow-sm">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 ${getModeColors(currentMode, 'bg')} rounded-full animate-bounce`} style={{ animationDelay: '0ms' }} />
                      <span className={`w-2 h-2 ${getModeColors(currentMode, 'bg')} rounded-full animate-bounce`} style={{ animationDelay: '150ms' }} />
                      <span className={`w-2 h-2 ${getModeColors(currentMode, 'bg')} rounded-full animate-bounce`} style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-gradient-to-t from-slate-100 to-transparent">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSend} className="relative">
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                {/* Upload hint for RAG mode */}
                {currentMode.id === 'rag' && uploadedFiles.length === 0 && (
                  <div className="px-4 py-2 bg-emerald-50 border-b border-emerald-100 flex items-center gap-2 text-emerald-700 text-sm">
                    <Upload className="w-4 h-4" />
                    <span>Upload a document first to use RAG mode</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 p-2">
                  {/* Upload button (always visible in RAG mode) */}
                  {currentMode.id === 'rag' && (
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="p-3 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-emerald-600 transition-colors disabled:opacity-50"
                    >
                      <Upload className="w-5 h-5" />
                    </button>
                  )}
                  
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={
                      currentMode.id === 'rag' 
                        ? "Ask about your documents..." 
                        : currentMode.id === 'agent'
                        ? "Try: 'What is 25 * 17?' or 'Search for latest AI news'"
                        : "Message NexusAI..."
                    }
                    className="flex-1 px-4 py-3 bg-transparent focus:outline-none text-slate-800 placeholder-slate-400"
                  />
                  
                  <button 
                    type="submit"
                    disabled={!input.trim() || loading}
                    className={`p-3 rounded-xl text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed ${getModeColors(currentMode, 'bg')} hover:opacity-90 shadow-md`}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </form>
            
            <div className="text-center text-xs text-slate-400 mt-3">
              NexusAI can make mistakes. Consider checking important information.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatInterface;
