import React, { useEffect, useState, useRef } from 'react';
import { Card } from '../common/Card';
import { useAuth } from '../auth/AuthContext';
import { apiRequest } from '../../lib/api';

export function AnalyticsPage() {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Data States
  const [chatHistory, setChatHistory] = useState([]);
  const [sidebarInsights, setSidebarInsights] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  // Auto-scroll to bottom of chat
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, analyzing]);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        setError('');
        await new Promise(resolve => setTimeout(resolve, 800)); 

        const mockData = {
          initial_message: "Hi! I've analyzed your transactions from the past 30 days. Here's what I found:",
          cards: [
            { id: 1, type: 'warning', title: 'Food & Dining', subtitle: '37% of total expenses', badge: 'HIGH SPENDING' },
            { id: 2, type: 'success', title: 'Savings Rate', subtitle: '36% this month', badge: 'GOOD JOB' },
            { id: 3, type: 'trend', title: 'Spending Up', subtitle: '+15% vs last month', badge: 'TREND' },
            { id: 4, type: 'tip', title: 'Save $400', subtitle: 'Cook 3x/week', badge: 'TIP' },
          ],
          smart_insights: [
            { id: 1, type: 'warning', title: 'Unusual Spending', desc: 'You spent $300 more on shopping this week.' },
            { id: 2, type: 'success', title: 'Great Job!', desc: 'Your savings rate is 15% higher than average.' },
            { id: 3, type: 'info', title: 'Spending Pattern', desc: 'You tend to spend more on weekends (+40%).' },
          ],
          prediction: {
            amount: 780,
            confidence: 78,
            next_week_label: 'Expected spending next week'
          }
        };

        setChatHistory([
          {
            id: 'init-1',
            sender: 'ai',
            text: mockData.initial_message,
            cards: mockData.cards
          }
        ]);
        setSidebarInsights({
          insights: mockData.smart_insights,
          prediction: mockData.prediction
        });

      } catch (e) {
        setError(e.message || 'Failed to load analytics');
        console.error('Load error:', e);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [token]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || analyzing) return;

    const userMsg = { id: Date.now(), sender: 'user', text: inputValue };
    setChatHistory(prev => [...prev, userMsg]);
    setInputValue('');
    setAnalyzing(true); 

    try {
      const response = await apiRequest('/api/insights/chat', {
        token,
        method: 'POST',
        body: { 
          user_id: Number(user?.id || 1), 
          message: userMsg.text 
        }
      });

      setChatHistory(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'ai',
        text: response.response || response.message || "I couldn't process that request.",
      }]);

    } catch (err) {
      console.error("Failed to connect to AI backend:", err);
      setChatHistory(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'ai',
        text: "I'm having trouble connecting to the server right now. Please try again later.",
        isError: true
      }]);
    } finally {
      setAnalyzing(false);
    }
  };

  const getCardStyles = (type) => {
    switch (type) {
      case 'warning': return 'bg-gradient-to-br from-rose-50 to-rose-100 border-rose-200 text-rose-600';
      case 'success': return 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-600';
      case 'trend': return 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 text-amber-600';
      case 'tip': return 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 text-blue-600';
      default: return 'bg-slate-50 border-slate-200 text-slate-600';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 p-4 md:p-0">
        <div className="flex justify-between">
           <div className="h-8 w-48 bg-slate-200 rounded animate-pulse"></div>
           <div className="h-8 w-32 bg-slate-200 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <Card className="lg:col-span-3 h-[700px] p-6 flex flex-col gap-4">
             <div className="h-16 bg-slate-100 rounded animate-pulse w-full"></div>
             <div className="h-32 bg-slate-100 rounded animate-pulse w-3/4"></div>
             <div className="h-16 bg-slate-100 rounded animate-pulse w-1/2 self-end"></div>
          </Card>
          <div className="lg:col-span-2 space-y-4">
             <Card className="h-48 bg-slate-100 animate-pulse"></Card>
             <Card className="h-48 bg-slate-100 animate-pulse"></Card>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <Card className="p-5 border-red-200 bg-red-50">
          <div className="text-red-600 font-medium">Error loading analytics: {error}</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4 md:p-0">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">AI Financial Insights</h1>
          <p className="text-sm text-slate-500">Powered by GPT-4 + Your Transaction History</p>
        </div>
        <button className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center justify-center gap-2 transition-colors bg-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Chat Section */}
        <div className="lg:col-span-3">
          <Card className="flex flex-col h-[700px] overflow-hidden p-0">
            {/* Chat Header */}
            <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-indigo-500 to-purple-600">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Your AI Financial Advisor</h2>
                  <p className="text-xs text-white/80">I've analyzed your spending patterns.</p>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
              {chatHistory.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                  
                  {msg.sender === 'ai' && (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 text-white shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>
                    </div>
                  )}

                  <div className="space-y-3 max-w-[85%]">
                    <div className={`rounded-2xl p-4 shadow-sm text-sm ${
                      msg.sender === 'user' 
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' 
                        : msg.isError
                        ? 'bg-red-50 text-red-900 border border-red-200'
                        : 'bg-white text-slate-900'
                    }`}>
                      {msg.text}
                    </div>

                    {msg.sender === 'ai' && msg.cards && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {msg.cards.map((card) => (
                          <div key={card.id} className={`rounded-xl p-4 border ${getCardStyles(card.type)}`}>
                            <div className="text-xs font-semibold mb-1 flex items-center gap-1 opacity-90">
                              {card.badge}
                            </div>
                            <div className="text-slate-900 font-bold text-lg">{card.title}</div>
                            <div className="text-xs text-slate-600 mt-1">{card.subtitle}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {msg.sender === 'user' && (
                    <div className="w-10 h-10 rounded-full bg-slate-300 flex items-center justify-center flex-shrink-0 text-slate-500 shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </div>
                  )}
                </div>
              ))}

              {/* Thinking Indicator */}
              {analyzing && (
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 text-white shadow-sm">
                    <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                  </div>
                  <div className="bg-white rounded-2xl p-4 shadow-sm text-sm text-slate-900">
                    <div className="flex items-center gap-2">
                      <span>Analyzing</span>
                      <span className="animate-pulse">...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-slate-200 bg-white">
              <div className="flex gap-3 mb-3">
                <input 
                  type="text" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !analyzing && handleSendMessage()}
                  placeholder="Ask about your finances..."
                  disabled={analyzing}
                  className="flex-1 px-4 py-3 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:bg-slate-50 disabled:cursor-not-allowed"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={analyzing || !inputValue.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {analyzing ? 'Sending...' : 'Send'}
                </button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {['How much can I save?', 'Compare to last month', 'Set a savings goal'].map((qs) => (
                  <button 
                    key={qs} 
                    onClick={() => !analyzing && setInputValue(qs)}
                    disabled={analyzing}
                    className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-full hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {qs}
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar Section */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Smart Insights Panel */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4 text-slate-900">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-1 1.5-2 1.5-3.5 0-2.2-1.8-4-4-4-1.7 0-3 1-3.5 2.5a4 4 0 0 0 0 4c.8.8 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
              <h3 className="text-sm font-bold">Smart Insights</h3>
            </div>
            <div className="space-y-3">
              {sidebarInsights?.insights.map((insight) => (
                <div key={insight.id} className={`p-3 rounded-lg border ${
                  insight.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-900' :
                  insight.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' :
                  'bg-blue-50 border-blue-200 text-blue-900'
                }`}>
                  <div className="flex items-start gap-3">
                    <div>
                      <div className="text-xs font-semibold">{insight.title}</div>
                      <div className="text-xs opacity-80 mt-1">{insight.desc}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Predictions Panel */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4 text-slate-900">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
              <h3 className="text-sm font-bold">AI Predictions</h3>
            </div>
            {sidebarInsights?.prediction && (
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-slate-500 mb-2">{sidebarInsights.prediction.next_week_label}:</div>
                  <div className="text-2xl font-bold text-slate-900">${sidebarInsights.prediction.amount}</div>
                  <div className="text-xs text-slate-500 mt-1">Based on your habits</div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div 
                    className="bg-indigo-500 h-2 rounded-full transition-all duration-1000" 
                    style={{ width: `${sidebarInsights.prediction.confidence}%` }}
                  ></div>
                </div>
                <div className="text-xs text-slate-600">
                  {sidebarInsights.prediction.confidence}% confidence • Updated just now
                </div>
              </div>
            )}
          </Card>

        </div>
      </div>
    </div>
  );
}