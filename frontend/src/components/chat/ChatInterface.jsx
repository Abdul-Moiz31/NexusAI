import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Send, Menu, X, Plus, MessageSquare, Upload, FileText, 
  Bot, Brain, Network, BookOpen, Trash2,
  Zap, Settings, Home, Edit2, Paperclip,
  History, FolderOpen, Archive, LogOut, Lightbulb,
  AlertTriangle, User, Crown
} from 'lucide-react';
import { Link } from 'react-router-dom';
import MessageBubble from './MessageBubble';
import SignUpModal from '../auth/SignUpModal';
import SettingsModal from '../settings/SettingsModal';
import { useAuth } from '../../context/AuthContext';

// API Base URL
const API_BASE = '/api/v1';

// Mode configurations with small icons
const MODES = [
  { 
    id: 'chat', 
    name: 'Chat', 
    fullName: 'Basic Chat',
    icon: MessageSquare, 
    description: 'Simple conversation with GPT-4o',
    endpoint: '/api/v1/chat/stream',
    streaming: true,
    tooltip: 'Basic Chat - Simple GPT-4o conversation'
  },
  { 
    id: 'agent', 
    name: 'Agent', 
    fullName: 'Agent (Tools)',
    icon: Zap, 
    description: 'AI with Calculator, Search & Knowledge Base',
    endpoint: '/api/v1/agent/chat',
    streaming: false,
    tooltip: 'Agent - Uses Calculator, Search, Knowledge Base'
  },
  { 
    id: 'graph', 
    name: 'Multi', 
    fullName: 'Multi-Agent',
    icon: Network, 
    description: 'Supervisor routes to Researcher or Tutor',
    endpoint: '/api/v1/agent/graph',
    streaming: false,
    tooltip: 'Multi-Agent - Supervisor routes to specialists'
  },
  { 
    id: 'rag', 
    name: 'RAG', 
    fullName: 'RAG (Docs)',
    icon: BookOpen, 
    description: 'Query your uploaded documents',
    endpoint: '/api/v1/rag/query',
    streaming: false,
    tooltip: 'RAG - Query uploaded documents'
  }
];

// Mode-specific welcome examples
const getModeExamples = (modeId) => {
  const examples = {
    chat: [
      { icon: Lightbulb, title: 'Examples', items: [
        'Explain quantum computing simply',
        'Write a poem about AI',
        'JavaScript HTTP request example'
      ]},
      { icon: Zap, title: 'Capabilities', items: [
        'Remembers conversation context',
        'Real-time streaming responses',
        'Markdown formatting support'
      ]},
      { icon: AlertTriangle, title: 'Limitations', items: [
        'May generate incorrect info',
        'Knowledge cutoff applies',
        'Cannot access the internet'
      ]}
    ],
    agent: [
      { icon: Lightbulb, title: 'Try These', items: [
        'Calculate 25 * 17 + 89',
        'Search for latest AI news',
        'Check my knowledge base'
      ]},
      { icon: Zap, title: 'Tools Available', items: [
        '🧮 Calculator - Math ops',
        '🔍 Web Search - Real-time',
        '📚 Knowledge Base - Docs'
      ]},
      { icon: AlertTriangle, title: 'How It Works', items: [
        'AI decides which tool',
        'Executes autonomously',
        'Returns with reasoning'
      ]}
    ],
    graph: [
      { icon: Lightbulb, title: 'Try These', items: [
        'Research machine learning history',
        'Teach me neural networks',
        'Compare Python vs JavaScript'
      ]},
      { icon: Zap, title: 'Agents', items: [
        '🔬 Researcher - Search expert',
        '📖 Tutor - Explains clearly',
        '🎯 Supervisor - Routes tasks'
      ]},
      { icon: AlertTriangle, title: 'How It Works', items: [
        'Supervisor analyzes request',
        'Routes to best specialist',
        'Agents collaborate'
      ]}
    ],
    rag: [
      { icon: Lightbulb, title: 'Try These', items: [
        'Summarize the document',
        'What are the key points?',
        'Find info about [topic]'
      ]},
      { icon: Zap, title: 'Capabilities', items: [
        '📄 PDF and TXT support',
        '🔍 Semantic search',
        '💡 Context-aware answers'
      ]},
      { icon: AlertTriangle, title: 'Tips', items: [
        'Upload documents first',
        'Ask specific questions',
        'Reference content directly'
      ]}
    ]
  };
  return examples[modeId] || examples.chat;
};

