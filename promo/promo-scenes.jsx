/* promo-scenes.jsx — Cieva promo 9:16, scenes for SceneStage (animations-v2.jsx)
   Version repo : vrais assets (../media), vrai écran de chat capturé, QR réel,
   narration audio synchronisée, slots clips Higgsfield avec repli maquette.
   IIFE : les scripts Babel partagent la portée globale, on isole nos noms. */
(() => {
const { SceneStage, VideoSprite, useScene, useTweaks, TweaksPanel, TweakSection, TweakToggle } = window;

const SAND = '#F5EDE1', TEAL = '#0E7C86', CORAL = '#E8734A', INK = '#16302f';
const PF = "'Playfair Display',Georgia,serif", IN = "'Inter',system-ui,sans-serif";
const clamp01 = t => Math.max(0, Math.min(1, t));
const S = (lt, t0, d) => clamp01((lt - t0) / d);
const eo = t => 1 - Math.pow(1 - clamp01(t), 3);
const bounce = t => { t = clamp01(t); const n1 = 7.5625, d1 = 2.75;
  if (t < 1/d1) return n1*t*t; if (t < 2/d1) return n1*(t-=1.5/d1)*t+.75;
  if (t < 2.5/d1) return n1*(t-=2.25/d1)*t+.9375; return n1*(t-=2.625/d1)*t+.984375; };
const MOTION = {
  enter: (lt, t0, d = .5) => { const t = eo(S(lt, t0, d)); return { opacity: t, transform: `translateY(${(1-t)*46}px)` }; },
  pop:   (lt, t0, d = .45) => { const t = S(lt, t0, d); const s = .6 + .4*eo(t) + .08*Math.sin(eo(t)*Math.PI); return { opacity: clamp01(t*2), transform: `scale(${t>=1?1:s})` }; },
  drift: (lt, dur, amt = .05) => ({ transform: `scale(${1 + amt * (lt/dur)})` })
};
let TW = { showSubtitles: true };

/* ── narration : un seul mp3 pour tout le film, piloté par l'horloge de scène.
   Chaque scène monte <Narr offset={début de la scène}> ; l'élément audio est un
   singleton qui survit aux coupes de scène. Silences dans le mp3 pendant que
   ELLE parle (Hook, clips). ── */
const NARR = (() => {
  const a = document.createElement('audio');
  a.src = 'narration.mp3'; a.preload = 'auto';
  return a;
})();
function Narr({ offset }) {
  const { localTime } = useScene();
  const st = React.useRef({ lastT: -1 });
  React.useEffect(() => {
    const advancing = localTime > st.current.lastT && localTime - st.current.lastT < 0.3;
    st.current.lastT = localTime;
    const target = offset + localTime;
    if (!NARR.duration) return;
    if (advancing) {
      if (NARR.paused) { NARR.play().catch(() => {}); }
      if (Math.abs(NARR.currentTime - target) > 0.35) NARR.currentTime = target;
    } else {
      if (!NARR.paused) NARR.pause();
      if (Math.abs(NARR.currentTime - target) > 0.06) NARR.currentTime = target;
    }
  });
  React.useEffect(() => () => { NARR.pause(); }, []);
  return null;
}

function Flash({ noExit }) {
  const { localTime, dur } = useScene();
  const op = Math.max(1 - S(localTime, 0, .4), noExit ? 0 : S(localTime, dur - .28, .28));
  if (op <= 0) return null;
  return <div style={{ position:'absolute', inset:0, background:'#fff', opacity:op, zIndex:60 }} />;
}
function Caption({ text, dark }) {
  const { localTime } = useScene();
  if (!TW.showSubtitles || !text) return null;
  const m = MOTION.enter(localTime, .45, .5);
  return <div style={{ position:'absolute', left:0, right:0, bottom:150, display:'flex', justifyContent:'center', zIndex:50, ...m }}>
    <div style={{ maxWidth:880, padding:'22px 42px', borderRadius:24, background: dark?'rgba(10,34,36,.78)':'rgba(255,255,255,.9)', backdropFilter:'blur(8px)', color: dark?'#fff':INK, fontFamily:IN, fontWeight:700, fontSize:52, lineHeight:1.25, textAlign:'center', boxShadow:'0 20px 60px rgba(10,40,44,.28)' }}>{text}</div>
  </div>;
}
function Logo({ light, size = 30 }) {
  return <div style={{ fontFamily:IN, fontWeight:700, letterSpacing:'.3em', fontSize:size, color: light?'#fff':INK }}>
    THE BE<span style={{ color: light?'#F4D3A4':CORAL }}>Δ</span>CH CLUB</div>;
}

/* le vrai QR de la table 12 (celui du chevalet) */
function QrBlock({ size }) {
  return <img src="../media/qr-table12.png" style={{ width:size, height:size, display:'block', background:'#fff' }} />;
}

/* ── 1 · Scan ── */
function Scan() {
  const { localTime: lt } = useScene();
  const fr = 1 - .18 * eo(S(lt, .3, 1.1));
  const corners = [[0,0,0],[1,0,90],[1,1,180],[0,1,270]];
  const dots = [1.6, 2.0, 2.4];
  return <div style={{ position:'absolute', inset:0, background:'repeating-linear-gradient(90deg,#6b4a30 0 130px,#7a5638 130px 133px,#5f4229 133px 260px)', display:'flex', alignItems:'center', justifyContent:'center' }}>
    <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at 50% 30%,rgba(255,225,180,.28),rgba(30,15,5,.5))' }} />
    <div style={{ ...MOTION.enter(lt, 0, .01), position:'relative', width:640, padding:'56px 0 44px', background:'#fdfaf4', borderRadius:28, boxShadow:'0 60px 120px rgba(0,0,0,.5)', display:'flex', flexDirection:'column', alignItems:'center', gap:34 }}>
      <Logo />
      <QrBlock size={430} />
      <div style={{ fontFamily:IN, fontSize:26, letterSpacing:'.24em', color:'rgba(22,48,47,.55)' }}>SCAN ME · TABLE 12</div>
      <div style={{ position:'absolute', inset:-34, transform:`scale(${fr})` }}>
        {corners.map(([x,y,rot],i) => <div key={i} style={{ position:'absolute', left:x?'auto':0, right:x?0:'auto', top:y?'auto':0, bottom:y?0:'auto', width:110, height:110, transform:`rotate(${rot}deg)`, borderLeft:`14px solid ${TEAL}`, borderTop:`14px solid ${TEAL}`, borderRadius:'10px 0 0 0' }} />)}
      </div>
      <div style={{ position:'absolute', bottom:-90, display:'flex', gap:22 }}>
        {dots.map((t,i) => <div key={i} style={{ width:26, height:26, borderRadius:99, background:lt>t?TEAL:'rgba(255,255,255,.35)', boxShadow:lt>t?`0 0 30px ${TEAL}`:'none' }} />)}
      </div>
    </div>
    <Caption dark text="Scan the code on your table." />
    <Narr offset={0} />
    <Flash />
  </div>;
}

/* ── vidéo pilotée par l'horloge de scène ── */
function SceneVideo({ src, style, muted, onFail }) {
  const { localTime, dur } = useScene();
  const ref = React.useRef(null);
  const st = React.useRef({ lastT: -1 });
  React.useEffect(() => {
    const v = ref.current; if (!v) return;
    const advancing = localTime > st.current.lastT && localTime - st.current.lastT < 0.3;
    st.current.lastT = localTime;
    const target = Math.min(localTime, (v.duration || dur) - .05);
    if (advancing) {
      if (v.paused) { v.muted = !!muted; v.play().catch(() => { v.muted = true; v.play().catch(()=>{}); }); }
      if (Math.abs(v.currentTime - target) > 0.35) v.currentTime = target;
    } else {
      if (!v.paused) v.pause();
      if (v.readyState >= 1 && Math.abs(v.currentTime - target) > 0.06) v.currentTime = target;
    }
  });
  React.useEffect(() => {
    const v = ref.current; if (!v) return;
    const sync = () => { const t = Math.min(st.current.lastT < 0 ? 0 : st.current.lastT, (v.duration || dur) - .05); if (Math.abs(v.currentTime - t) > .06) v.currentTime = t; };
    v.addEventListener('loadeddata', sync);
    return () => { v.removeEventListener('loadeddata', sync); v.pause(); };
  }, []);
  return <video ref={ref} src={src} muted playsInline preload="auto"
    onError={onFail}
    data-om-exportable-video-play-start={0} data-om-exportable-video-play-end={dur}
    style={{ display:'block', objectFit:'cover', ...style }} />;
}

/* ── 2 · Hook : le vrai clip parlé de l'app, plein cadre, avec SA voix ── */
function Hook({ scene }) {
  return <div style={{ position:'absolute', inset:0, background:'#08282c' }}>
    <SceneVideo src="../media/spk-en.mp4"
      style={{ position:'absolute', inset:0, width:'100%', height:'100%' }} />
    <div style={{ position:'absolute', left:0, right:0, top:0, padding:'54px 0', display:'flex', justifyContent:'center', background:'linear-gradient(rgba(8,40,44,.5),transparent)' }}><Logo light /></div>
    <Caption dark text={scene.sub} />
    <Narr offset={3} />
    <Flash />
  </div>;
}

/* ── slots Higgsfield : la vidéo si elle existe (clips/higgsfield-b.mp4), sinon la maquette ── */
function ClipSlot({ scene }) {
  const { localTime: lt, dur } = useScene();
  const [failed, setFailed] = React.useState(false);
  const off = scene.slot === 'higgsfield-b' ? 29 : 52;
  return <div style={{ position:'absolute', inset:0, overflow:'hidden', background:'linear-gradient(165deg,#0a3d40,#0E7C86 55%,#c98d5a)' }}>
    <div style={{ position:'absolute', inset:0, ...MOTION.drift(lt, dur, .07), background:'radial-gradient(ellipse at 30% 20%,rgba(255,255,255,.14),transparent 60%)' }} />
    {!failed && <SceneVideo src={`clips/${scene.slot}.mp4`} onFail={() => setFailed(true)}
      style={{ position:'absolute', inset:0, width:'100%', height:'100%' }} />}
    {failed && <div data-video-slot={scene.slot} style={{ position:'absolute', inset:120, border:'3px dashed rgba(255,255,255,.45)', borderRadius:40, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:36, padding:60 }}>
      <div style={{ fontFamily:IN, fontWeight:700, letterSpacing:'.3em', fontSize:30, color:'rgba(255,255,255,.75)' }}>{scene.label}</div>
      <div style={{ ...MOTION.enter(lt,.5,.7), fontFamily:PF, fontStyle:'italic', fontSize:64, lineHeight:1.35, color:'#fff', textAlign:'center', maxWidth:760 }}>“{scene.quote}”</div>
      <div style={{ fontFamily:IN, fontSize:24, color:'rgba(255,255,255,.6)' }}>Replace with the Higgsfield clip ({Math.round(dur)} s)</div>
    </div>}
    <Caption dark text={scene.sub} />
    <Narr offset={off} />
    <Flash />
  </div>;
}

/* ── 3 · Chat : LE VRAI ÉCRAN, capturé dans l'app en production ── */
function Chat() {
  const { localTime: lt, dur } = useScene();
  const w = 660, h = Math.round(w * 844 / 390);
  return <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg,#0a3d40,#14676a 40%,#3f9c93)', display:'flex', alignItems:'center', justifyContent:'center' }}>
    <div style={{ width:w, height:h, borderRadius:56, overflow:'hidden', background:'#0d2f2c', boxShadow:'0 60px 140px rgba(4,26,29,.55), 0 0 0 10px #1b2a2c, 0 0 0 13px rgba(255,255,255,.14)', transform:`scale(${1+.03*(lt/dur)})` }}>
      <SceneVideo src="chat-real.mp4" style={{ width:'100%', height:'100%' }} />
    </div>
    <Caption dark text="Order in the chat — straight to the kitchen." />
    <Narr offset={13} />
    <Flash />
  </div>;
}

/* ── 4 · Languages ── */
const FLAGS = [['EN','#012169'],['ไทย','#A51931'],['FR','#0055A4'],['DE','#3d3d3d'],['RU','#0039A6'],['中文','#DE2910']];
const WELCOMES = ['Welcome','ยินดีต้อนรับ','Bienvenue','欢迎'];
function Languages() {
  const { localTime: lt } = useScene();
  const wi = Math.min(WELCOMES.length - 1, Math.max(0, Math.floor((lt - 3.1) / .85)));
  const word = WELCOMES[Math.max(0, wi)];
  const wp = lt < 3.1 ? 0 : S(lt - 3.1 - wi * .85, 0, .55);
  const chars = Math.ceil(wp * word.length);
  return <div style={{ position:'absolute', inset:0, background:SAND, display:'flex', flexDirection:'column', alignItems:'center' }}>
    <div style={{ marginTop:120 }}><Logo /></div>
    <div style={{ display:'flex', gap:26, marginTop:190 }}>
      {FLAGS.map(([f,c],i) => { const t = bounce(S(lt, .2 + i*.22, .9));
        return <div key={i} style={{ width:128, height:128, borderRadius:99, background:'#fff', border:`5px solid ${c}`, boxShadow:'0 24px 50px rgba(22,48,47,.18)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:IN, fontWeight:800, fontSize:f.length>2?40:44, color:c, transform:`translateY(${(t-1)*700}px)`, opacity: lt > .2+i*.22 ? 1 : 0 }}>{f}</div>; })}
    </div>
    <div style={{ marginTop:230, height:260, display:'flex', alignItems:'center' }}>
      {lt > 3.1 && <div style={{ fontFamily:PF, fontSize:128, color:TEAL, borderRight:`6px solid ${CORAL}`, paddingRight:18, lineHeight:1.2 }}>{word.slice(0, chars)}</div>}
    </div>
    <Caption text="She speaks every guest’s language." />
    <Narr offset={19} />
    <Flash />
  </div>;
}

/* ── 5 · Menu ── */
const DISHES = [
  ['Phad Kra Pao','ผัดกระเพรา',280,['Spicy']], ['Fresh Sea Bass Tartare','',500,[]],
  ['Seafood Platter BBQ','',900,['Shellfish']], ['Chicken Satay','ไก่สะเตะ',280,['Nut']],
  ['Pizza Andaman','',600,['Gluten','Shellfish']], ['Kale Salad','',350,['Veg']],
  ['Spaghetti alla Vongole','',450,['Shellfish']], ['Mango Sticky Rice','',220,['Veg']],
  ['Burrata Beef Burger','',500,['Beef','Gluten']], ['Glass Noodle Salad','ยำวุ้นเส้นทะเล',380,['Nut']],
  ['Filetto di Manzo','',1000,['Beef']], ['Gambas al Ajillo','',260,['Shellfish']],
  ['Four Cheese Truffle','',700,['Gluten','Veg']], ['Roti Tob','โรตีตบ',160,['Veg']]
];
/* correspondance avec les vraies photos de l'app quand elles existent */
const PHOTO = { 'Phad Kra Pao':'krapao','Fresh Sea Bass Tartare':'tartare','Seafood Platter BBQ':'seafoodbbq',
  'Chicken Satay':'satay','Pizza Andaman':'andaman','Kale Salad':'kalesalad','Spaghetti alla Vongole':'vongole',
  'Mango Sticky Rice':'mango','Burrata Beef Burger':'burrataburger','Glass Noodle Salad':'glassnoodle',
  'Roti Tob':'rotitob','Carbonara':'carbonara','Khao Phad':'khaophad' };
const hue = s => { let h=0; for (const c of s) h=(h*31+c.charCodeAt(0))%360; return 20 + h%160; };
function DishCard([name, thai, price, tags], w = 760) {
  const h = hue(name), ph = PHOTO[name];
  return <div style={{ width:w, display:'flex', alignItems:'center', gap:26, padding:20, borderRadius:24, background:'#fff', boxShadow:'0 14px 36px rgba(22,48,47,.12)' }}>
    <div style={{ flex:'none', width:110, height:110, borderRadius:18, overflow:'hidden', position:'relative', background:`linear-gradient(150deg,hsl(${h} 36% 48%),hsl(${(h+40)%360} 44% 64%))`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:PF, fontSize:38, color:'rgba(255,255,255,.85)' }}>
      {ph ? <img src={`../media/dishes/${ph}.webp`} style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }} /> : name.split(' ').slice(0,2).map(x=>x[0]).join('')}
    </div>
    <div style={{ flex:1, minWidth:0 }}>
      <div style={{ fontFamily:IN, fontWeight:700, fontSize:32, color:INK }}>{name}</div>
      {thai && <div style={{ fontFamily:IN, fontSize:26, color:'rgba(22,48,47,.55)', marginTop:4 }}>{thai}</div>}
      <div style={{ display:'flex', gap:10, marginTop:10 }}>
        {tags.map(t => <span key={t} style={{ padding:'6px 16px', borderRadius:99, fontFamily:IN, fontWeight:700, fontSize:20, background: t==='Veg'?'#e3f3e6':'#fdeae2', color: t==='Veg'?'#166534':'#9a3412' }}>{t}</span>)}
      </div>
    </div>
    <div style={{ fontFamily:IN, fontWeight:800, fontSize:36, color:TEAL, whiteSpace:'nowrap' }}>{price} ฿</div>
  </div>;
}
function Menu() {
  const { localTime: lt, progress, dur } = useScene();
  const list = [...DISHES, ...DISHES, ...DISHES];
  const y = -eo(S(lt, .3, dur - .5)) * 2600;
  return <div style={{ position:'absolute', inset:0, background:SAND, overflow:'hidden' }}>
    <div style={{ position:'absolute', left:160, top:0, display:'flex', flexDirection:'column', gap:26, transform:`translateY(${560 + y}px)` }}>
      {list.map((d,i) => <div key={i}>{DishCard(d)}</div>)}
    </div>
    <div style={{ position:'absolute', inset:0, background:'linear-gradient(rgba(245,237,225,1) 24%,transparent 34%,transparent 68%,rgba(245,237,225,.97) 90%)' }} />
    <div style={{ position:'absolute', left:0, right:0, top:140, textAlign:'center' }}>
      <div style={{ fontFamily:PF, fontSize:200, lineHeight:1, color:INK }}>{Math.round(clamp01(progress*1.15)*121)}</div>
      <div style={{ fontFamily:IN, fontWeight:700, letterSpacing:'.3em', fontSize:28, color:CORAL, marginTop:8 }}>DISHES · PHOTOS · PRICES</div>
    </div>
    <Caption text="The whole menu, always up to date." />
    <Narr offset={24} />
    <Flash />
  </div>;
}

/* ── 6 · Allergens ── */
const NUTIDX = [2,5,8,11,14,17];
const AITEMS = [['🍤','Prawn Cake'],['🍕','Pizza Andaman'],['🥜','Chicken Satay'],['🥗','Kale Salad'],['🐟','Sea Bass'],['🥜','Cashew Chicken'],['🍝','Carbonara'],['🍚','Khao Phad'],['🥜','Glass Noodle Salad'],['🍔','Beef Burger'],['🌮','Fajitas'],['🥜','Soft Shell Crab'],['🍣','Sea Bass Tartare'],['🥟','Spring Rolls'],['🥜','Oriental Plate'],['🍨','Ice Cream'],['🍹','Limoncello'],['🥜','Burrata Pesto'],['🍕','Truffle Pizza'],['🥭','Mango Sticky Rice']];
function Allergens() {
  const { localTime: lt } = useScene();
  const tap = S(lt, 1.35, .18), red = S(lt, 1.7, .7), gone = S(lt, 2.6, .8);
  const flow = lt >= 4.3 ? 1 : eo(S(lt, 3.4, .9));
  const cw = 218, ch = 200, gap = 22, cols = 4, ox = (1080 - cols*cw - (cols-1)*gap)/2;
  const pos = j => [ox + (j%cols)*(cw+gap), 560 + Math.floor(j/cols)*(ch+gap)];
  const after = {}; let k = 0;
  for (let j=0;j<20;j++) if (!NUTIDX.includes(j)) after[j] = k++;
  const fx = 1 - eo(S(lt, .15, 1.1));
  return <div style={{ position:'absolute', inset:0, background:SAND }}>
    <div style={{ position:'absolute', left:0, right:0, top:150, display:'flex', flexDirection:'column', alignItems:'center', gap:40 }}>
      <Logo />
      <div style={{ display:'flex', alignItems:'center', gap:18, padding:'20px 40px', borderRadius:99, fontFamily:IN, fontWeight:700, fontSize:38, border:`4px solid ${tap>0?CORAL:'rgba(22,48,47,.25)'}`, background: tap>0?CORAL:'#fff', color: tap>0?'#fff':INK, transform:`scale(${1+.12*Math.sin(tap*Math.PI)})`, boxShadow:'0 16px 40px rgba(22,48,47,.14)' }}><span style={{ width:26, height:26, borderRadius:8, background: tap>0?'#fff':'#7c2d12', display:'inline-block' }} />Nut — exclude</div>
    </div>
    {Array.from({length:20}, (_,i) => {
      const nut = NUTIDX.includes(i);
      const [x0,y0] = pos(i);
      const [x1,y1] = nut ? [x0,y0] : pos(after[i]);
      const x = x0 + (x1-x0)*flow, y = y0 + (y1-y0)*flow;
      const op = nut ? 1-gone : 1;
      if (op <= 0) return null;
      const h = hue('d'+i*7);
      return <div key={i} style={{ position:'absolute', left:x, top:y, width:cw, height:ch, borderRadius:22, background: nut&&red>0?`rgba(232,80,60,${.12+.2*red})`:'#fff', border: nut&&red>0?'3px solid #d84b33':'3px solid transparent', opacity:op, transform:`scale(${1-.25*gone*(nut?1:0)})`, boxShadow:'0 12px 30px rgba(22,48,47,.1)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:10, padding:'0 12px' }}>
        <div style={{ width:86, height:86, borderRadius:99, background:`hsl(${h} 40% 92%)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:46 }}>{AITEMS[i][0]}</div>
        <div style={{ fontFamily:IN, fontWeight:600, fontSize:21, color:INK, textAlign:'center', lineHeight:1.2 }}>{AITEMS[i][1]}</div>
      </div>; })}
    <div style={{ position:'absolute', width:70, height:70, borderRadius:99, background:'rgba(22,48,47,.35)', border:'4px solid #fff', opacity: lt<1.9?1:1-S(lt,1.9,.4), transform:`scale(${1-.3*Math.sin(tap*Math.PI)})`, zIndex:5, left:540-260*fx, top:1500-1160*eo(S(lt,.15,1.1)) }} />
    {lt > 4.4 && <div style={{ position:'absolute', left:0, right:0, top:1430, display:'flex', justifyContent:'center', ...MOTION.pop(lt,4.4,.5) }}>
      <div style={{ padding:'24px 52px', borderRadius:99, background:'#166534', color:'#fff', fontFamily:IN, fontWeight:700, fontSize:42, boxShadow:'0 20px 50px rgba(22,101,52,.35)' }}>14 dishes safe for you ✓</div>
    </div>}
    <Caption text="An allergy? She never forgets." />
    <Narr offset={37} />
    <Flash />
  </div>;
}

/* ── 7 · Voice ── */
const PHRASE = 'Something spicy, no shellfish'.split(' ');
function Voice() {
  const { localTime: lt } = useScene();
  const words = Math.floor(S(lt, .7, 2.0) * PHRASE.length);
  const env = clamp01(Math.sin(Math.min(lt/3.2,1)*Math.PI)+.15);
  return <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg,#0a3d40,#0E7C86 70%,#3f9c93)' }}>
    <div style={{ position:'absolute', left:0, right:0, top:150, display:'flex', justifyContent:'center' }}><Logo light /></div>
    <div style={{ position:'absolute', left:0, right:0, top:340, minHeight:200, display:'flex', justifyContent:'center', padding:'0 100px' }}>
      <div style={{ fontFamily:PF, fontSize:76, lineHeight:1.3, color:'#fff', textAlign:'center' }}>
        {PHRASE.slice(0, words).join(' ')}{words>0 && words<PHRASE.length ? ' …' : ''}
      </div>
    </div>
    <div style={{ position:'absolute', left:'50%', top:820, transform:'translateX(-50%)' }}>
      {[0,1,2].map(i => { const p = (lt*.5 + i/3) % 1;
        return <div key={i} style={{ position:'absolute', left:'50%', top:'50%', width:240, height:240, marginLeft:-120, marginTop:-120, borderRadius:99, border:'3px solid rgba(255,255,255,.7)', transform:`scale(${1+p*1.5})`, opacity:(1-p)*.5 }} />; })}
      <div style={{ position:'relative', width:240, height:240, borderRadius:99, background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 30px 80px rgba(6,30,33,.45)' }}>
        <div style={{ width:64, height:100, borderRadius:40, background:TEAL, position:'relative' }}>
          <div style={{ position:'absolute', left:-24, right:-24, bottom:-34, height:8, borderRadius:9, background:TEAL }} />
        </div>
      </div>
    </div>
    <div style={{ position:'absolute', left:0, right:0, top:1130, display:'flex', justifyContent:'center', gap:9, alignItems:'flex-end', height:110 }}>
      {Array.from({length:26}, (_,i) => <div key={i} style={{ width:12, borderRadius:8, background:'rgba(255,255,255,.85)', height: 14 + Math.abs(Math.sin(lt*9 + i*1.1)) * 90 * env }} />)}
    </div>
    {lt > 3.5 && <div style={{ position:'absolute', left:110, right:110, top:1215, ...MOTION.enter(lt,3.5,.6) }}>
      <div style={{ borderRadius:28, background:'rgba(255,255,255,.95)', padding:'22px 26px', display:'flex', flexDirection:'column', gap:14, boxShadow:'0 24px 70px rgba(6,30,33,.4)', transform:'scale(.92)', transformOrigin:'top center' }}>
        <div style={{ fontFamily:IN, fontSize:28, lineHeight:1.35, color:INK }}>Two dishes with real heat, zero shellfish:</div>
        {DishCard(['Phad Kra Pao','ผัดกระเพรา',280,['Spicy']], 800)}
        {lt > 4.1 && <div style={{ ...MOTION.enter(lt,4.1,.5) }}>{DishCard(['Roti & Sweet Chicken Curry','',350,[]], 800)}</div>}
      </div>
    </div>}
    <Caption dark text="Just talk. She understands." />
    <Narr offset={43} />
    <Flash />
  </div>;
}

/* ── 8 · Two roles ── */
function RolePane({ accent, tag, img, title, rows, light }) {
  return <div style={{ flex:1, background:light?'#fdfaf4':SAND, display:'flex', flexDirection:'column', alignItems:'center', paddingTop:300, gap:26 }}>
    <div style={{ width:300, height:360, borderRadius:28, overflow:'hidden', boxShadow:'0 30px 70px rgba(22,48,47,.28)', border:'5px solid #fff' }}>
      <img src={img} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
    </div>
    <div style={{ padding:'12px 30px', borderRadius:99, background:accent, color:'#fff', fontFamily:IN, fontWeight:800, letterSpacing:'.22em', fontSize:26 }}>{tag}</div>
    <div style={{ fontFamily:PF, fontSize:56, color:accent, marginTop:-6 }}>{title}</div>
    <div style={{ display:'flex', flexDirection:'column', gap:18, width:400 }}>
      {rows.map((r,i) => <div key={i} style={{ display:'flex', alignItems:'center', gap:16, padding:'20px 24px', borderRadius:20, background:'#fff', boxShadow:'0 10px 26px rgba(22,48,47,.1)' }}>
        <div style={{ width:16, height:16, borderRadius:99, background:accent }} />
        <div style={{ flex:1, fontFamily:IN, fontWeight:600, fontSize:27, color:INK }}>{r[0]}</div>
        <div style={{ fontFamily:IN, fontWeight:800, fontSize:26, color:accent }}>{r[1]}</div>
      </div>)}
    </div>
  </div>;
}
function TwoRoles() {
  const { localTime: lt } = useScene();
  const t = eo(S(lt, .1, .8));
  return <div style={{ position:'absolute', inset:0, background:SAND, display:'flex' }}>
    <div style={{ flex:1, display:'flex', transform:`translateX(${(t-1)*540}px)` }}>
      <RolePane light accent={TEAL} tag="BEACH CLUB" img="../media/waitress.webp" title="Alina" rows={[['Phad Kra Pao','280 ฿'],['Sea Bass Tartare','500 ฿'],['Mango Sticky Rice','220 ฿']]} />
    </div>
    <div style={{ flex:1, display:'flex', transform:`translateX(${(1-t)*540}px)` }}>
      <RolePane accent={CORAL} tag="HOTEL" img="../media/concierge.webp" title="Malee" rows={[['Thai Massage 60’','900 ฿'],['Hong Island boat','2 200 ฿'],['Late check-out','1 500 ฿']]} />
    </div>
    <div style={{ position:'absolute', left:'50%', top:0, bottom:0, width:6, marginLeft:-3, background:`linear-gradient(180deg,transparent,${CORAL},${TEAL},transparent)`, boxShadow:`0 0 ${30+14*Math.sin(lt*3)}px ${CORAL}`, opacity:t }} />
    <div style={{ position:'absolute', left:0, right:0, top:190, textAlign:'center', ...MOTION.enter(lt,.6,.6) }}>
      <div style={{ fontFamily:PF, fontSize:74, color:INK }}>One link. Two jobs.</div>
    </div>
    <Caption text="Restaurant and concierge — one app." />
    <Narr offset={48} />
    <Flash />
  </div>;
}

/* ── 11 · Outro ── */
function Outro() {
  const { localTime: lt } = useScene();
  return <div style={{ position:'absolute', inset:0, background:SAND, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:60 }}>
    <div style={{ ...MOTION.enter(lt,.15,.6), fontFamily:PF, fontSize:190, color:INK, letterSpacing:'-.02em' }}>cieva</div>
    <div style={{ ...MOTION.enter(lt,.5,.6), padding:26, background:'#fff', borderRadius:24, boxShadow:'0 24px 60px rgba(22,48,47,.16)' }}><QrBlock size={300} /></div>
    <div style={{ ...MOTION.enter(lt,.8,.6), fontFamily:IN, fontWeight:700, fontSize:48, color:TEAL, letterSpacing:'.06em' }}>cieva.ai</div>
    <Narr offset={58} />
    <Flash noExit />
  </div>;
}

window.PromoVideo = function PromoVideo() {
  const [t, setTweak] = useTweaks(window.TWEAK_DEFAULTS);
  TW = t;
  return <div style={{ width:'100%', height:'100%' }}>
    <SceneStage width={1080} height={1920} bg={SAND} scenes={window.OM_SCENES} playback={window.OM_PLAYBACK}>
      {{ Scan, Hook, Chat, Languages, Menu, ClipB: ClipSlot, Allergens, Voice, TwoRoles, ClipC: ClipSlot, Outro }}
    </SceneStage>
    <TweaksPanel>
      <TweakSection label="Video" />
      <TweakToggle label="Motion editor" value={t.motionEditor} onChange={v => setTweak('motionEditor', v)} />
      <TweakToggle label="Burned-in subtitles" value={t.showSubtitles} onChange={v => setTweak('showSubtitles', v)} />
    </TweaksPanel>
  </div>;
};
})();