import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, Activity, Search, User, Clock, ExternalLink, 
  Maximize2, RefreshCcw, Video, Newspaper, Twitter, 
  AlertTriangle, CheckCircle2, Info, Brain, X,
  LayoutGrid, ChevronRight, MessageSquare, TrendingUp,
  HeartPulse, Briefcase, GraduationCap, Users,
  Instagram, Facebook, FileText, Download
} from 'lucide-react';
import YouTube from 'react-youtube';
import { jsPDF } from 'jspdf';
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

const PredictiveAnalysis = () => {
  const [view, setView] = useState<'city' | 'ward'>('city');
  const [selectedWard, setSelectedWard] = useState('Ward 01');

  const wards = ['Ward 01', 'Ward 02', 'Ward 03', 'Ward 04', 'Ward 05'];

  const cityData = {
    health: { status: 'Stable', risk: 12, trend: 'down', message: 'Healthcare capacity at 65%. No immediate crisis predicted.' },
    jobs: { status: 'Warning', risk: 45, trend: 'up', message: 'Unemployment rate rising in manufacturing sector. Potential crisis in Q3.' },
    education: { status: 'Critical', risk: 78, trend: 'up', message: 'Teacher shortage in primary schools. High dropout risk in rural pockets.' },
    voter: { status: 'Stable', risk: 5, trend: 'down', message: 'Voter registration up by 15%. High engagement predicted for upcoming elections.' },
    social: { status: 'Warning', risk: 30, trend: 'up', message: 'Rising concerns over public infrastructure maintenance in outer sectors.' },
  };

  const wardData: Record<string, typeof cityData> = {
    'Ward 01': {
      health: { status: 'Critical', risk: 85, trend: 'up', message: 'Water-borne disease outbreak risk high due to drainage issues.' },
      jobs: { status: 'Stable', risk: 10, trend: 'down', message: 'Local cottage industry thriving. High employment stability.' },
      education: { status: 'Stable', risk: 15, trend: 'down', message: 'New community library showing positive impact on literacy.' },
      voter: { status: 'Warning', risk: 35, trend: 'up', message: 'Low voter turnout predicted due to migration patterns.' },
      social: { status: 'Stable', risk: 8, trend: 'down', message: 'Community cohesion high. Active local participation in ward meetings.' },
    },
    'Ward 02': {
      health: { status: 'Stable', risk: 20, trend: 'down', message: 'New clinic opened. Health metrics improving.' },
      jobs: { status: 'Critical', risk: 92, trend: 'up', message: 'Major factory closure leading to mass unemployment.' },
      education: { status: 'Warning', risk: 50, trend: 'up', message: 'School infrastructure needs urgent repair.' },
      voter: { status: 'Stable', risk: 12, trend: 'down', message: 'Normal voter engagement levels.' },
      social: { status: 'Critical', risk: 88, trend: 'up', message: 'High tension reported due to recent zoning disputes.' },
    },
  };

  const currentData = view === 'city' ? cityData : (wardData[selectedWard] || wardData['Ward 01']);

  const categories = [
    { id: 'health', label: 'Health', icon: HeartPulse, color: 'text-red-400', bg: 'bg-red-400/10' },
    { id: 'jobs', label: 'Job Crisis', icon: Briefcase, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { id: 'education', label: 'Education', icon: GraduationCap, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { id: 'voter', label: 'Voter Crisis', icon: Users, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { id: 'social', label: 'Social Issues', icon: MessageSquare, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex bg-white/5 rounded-lg p-1">
          <button 
            onClick={() => setView('city')}
            className={`px-4 py-1.5 rounded-md text-[10px] font-bold transition-all ${view === 'city' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-white/40 hover:text-white'}`}
          >
            CITY OVERVIEW
          </button>
          <button 
            onClick={() => setView('ward')}
            className={`px-4 py-1.5 rounded-md text-[10px] font-bold transition-all ${view === 'ward' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-white/40 hover:text-white'}`}
          >
            WARD OVERVIEW
          </button>
        </div>

        {view === 'ward' && (
          <select 
            value={selectedWard}
            onChange={(e) => setSelectedWard(e.target.value)}
            className="bg-[#050508] border border-white/10 rounded-md px-3 py-1.5 text-[10px] font-bold text-white/80 focus:outline-none focus:border-emerald-500/50"
          >
            {wards.map(w => <option key={w} value={w}>{w}</option>)}
          </select>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 flex-1 overflow-auto custom-scrollbar pr-2">
        {categories.map((cat) => {
          const data = currentData[cat.id as keyof typeof currentData];
          return (
            <div key={cat.id} className="bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col hover:border-white/10 transition-all group min-h-[200px]">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-lg ${cat.bg} flex items-center justify-center`}>
                  <cat.icon className={`w-5 h-5 ${cat.color}`} />
                </div>
                <div className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest ${
                  data.status === 'Critical' ? 'bg-red-500/20 text-red-400' :
                  data.status === 'Warning' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {data.status}
                </div>
              </div>

              <h4 className="text-xs font-bold text-white/90 mb-1">{cat.label}</h4>
              <div className="flex items-end gap-2 mb-4">
                <span className="text-2xl font-black tracking-tighter">{data.risk}%</span>
                <span className="text-[10px] font-bold text-white/40 mb-1 uppercase tracking-widest">Risk Index</span>
              </div>

              <div className="flex-1">
                <p className="text-[10px] text-white/60 leading-relaxed mb-4">
                  {data.message}
                </p>
              </div>

              <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${data.trend === 'up' ? 'bg-red-500' : 'bg-emerald-500'}`} />
                  <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Trend: {data.trend}</span>
                </div>
                <TrendingUp className={`w-3 h-3 ${data.trend === 'up' ? 'text-red-500 rotate-0' : 'text-emerald-500 rotate-180'}`} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const OppositionIntelligence = () => {
  const [selectedParty, setSelectedParty] = useState<'sp' | 'congress'>('sp');
  const [activeTab, setActiveTab] = useState<'instagram' | 'facebook' | 'twitter' | 'reports'>('instagram');

  const allSocialFeeds = [
    // --- SAMAJWADI PARTY (SP) INSTAGRAM (10 posts) ---
    { id: 1, party: 'sp', platform: 'instagram', user: 'SamajwadiParty_UP', handle: '@samajwadiparty', text: "The sea of people in Bareilly today shows the mood of the state. We stand for progress, for the youth, and for our farmers! #Samajwad #BareillyRally #Mission2027", likes: '48.2K', time: '1h ago', image: 'https://picsum.photos/seed/political-rally-india/600/800' },
    { id: 2, party: 'sp', platform: 'instagram', user: 'SP Bareilly Unit', handle: '@sp_bareilly', text: "Our candidate visiting local artisans in the Jhumka city. We promise better markets and global exposure for Bareilly's craftsmanship.", likes: '12.5K', time: '4h ago', image: 'https://picsum.photos/seed/handicrafts-india/600/800' },
    { id: 3, party: 'sp', platform: 'instagram', user: 'Samajwadi Youth Wing', handle: '@sp_youth_up', text: "The cycle of change has begun. Thousands join the Cycle Yatra through the streets of Bareilly. #CycleYatra #YouthPower", likes: '31.9K', time: '8h ago', image: 'https://picsum.photos/seed/bicycle-rally/600/800' },
    { id: 13, party: 'sp', platform: 'instagram', user: 'Samajwadi_Women', handle: '@sp_women_front', text: "Empowering the women of Bareilly with skills and safety. Our manifesto promises pink toilets and security hubs.", likes: '18.2K', time: '10h ago', image: 'https://picsum.photos/seed/indian-women-group/600/800' },
    { id: 14, party: 'sp', platform: 'instagram', user: 'SP Digital Bareilly', handle: '@sp_bly_digital', text: "Behind the scenes: Preparing for the mega digital outreach. Every phone in Bareilly will hear the message of progress.", likes: '5.6K', time: '12h ago', image: 'https://picsum.photos/seed/digital-war-room/600/800' },
    { id: 15, party: 'sp', platform: 'instagram', user: 'Samajwadi_Farmers', handle: '@kisan_sahayak_sp', text: "Standing with the sugarcane farmers of Bareilly. Immediate payment of dues is our topmost priority. #KisanNyay", likes: '25.4K', time: '15h ago', image: 'https://picsum.photos/seed/indian-farmer-field/600/800' },
    { id: 16, party: 'sp', platform: 'instagram', user: 'SP_Leader_Official', handle: '@sp_leader_ Bly', text: "Meeting the elders at Kutub Khana. Their blessings are our strength. Experience meets energy. #ElderlyCare #BareillyRoots", likes: '14.1K', time: '1d ago', image: 'https://picsum.photos/seed/indian-elderly/600/800' },
    { id: 17, party: 'sp', platform: 'instagram', user: 'SP_Heritage_BLY', handle: '@samajwad_heritage', text: "Bareilly's heritage is our pride. We will restore the glory of the old city and boost local tourism. #HistoricBareilly", likes: '20.9K', time: '1d ago', image: 'https://picsum.photos/seed/indian-architecture/600/800' },
    { id: 18, party: 'sp', platform: 'instagram', user: 'SP_Health_Watch', handle: '@sp_health_bly', text: "The state of government hospitals in Bareilly is a shame. We will bring back the world-class medical facilities we started.", likes: '11.8K', time: '2d ago', image: 'https://picsum.photos/seed/indian-hospital-building/600/800' },
    { id: 19, party: 'sp', platform: 'instagram', user: 'SamajwadiParty_UP', handle: '@samajwadiparty', text: "Visuals from our recent gathering in Aonla. The momentum for SP is unstoppable. #Lahar #UPKalyan", likes: '52K', time: '2d ago', image: 'https://picsum.photos/seed/crowd-india-rally/600/800' },

    // --- SAMAJWADI PARTY (SP) FACEBOOK (10 posts) ---
    { id: 4, party: 'sp', platform: 'facebook', user: 'Samajwadi Party Uttar Pradesh', handle: 'SamajwadiPartyUP', text: "Under the current regime, Bareilly's industrial sectors have seen a 40% decline. SP is the only party with a roadmap for industrial revival and job creation for our youth. Watch our live session tonight at 8 PM.", comments: '4.2K', time: '2h ago', image: 'https://picsum.photos/seed/factory-india/800/450' },
    { id: 5, party: 'sp', platform: 'facebook', user: 'Akhilesh Fan Club Bareilly', handle: 'AkhileshFansBLY', text: "The vision of modern Uttar Pradesh started with the Expressways. We will continue that legacy in Bareilly. #Development #SPVision", comments: '1.1K', time: '6h ago', image: 'https://picsum.photos/seed/highway-india/800/450' },
    { id: 6, party: 'sp', platform: 'facebook', user: 'SP Digital Force', handle: 'SPDigitalForce', text: "Exposing the false promises of the Smart City project. Look at the state of drainage in Ward 12. #RealityCheck #BareillyNeedsSP", comments: '8.9K', time: '12h ago', image: 'https://picsum.photos/seed/flooded-street/800/450' },
    { id: 20, party: 'sp', platform: 'facebook', user: 'Samajwadi Party Bareilly Official', handle: 'sp.bly.official', text: "Town Hall on Education: Our leaders discuss the need for a Central University expansion in Bareilly and more vocational training centers for local youth.", comments: '2.5K', time: '14h ago', image: 'https://picsum.photos/seed/education-meeting/800/450' },
    { id: 21, party: 'sp', platform: 'facebook', user: 'Desh Ka Samajwad', handle: 'deshkasamajwad', text: "Remembering the late Netaji's connection with Bareilly. He always said, 'Bareilly is the heart of Rohilkhand.' We will fulfill his dreams.", comments: '15.6K', time: '1d ago', image: 'https://picsum.photos/seed/old-indian-leader/800/450' },
    { id: 22, party: 'sp', platform: 'facebook', user: 'SP Media Cell', handle: 'sp_media_cell', text: "Visual Comparison: The condition of Bareilly's parks before and after. We build, they neglect. Vote for progress, vote for Cycle.", comments: '3.8K', time: '1d ago', image: 'https://picsum.photos/seed/indian-park-neglect/800/450' },
    { id: 23, party: 'sp', platform: 'facebook', user: 'Social Justice Forum', handle: 'justice_sp', text: "Fighting for the rights of the underprivileged. Our distribution drive in the slums of Bareilly provides essential supplies and hope.", comments: '920', time: '2d ago', image: 'https://picsum.photos/seed/charity-india/800/450' },
    { id: 24, party: 'sp', platform: 'facebook', user: 'SP Youth Parliament', handle: 'sp_youth_bly', text: "Debate Session: Why the current administration's paper-leak issues are ruining the lives of Bareilly's students. #StudentPower #SPVoices", comments: '6.7K', time: '2d ago', image: 'https://picsum.photos/seed/student-protest-india/800/450' },
    { id: 25, party: 'sp', platform: 'facebook', user: 'Samajwadi Party Uttar Pradesh', handle: 'SamajwadiPartyUP', text: "Our manifesto is a promise of dignity. From IT hubs in Bareilly to high-tech agro-markets. Check the full document on our website.", comments: '12.3K', time: '3d ago', image: 'https://picsum.photos/seed/blueprint-development/800/450' },
    { id: 26, party: 'sp', platform: 'facebook', user: 'Bareilly Vikas Manch', handle: 'vikasmanch_sp', text: "Join the conversation: How can we solve the traffic menace in Kutub Khana market? SP has a flyover plan that actually works.", comments: '4.5K', time: '3d ago', image: 'https://picsum.photos/seed/indian-traffic-jam/800/450' },

    // --- CONGRESS INSTAGRAM (10 posts) ---
    { id: 7, party: 'congress', platform: 'instagram', user: 'UP Congress Committee', handle: '@inc_uttarpradesh', text: "The Congress Nyay Patra for Bareilly is here. Focus on 100% literacy, women security, and free healthcare in every block. #HaathBadlegaHalaat", likes: '22.4K', time: '3h ago', image: 'https://picsum.photos/seed/political-poster-india/600/800' },
    { id: 8, party: 'congress', platform: 'instagram', user: 'Congress Seva Dal', handle: '@sevadal_up', text: "Our volunteers distributed textbooks and stationaries to 500+ students in rural Bareilly today. Education is the foundation of freedom.", likes: '9.8K', time: '10h ago', image: 'https://picsum.photos/seed/school-children-india/600/800' },
    { id: 9, party: 'congress', platform: 'instagram', user: 'Mahila Congress BLY', handle: '@mahila_congress_bly', text: "Walking for the dignity and safety of every woman in Uttar Pradesh. The Nari Nyay movement reaches Bareilly.", likes: '15.6K', time: '1d ago', image: 'https://picsum.photos/seed/women-protest-india/600/800' },
    { id: 27, party: 'congress', platform: 'instagram', user: 'Congress_Youth_BLY', handle: '@iyc_bareilly', text: "Lighting candles for justice. We will not stop until the voice of the common citizen is heard by the deaf administration. #JusticeForBareilly", likes: '11.2K', time: '12h ago', image: 'https://picsum.photos/seed/candle-march-india/600/800' },
    { id: 28, party: 'congress', platform: 'instagram', user: 'Heritage_Congress', handle: '@heritage_bly_inc', text: "Bareilly's old library needs urgent attention. Congress will preserve our intellectual heritage. #Culture #History", likes: '8.4K', time: '1d ago', image: 'https://picsum.photos/seed/old-indian-library/600/800' },
    { id: 29, party: 'congress', platform: 'instagram', user: 'INC_Medical_Cell', handle: '@medical_inc_up', text: "Health checkup camp in the heart of Civil Lines. Serving the community is the true politics. #SevaHiLakshya", likes: '14.5K', time: '1d ago', image: 'https://picsum.photos/seed/health-camp-india/600/800' },
    { id: 30, party: 'congress', platform: 'instagram', user: 'UP Congress Committee', handle: '@inc_uttarpradesh', text: "The love we received in Bareilly today was overwhelming. Together, we are building a path of unity and love. #MohabbatKiDukan", likes: '64K', time: '2d ago', image: 'https://picsum.photos/seed/smiling-indian-crowd/600/800' },
    { id: 31, party: 'congress', platform: 'instagram', user: 'Congress_BLY_Urban', handle: '@congress_urban_ Bly', text: "Addressing the shopkeepers of Bareilly. We promise lower commercial taxes and better electricity supply. #BusinessNyay", likes: '10.1K', time: '2d ago', image: 'https://picsum.photos/seed/indian-shopkeeper/600/800' },
    { id: 32, party: 'congress', platform: 'instagram', user: 'Mahila Congress BLY', handle: '@mahila_congress_bly', text: "Self-defense workshop for girls in Subhash Nagar. Power to the daughters of Bareilly! #Shakti", likes: '19.8K', time: '3d ago', image: 'https://picsum.photos/seed/indian-karate-girls/600/800' },
    { id: 33, party: 'congress', platform: 'instagram', user: 'Congress_Seva', handle: '@congress_seva_bly', text: "Providing clean drinking water to commuters at the Railway Station. Small acts, big impact. #HumanePolitics", likes: '7.6K', time: '3d ago', image: 'https://picsum.photos/seed/indian-water-distribution/600/800' },

    // --- CONGRESS FACEBOOK (10 posts) ---
    { id: 10, party: 'congress', platform: 'facebook', user: 'Indian National Congress - UP', handle: 'INC_UP', text: "The youth of Bareilly are struggling with unprecedented unemployment. Congress promises a Right to Apprenticeship for every graduate. Let's build a future together. #RozgarNyay", comments: '5.1K', time: '5h ago', image: 'https://picsum.photos/seed/unemployed-youth/800/450' },
    { id: 11, party: 'congress', platform: 'facebook', user: 'Congress Connect Bareilly', handle: 'CongressBareillyConnect', text: "Our candidate's passionate speech at the Town Hall. Addressing the real issues: water scarcity and rising power tariffs. #VoiceOfBareilly", comments: '2.3K', time: '9h ago', image: 'https://picsum.photos/seed/politician-speaking/800/450' },
    { id: 12, party: 'congress', platform: 'facebook', user: 'INC Heritage Wing', handle: 'INC_Heritage', text: "Do you know? Bareilly was a key center during the freedom struggle. Congress is proud of its deep roots in this soil. #Heritage #FreedomStruggle", comments: '3.4K', time: '1d ago', image: 'https://picsum.photos/seed/historical-india/800/450' },
    { id: 34, party: 'congress', platform: 'facebook', user: 'INC Truth Social', handle: 'truth_inc_up', text: "Fact-Check: The state of government roads in Bareilly remains pathetic despite the 'Smart City' billions. Where did the money go? Demand accountability. #AuditBareilly", comments: '11.8K', time: '12h ago', image: 'https://picsum.photos/seed/indian-potholes/800/450' },
    { id: 35, party: 'congress', platform: 'facebook', user: 'Congress Farmers Council', handle: 'farmer_inc_bly', text: "Proposing a Loan Waiver scheme for small-scale farmers in Bareilly. Agriculture shouldn't be a debt trap. Congress stands with you.", comments: '7.4K', time: '1d ago', image: 'https://picsum.photos/seed/indian-farmer-protest/800/450' },
    { id: 36, party: 'congress', platform: 'facebook', user: 'INC Urban Transformation', handle: 'urban_inc_up', text: "Our vision for a green Bareilly: 5 new city forests and a revitalized Ramganga riverfront. Vote for a breathable future.", comments: '4.6K', time: '1d ago', image: 'https://picsum.photos/seed/river-pollution/800/450' },
    { id: 37, party: 'congress', platform: 'facebook', user: 'Indian National Congress - UP', handle: 'INC_UP', text: "Live from the massive rally in Civil Lines: The energy is infectious. Bareilly is ready for a change! Watch the full speech here.", comments: '22K', time: '2d ago', image: 'https://picsum.photos/seed/congress-rally-india/800/450' },
    { id: 38, party: 'congress', platform: 'facebook', user: 'INC Student Union', handle: 'student_inc_bly', text: "Demanding better hostel facilities and Wi-Fi across Bareilly College. Students are the future, not just voters. #StudentNyay", comments: '5.2K', time: '2d ago', image: 'https://picsum.photos/seed/college-campus-india/800/450' },
    { id: 39, party: 'congress', platform: 'facebook', user: 'Congress Health Taskforce', handle: 'health_inc_ Bly', text: "Why is medicine so expensive? Congress will cap prices and provide free generic drugs in every ward. #HealthcareForAll", comments: '8.1K', time: '3d ago', image: 'https://picsum.photos/seed/indian-pharmacy/800/450' },
    { id: 40, party: 'congress', platform: 'facebook', user: 'INC Connect UP', handle: 'inc.connect.up', text: "Our candidate for Bareilly is a local teacher who understands your pain. No more carpet-bagging politicians. Support local leadership.", comments: '14.2K', time: '3d ago', image: 'https://picsum.photos/seed/humble-indian-leader/800/450' },
  ];

  const allTweets = [
    // --- CONGRESS TWEETS ---
    { id: 1, party: 'congress', user: "UP Congress", handle: "@INC_UP_Voice", text: "The Smart City project in Bareilly is a classic case of corruption. Decorative lights on the outside, broken drains on the inside. #ExposeCurrentGovt", time: "1h ago", retweets: '1.2K', likes: '4.5K' },
    { id: 2, party: 'congress', user: "Congress Youth", handle: "@IYC_Bareilly", text: "Protested today at the District Magistrate's office for the immediate repair of Nainital Road. The administration is sleeping! #BareillyAlert", time: "4h ago", retweets: '650', likes: '2.1K' },
    { id: 3, party: 'congress', user: "Priyanka Gandhi Vadra (Archives)", handle: "@priyankagandhi", text: "Listening to the brave women of Bareilly. Your struggle is our struggle. Together, we will fight for justice. #LadkiHoonLadSaktiHoon", time: "1d ago", retweets: '8K', likes: '24K' },

    // --- SP TWEETS ---
    { id: 4, party: 'sp', user: "Akhilesh Yadav (Archives)", handle: "@yadavakhilesh", text: "The youth of Bareilly want laptops and jobs, not empty slogans. Our previous governance transformed UP, and we will do it again. #Insaaf", time: "2h ago", retweets: '12K', likes: '45K' },
    { id: 5, party: 'sp', user: "Samajwadi Media", handle: "@Samajwadi_Media", text: "The Cycle is the only vehicle of progress for the poor and middle class. Join the SP movement today. #SamajwadZindabad", time: "6h ago", retweets: '2.3K', likes: '8.9K' },
    { id: 6, party: 'sp', user: "SP Bareilly Live", handle: "@SP_Bareilly_Unit", text: "Ground reports suggest a clean sweep for SP in the upcoming local body polls. People are fed up with inflation! #SPMagic", time: "10h ago", retweets: '900', likes: '3.4K' },

    // --- NEUTRAL / BOTH ---
    { id: 7, party: 'both', user: "UP Politics Watch", handle: "@UP_Politics_Watch", text: "Election math: If SP and Congress find a common ground in Bareilly, it could be a tough road ahead for the ruling party. #UPPolitics", time: "12h ago", retweets: '400', likes: '1.2K' },
    { id: 8, party: 'both', user: "Bareilly News Hub", handle: "@BLYNewsHub", text: "Political heat rising in Bareilly as both SP and Congress intensify their door-to-door campaigns. #LocalElection2026", time: "1d ago", retweets: '150', likes: '500' },
  ];

  const allReports = [
    { id: 1, party: 'sp', title: "Q1 2026 Samajwadi Party (SP) Strategy Analysis", date: "2026-03-15", size: "2.8 MB" },
    { id: 2, party: 'congress', title: "Congress Bareilly Ward-wise Influence Report", date: "2026-03-28", size: "2.1 MB" },
    { id: 3, party: 'both', title: "Social Media Sentiment: SP vs Congress vs Foundation", date: "2026-04-05", size: "3.5 MB" },
    { id: 4, party: 'both', title: "Opposition Alliance Impact Assessment - Bareilly", date: "2026-04-08", size: "1.9 MB" },
    { id: 5, party: 'sp', title: "SP Manifesto Deep Dive: Infrastructure & Jobs", date: "2026-04-09", size: "2.4 MB" },
    { id: 6, party: 'congress', title: "Congress Digital Campaign Reach Analysis", date: "2026-04-10", size: "3.2 MB" },
  ];

  const filteredSocial = allSocialFeeds.filter(f => f.party === selectedParty && f.platform === activeTab);
  const filteredTweets = allTweets.filter(t => (t.party === selectedParty || t.party === 'both') && activeTab === 'twitter');
  const filteredReports = allReports.filter(r => (r.party === selectedParty || r.party === 'both') && activeTab === 'reports');

  const handleDownload = (title: string) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("OPPOSITION INTELLIGENCE REPORT", 20, 20);
    doc.setFontSize(14);
    doc.text(`Report: ${title}`, 20, 35);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 45);
    doc.text("Location: Bareilly & Uttar Pradesh", 20, 55);
    
    doc.setFontSize(12);
    doc.text("Executive Summary:", 20, 75);
    doc.text(`This report details the recent activities, social media presence, and public sentiment`, 20, 85);
    doc.text(`regarding the ${selectedParty === 'sp' ? 'Samajwadi Party (SP)' : 'Congress'} in the Bareilly sector.`, 20, 92);
    
    doc.text("Key Findings:", 20, 110);
    if (selectedParty === 'sp') {
      doc.text("1. Samajwadi Party (SP) has significantly increased its ground presence in rural Bareilly.", 20, 120);
      doc.text("2. Digital sentiment shows a surge in SP engagement among the youth.", 20, 127);
    } else {
      doc.text("1. Congress is focusing on urban grievances, specifically water and electricity.", 20, 120);
      doc.text("2. Increased town hall meetings and direct voter connect initiatives.", 20, 127);
    }
    
    doc.text("Strategic Recommendations:", 20, 150);
    if (selectedParty === 'sp') {
      doc.text("- Counter SP's rural narrative with foundation's agricultural initiatives.", 20, 160);
    } else {
      doc.text("- Address Congress's urban infrastructure criticisms with live project updates.", 20, 160);
    }
    
    doc.text("CONFIDENTIAL - FOR INTERNAL USE ONLY", 20, 280);
    
    doc.save(`${title.replace(/\s+/g, '_')}_Report.pdf`);
  };

  const InstagramCard = ({ feed }: { feed: any }) => (
    <div className="bg-[#121218] border border-white/5 rounded-lg overflow-hidden flex flex-col h-[480px]">
      <div className="p-3 flex items-center gap-3 border-b border-white/5">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 p-[1px]">
          <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
            <Instagram className="w-4 h-4 text-white" />
          </div>
        </div>
        <div>
          <div className="text-[11px] font-bold text-white leading-none">{feed.user}</div>
          <div className="text-[8px] text-white/40 tracking-tight">{feed.handle}</div>
        </div>
      </div>
      <div className="aspect-[4/5] bg-black">
        <img src={feed.image} alt="Insta post" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
      </div>
      <div className="p-4 flex-1">
        <div className="flex items-center gap-4 mb-3">
          <button className="text-white hover:text-white/80 transition-colors"><Instagram className="w-5 h-5" /></button>
          <button className="text-white hover:text-white/80 transition-colors"><MessageSquare className="w-5 h-5" /></button>
          <button className="text-white hover:text-white/80 transition-colors ml-auto"><Download className="w-5 h-5" /></button>
        </div>
        <div className="text-[11px] font-bold text-white mb-1.5">{feed.likes} likes</div>
        <p className="text-[10px] text-white/70 line-clamp-3 leading-relaxed">
          <span className="font-bold mr-1.5 text-white">{feed.user}</span>
          {feed.text}
        </p>
        <div className="mt-2 text-[8px] text-white/30 uppercase tracking-widest font-bold">{feed.time}</div>
      </div>
    </div>
  );

  const FacebookCard = ({ feed }: { feed: any }) => (
    <div className="bg-[#121218] border border-white/5 rounded-lg overflow-hidden flex flex-col h-[480px]">
      <div className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
          <Facebook className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="text-xs font-bold text-white">{feed.user}</div>
          <div className="text-[9px] text-white/40 flex items-center gap-1.5 font-bold">
            {feed.time} • <Users className="w-2.5 h-2.5" />
          </div>
        </div>
        <button className="ml-auto text-white/20"><ExternalLink className="w-4 h-4" /></button>
      </div>
      <div className="px-4 pb-3">
        <p className="text-[11px] text-white/80 leading-relaxed line-clamp-3">{feed.text}</p>
      </div>
      <div className="aspect-video bg-black flex-1">
        <img src={feed.image} alt="FB post" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
      </div>
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center justify-between text-[10px] text-white/40 mb-3 font-bold">
          <div className="flex items-center gap-2">
            <span className="flex -space-x-1">
              <span className="w-4 h-4 rounded-full bg-blue-500 border border-black flex items-center justify-center"><Facebook className="w-2.5 h-2.5 text-white" /></span>
              <span className="w-4 h-4 rounded-full bg-red-500 border border-black flex items-center justify-center"><ShieldAlert className="w-2.5 h-2.5 text-white" /></span>
            </span>
            {feed.comments}
          </div>
          <div>512 Shares</div>
        </div>
        <div className="flex items-center border-t border-white/5 pt-3">
          <button className="flex-1 flex items-center justify-center gap-2 text-[11px] font-bold text-white/60 hover:bg-white/5 py-1.5 rounded transition-colors">Like</button>
          <button className="flex-1 flex items-center justify-center gap-2 text-[11px] font-bold text-white/60 hover:bg-white/5 py-1.5 rounded transition-colors">Comment</button>
          <button className="flex-1 flex items-center justify-center gap-2 text-[11px] font-bold text-white/60 hover:bg-white/5 py-1.5 rounded transition-colors">Share</button>
        </div>
      </div>
    </div>
  );

  const TweetCard = ({ tweet }: { tweet: any }) => (
    <div className="bg-[#121218] border border-white/5 rounded-xl p-5 flex flex-col h-[480px]">
      <div className="flex gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${tweet.party === 'sp' ? 'bg-red-500/10' : 'bg-blue-500/10'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tweet.party === 'sp' ? 'bg-red-500' : 'bg-blue-600'}`}>
            <Twitter className="w-6 h-6 text-white" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 truncate">
              <span className="text-[13px] font-black text-white truncate">{tweet.user}</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="text-xs text-white/40 font-medium truncate">{tweet.handle}</span>
              <span className="text-xs text-white/20 font-bold">• {tweet.time}</span>
            </div>
            <button className="text-white/20"><span className="text-lg leading-none">...</span></button>
          </div>
          <p className="mt-3 text-[14px] text-white/90 leading-[1.4] tracking-normal font-medium">
            {tweet.text}
          </p>
          <div className="mt-4 flex items-center justify-between text-white/40 max-w-sm">
            <button className="flex items-center gap-2 hover:text-blue-400 transition-colors group">
              <MessageSquare className="w-4 h-4 group-hover:bg-blue-400/10 p-0.5 rounded-full" />
              <span className="text-xs font-bold">142</span>
            </button>
            <button className="flex items-center gap-2 hover:text-emerald-400 transition-colors group">
              <RefreshCcw className="w-4 h-4 group-hover:bg-emerald-400/10 p-0.5 rounded-full" />
              <span className="text-xs font-bold">{tweet.retweets}</span>
            </button>
            <button className="flex items-center gap-2 hover:text-pink-400 transition-colors group">
              <ShieldAlert className="w-4 h-4 group-hover:bg-pink-400/10 p-0.5 rounded-full" />
              <span className="text-xs font-bold">{tweet.likes}</span>
            </button>
            <button className="flex items-center gap-2 hover:text-blue-400 transition-colors group">
              <TrendingUp className="w-4 h-4 group-hover:bg-blue-400/10 p-0.5 rounded-full" />
              <span className="text-xs font-bold">94K</span>
            </button>
          </div>
        </div>
      </div>
      <div className="mt-auto pt-6 border-t border-white/5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 mb-2">Internal AI Sentiment Analysis</p>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] font-bold text-white/60">Narrative Score</span>
            <span className="text-[9px] font-bold text-emerald-400">Low Threat</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 w-[72%]" />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-[#020205]">
      {/* Filters Section */}
      <div className="sticky top-0 z-20 bg-[#020205] pt-0 pb-6 border-b border-white/10 px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Party Selection Tabs */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSelectedParty('sp')}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all border ${selectedParty === 'sp' ? 'bg-red-500 text-white border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]' : 'bg-white/5 text-white/40 border-white/10 hover:border-white/20 hover:text-white'}`}
            >
              <div className={`w-2.5 h-2.5 rounded-full ${selectedParty === 'sp' ? 'bg-white' : 'bg-red-500'}`} />
              <span className="text-[11px] font-black uppercase tracking-widest">SAMAJWADI PARTY (SP)</span>
            </button>
            <button 
              onClick={() => setSelectedParty('congress')}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all border ${selectedParty === 'congress' ? 'bg-blue-600 text-white border-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.3)]' : 'bg-white/5 text-white/40 border-white/10 hover:border-white/20 hover:text-white'}`}
            >
              <div className={`w-2.5 h-2.5 rounded-full ${selectedParty === 'congress' ? 'bg-white' : 'bg-blue-500'}`} />
              <span className="text-[11px] font-black uppercase tracking-widest">INC CONGRESS</span>
            </button>
          </div>

          {/* Social Type Tabs */}
          <div className="flex items-center p-1 bg-white/5 rounded-xl border border-white/10">
            {[
              { id: 'instagram', icon: Instagram, label: 'INSTAGRAM' },
              { id: 'facebook', icon: Facebook, label: 'FACEBOOK' },
              { id: 'twitter', icon: Twitter, label: 'TWITTER' },
              { id: 'reports', icon: FileText, label: 'REPORTS' }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-[10px] font-black tracking-widest transition-all ${activeTab === tab.id ? 'bg-white/10 text-white shadow-xl' : 'text-white/40 hover:text-white'}`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div className="flex-1 overflow-auto custom-scrollbar p-8">
        {activeTab === 'instagram' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredSocial.map(feed => <InstagramCard key={feed.id} feed={feed} />)}
            {filteredSocial.length === 0 && (
              <div className="col-span-full flex items-center justify-center h-64 border-2 border-dashed border-white/5 rounded-2xl">
                <span className="text-white/20 font-bold uppercase tracking-widest">No Recent Instagram Content</span>
              </div>
            )}
          </div>
        )}

        {activeTab === 'facebook' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredSocial.map(feed => <FacebookCard key={feed.id} feed={feed} />)}
            {filteredSocial.length === 0 && (
              <div className="col-span-full flex items-center justify-center h-64 border-2 border-dashed border-white/5 rounded-2xl">
                <span className="text-white/20 font-bold uppercase tracking-widest">No Recent Facebook Content</span>
              </div>
            )}
          </div>
        )}

        {activeTab === 'twitter' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTweets.map(tweet => <TweetCard key={tweet.id} tweet={tweet} />)}
            {filteredTweets.length === 0 && (
              <div className="col-span-full flex items-center justify-center h-64 border-2 border-dashed border-white/5 rounded-2xl">
                <span className="text-white/20 font-bold uppercase tracking-widest">No Recent Twitter Content</span>
              </div>
            )}
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.map(report => (
              <div key={report.id} className="bg-[#121218] border border-white/5 rounded-2xl p-6 flex flex-col justify-between hover:border-white/20 transition-all group h-[240px]">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="px-3 py-1 rounded bg-white/5 border border-white/10 text-[8px] font-black text-white/40 uppercase tracking-widest">
                      {report.size}
                    </div>
                  </div>
                  <h4 className="text-sm font-black text-white group-hover:text-red-500 transition-colors line-clamp-2 leading-tight">
                    {report.title}
                  </h4>
                  <p className="text-[10px] text-white/40 mt-2 font-bold uppercase tracking-widest">{report.date}</p>
                </div>
                <button 
                  onClick={() => handleDownload(report.title)}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-red-500/20 rounded-xl transition-all text-[11px] font-black uppercase tracking-widest text-white/60 hover:text-red-500 border border-white/5"
                >
                  <Download className="w-4 h-4" />
                  Download Analysis
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const CommandCentre = ({ isOpen, onClose }: CommandCentreProps) => {
  const [activeMainTab, setActiveMainTab] = useState<'mission' | 'opposition'>('mission');
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
      { i: 'predictive', x: 0, y: 4, w: 12, h: 5 },
      { i: 'sentiment', x: 0, y: 9, w: 4, h: 4 },
      { i: 'pm', x: 4, y: 9, w: 4, h: 4 },
      { i: 'cm', x: 8, y: 9, w: 4, h: 4 },
      { i: 'surveillance', x: 0, y: 13, w: 8, h: 4 },
      { i: 'alerts', x: 8, y: 13, w: 4, h: 4 },
      { i: 'ai', x: 0, y: 17, w: 12, h: 2 },
    ],
    md: [
      { i: 'video', x: 0, y: 0, w: 10, h: 4 },
      { i: 'news', x: 0, y: 4, w: 10, h: 4 },
      { i: 'predictive', x: 0, y: 8, w: 10, h: 6 },
      { i: 'sentiment', x: 0, y: 14, w: 5, h: 4 },
      { i: 'pm', x: 5, y: 14, w: 5, h: 4 },
      { i: 'cm', x: 0, y: 18, w: 5, h: 4 },
      { i: 'surveillance', x: 5, y: 18, w: 5, h: 4 },
      { i: 'alerts', x: 0, y: 22, w: 10, h: 4 },
      { i: 'ai', x: 0, y: 26, w: 10, h: 2 },
    ],
    sm: [
      { i: 'video', x: 0, y: 0, w: 6, h: 4 },
      { i: 'news', x: 0, y: 4, w: 6, h: 4 },
      { i: 'predictive', x: 0, y: 8, w: 6, h: 6 },
      { i: 'sentiment', x: 0, y: 14, w: 6, h: 4 },
      { i: 'pm', x: 0, y: 18, w: 6, h: 4 },
      { i: 'cm', x: 0, y: 22, w: 6, h: 4 },
      { i: 'surveillance', x: 0, y: 26, w: 6, h: 4 },
      { i: 'alerts', x: 0, y: 30, w: 6, h: 4 },
      { i: 'ai', x: 0, y: 34, w: 6, h: 2 },
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

          <div className="h-8 w-[1px] bg-white/10 mx-2" />

          <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
            <button 
              onClick={() => setActiveMainTab('mission')}
              className={`px-4 py-1.5 rounded-md text-[10px] font-bold transition-all flex items-center gap-2 ${activeMainTab === 'mission' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-white/40 hover:text-white'}`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              MISSION CONTROL
            </button>
            <button 
              onClick={() => setActiveMainTab('opposition')}
              className={`px-4 py-1.5 rounded-md text-[10px] font-bold transition-all flex items-center gap-2 ${activeMainTab === 'opposition' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-white/40 hover:text-white'}`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              OPPOSITION ANALYSIS
            </button>
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
        {activeMainTab === 'mission' ? (
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

          {/* Panel 9: Predictive Intelligence */}
          <div key="predictive">
            <Panel title="Predictive Intelligence Dashboard" icon={TrendingUp}>
              <PredictiveAnalysis />
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
        ) : (
          <div className="h-full flex flex-col pt-4 overflow-hidden">
            <div className="flex items-center justify-between mb-8 px-8 shrink-0">
              <div>
                <h2 className="text-4xl font-black uppercase tracking-tighter text-red-500 mb-1">Opposition Intelligence Database</h2>
                <p className="text-sm text-white/40 uppercase tracking-[0.3em] font-black italic">Strategic Competitor Surveillance • Sector: BLY-UP-X</p>
              </div>
              <div className="flex gap-6">
                <div className="bg-white/5 border border-white/10 px-8 py-4 rounded-2xl flex flex-col items-center min-w-[160px]">
                  <span className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-2">Threat Vector</span>
                  <span className="text-2xl font-black text-amber-500">MODERATE</span>
                </div>
                <div className="bg-white/5 border border-white/10 px-8 py-4 rounded-2xl flex flex-col items-center min-w-[160px]">
                  <span className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-2">Digital Dominance</span>
                  <span className="text-2xl font-black text-red-500">+12.4%</span>
                </div>
              </div>
            </div>
            
            <div className="flex-1 min-h-0 bg-[#020205] overflow-hidden flex flex-col">
              <OppositionIntelligence />
            </div>
          </div>
        )}
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