const ChatInterface = () => {
  // Auth
  const { 
    user, isGuest, promptCount, remainingPrompts, hasReachedLimit,
    setShowSignUpModal, incrementPromptCount, canSendMessage, signOut
  } = useAuth();

  // State
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentMode, setCurrentMode] = useState(MODES[0]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
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
  const editInputRef = useRef(null);
  const dropZoneRef = useRef(null);

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

  // Close sidebar on mobile when clicking outside
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Drag and drop handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Supported file types
  const SUPPORTED_FILE_TYPES = [
    'application/pdf',
    'text/plain',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/gif',
    'image/webp'
  ];

  const SUPPORTED_EXTENSIONS = ['.pdf', '.txt', '.png', '.jpg', '.jpeg', '.gif', '.webp'];

  const isFileSupported = (file) => {
    const extension = '.' + file.name.split('.').pop().toLowerCase();
    return SUPPORTED_FILE_TYPES.includes(file.type) || SUPPORTED_EXTENSIONS.includes(extension);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (isFileSupported(file)) {
        await processFileUpload(file);
      } else {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `❌ **Unsupported file type.** Supported formats: PDF, TXT, PNG, JPG, JPEG, GIF, WebP`
        }]);
      }
    }
  };

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
      setMessages(data.messages.map(m => ({ role: m.role, content: m.content })));
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
      setConversations(prev => prev.map(c => c.id === id ? { ...c, title } : c));
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

  // Process file upload
  const processFileUpload = async (file) => {
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
        content: `✅ **Document uploaded!**\n\n📄 **${file.name}** - ${data.chunks} chunks processed\n\nYou can now ask questions about this document.`
      }]);

      // Auto-switch to RAG mode when file is uploaded
      const ragMode = MODES.find(m => m.id === 'rag');
      if (ragMode) setCurrentMode(ragMode);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `❌ **Upload failed.** Make sure the backend is running.`
      }]);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Handle file upload from input
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    await processFileUpload(file);
  };

  // Handle sending messages
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    // Check if user can send message
    if (!canSendMessage()) {
      setShowSignUpModal(true);
      return;
    }

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    // Increment prompt count for guests
    incrementPromptCount();

    let convId = currentConversation?.id;
    if (!convId) {
      const newConv = await createConversation();
      if (newConv) convId = newConv.id;
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
          
          if (saveData.title) {
            setCurrentConversation(prev => prev ? { ...prev, title: saveData.title } : prev);
            setConversations(prev => prev.map(c => c.id === convId ? { ...c, title: saveData.title } : c));
          }
        }
      } else {
        let response;
        
        if (currentMode.id === 'rag') {
          response = await fetch(currentMode.endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: currentInput, conversation_id: convId })
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
        
        if (currentMode.id === 'rag' && data.sources?.length > 0) {
          reply += `\n\n📎 **Sources:** ${data.sources.join(', ')}`;
        }
        
        setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
        fetchConversations();
      }
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `❌ **Error:** Could not connect to the backend.`
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    setCurrentConversation(null);
    setMessages([]);
    setUploadedFiles([]);
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const handleSelectConversation = (conv) => {
    setCurrentConversation(conv);
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const handleModeChange = (mode) => {
    setCurrentMode(mode);
  };

  const handleLogout = () => {
    signOut();
    handleNewChat();
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString();
  };

  return (
    <div 
      className="flex h-screen h-[100dvh] bg-[#0d1117] overflow-hidden"
      onDragEnter={handleDragEnter}
    >
      {/* Sign Up Modal */}
      <SignUpModal />

      {/* Settings Modal */}
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />

      {/* Drag Overlay */}
      {isDragging && (
        <div 
          className="fixed inset-0 bg-emerald-500/10 border-4 border-dashed border-emerald-500 z-50 flex items-center justify-center"
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="bg-[#161b22] border border-emerald-500 rounded-2xl p-8 text-center">
            <Upload className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Drop your file here</h3>
            <p className="text-gray-400">Supports PDF, TXT, PNG, JPG, JPEG, GIF, WebP</p>
          </div>
        </div>
      )}

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
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed lg:relative z-30 w-64 h-full bg-[#161b22] border-r border-[#30363d] transition-transform duration-300 ease-in-out flex flex-col`}
      >
        {/* Sidebar Header */}
        <div className="p-3 border-b border-[#30363d] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold text-white">NexusAI</span>
          </Link>
          <button 
            onClick={() => setSidebarOpen(false)} 
            className="lg:hidden p-1.5 hover:bg-[#21262d] rounded-lg text-gray-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button 
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-all font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Guest Prompt Counter */}
        {isGuest && (
          <div className="mx-3 mb-2 p-2.5 bg-[#21262d] border border-[#30363d] rounded-lg">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-gray-400">Free prompts</span>
              <span className="text-emerald-400 font-bold">{remainingPrompts}/5</span>
            </div>
            <div className="w-full h-1 bg-[#30363d] rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${(remainingPrompts / 5) * 100}%` }}
              />
            </div>
            {remainingPrompts <= 2 && (
              <button 
                onClick={() => setShowSignUpModal(true)}
                className="w-full mt-1.5 py-1 text-xs text-emerald-400 hover:text-emerald-300 font-medium"
              >
                Sign up for unlimited →
              </button>
            )}
          </div>
        )}

        {/* Menu Section */}
        <div className="px-3 mb-2">
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1 px-2">Menu</p>
          <div className="space-y-0.5">
            {[
              { id: 'history', icon: History, label: 'History' },
              { id: 'collection', icon: FolderOpen, label: 'Collection' },
              { id: 'bin', icon: Archive, label: 'Bin' }
            ].map(item => (
              <button 
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all text-sm ${
                  activeSection === item.id 
                    ? 'bg-[#21262d] text-emerald-400' 
                    : 'text-gray-400 hover:bg-[#21262d] hover:text-white'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto px-3 py-1">
          {loadingConversations ? (
            <div className="space-y-1.5">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-9 bg-[#21262d] rounded-lg animate-pulse" />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-4">
              <MessageSquare className="w-5 h-5 text-gray-600 mx-auto mb-1.5" />
              <p className="text-gray-500 text-xs">No conversations yet</p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {conversations.map((conv) => {
                const isActive = currentConversation?.id === conv.id;
                
                return (
                  <div 
                    key={conv.id} 
                    className={`group relative rounded-lg transition-all ${isActive ? 'bg-[#21262d]' : 'hover:bg-[#21262d]'}`}
                  >
                    {editingTitle === conv.id ? (
                      <div className="px-2 py-1">
                        <input
                          ref={editInputRef}
                          type="text"
                          value={editTitleValue}
                          onChange={(e) => setEditTitleValue(e.target.value)}
                          onBlur={() => {
                            if (editTitleValue.trim()) updateConversationTitle(conv.id, editTitleValue.trim());
                            setEditingTitle(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              if (editTitleValue.trim()) updateConversationTitle(conv.id, editTitleValue.trim());
                              setEditingTitle(null);
                            }
                            if (e.key === 'Escape') setEditingTitle(null);
                          }}
                          className="w-full bg-[#0d1117] text-white text-xs px-2 py-1 rounded border border-emerald-500 outline-none"
                        />
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleSelectConversation(conv)}
                        className="w-full flex items-center gap-2 px-2 py-1.5 text-left"
                      >
                        <MessageSquare className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-emerald-400' : 'text-gray-500'}`} />
                        <div className="flex-1 min-w-0">
                          <div className={`text-xs truncate ${isActive ? 'text-white' : 'text-gray-300'}`}>
                            {conv.title}
                          </div>
                        </div>
                        <span className="text-[10px] text-gray-500 flex-shrink-0">
                          {formatTime(conv.updated_at)}
                        </span>
                      </button>
                    )}
                    
                    {!editingTitle && (
                      <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 flex gap-0.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditTitleValue(conv.title);
                            setEditingTitle(conv.id);
                          }}
                          className="p-1 hover:bg-[#30363d] rounded text-gray-400 hover:text-white"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Delete this conversation?')) deleteConversation(conv.id);
                          }}
                          className="p-1 hover:bg-red-500/20 rounded text-gray-400 hover:text-red-400"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Settings */}
        <div className="px-3 py-2 border-t border-[#30363d]">
          <button 
            onClick={() => setSettingsOpen(true)}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-gray-400 hover:bg-[#21262d] hover:text-white transition-all text-sm"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>

        {/* User Profile */}
        <div className="p-3 border-t border-[#30363d]">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs ${
              user ? 'bg-gradient-to-br from-emerald-500 to-cyan-500' : 'bg-gradient-to-br from-gray-500 to-gray-600'
            }`}>
              {user ? user.name?.charAt(0).toUpperCase() || 'U' : 'G'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">
                {user ? user.name || user.email : 'Guest'}
              </div>
              <div className="text-[10px] text-gray-500">
                {user ? 'Pro Account' : 'Free Trial'}
              </div>
            </div>
            {user ? (
              <button 
                onClick={handleLogout}
                className="p-1.5 hover:bg-[#21262d] rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            ) : (
              <button 
                onClick={() => setShowSignUpModal(true)}
                className="p-1.5 hover:bg-[#21262d] rounded-lg text-emerald-400 hover:text-emerald-300"
                title="Sign Up"
              >
                <Crown className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main 
        ref={dropZoneRef}
        className="flex-1 flex flex-col w-full h-full min-w-0 bg-[#0d1117]"
      >
        {/* Header */}
        <header className="h-12 bg-[#161b22] border-b border-[#30363d] flex items-center justify-between px-3 sticky top-0 z-10 flex-shrink-0">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 hover:bg-[#21262d] rounded-lg text-gray-400"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="font-medium text-white text-sm truncate max-w-[150px] sm:max-w-[250px]">
              {currentConversation?.title || 'New Chat'}
            </h2>
          </div>
          
          <div className="flex items-center gap-1">
            <button 
              onClick={handleNewChat}
              className="p-1.5 hover:bg-[#21262d] rounded-lg text-gray-400 hover:text-white"
              title="New Chat"
            >
              <Plus className="w-4 h-4" />
            </button>
            <Link to="/" className="p-1.5 hover:bg-[#21262d] rounded-lg text-gray-400 hover:text-white">
              <Home className="w-4 h-4" />
            </Link>
          </div>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {messages.length === 0 ? (
            /* Welcome Screen */
            <div className="h-full flex flex-col items-center justify-center px-4 py-6">
              <div className="text-center mb-8">
                <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <currentMode.icon className="w-7 h-7 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{currentMode.fullName}</h1>
                <p className="text-gray-500 text-sm">{currentMode.description}</p>
              </div>
              
              {/* Feature Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl w-full px-4">
                {getModeExamples(currentMode.id).map((card, idx) => {
                  const Icon = card.icon;
                  return (
                    <div key={idx} className="bg-[#161b22] border border-[#30363d] rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-3">
                        <Icon className="w-4 h-4 text-emerald-400" />
                        <h3 className="font-medium text-white text-sm">{card.title}</h3>
                      </div>
                      <div className="space-y-1.5">
                        {card.items.map((item, itemIdx) => (
                          <button
                            key={itemIdx}
                            onClick={() => !item.startsWith('🧮') && !item.startsWith('🔍') && !item.startsWith('📚') && !item.startsWith('🔬') && !item.startsWith('📖') && !item.startsWith('🎯') && !item.startsWith('📄') && setInput(item)}
                            className={`w-full text-left p-2 bg-[#21262d] rounded-lg text-xs transition-all ${
                              item.match(/^[🧮🔍📚🔬📖🎯📄💡]/) 
                                ? 'text-gray-300 cursor-default' 
                                : 'text-gray-400 hover:bg-[#30363d] hover:text-white cursor-pointer'
                            }`}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* RAG Upload hint */}
              {currentMode.id === 'rag' && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-6 flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Document</span>
                </button>
              )}

              {/* Drag & Drop hint */}
              <p className="mt-4 text-xs text-gray-600">
                💡 Tip: Drag and drop files anywhere to upload
              </p>
            </div>
          ) : (
            /* Messages */
            <div className="max-w-3xl mx-auto px-4 py-4">
              {messages.map((msg, idx) => (
                <MessageBubble key={idx} role={msg.role} content={msg.content} />
              ))}
              
              {loading && (
                <div className="flex gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-[#161b22] border border-[#30363d] px-3 py-2.5 rounded-xl">
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area - Fixed at bottom */}
        <div className="p-3 bg-[#0d1117] border-t border-[#30363d] flex-shrink-0">
          <div className="max-w-3xl mx-auto">
            {/* Limit Warning */}
            {isGuest && remainingPrompts <= 2 && remainingPrompts > 0 && (
              <div className="mb-2 flex items-center justify-center gap-2 text-xs text-amber-400">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{remainingPrompts} prompt{remainingPrompts !== 1 ? 's' : ''} remaining</span>
              </div>
            )}

            <form onSubmit={handleSend}>
              <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden">
                {/* Uploaded files */}
                {uploadedFiles.length > 0 && (
                  <div className="px-3 py-1.5 border-b border-[#30363d] flex flex-wrap gap-1.5">
                    {uploadedFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 px-2 py-0.5 bg-[#21262d] rounded text-[10px]">
                        <FileText className="w-3 h-3 text-emerald-400" />
                        <span className="text-gray-300 truncate max-w-[100px]">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== idx))}
                          className="text-gray-500 hover:text-red-400"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center gap-1 p-1.5">
                  {/* Attachment */}
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 hover:bg-[#21262d] rounded-lg text-gray-500 hover:text-white flex-shrink-0"
                    title="Upload file"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".pdf,.txt,.png,.jpg,.jpeg,.gif,.webp"
                    className="hidden"
                  />

                  {/* Mode Icons - Small bubble style like ChatGPT */}
                  <div className="flex items-center gap-0.5 px-1 flex-shrink-0">
                    {MODES.map((mode) => {
                      const Icon = mode.icon;
                      const isActive = currentMode.id === mode.id;
                      return (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => handleModeChange(mode)}
                          title={mode.tooltip}
                          className={`p-1.5 rounded-lg transition-all ${
                            isActive 
                              ? 'bg-emerald-600 text-white' 
                              : 'text-gray-500 hover:text-white hover:bg-[#21262d]'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* Input */}
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={hasReachedLimit ? "Sign up to continue..." : `Message ${currentMode.name}...`}
                    disabled={hasReachedLimit}
                    className="flex-1 bg-transparent px-2 py-2 text-white placeholder-gray-500 focus:outline-none text-sm min-w-0 disabled:cursor-not-allowed"
                  />
                  
                  {/* Send */}
                  <button 
                    type="submit"
                    disabled={!input.trim() || loading || hasReachedLimit}
                    className="p-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </form>
            
            <p className="text-center text-[10px] text-gray-600 mt-2">
              NexusAI may produce inaccurate information.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatInterface;
