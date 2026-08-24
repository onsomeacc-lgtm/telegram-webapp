const tg=window.Telegram?.WebApp;if(tg){tg.ready();tg.expand()}
const BASE='./assets/';
const stories=[
 {image:BASE+'story-01.svg',title:'Так хочется потрогать!\nЛучше — с включенным звуком.',action:'✦',sound:BASE+'tkan1.mp3'},
 {image:BASE+'grass.jpg',title:'Так хочется потрогать!\nЛучше — с включенным звуком.',action:'↗',sound:BASE+'trava2.mp3'},
 {image:BASE+'sand3.jpg',title:'Так хочется потрогать!\nЛучше — с включенным звуком.',action:'○',sound:BASE+'pesok3.mp3'}
];
const track=document.querySelector('#storyTrack'),progress=document.querySelector('#storyProgress'),counter=document.querySelector('#storyCounter');let index=0;
stories.forEach((s,i)=>{const el=document.createElement('article');el.className='story';el.innerHTML='<img class="story-photo" src="'+s.image+'" alt="" draggable="false"><div class="story-content"><h2 class="story-title">'+s.title.replaceAll('\n','<br>')+'</h2></div>';track.appendChild(el);const p=document.createElement('i');p.innerHTML='<b></b>';progress.appendChild(p)});
function update(){track.style.transform='translate3d('+(-index*100)+'%,0,0)';[...progress.children].forEach((p,i)=>p.classList.toggle('active',i<=index));counter.textContent=String(index+1).padStart(2,'0')+' / 03'}update();
let down=false,startX=0,dx=0;track.addEventListener('pointerdown',e=>{down=true;startX=e.clientX;dx=0;track.setPointerCapture?.(e.pointerId)});track.addEventListener('pointermove',e=>{if(!down)return;dx=e.clientX-startX;track.style.transform='translate3d(calc('+(-index*100)+'% + '+dx+'px),0,0)'});function up(){if(!down)return;down=false;if(Math.abs(dx)>55){if(dx<0&&index<2)index++;else if(dx>0&&index>0)index--}update()}track.addEventListener('pointerup',up);track.addEventListener('pointercancel',up);
