import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, Activity, Search, User, Clock, ExternalLink, 
  Maximize2, RefreshCcw, Video, Newspaper, Twitter, 
  AlertTriangle, CheckCircle2, Info, Brain, X,
  LayoutGrid, ChevronRight, MessageSquare
} from 'lucide-react';
import YouTube from 'react-youtube';
// @ts-ignore
import * as RGL from 'react-grid-layout';

const { Responsive, useContainerWidth } = RGL;

interface CommandCentreProps {
  isOpen: boolean;
  onClose: () => void;
}

// --- MOCK DATA GENERATORS ---

const generateNews = () => [
  { id: 1, title: "Bareilly Smart City Project Phase 4 Approved", source: "TOI", time: "2m ago", type: "info" },
  { id: 2, title: "Heavy Rainfall Alert in Western UP for next 24h", source: "IMD", time: "15m ago", type: "warning" },
  { id: 3, title: "UP CM to visit Bareilly for Infrastructure Review", source: "News18", time: "1h ago", type: "info" },
  { id: 4, title: "New Traffic Regulations in Civil Lines Area", source: "Local Admin", time: "2h ago", type: "info" },
  { id: 5, title: "Bareilly Airport expansion work gains momentum", source: "Dainik Jagran", time: "4h ago", type: "success" },
];

const generateTweets = (keyword: string) => [
  { id: 1, user: "@Bareilly_Admin", text: `Updates on ${keyword}: New citizen helpline launched for emergency services.`, time: "5m ago" },
  { id: 2, user: "@UPGovt", text: `CM reviews development projects in ${keyword} and surrounding districts.`, time: "12m ago" },
  { id: 3, user: "@CitizenVoice", text: `Great to see the new parks in ${keyword} being maintained so well!`, time: "20m ago" },
  { id: 4, user: "@TrafficUpdate", text: `Congestion reported near Railway Station. Plan your travel accordingly.`, time: "35m ago" },
];

const generateAlerts = () => [
  { id: 1, title: "Heatwave Warning", summary: "Temperature expected to cross 44°C. Citizens advised to stay hydrated.", time: "10:30 AM", level: "warning" },
  { id: 2, title: "Power Grid Maintenance", summary: "Scheduled maintenance in Subhash Nagar. Expected downtime: 2 hours.", time: "09:15 AM", level: "info" },
  { id: 3, title: "Security Alert: High Alert", summary: "Increased patrolling in market areas following national security advisory.", time: "08:45 AM", level: "critical" },
];

const CCTV_LOCATIONS = [
  "Railway Station Exit", "Civil Lines Square", "Kutub Khana Market", 
  "Chaupula Flyover", "Bareilly College Gate", "District Hospital",
  "Satellite Bus Stand", "IVRI Road", "Nainital Road Junction"
];

// --- COMPONENTS ---

const Panel = ({ title, icon: Icon, children, className = "", onRefresh }: any) => (
  <div className={`bg-[#0a0a0f] border border-white/10 rounded-lg overflow-hidden flex flex-col shadow-2xl ${className}`}>
    <div className="bg-white/5 px-4 py-2 flex items-center justify-between border-b border-white/5">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-emerald-500" />
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/80">{title}</h3>
      </div>
      <div className="flex items-center gap-2">
        {onRefresh && (
          <button onClick={onRefresh} className="p-1 hover:bg-white/10 rounded transition-colors">
            <RefreshCcw className="w-3 h-3 text-white/40" />
          </button>
        )}
        <button className="p-1 hover:bg-white/10 rounded transition-colors">
          <Maximize2 className="w-3 h-3 text-white/40" />
        </button>
      </div>
    </div>
    <div className="flex-1 overflow-auto p-4 custom-scrollbar">
      {children}
    </div>
  </div>
);

