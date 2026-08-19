const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  tg.setHeaderColor?.('#f4f3ee');
  tg.setBackgroundColor?.('#f4f3ee');
}

const stories = [
  {image:'./assets/story-01.svg', title:'место\nначинается\nс ощущения', action:'✦'},
  {image:'./assets/story-02.svg', title:'свет остаётся\nдаже когда\nего не видно', action:'↗'},
  {image:'./assets/story-03.svg', title:'а теперь\nможно просто\nсмотреть', action:'○'}
];
const gallery = Array.from({length:15},(_,i)=>`./assets/photo-${String(i+1).padStart(2,'0')}.svg`);

const intro=document.querySelector('#intro');
const start=document.querySelector('#start');
const storiesScreen=document.querySelector('#stories');
const galleryScreen=document.querySelector('#gallery');
const track=document.querySelector('#storyTrack');
const progress=document.querySelector('#storyProgress');
const counter=document.querySelector('#storyCounter');
const grid=document.querySelector('#galleryGrid');

stories.forEach((s)=>{
  const el=document.createElement('article'); el.className='story';
  el.innerHTML=`<img src="${s.image}" alt="" draggable="false"><div class="story-content"><h2 class="story-title">${s.title.replaceAll('\n','<br>')}</h2><button class="story-action" aria-label="Взаимодействовать"><span>${s.action}</span></button></div>`;
  el.querySelector('button').addEventListener('click',e=>{e.stopPropagation(); interact(el);});
  track.appendChild(el);
  const p=document.createElement('i'); p.innerHTML='<b></b>'; progress.appendChild(p);
});

gallery.forEach((src,i)=>{
  const fig=document.createElement('figure');
  fig.innerHTML=`<img src="${src}" alt="Фото ${i+1}" loading="lazy" draggable="false">`;
  grid.appendChild(fig);
});

document.querySelector('#galleryCount').textContent=`${gallery.length} фото`;
let index=0, startX=0, deltaX=0, dragging=false;

function showStories(){
  intro.classList.remove('active'); storiesScreen.classList.add('active'); updateStory();
}
start.addEventListener('click',()=>{ unlockAudio(); haptic('light'); showStories(); });

function updateStory(){
  track.style.transform=`translate3d(${-index*100}%,0,0)`;
  [...progress.children].forEach((p,i)=>p.classList.toggle('active',i<=index));
  counter.textContent=`${String(index+1).padStart(2,'0')} / 03`;
}

track.addEventListener('pointerdown',e=>{dragging=true;startX=e.clientX;deltaX=0;track.setPointerCapture?.(e.pointerId)});
track.addEventListener('pointermove',e=>{if(!dragging)return;deltaX=e.clientX-startX;track.style.transform=`translate3d(calc(${-index*100}% + ${deltaX}px),0,0)`});
track.addEventListener('pointerup',()=>{if(!dragging)return;dragging=false;if(Math.abs(deltaX)>55){if(deltaX<0 && index<2) index++;else if(deltaX>0 && index>0) index--;else if(deltaX<0 && index===2){openGallery();return;}} updateStory(); haptic('light')});
track.addEventListener('pointercancel',()=>{dragging=false;updateStory()});

function openGallery(){
  track.style.transform='translate3d(-200%,0,0)';
  setTimeout(()=>{storiesScreen.classList.remove('active');galleryScreen.classList.add('active');},350);
}
function interact(el){
  el.animate([{transform:'scale(1)'},{transform:'scale(.985)'},{transform:'scale(1)'}],{duration:320,easing:'cubic-bezier(.22,1,.36,1)'});
  haptic('medium'); playClick();
}
function haptic(style){try{tg?.HapticFeedback?.impactOccurred(style)}catch(_){} if(navigator.vibrate) navigator.vibrate(style==='light'?12:style==='medium'?22:32)}

let audioCtx;
function unlockAudio(){
  try{audioCtx=new (window.AudioContext||window.webkitAudioContext)(); if(audioCtx.state==='suspended') audioCtx.resume();}catch(_){}
}
function playClick(){
  try{if(!audioCtx)unlockAudio(); const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='sine';o.frequency.setValueAtTime(520,audioCtx.currentTime);o.frequency.exponentialRampToValueAtTime(220,audioCtx.currentTime+.07);g.gain.setValueAtTime(.0001,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(.11,audioCtx.currentTime+.008);g.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+.09);o.connect(g).connect(audioCtx.destination);o.start();o.stop(audioCtx.currentTime+.1)}catch(_){}
}
