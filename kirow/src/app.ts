import type {SceneAPI,SceneSettings} from './scene';
const $=<E extends HTMLElement=HTMLElement>(id:string)=>document.getElementById(id) as E;
const messages=JSON.parse($('ui-messages').textContent!);
const host=$('scene-host'),showcase=$('showcase'),start=$<HTMLButtonElement>('start-3d'),exit=$<HTMLButtonElement>('touch-exit'),status=$('render-status');
const heroMount=host.parentElement!,exitHome=exit.parentElement!,controlView=$('control-view'),controlsSection=$('commandes');
const controlStart=$<HTMLButtonElement>('activate-controls');
const touch=matchMedia('(pointer: coarse)').matches;
let api:SceneAPI|null=null,loading=false,failed=false,pageActive=true,activation=0;
let controlVisible=false,sectionVisible=false,controlsEngaged=false;
let settings:SceneSettings={elevation:24,slew:0,hook:9,explode:0,night:false,auto:false,step:32};
const initial={...settings};
const inputs=Array.from(document.querySelectorAll<HTMLInputElement>('.pose-input'));
const toggles=Array.from(document.querySelectorAll<HTMLButtonElement>('[data-toggle]'));
const liveButtons=Array.from(document.querySelectorAll<HTMLButtonElement>('[data-view],#capture,#reset'));
function setStatus(text:string){status.textContent=text;const mirror=$('control-status');if(mirror)mirror.textContent=text;}
function enableControls(enabled:boolean,note=messages.unavailable){for(const el of [...inputs,...toggles,...liveButtons])el.disabled=!enabled;$('live-note').textContent=enabled?messages.activeNote:note;}
function refresh(){for(const input of inputs){input.value=String(settings[input.id as keyof SceneSettings]);$(`${input.id}-value`).textContent=input.value+input.dataset.unit;}
 for(const button of toggles){const key=button.dataset.toggle!;button.setAttribute('aria-pressed',String(Boolean(settings[key as keyof SceneSettings])));}}
