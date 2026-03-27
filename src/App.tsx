import { useState, useEffect, useMemo, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ImpactMap, CATEGORY_COLORS } from './components/Map';
import { Chat } from './components/Chat';
import { generateMockBeneficiaries, BAREILLY_WARDS, BAREILLY_BOUNDARY, BAREILLY_NEIGHBORHOODS, Beneficiary } from './data/mockData';
import { generateMapFilter } from './services/gemini';
import { LayoutDashboard, Users, Map as MapIcon, Settings, LogOut, Bell } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface FeedItemData {
  id: string;
  time: string;
  msg: string;
  type: 'alert' | 'info' | 'success';
}

const initialFeed: FeedItemData[] = [
  { id: '1', time: '12:44', msg: 'Healthcare request in Ward 12', type: 'alert' },
  { id: '2', time: '12:42', msg: 'Education camp started', type: 'info' },
  { id: '3', time: '12:38', msg: 'System sync complete', type: 'success' },
  { id: '4', time: '12:35', msg: 'New beneficiary registered', type: 'info' },
];

export default function App() {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>(() => generateMockBeneficiaries(1500));
  const [feedItems, setFeedItems] = useState<FeedItemData[]>(initialFeed);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Welcome back, Parth. I am ready to help you analyze the foundation\'s impact across Bareilly. How can I assist you today?' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [mapFilter, setMapFilter] = useState<any>({});
  const [highlightWards, setHighlightWards] = useState<number[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeOp, setActiveOp] = useState('Overview');

  useEffect(() => {
    const interval = setInterval(() => {
      // Add a new beneficiary
      const newBeneficiary = generateMockBeneficiaries(1)[0];
      newBeneficiary.id = `new-${Date.now()}`;
      newBeneficiary.timestamp = Date.now();

      setBeneficiaries(prev => [...prev, newBeneficiary]);

      // Add a new feed item
      const now = new Date();
      const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const types: ('alert' | 'info' | 'success')[] = ['alert', 'info', 'success'];
      const msgs = [
        `New ${newBeneficiary.category} request in Ward ${newBeneficiary.wardId}`,
        `Impact recorded in Ward ${newBeneficiary.wardId}`,
        `Beneficiary assisted in Ward ${newBeneficiary.wardId}`,
      ];

      const newFeedItem: FeedItemData = {
        id: `feed-${Date.now()}`,
        time: timeString,
        msg: msgs[Math.floor(Math.random() * msgs.length)],
        type: types[Math.floor(Math.random() * types.length)],
      };

      setFeedItems(prev => [newFeedItem, ...prev].slice(0, 15)); // Keep last 15 items
    }, 4000); // Every 4 seconds

    return () => clearInterval(interval);
  }, []);

  const categoryCounts = useMemo(() => {
    return beneficiaries.reduce((acc, b) => {
      acc[b.category] = (acc[b.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [beneficiaries]);

  const dataSummary = useMemo(() => {
    const total = beneficiaries.length;
    return `Total beneficiaries: ${total}. Breakdown: ${JSON.stringify(categoryCounts)}`;
  }, [beneficiaries, categoryCounts]);

  const handleSendMessage = async (content: string) => {
    setMessages(prev => [...prev, { role: 'user', content }]);
    setIsTyping(true);

    try {
      const result = await generateMapFilter(content, dataSummary);
      setMessages(prev => [...prev, { role: 'assistant', content: result.explanation }]);
      setMapFilter(result.filter || {});
      setHighlightWards(result.highlightWards || []);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "I encountered an error processing your request. Please try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCategoryToggle = (category: string | null) => {
    setMapFilter((prev: any) => ({
      ...prev,
      category: prev.category === category ? null : category
    }));
  };

  const handleOpClick = (op: string) => {
    setActiveOp(op);
    switch (op) {
      case 'Overview':
        setMapFilter({});
        setHighlightWards([]);
        break;
      case 'Citizens':
        setMapFilter({ category: null }); // Show all
        setHighlightWards([]);
        break;
      case 'Wards':
        setMapFilter({});
        setHighlightWards(BAREILLY_WARDS.map(w => w.id));
        break;
      case 'Alerts':
        setMapFilter({ urgency: 'high' });
        setHighlightWards([]);
        break;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#050505] text-white font-sans overflow-hidden selection:bg-emerald-500/30">
      {/* Top HUD Bar */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-[#0a0a0a] z-30 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-emerald-500/5" />
        
        <div className="flex items-center gap-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <span className="font-bold text-black text-lg">P</span>
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight uppercase">Mission Control</h1>
              <p className="text-[8px] text-emerald-500/60 uppercase tracking-[0.3em] font-bold">Bareilly Sector • Active</p>
            </div>
          </div>
          
          <div className="h-8 w-[1px] bg-white/10 mx-2" />
          
          <div className="flex gap-4">
            <HUDStat label="System" value="Online" color="text-emerald-400" />
            <HUDStat label="Coverage" value="94.2%" color="text-blue-400" />
            <HUDStat label="Latency" value="12ms" color="text-emerald-400" />
          </div>
        </div>

        <div className="flex items-center gap-6 relative z-10">
          <div className="flex items-center gap-4 bg-white/5 px-4 py-2 rounded-2xl border border-white/10">
            <div className="flex flex-col items-end">
              <span className="text-2xl font-mono font-bold tracking-tighter text-[#FF9933] drop-shadow-[0_0_8px_rgba(255,153,51,0.4)]">
                {beneficiaries.length.toLocaleString()}
              </span>
              <span className="text-[7px] text-white/40 uppercase tracking-[0.2em] font-bold">Active Members</span>
            </div>
          </div>
          <button className="p-2 text-white/40 hover:text-white transition-colors">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex relative">
        {/* Left Operations Panel */}
        <aside className="w-64 border-r border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md z-20 flex flex-col p-4 gap-6">
          <PanelSection title="Operations">
            <div className="grid grid-cols-2 gap-2">
              <OpButton 
                icon={<LayoutDashboard className="w-4 h-4" />} 
                label="Overview" 
                active={activeOp === 'Overview'} 
                onClick={() => handleOpClick('Overview')}
              />
              <OpButton 
                icon={<MapIcon className="w-4 h-4" />} 
                label="Wards" 
                active={activeOp === 'Wards'} 
                onClick={() => handleOpClick('Wards')}
              />
            </div>
          </PanelSection>

          <PanelSection title="Live Feed" className="flex-1 min-h-0">
            <div className="flex-1 space-y-3 overflow-hidden mask-fade-y relative no-scrollbar">
              <AnimatePresence initial={false}>
                {feedItems.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: -20, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4, type: 'spring', bounce: 0.2 }}
                  >
                    <FeedItem time={item.time} msg={item.msg} type={item.type} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </PanelSection>

          <div className="mt-auto pt-4 border-t border-white/5">
            <div className="text-[9px] text-white/30 uppercase tracking-widest font-bold mb-3">
              Filters
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(CATEGORY_COLORS).map(([cat, color]) => {
                const isActive = !mapFilter.category || mapFilter.category === cat;
                return (
                  <button 
                    key={cat} 
                    onClick={() => handleCategoryToggle(cat)}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all duration-300 border ${
                      isActive ? 'bg-white/5 border-white/10' : 'opacity-30 border-transparent grayscale'
                    } hover:bg-white/10`}
                  >
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color, boxShadow: isActive ? `0 0 8px ${color}` : 'none' }} />
                    <span className="text-[8px] uppercase tracking-widest text-white font-bold whitespace-nowrap">{cat.replace('_', ' ')}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Central Map Area */}
        <main className="flex-1 relative bg-black">
          <ImpactMap 
            beneficiaries={beneficiaries} 
            wards={BAREILLY_WARDS} 
            neighborhoods={BAREILLY_NEIGHBORHOODS}
            boundary={BAREILLY_BOUNDARY}
            highlightWards={highlightWards}
            filter={mapFilter}
            onCategoryToggle={handleCategoryToggle}
          />
          
          {/* HUD Overlays */}
          <div className="absolute top-6 right-6 flex flex-col gap-3 pointer-events-none z-10">
            {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
              <MiniStat 
                key={cat} 
                label={cat.replace('_', ' ')} 
                value={categoryCounts[cat] || 0} 
                colorHex={color} 
              />
            ))}
          </div>

          <div className="absolute bottom-6 right-6 pointer-events-none">
            <div className="text-[8px] text-white/20 font-mono uppercase tracking-[0.4em]">
              Scanning Smart Bareilly 79.43E 28.37N
            </div>
          </div>
        </main>

        {/* Right Intelligence Panel (Optional/Floating) */}
      </div>

      {/* Floating Chat */}
      <Chat 
        onSendMessage={handleSendMessage} 
        messages={messages} 
        isTyping={isTyping} 
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen(!isChatOpen)}
      />
    </div>
  );
}

function HUDStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[7px] text-white/30 uppercase tracking-widest font-bold">{label}</span>
      <span className={`text-[10px] font-mono font-bold ${color}`}>{value}</span>
    </div>
  );
}

function PanelSection({ title, children, className = "" }: { title: string; children: ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <h3 className="text-[9px] text-white/30 uppercase tracking-[0.2em] font-bold border-l-2 border-emerald-500 pl-2">{title}</h3>
      {children}
    </div>
  );
}

function OpButton({ icon, label, active = false, onClick }: { icon: ReactNode; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-300 gap-2 border ${
      active ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-white/5 border-white/5 text-white/40 hover:text-white/60 hover:bg-white/10'
    }`}>
      {icon}
      <span className="text-[8px] uppercase tracking-widest font-bold">{label}</span>
    </button>
  );
}

function FeedItem({ time, msg, type }: { time: string; msg: string; type: 'alert' | 'info' | 'success' }) {
  const colors = {
    alert: 'text-amber-400',
    info: 'text-blue-400',
    success: 'text-emerald-400'
  };
  return (
    <div className="flex gap-3 text-[9px] font-mono leading-tight">
      <span className="text-white/20 shrink-0">{time}</span>
      <span className={`${colors[type]} opacity-80`}>{msg}</span>
    </div>
  );
}

function MiniStat({ label, value, colorHex }: { key?: string; label: string; value: string | number; colorHex: string }) {
  return (
    <div className="bg-black/60 backdrop-blur-md border border-white/10 p-3 rounded-xl min-w-[120px] flex items-center justify-between gap-4">
      <div className="flex flex-col">
        <div className="text-[7px] uppercase tracking-widest text-white/40 font-bold">{label}</div>
        <div className="text-lg font-mono font-bold text-white overflow-hidden">
          <motion.div
            key={value}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {value}
          </motion.div>
        </div>
      </div>
      <div className="w-1 h-8 rounded-full opacity-50" style={{ backgroundColor: colorHex }} />
    </div>
  );
}
