import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Send, Menu, X, Plus, MessageSquare, Upload, FileText, 
  Bot, Brain, Network, BookOpen, ChevronDown, Check, Trash2,
  Sparkles, Zap, Settings, Home, Edit2, Clock, Paperclip,
  History, FolderOpen, Archive, LogOut, RefreshCw, Lightbulb,
  AlertTriangle, HelpCircle, Copy, MoreHorizontal
} from 'lucide-react';
import { Link } from 'react-router-dom';
import MessageBubble from './MessageBubble';

// API Base URL
const API_BASE = '/api/v1';

// Mode configurations
const MODES = [
  { 
    id: 'chat', 
    name: 'Basic Chat', 
    icon: MessageSquare, 
    color: 'emerald',
    description: 'Simple conversation with GPT-4o',
    endpoint: '/api/v1/chat/stream',
    streaming: true
  },
  { 
    id: 'agent', 
    name: 'Agent (Tools)', 
    icon: Zap, 
    color: 'emerald',
    description: 'AI with Calculator, Search & Knowledge Base',
    endpoint: '/api/v1/agent/chat',
    streaming: false
  },
  { 
    id: 'graph', 
    name: 'Multi-Agent', 
    icon: Network, 
    color: 'emerald',
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

// Welcome screen examples
const WELCOME_CARDS = [
  {
    icon: Lightbulb,
    title: 'Examples',
    items: [
      'Explain quantum computing in simple terms',
      'Got any creative ideas for a 10 year old birthday?',
      'How do I make an HTTP request in JavaScript?'
    ]
  },
  {
    icon: Zap,
    title: 'Capabilities',
    items: [
      'Remembers what user said earlier in the conversation',
      'Allows user to provide follow-up corrections',
      'Trained to decline inappropriate requests'
    ]
  },
  {
    icon: AlertTriangle,
    title: 'Limitations',
    items: [
      'May occasionally generate incorrect information',
      'May occasionally produce harmful instructions',
      'Limited knowledge of world and events after 2021'
    ]
  }
];

const ChatInterface = () => {
  // State
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [currentMode, setCurrentMode] = useState(MODES[0]);
  const [modeDropdownOpen, setModeDropdownOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  
  // Database-backed state
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [editingTitle, setEditingTitle] = useState(null);
  const [editTitleValue, setEditTitleValue] = useState('');
  const [activeSection, setActiveSection] = useState('history');
  
  // Refs
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const editInputRef = useRef(null);

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations();
  }, []);

  // Load conversation when selected
  useEffect(() => {
    if (currentConversation) {
      loadConversation(currentConversation.id);
    }
  }, [currentConversation?.id]);

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

  // Auto-focus edit input
  useEffect(() => {
    if (editingTitle && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingTitle]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // API Functions
  const fetchConversations = async () => {
    try {
      setLoadingConversations(true);
      const response = await fetch(`${API_BASE}/conversations`);
      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoadingConversations(false);
    }
  };

  const loadConversation = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/conversations/${id}`);
      const data = await response.json();
      setMessages(data.messages.map(m => ({
        role: m.role,
        content: m.content
      })));
      const mode = MODES.find(m => m.id === data.mode) || MODES[0];
      setCurrentMode(mode);
    } catch (error) {
      console.error('Failed to load conversation:', error);
    }
  };

  const createConversation = async () => {
    try {
      const response = await fetch(`${API_BASE}/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Conversation', mode: currentMode.id })
      });
      const data = await response.json();
      setConversations(prev => [data, ...prev]);
      setCurrentConversation(data);
      return data;
    } catch (error) {
      console.error('Failed to create conversation:', error);
      return null;
    }
  };

  const updateConversationTitle = async (id, title) => {
    try {
      await fetch(`${API_BASE}/conversations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
      });
      setConversations(prev => prev.map(c => 
        c.id === id ? { ...c, title } : c
      ));
      if (currentConversation?.id === id) {
        setCurrentConversation(prev => ({ ...prev, title }));
      }
    } catch (error) {
      console.error('Failed to update conversation:', error);
    }
  };

  const deleteConversation = async (id) => {
    try {
      await fetch(`${API_BASE}/conversations/${id}`, { method: 'DELETE' });
      setConversations(prev => prev.filter(c => c.id !== id));
      if (currentConversation?.id === id) {
        setCurrentConversation(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  // Handle file upload for RAG
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE}/rag/ingest`, {
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

    let convId = currentConversation?.id;
    if (!convId) {
      const newConv = await createConversation();
      if (newConv) {
        convId = newConv.id;
      }
    }

    try {
      if (currentMode.streaming) {
        const response = await fetch(currentMode.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: currentInput })
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';
        
        setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          fullResponse += chunk;
          
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMsg = newMessages[newMessages.length - 1];
            if (lastMsg.role === 'assistant') {
              lastMsg.content = fullResponse;
            }
            return [...newMessages];
          });
        }

        if (convId) {
          const saveResponse = await fetch(`${API_BASE}/chat/save-streamed`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              conversation_id: convId,
              user_message: currentInput,
              assistant_message: fullResponse
            })
          });
          const saveData = await saveResponse.json();
          
          if (saveData.title && currentConversation) {
            setCurrentConversation(prev => ({ ...prev, title: saveData.title }));
            setConversations(prev => prev.map(c => 
              c.id === convId ? { ...c, title: saveData.title } : c
            ));
          }
        }
      } else {
        let response;
        
        if (currentMode.id === 'rag') {
          response = await fetch(currentMode.endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              query: currentInput,
              conversation_id: convId
            })
          });
        } else {
          response = await fetch(currentMode.endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              message: currentInput,
              history: messages.filter(m => m.role !== 'system'),
              conversation_id: convId
            })
          });
        }
        
        const data = await response.json();
        let reply = data.response || JSON.stringify(data);
        
        if (currentMode.id === 'rag' && data.sources && data.sources.length > 0) {
          reply += `\n\n📎 **Sources:** ${data.sources.join(', ')}`;
        }
        
        setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
        fetchConversations();
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

  const handleNewChat = () => {
    setCurrentConversation(null);
    setMessages([]);
  };

  const handleSelectConversation = (conv) => {
    setCurrentConversation(conv);
    setSidebarOpen(false);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  return (
    <div className="flex h-screen bg-[#0d1117] overflow-hidden">
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } fixed lg:relative z-30 w-72 h-full bg-[#161b22] border-r border-[#30363d] transition-transform duration-300 ease-in-out flex flex-col`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-[#30363d]">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">NexusAI</h1>
              <p className="text-xs text-gray-500">Advanced AI Assistant</p>
            </div>
          </Link>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <button 
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all font-medium shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-5 h-5" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Menu Section */}
        <div className="px-4 mb-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Menu</p>
          <div className="space-y-1">
            <button 
              onClick={() => setActiveSection('history')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                activeSection === 'history' 
                  ? 'bg-[#21262d] text-emerald-400' 
                  : 'text-gray-400 hover:bg-[#21262d] hover:text-white'
              }`}
            >
              <History className="w-5 h-5" />
              <span className="text-sm font-medium">History</span>
            </button>
            <button 
              onClick={() => setActiveSection('collection')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                activeSection === 'collection' 
                  ? 'bg-[#21262d] text-emerald-400' 
                  : 'text-gray-400 hover:bg-[#21262d] hover:text-white'
              }`}
            >
              <FolderOpen className="w-5 h-5" />
              <span className="text-sm font-medium">Collection</span>
            </button>
            <button 
              onClick={() => setActiveSection('bin')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                activeSection === 'bin' 
                  ? 'bg-[#21262d] text-emerald-400' 
                  : 'text-gray-400 hover:bg-[#21262d] hover:text-white'
              }`}
            >
              <Archive className="w-5 h-5" />
              <span className="text-sm font-medium">Bin</span>
            </button>
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto px-4 py-2">
          {loadingConversations ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 bg-[#21262d] rounded-lg animate-pulse" />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No conversations yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {conversations.map((conv) => {
                const isActive = currentConversation?.id === conv.id;
                
                return (
                  <div 
                    key={conv.id} 
                    className={`group relative rounded-lg transition-all ${
                      isActive ? 'bg-[#21262d]' : 'hover:bg-[#21262d]'
                    }`}
                  >
                    {editingTitle === conv.id ? (
                      <div className="px-3 py-2">
                        <input
                          ref={editInputRef}
                          type="text"
                          value={editTitleValue}
                          onChange={(e) => setEditTitleValue(e.target.value)}
                          onBlur={() => {
                            if (editTitleValue.trim()) {
                              updateConversationTitle(conv.id, editTitleValue.trim());
                            }
                            setEditingTitle(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              if (editTitleValue.trim()) {
                                updateConversationTitle(conv.id, editTitleValue.trim());
                              }
                              setEditingTitle(null);
                            }
                            if (e.key === 'Escape') setEditingTitle(null);
                          }}
                          className="w-full bg-[#0d1117] text-white text-sm px-2 py-1 rounded border border-emerald-500 outline-none"
                        />
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleSelectConversation(conv)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-left"
                      >
                        <MessageSquare className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-emerald-400' : 'text-gray-500'}`} />
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm truncate ${isActive ? 'text-white' : 'text-gray-300'}`}>
                            {conv.title}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatTime(conv.updated_at)}
                          </div>
                        </div>
                      </button>
                    )}
                    
                    {!editingTitle && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditTitleValue(conv.title);
                            setEditingTitle(conv.id);
                          }}
                          className="p-1 hover:bg-[#30363d] rounded text-gray-400 hover:text-white"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Delete this conversation?')) {
                              deleteConversation(conv.id);
                            }
                          }}
                          className="p-1 hover:bg-red-500/20 rounded text-gray-400 hover:text-red-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* General Section */}
        <div className="px-4 py-2 border-t border-[#30363d]">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">General</p>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-[#21262d] hover:text-white transition-all">
            <Settings className="w-5 h-5" />
            <span className="text-sm font-medium">Settings</span>
          </button>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[#30363d]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
              U
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">User</div>
              <div className="text-xs text-gray-500">user@example.com</div>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#21262d] hover:bg-[#30363d] rounded-lg text-gray-400 hover:text-white transition-all text-sm">
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#21262d] hover:bg-[#30363d] rounded-lg text-gray-400 hover:text-white transition-all text-sm">
              <RefreshCw className="w-4 h-4" />
              <span>Switch</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col w-full h-full min-w-0 bg-[#0d1117]">
        {/* Header */}
        <header className="h-14 sm:h-16 bg-[#161b22] border-b border-[#30363d] flex items-center justify-between px-4 sm:px-6 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-[#21262d] rounded-lg text-gray-400 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#21262d] rounded-lg flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-gray-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-white text-sm sm:text-base">
                    {currentConversation?.title || 'New Chat'}
                  </h2>
                  <button className="p-1 hover:bg-[#21262d] rounded text-gray-500 hover:text-white">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-gray-500">{formatDate()}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-[#21262d] rounded-lg text-gray-400 hover:text-white transition-colors">
              <Copy className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-[#21262d] rounded-lg text-gray-400 hover:text-white transition-colors">
              <Upload className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-[#21262d] rounded-lg text-gray-400 hover:text-white transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
            <Link 
              to="/" 
              className="p-2 hover:bg-[#21262d] rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              <Home className="w-5 h-5" />
            </Link>
          </div>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {messages.length === 0 ? (
            /* Welcome Screen */
            <div className="h-full flex flex-col items-center justify-center px-4 py-8">
              <div className="text-center mb-12">
                <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">NexusAI</h1>
                <p className="text-gray-500">Your Advanced AI Assistant</p>
              </div>
              
              {/* Feature Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl w-full px-4">
                {WELCOME_CARDS.map((card, idx) => {
                  const Icon = card.icon;
                  return (
                    <div 
                      key={idx}
                      className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 hover:border-emerald-500/50 transition-all"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-[#21262d] rounded-lg flex items-center justify-center">
                          <Icon className="w-4 h-4 text-emerald-400" />
                        </div>
                        <h3 className="font-semibold text-white">{card.title}</h3>
                      </div>
                      <div className="space-y-2">
                        {card.items.map((item, itemIdx) => (
                          <button
                            key={itemIdx}
                            onClick={() => setInput(item)}
                            className="w-full text-left p-3 bg-[#21262d] hover:bg-[#30363d] rounded-lg text-sm text-gray-400 hover:text-white transition-all"
                          >
                            "{item}" →
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* RAG Upload hint */}
              {currentMode.id === 'rag' && (
                <div className="mt-8">
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
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all disabled:opacity-50"
                  >
                    {uploading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5" />
                        <span>Upload Document for RAG</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Messages */
            <div className="max-w-3xl mx-auto px-4 py-6">
              {messages.map((msg, idx) => (
                <MessageBubble key={idx} role={msg.role} content={msg.content} />
              ))}
              
              {loading && (
                <div className="flex gap-4 mb-6">
                  <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-[#161b22] border border-[#30363d] px-4 py-3 rounded-xl">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-gradient-to-t from-[#0d1117] via-[#0d1117] to-transparent">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSend}>
              <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden">
                {/* Uploaded files display */}
                {uploadedFiles.length > 0 && currentMode.id === 'rag' && (
                  <div className="px-4 py-2 border-b border-[#30363d] flex flex-wrap gap-2">
                    {uploadedFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-2 px-2 py-1 bg-[#21262d] rounded-lg text-xs">
                        <FileText className="w-3 h-3 text-emerald-400" />
                        <span className="text-gray-300">{file.name}</span>
                        <span className="text-gray-500">({file.chunks} chunks)</span>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center gap-2 p-2">
                  {/* Attachment button */}
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2.5 hover:bg-[#21262d] rounded-lg text-gray-500 hover:text-white transition-colors"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".pdf,.txt"
                    className="hidden"
                  />
                  
                  {/* Mode Selector */}
                  <div className="relative" ref={dropdownRef}>
                    <button 
                      type="button"
                      onClick={() => setModeDropdownOpen(!modeDropdownOpen)}
                      className="flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white text-sm font-medium transition-all"
                    >
                      <currentMode.icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{currentMode.name}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${modeDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {modeDropdownOpen && (
                      <div className="absolute bottom-full left-0 mb-2 w-64 bg-[#161b22] border border-[#30363d] rounded-xl shadow-xl py-2 z-50">
                        {MODES.map((mode) => {
                          const Icon = mode.icon;
                          const isActive = currentMode.id === mode.id;
                          return (
                            <button
                              key={mode.id}
                              type="button"
                              onClick={() => {
                                setCurrentMode(mode);
                                setModeDropdownOpen(false);
                              }}
                              className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-[#21262d] transition-colors ${isActive ? 'bg-[#21262d]' : ''}`}
                            >
                              <div className="w-8 h-8 bg-[#0d1117] rounded-lg flex items-center justify-center flex-shrink-0">
                                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-gray-400'}`} />
                              </div>
                              <div className="text-left flex-1">
                                <div className={`font-medium text-sm ${isActive ? 'text-white' : 'text-gray-300'}`}>
                                  {mode.name}
                                </div>
                                <div className="text-xs text-gray-500">{mode.description}</div>
                              </div>
                              {isActive && <Check className="w-4 h-4 text-emerald-400 mt-1" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  
                  {/* Input */}
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Send a message..."
                    className="flex-1 bg-transparent px-3 py-2 text-white placeholder-gray-500 focus:outline-none text-sm"
                  />
                  
                  {/* Settings */}
                  <button 
                    type="button"
                    className="p-2.5 hover:bg-[#21262d] rounded-lg text-gray-500 hover:text-white transition-colors"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                  
                  {/* Send button */}
                  <button 
                    type="submit"
                    disabled={!input.trim() || loading}
                    className="p-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </form>
            
            <p className="text-center text-xs text-gray-600 mt-3">
              NexusAI may produce inaccurate information about people, places, or facts.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatInterface;
