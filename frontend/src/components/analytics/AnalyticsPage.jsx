import React, { useEffect, useState, useRef } from 'react';
import { Card } from '../common/Card';
import { useAuth } from '../auth/AuthContext';
import { apiRequest } from '../../lib/api';

export function AnalyticsPage() {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [financeId, setFinanceId] = useState(null); 
  const [sidebarInsights, setSidebarInsights] = useState(null);
  const [chatHistory, setChatHistory] = useState(() => {
    const saved = localStorage.getItem("fina_chat_history");
    return saved ? JSON.parse(saved) : [];
  });

  const chatEndRef = useRef(null);
  const formatCurrency = (amount, currency = 'VND') => {
    if (amount === undefined || amount === null) return '0';
    return Number(amount).toLocaleString('vi-VN', { 
        style: 'decimal', 
        maximumFractionDigits: 0 
    });
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, analyzing]);

  useEffect(() => {
    localStorage.setItem("fina_chat_history", JSON.stringify(chatHistory));
  }, [chatHistory]);

  useEffect(() => {
    const loadAnalytics = async () => {
      if (!token) return;

      try {
        if (!sidebarInsights) setLoading(true);
        setError('');
        
        let targetId = user?.fid || user?.id; 
        try {
            const profile = await apiRequest('/api/users/me', { token, method: 'GET' });
            if (profile && profile.id) {
                targetId = profile.id;
                setFinanceId(profile.id);
            }
        } catch (err) {
            console.warn("Could not verify Finance ID:", targetId);
        }

        const dashboardData = await apiRequest(`/api/insights/dashboard/${targetId}`, {
            token,
            method: 'GET'
        });

        if (dashboardData) {
            setSidebarInsights({
              insights: dashboardData.smart_insights,
              prediction: dashboardData.prediction
            });

            setChatHistory(prev => {
                if (prev.length === 0) {
                    return [{
                        id: 'init-1',
                        sender: 'ai',
                        text: dashboardData.initial_message || "Hello! I've analyzed your finances.",
                        cards: dashboardData.summary_cards || []
                    }];
                }
                return prev;
            });
        }
      } catch (e) {
        console.error("Analytics Load Error:", e);
        setError("Could not load financial data.");
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [token]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || analyzing) return;

    const targetId = financeId || user?.fid || user?.id;
    const userMsg = { id: Date.now(), sender: 'user', text: inputValue };
    
    setChatHistory(prev => [...prev, userMsg]);
    setInputValue('');
    setAnalyzing(true); 

    try {
      const response = await apiRequest('/api/insights/chat', {
        token,
        method: 'POST',
        body: { 
          user_id: Number(targetId),
          message: userMsg.text 
        }
      });

      setChatHistory(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'ai',
        text: response.response || "I couldn't process that request.",
      }]);

    } catch (err) {
      setChatHistory(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'ai',
        text: "I'm having trouble connecting to the Brain.",
        isError: true
      }]);
    } finally {
      setAnalyzing(false);
    }
  };

  const renderMessageText = (text) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-bold text-indigo-900">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const getCardStyles = (type) => {
    switch (type) {
      case 'warning': return 'bg-rose-50 border-rose-200 text-rose-700';
      case 'success': return 'bg-emerald-50 border-emerald-200 text-emerald-700';
      case 'danger':  return 'bg-red-50 border-red-200 text-red-700';
      case 'info':    return 'bg-blue-50 border-blue-200 text-blue-700';
      default:        return 'bg-slate-50 border-slate-200 text-slate-600';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 p-4 md:p-0 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 rounded"></div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <Card className="lg:col-span-3 h-[700px] bg-slate-100"></Card>
          <div className="lg:col-span-2 space-y-4">
             <Card className="h-48 bg-slate-100"></Card>
             <Card className="h-48 bg-slate-100"></Card>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="max-w-7xl mx-auto p-4">Error: {error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4 md:p-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">AI Financial Insights</h1>
          <p className="text-sm text-slate-500">Powered by FINA Local Brain</p>
        </div>
        <button onClick={() => { localStorage.removeItem("fina_chat_history"); setChatHistory([]); }} className="text-xs text-slate-400 hover:text-red-500">Clear History</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Chat Section */}
        <div className="lg:col-span-3">
          <Card className="flex flex-col h-[700px] overflow-hidden p-0 shadow-lg border-0">
            <div className="p-6 border-b border-slate-100 bg-white">
              <h2 className="text-lg font-bold text-slate-900">FINA Assistant</h2>
              <p className="text-xs text-slate-500">Online & Ready</p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
              {chatHistory.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                  {msg.sender === 'ai' && <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">🤖</div>}
                  
                  <div className="space-y-3 max-w-[85%]">
                    <div className={`rounded-2xl p-4 shadow-sm text-sm ${msg.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 border border-slate-100'}`}>
                      <div className="whitespace-pre-wrap font-medium">{msg.sender === 'user' ? msg.text : renderMessageText(msg.text)}</div>
                    </div>

                    {msg.sender === 'ai' && msg.cards && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                        {msg.cards.map((card) => (
                          <div key={card.id} className={`rounded-xl p-4 border ${getCardStyles(card.type)}`}>
                            <div className="text-[10px] uppercase font-bold opacity-70 mb-2">{card.badge}</div>
                            {/* Force Backend strings to look nice, or if number use formatter */}
                            <div className="text-2xl font-bold mb-1">{card.subtitle}</div>
                            <div className="text-xs opacity-90">{card.title}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {analyzing && <div className="text-xs text-slate-400">Thinking...</div>}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 border-t border-slate-200 bg-white">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !analyzing && handleSendMessage()}
                  placeholder="Ask FINA..."
                  className="flex-1 px-4 py-3 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
                <button onClick={handleSendMessage} className="px-4 bg-indigo-600 text-white rounded-xl">Send</button>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-6 border-0 shadow-md">
            <h3 className="text-sm font-bold mb-4">Smart Insights</h3>
            <div className="space-y-3">
              {sidebarInsights?.insights?.map((insight, idx) => (
                <div key={idx} className={`p-4 rounded-xl border-l-4 ${insight.type === 'warning' ? 'bg-amber-50 border-amber-400' : 'bg-indigo-50 border-indigo-400'}`}>
                  <div className="font-bold text-xs uppercase opacity-80">{insight.title}</div>
                  <div className="text-sm">{insight.desc}</div>
                </div>
              )) || <div className="text-slate-400">Loading...</div>}
            </div>
          </Card>

          <Card className="p-6 border-0 shadow-md bg-slate-900 text-white">
            <h3 className="text-sm font-bold mb-4 text-emerald-400">AI Forecast</h3>
            {sidebarInsights?.prediction ? (
              <div>
                <div className="text-xs text-slate-400 mb-1">{sidebarInsights.prediction.label || 'Projected Spend'}</div>
                <div className="text-3xl font-bold text-white">
                  {formatCurrency(sidebarInsights.prediction.amount)}đ
                </div>
                <div className="mt-2 text-xs text-slate-400">Confidence: {sidebarInsights.prediction.confidence}%</div>
              </div>
            ) : <div>Loading...</div>}
          </Card>
        </div>
      </div>
    </div>
  );
}