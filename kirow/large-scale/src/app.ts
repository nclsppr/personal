import data from './ui-data.json';
const $=<T extends HTMLElement=HTMLElement>(id:string)=>document.getElementById(id) as T;
const text=JSON.parse($('ui-messages').textContent||'{}');
const lang=document.documentElement.lang==='fr'?'fr':'en';
const initial={mode:'working',elevation:12,slew:0,extension:35,outriggers:100,hook:12,explode:0,night:false,auto:false,step:data.steps.length};
let state={...initial},api:any,loading=false;
const viewer=$('viewer'),host=$('scene-host'),status=$('render-status'),start=$<HTMLButtonElement>('start-3d');
const theme=$<HTMLButtonElement>('theme');
function setTheme(dark:boolean){document.body.classList.toggle('dark',dark);theme?.setAttribute('aria-pressed',String(dark));try{localStorage.setItem('kirow-theme',dark?'dark':'light');}catch{}}
theme.hidden=false;start.hidden=false;
let saved='';try{saved=localStorage.getItem('kirow-theme')||'';}catch{}
setTheme(saved?saved==='dark':matchMedia('(prefers-color-scheme: dark)').matches);
theme?.addEventListener('click',()=>setTheme(!document.body.classList.contains('dark')));
function enableScene(enabled:boolean){for(const e of document.querySelectorAll<HTMLInputElement|HTMLButtonElement>('.pose-input,[data-toggle],[data-view],[data-pose],#reset,#capture'))e.disabled=!enabled;}
function sync(){for(const input of document.querySelectorAll<HTMLInputElement>('.pose-input')){const key=input.id as keyof typeof state;input.value=String(state[key]);const out=$(key+'-value');if(out)out.textContent=input.value+(key==='elevation'||key==='slew'?'°':key==='hook'?'': '%');}for(const b of document.querySelectorAll<HTMLButtonElement>('[data-toggle]'))b.setAttribute('aria-pressed',String(state[b.dataset.toggle as 'night'|'auto']));for(const b of document.querySelectorAll('[data-pose]'))b.setAttribute('aria-pressed',String((b as HTMLElement).dataset.pose===state.mode));api?.apply(state);}
async function activate(){if(api||loading)return;loading=true;start.disabled=true;start.textContent=text.busy||text.loading;status.textContent=text.loading;try{const {createScene}=await import('./scene');api=createScene(host,{onStatus:(s:string)=>{status.textContent=text[s]||s;}});sync();viewer.classList.add('is-live');enableScene(true);status.textContent=text.ready;start.textContent=text.start;start.disabled=false;}catch(error){console.warn('Kirow scene unavailable',error);status.textContent=text.unavailable;start.textContent=text.start;start.disabled=false;api?.dispose();api=null;}finally{loading=false;}}
start?.addEventListener('click',activate);
host.addEventListener('kirow-renderer-unavailable',()=>{api?.dispose();api=null;viewer.classList.remove('is-live');enableScene(false);status.textContent=text.unavailable;});
$('touch-exit')?.addEventListener('click',()=>{api?.dispose();api=null;viewer.classList.remove('is-live');enableScene(false);status.textContent=text.status;start.focus();});
for(const input of document.querySelectorAll<HTMLInputElement>('.pose-input'))input.addEventListener('input',()=>{state.mode='working';(state as any)[input.id]=Number(input.value);sync();});
for(const b of document.querySelectorAll<HTMLButtonElement>('[data-toggle]'))b.addEventListener('click',()=>{const key=b.dataset.toggle as 'night'|'auto';state[key]=!state[key];sync();});
for(const b of document.querySelectorAll<HTMLButtonElement>('[data-view]'))b.addEventListener('click',async()=>{await activate();api?.setView(b.dataset.view);});
for(const b of document.querySelectorAll<HTMLButtonElement>('[data-pose]'))b.addEventListener('click',async()=>{await activate();for(const peer of document.querySelectorAll('[data-pose]'))peer.setAttribute('aria-pressed',String(peer===b));const keep={night:state.night,auto:state.auto};state=b.dataset.pose==='transport'?{...initial,...keep,mode:'transport',elevation:0,extension:0,outriggers:0,hook:6}:{...initial,...keep};sync();if(b.closest('#transport'))viewer.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'center'});});
$('reset')?.addEventListener('click',()=>{state={...initial};sync();api?.setView('hero');});
$('capture')?.addEventListener('click',async()=>{await activate();if(!api)return;const a=document.createElement('a');a.href=api.capture('image/jpeg',.92);a.download='kirow-grande-echelle.jpg';a.click();});
const selector=$<HTMLSelectElement>('step-select');
function selectStep(value:number){value=Math.max(1,Math.min(data.steps.length,value));const s=data.steps[value-1];selector.value=String(value);$('step-number').textContent=String(value);$('step-title').textContent=lang==='fr'?s.title:s.titleEn;$('step-description').textContent=lang==='fr'?s.description:s.descriptionEn;const img=$<HTMLImageElement>('step-image');img.src='/kirow/large-scale/assets/manual/step-'+String(value).padStart(2,'0')+'.jpg?v=1';img.alt=(lang==='fr'?'Étape ':'Step ')+value+' · '+(lang==='fr'?s.title:s.titleEn);const src=$('all-step-parts-'+value);if(src)$('step-parts').innerHTML=src.innerHTML;$<HTMLButtonElement>('previous-step').disabled=value===1;$<HTMLButtonElement>('next-step').disabled=value===data.steps.length;state.step=value;const nextMode=value>=data.transportFirstStep?'transport':'working';if(state.mode!==nextMode)state=nextMode==='transport'?{...state,mode:nextMode,elevation:0,slew:0,extension:0,outriggers:0,hook:6}:{...initial,step:value,night:state.night};sync();}
selector?.addEventListener('change',()=>selectStep(Number(selector.value)));
$('previous-step')?.addEventListener('click',()=>selectStep(Number(selector.value)-1));$('next-step')?.addEventListener('click',()=>selectStep(Number(selector.value)+1));
// The starting scene remains complete; the manual can be read independently.
for(const b of document.querySelectorAll<HTMLButtonElement>('[data-pose]'))b.disabled=false;
selector.disabled=false;$<HTMLButtonElement>('previous-step').disabled=false;
sync();
window.addEventListener('pagehide',()=>api?.dispose(),{once:true});