export const CommandCentre = ({ isOpen, onClose }: CommandCentreProps) => {
  const [time, setTime] = useState(new Date());
  const [news, setNews] = useState(generateNews());
  const [tweets, setTweets] = useState(generateTweets("Bareilly"));
  const [pmTweets, setPmTweets] = useState(generateTweets("India"));
  const [cmTweets, setCmTweets] = useState(generateTweets("UP"));
  const [alerts, setAlerts] = useState(generateAlerts());
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    const refreshTimer = setInterval(() => {
      setNews(generateNews());
      setTweets(generateTweets("Bareilly"));
      setAlerts(generateAlerts());
    }, 60000);

    return () => {
      clearInterval(timer);
      clearInterval(refreshTimer);
    };
  }, []);

  const { width, containerRef } = useContainerWidth();

  const layout = {
    lg: [
      { i: 'video', x: 0, y: 0, w: 8, h: 4 },
      { i: 'news', x: 8, y: 0, w: 4, h: 4 },
      { i: 'sentiment', x: 0, y: 4, w: 4, h: 4 },
      { i: 'pm', x: 4, y: 4, w: 4, h: 4 },
      { i: 'cm', x: 8, y: 4, w: 4, h: 4 },
      { i: 'surveillance', x: 0, y: 8, w: 8, h: 4 },
      { i: 'alerts', x: 8, y: 8, w: 4, h: 4 },
      { i: 'ai', x: 0, y: 12, w: 12, h: 2 },
    ],
    md: [
      { i: 'video', x: 0, y: 0, w: 10, h: 4 },
      { i: 'news', x: 0, y: 4, w: 10, h: 4 },
      { i: 'sentiment', x: 0, y: 8, w: 5, h: 4 },
      { i: 'pm', x: 5, y: 8, w: 5, h: 4 },
      { i: 'cm', x: 0, y: 12, w: 5, h: 4 },
      { i: 'surveillance', x: 5, y: 12, w: 5, h: 4 },
      { i: 'alerts', x: 0, y: 16, w: 10, h: 4 },
      { i: 'ai', x: 0, y: 20, w: 10, h: 2 },
    ],
    sm: [
      { i: 'video', x: 0, y: 0, w: 6, h: 4 },
      { i: 'news', x: 0, y: 4, w: 6, h: 4 },
      { i: 'sentiment', x: 0, y: 8, w: 6, h: 4 },
      { i: 'pm', x: 0, y: 12, w: 6, h: 4 },
      { i: 'cm', x: 0, y: 16, w: 6, h: 4 },
      { i: 'surveillance', x: 0, y: 20, w: 6, h: 4 },
      { i: 'alerts', x: 0, y: 24, w: 6, h: 4 },
      { i: 'ai', x: 0, y: 28, w: 6, h: 2 },
    ]
  };

  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 1.05 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="fixed inset-0 z-[100] bg-[#020205] text-white flex flex-col font-sans"
    >
      {/* Top Bar */}
      <header className="h-14 border-b border-white/10 bg-[#050508] px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center shadow-lg shadow-red-600/20">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-black uppercase tracking-tighter">Bareilly Intelligence Command Center</h1>
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                <span className="text-[8px] font-bold uppercase tracking-widest text-white/40">System Live • Sector 01-B</span>
              </div>
            </div>
          </div>
          
          <div className="h-8 w-[1px] bg-white/10" />
          
          <div className="hidden md:flex items-center gap-4 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
            <Search className="w-3.5 h-3.5 text-white/40" />
            <input 
              type="text" 
              placeholder="Search Intelligence Database..." 
              className="bg-transparent border-none text-[10px] focus:outline-none w-48 text-white/60"
            />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold text-lg">
              <Clock className="w-4 h-4" />
              {time.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false })}
            </div>
            <span className="text-[8px] text-white/30 uppercase font-bold tracking-widest">IST • Bareilly, India</span>
          </div>
          
          <div className="h-8 w-[1px] bg-white/10" />
          
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-white/80">Parth Gautam</span>
              <span className="text-[8px] text-emerald-500 uppercase font-bold tracking-widest">Administrator</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-white/10 border border-white/10 flex items-center justify-center">
              <User className="w-5 h-5 text-white/60" />
            </div>
            <button 
              onClick={onClose}
              className="ml-2 p-2 hover:bg-red-500/20 rounded-lg transition-colors group"
            >
              <X className="w-5 h-5 text-white/40 group-hover:text-red-500" />
            </button>
          </div>
        </div>
      </header>

      {/* Grid Content */}
      <div ref={containerRef} className="flex-1 overflow-auto bg-[#020205] p-4 custom-scrollbar">
        <Responsive
          className="layout"
          layouts={layout}
          width={width}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={80}
          dragConfig={{ handle: ".bg-white/5" }}
          margin={[16, 16]}
        >
          {/* Panel 1: Live Video Feed */}
          <div key="video">
            <Panel title="Live City Feed" icon={Video}>
              <div className="grid grid-cols-2 gap-2 h-full">
                {[0, 1].map((i) => (
                  <div key={i} className="bg-black rounded border border-white/5 overflow-hidden relative group">
                    <div className="absolute inset-0 opacity-20 pointer-events-none z-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />
                    
                    {/* HUD Overlays */}
                    <div className="absolute top-2 left-2 z-30 flex flex-col gap-1">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-[8px] font-bold uppercase tracking-widest text-white/80">Feed 0{i + 1} • Live</span>
                      </div>
                      <span className="text-[6px] font-mono text-white/40 uppercase">28.4575° N, 77.0266° E</span>
                    </div>

                    <div className="absolute bottom-2 right-2 z-30 flex flex-col items-end">
                      <span className="text-[6px] font-mono text-emerald-500/60 uppercase">Signal: Strong</span>
                      <span className="text-[6px] font-mono text-white/20 uppercase">ID: BLY-SEC-{100 + i}</span>
                    </div>

                    {/* Scanning Line */}
                    <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
                      <motion.div 
                        initial={{ top: '-100%' }}
                        animate={{ top: '100%' }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="w-full h-[1px] bg-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                      />
                    </div>

                    <img 
                      src={`https://picsum.photos/seed/city-feed-${i}/640/360?grayscale`} 
                      alt={`City Feed ${i + 1}`}
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          {/* Panel 2: Live News Feed */}
          <div key="news">
            <Panel title="Bareilly / India News" icon={Newspaper} onRefresh={() => setNews(generateNews())}>
              <div className="space-y-4">
                {news.map(item => (
                  <div key={item.id} className="group cursor-pointer">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest">{item.source}</span>
                      <span className="text-[8px] text-white/20">{item.time}</span>
                    </div>
                    <h4 className="text-[11px] font-medium text-white/80 group-hover:text-emerald-400 transition-colors leading-snug">
                      {item.title}
                    </h4>
                    <div className="mt-2 h-[1px] w-full bg-white/5" />
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          {/* Panel 3: Public Sentiment */}
          <div key="sentiment">
            <Panel title="Public Sentiment (Bareilly)" icon={Twitter}>
              <div className="space-y-4">
                {tweets.map(tweet => (
                  <div key={tweet.id} className="bg-white/5 p-3 rounded-lg border border-white/5 hover:border-emerald-500/30 transition-colors">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[9px] font-bold text-blue-400">{tweet.user}</span>
                      <span className="text-[8px] text-white/20">{tweet.time}</span>
                    </div>
                    <p className="text-[10px] text-white/70 leading-relaxed">{tweet.text}</p>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          {/* Panel 4: PM Updates */}
          <div key="pm">
            <Panel title="Prime Minister Updates" icon={Info}>
              <div className="space-y-4">
                {pmTweets.map(tweet => (
                  <div key={tweet.id} className="bg-white/5 p-3 rounded-lg border border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center">
                        <span className="text-[8px] font-bold text-amber-500">PM</span>
                      </div>
                      <span className="text-[9px] font-bold text-white/90">@narendramodi</span>
                    </div>
                    <p className="text-[10px] text-white/70 leading-relaxed">{tweet.text}</p>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          {/* Panel 5: CM Updates */}
          <div key="cm">
            <Panel title="CM Uttar Pradesh" icon={Activity}>
              <div className="space-y-4">
                {cmTweets.map(tweet => (
                  <div key={tweet.id} className="bg-white/5 p-3 rounded-lg border border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center">
                        <span className="text-[8px] font-bold text-red-500">CM</span>
                      </div>
                      <span className="text-[9px] font-bold text-white/90">@myogiadityanath</span>
                    </div>
                    <p className="text-[10px] text-white/70 leading-relaxed">{tweet.text}</p>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          {/* Panel 6: Surveillance Grid */}
          <div key="surveillance">
            <Panel title="Live City Visual Grid" icon={LayoutGrid}>
              <div className="grid grid-cols-4 gap-2 h-full">
                {CCTV_LOCATIONS.map((loc, i) => (
                  <div key={i} className="aspect-video bg-black rounded border border-white/5 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                    {/* Simulated video noise/scanline */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none z-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />
                    <div className="absolute top-1 left-1 z-30 flex items-center gap-1">
                      <div className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-[6px] font-bold uppercase text-white/60">CAM-{String(i+1).padStart(2, '0')}</span>
                    </div>
                    <div className="absolute bottom-1 left-1 z-30">
                      <span className="text-[7px] font-bold uppercase text-white/80">{loc}</span>
                    </div>
                    <img 
                      src={`https://picsum.photos/seed/cctv${i}/320/180`} 
                      alt={loc}
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          {/* Panel 7: Alerts */}
          <div key="alerts">
            <Panel title="National & Global Alerts" icon={AlertTriangle}>
              <div className="space-y-3">
                {alerts.map(alert => (
                  <div key={alert.id} className={`p-3 rounded-lg border ${
                    alert.level === 'critical' ? 'bg-red-500/10 border-red-500/30' : 
                    alert.level === 'warning' ? 'bg-amber-500/10 border-amber-500/30' : 
                    'bg-blue-500/10 border-blue-500/30'
                  }`}>
                    <div className="flex justify-between items-center mb-1">
                      <h5 className={`text-[10px] font-bold uppercase ${
                        alert.level === 'critical' ? 'text-red-400' : 
                        alert.level === 'warning' ? 'text-amber-400' : 
                        'text-blue-400'
                      }`}>{alert.title}</h5>
                      <span className="text-[8px] text-white/30">{alert.time}</span>
                    </div>
                    <p className="text-[9px] text-white/60 leading-normal">{alert.summary}</p>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          {/* Panel 8: AI Summary */}
          <div key="ai">
            <Panel title="AI Daily Brief" icon={Brain}>
              <div className="flex items-center gap-6 h-full">
                <div className="flex-1 grid grid-cols-3 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">Stability Index</p>
                      <p className="text-sm font-bold text-emerald-400">98.4% Normal</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded bg-blue-500/10 flex items-center justify-center shrink-0">
                      <Activity className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">Public Sentiment</p>
                      <p className="text-sm font-bold text-blue-400">Positive Trend</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded bg-amber-500/10 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">Key Risks</p>
                      <p className="text-sm font-bold text-amber-400">Weather Alert</p>
                    </div>
                  </div>
                </div>
                <div className="w-[1px] h-12 bg-white/10" />
                <div className="flex-1">
                  <p className="text-[10px] text-white/60 italic leading-relaxed">
                    "Intelligence summary indicates a stable governance environment in Bareilly. Focus recommended on monsoon preparedness and Civil Lines traffic management."
                  </p>
                </div>
              </div>
            </Panel>
          </div>
        </Responsive>
      </div>

      {/* Footer / Status Bar */}
      <footer className="h-8 bg-[#050508] border-t border-white/10 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[8px] font-bold uppercase tracking-widest text-white/40">Secure Connection Established</span>
          </div>
          <div className="h-3 w-[1px] bg-white/10" />
          <span className="text-[8px] font-mono text-white/20">ENCRYPTION: AES-256-GCM</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[8px] font-mono text-white/20">LATENCY: 14ms</span>
          <span className="text-[8px] font-mono text-white/20">UPTIME: 99.99%</span>
        </div>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        .react-grid-placeholder {
          background: rgba(16, 185, 129, 0.1) !important;
          border-radius: 8px !important;
          opacity: 0.5 !important;
        }
      `}</style>
    </motion.div>
  );
};