function syncViewer(){
 const healthy=Boolean(api&&!failed);
 showcase.classList.toggle('is-live',healthy&&host.parentElement===heroMount);
 controlView?.classList.toggle('is-live',healthy&&host.parentElement===controlView);
 for(const button of [start,controlStart])if(button){button.hidden=healthy||failed;button.disabled=loading||failed;button.textContent=loading?messages.busy:failed?messages.unavailable:messages.start;}
 exit.hidden=!healthy||!touch;
}
function moveViewer(){
 const destination=controlView&&(controlVisible||(controlsEngaged&&sectionVisible))?controlView:heroMount;
 if(host.parentElement!==destination)destination.appendChild(host);
 const exitDestination=destination===controlView?controlView:exitHome;
 if(exit.parentElement!==exitDestination)exitDestination.appendChild(exit);
 syncViewer();
}
function fallback(){failed=true;enableControls(false);setStatus(messages.unavailable);syncViewer();}
async function activate(){
 if(api||loading||failed||!pageActive)return;
 const attempt=++activation;loading=true;syncViewer();setStatus(messages.loading);
 try{
  const {createScene}=await import('./scene');
  if(!pageActive||attempt!==activation)return;
  api=createScene(host,setStatus);
  // A first-frame shader/context failure can emit its event before createScene returns.
  if(failed){syncViewer();return;}
  api.update(settings);
  if(failed){syncViewer();return;}
  enableControls(true);refresh();syncViewer();
 }catch(error){
  if(!pageActive||attempt!==activation)return;
  console.warn('Kirow 3D unavailable',error);api?.dispose();api=null;host.replaceChildren();fallback();
 }finally{if(attempt===activation){loading=false;syncViewer();}}
}
start.addEventListener('click',activate);
controlStart?.addEventListener('click',()=>{controlsEngaged=true;sectionVisible=true;moveViewer();activate();});
$('take-controls').addEventListener('click',()=>{controlsEngaged=true;activate();});
exit.addEventListener('click',()=>{
 const inControls=host.parentElement===controlView;
 api?.dispose();api=null;enableControls(false,messages.ready);setStatus(messages.status);syncViewer();
 (inControls&&controlStart?controlStart:start).focus({preventScroll:true});
});
host.addEventListener('kirow-renderer-unavailable',fallback);
host.addEventListener('kirow-renderer-restored',()=>{failed=false;api?.update(settings);refresh();enableControls(true);syncViewer();});
for(const input of inputs)input.addEventListener('input',()=>{(settings as unknown as Record<string,unknown>)[input.id]=Number(input.value);$(`${input.id}-value`).textContent=input.value+input.dataset.unit;api?.update(settings);});
for(const button of toggles)button.addEventListener('click',()=>{const key=button.dataset.toggle!;(settings as unknown as Record<string,unknown>)[key]=!settings[key as keyof SceneSettings];refresh();api?.update(settings);});
for(const button of Array.from(document.querySelectorAll<HTMLButtonElement>('[data-view]')))button.addEventListener('click',()=>api?.view(button.dataset.view!));
$('capture').addEventListener('click',()=>api?.capture());
$('reset').addEventListener('click',()=>{settings={...initial};refresh();api?.update(settings);api?.view('hero');select.value='32';updateStep();});
const select=$<HTMLSelectElement>('step-select');
function updateStep(){const step=Number(select.value),option=select.selectedOptions[0],title=option.textContent!.split(' · ').slice(1).join(' · ');$('step-number').textContent=String(step).padStart(2,'0');$('step-title').textContent=title;$('step-description').textContent=option.dataset.description!;$('step-parts').replaceChildren(...Array.from($(`all-step-parts-${step}`).childNodes,node=>node.cloneNode(true)));const image=$<HTMLImageElement>('step-image');image.src=`/kirow/assets/manual/step-${String(step).padStart(2,'0')}.jpg?v=2`;image.alt=title;$<HTMLButtonElement>('previous-step').disabled=step===1;$<HTMLButtonElement>('next-step').disabled=step===32;settings.step=step;api?.update(settings);}
select.disabled=false;select.addEventListener('change',updateStep);
$('step-title').setAttribute('aria-live','polite');$('step-title').setAttribute('aria-atomic','true');
$('previous-step').addEventListener('click',()=>{select.value=String(Math.max(1,Number(select.value)-1));updateStep();});
$('next-step').addEventListener('click',()=>{select.value=String(Math.min(32,Number(select.value)+1));updateStep();});
updateStep();
const partSearch=$<HTMLInputElement>('part-search');
const inventoryRows=Array.from(document.querySelectorAll<HTMLTableRowElement>('#inventory-table tbody tr'));
const normalize=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function searchParts(){
 const terms=normalize(partSearch.value).trim().split(/\s+/).filter(Boolean);
 let visible=0;
 for(const row of inventoryRows){const haystack=normalize(row.dataset.search!);row.hidden=!terms.every(term=>haystack.includes(term));if(!row.hidden)visible++;}
 $('search-status').textContent=messages.searchCount.replace('{visible}',String(visible)).replace('{total}',String(inventoryRows.length));
 $('search-empty').hidden=visible!==0;
}
$('inventory-search').hidden=false;
partSearch.addEventListener('input',searchParts);
$('clear-search').addEventListener('click',()=>{partSearch.value='';searchParts();partSearch.focus();});
document.addEventListener('click',event=>{
 const anchor=event.target instanceof Element?event.target.closest<HTMLAnchorElement>('a[href^="#piece-"]'):null;
 if(!anchor)return;
 $<HTMLDetailsElement>('inventory').open=true;
 partSearch.value='';searchParts();
});
searchParts();
const theme=$('theme');let dark=matchMedia('(prefers-color-scheme: dark)').matches;
try{const saved=sessionStorage.getItem('kirow-page-theme');if(saved)dark=saved==='dark';}catch{}
function applyTheme(){document.body.classList.toggle('dark',dark);theme.setAttribute('aria-pressed',String(dark));}
applyTheme();theme.addEventListener('click',()=>{dark=!dark;applyTheme();try{sessionStorage.setItem('kirow-page-theme',dark?'dark':'light');}catch{}});
if(controlView){
 const viewObserver=new IntersectionObserver(entries=>{for(const entry of entries){controlVisible=entry.isIntersecting&&entry.intersectionRatio>=.3;}moveViewer();},{threshold:[0,.3]});viewObserver.observe(controlView);
 const sectionObserver=new IntersectionObserver(entries=>{for(const entry of entries)sectionVisible=entry.isIntersecting;if(!sectionVisible)controlsEngaged=false;moveViewer();},{threshold:0});sectionObserver.observe(controlsSection);
 controlsSection.addEventListener('pointerdown',()=>{controlsEngaged=true;sectionVisible=true;moveViewer();});
 controlsSection.addEventListener('focusin',()=>{controlsEngaged=true;sectionVisible=true;moveViewer();});
 controlsSection.addEventListener('focusout',event=>{if(!(event.relatedTarget instanceof Node)||!controlsSection.contains(event.relatedTarget)){controlsEngaged=false;moveViewer();}});
}
syncViewer();
if(!touch){const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){observer.disconnect();activate();}},{threshold:.2});observer.observe(showcase);}
window.addEventListener('pagehide',()=>{pageActive=false;activation++;loading=false;api?.dispose();api=null;});
window.addEventListener('pageshow',(event)=>{pageActive=true;if(event.persisted){enableControls(false,failed?messages.unavailable:messages.ready);moveViewer();if(!touch&&!failed)activate();}});
