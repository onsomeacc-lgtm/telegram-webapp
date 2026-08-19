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

// The first tap is a real user gesture. We use it to unlock the audio engine
// before moving into the story, so later interaction sounds are not blocked.
start.addEventListener('pointerup',()=>{
  unlockAudio();
  haptic('light');
  showStories();
},{once:true});

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
  el.animate([{transform:'scale(1)'},{transform:'scale(.975)'},{transform:'scale(1)'}],{duration:320,easing:'cubic-bezier(.22,1,.36,1)'});
  // Fire both channels: Telegram's native haptic engine and browser vibration
  // where the host supports it. Sound is triggered from this direct tap.
  haptic('medium');
  playClick();
}

function haptic(style='medium'){
  try {
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred(style);
    }
  } catch (_) {}

  // Android browsers / Telegram WebView may expose navigator.vibrate.
  try {
    if (typeof navigator.vibrate === 'function') {
      navigator.vibrate(style==='light' ? [12] : style==='medium' ? [28] : [45]);
    }
  } catch (_) {}
}

let audioCtx = null;
let masterGain = null;

function unlockAudio(){
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      audioCtx = new AudioContextClass();
      masterGain = audioCtx.createGain();
      masterGain.gain.value = 0.8;
      masterGain.connect(audioCtx.destination);
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
  } catch (_) {}
}

function playClick(){
  try {
    unlockAudio();
    if (!audioCtx || !masterGain) return;

    const now = audioCtx.currentTime;
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();

    // A short, clearly audible tactile-style two-tone click.
    o.type = 'sine';
    o.frequency.setValueAtTime(620, now);
    o.frequency.exponentialRampToValueAtTime(280, now + 0.075);

    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.28, now + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

    o.connect(g).connect(masterGain);
    o.start(now);
    o.stop(now + 0.15);
  } catch (_) {}
}
