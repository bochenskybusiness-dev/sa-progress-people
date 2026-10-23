const leadDialog=document.querySelector('#lead-dialog');
const demoDialog=document.querySelector('#demo-dialog');
const menuDialog=document.querySelector('#menu-dialog');
let returnFocus=null;
// Dialogs and the article control live outside the scaled annotation canvas.
document.querySelectorAll('dialog').forEach(dialog=>{
  document.body.append(dialog);
  dialog.querySelectorAll('[data-close-dialog]').forEach(button=>button.addEventListener('click',()=>dialog.close()));
  dialog.addEventListener('close',()=>{if(!document.querySelector('dialog[open]'))returnFocus?.focus({preventScroll:true});});
  dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();});
});
document.querySelector('.menu-toggle').addEventListener('click',event=>{returnFocus=event.currentTarget;menuDialog.showModal();});
document.querySelectorAll('a[href^="#"]').forEach(link=>link.addEventListener('click',event=>{
  const id=link.getAttribute('href').slice(1);const target=document.getElementById(id);if(!target)return;
  event.preventDefault();if(menuDialog.open)menuDialog.close();history.replaceState(null,'','#'+id);requestAnimationFrame(()=>window.pageScroll.to(id==='top'?0:target));
}));

const services=[...document.querySelectorAll('.service-choices input')];
function chosenServices(){return services.filter(input=>input.checked).map(input=>input.value);}
function updateCount(){const n=chosenServices().length;document.querySelector('#service-count').textContent=n;document.querySelector('#service-count-label').textContent=n===1?'приоритет':n>=2&&n<=4?'приоритета':'приоритетов';}
services.forEach(input=>input.addEventListener('change',updateCount));
document.querySelectorAll('[data-open-lead]').forEach(button=>button.addEventListener('click',()=>{
  returnFocus=button;
  const selected=button.dataset.context==='program'?chosenServices():[];
  const team=document.querySelector('[name="team-size"]:checked').value;
  document.querySelector('#lead-context').textContent=button.dataset.context==='program'?`Команда: ${team} сотрудников. ${selected.length?'Приоритеты: '+selected.join(', ').toLowerCase()+'.':'Состав программы обсудим вместе.'}`:'Уточним задачи компании и подберём подходящие варианты ДМС.';
  leadDialog.showModal();
}));
function setError(input,message){input.setAttribute('aria-invalid',String(Boolean(message)));const id=input.getAttribute('aria-describedby');if(id)document.getElementById(id).textContent=message;}
function validateInput(input){const value=input.value.trim();let message='';if(input.name==='name'&&value.length<2)message='Укажите ваше имя';if(input.name==='phone'){const digits=value.replace(/\D/g,'');if(!/^[+\d\s().-]+$/.test(value)||digits.length<10||digits.length>15)message='Проверьте номер телефона';}if(input.name==='employees'&&value&&(!Number.isInteger(Number(value))||Number(value)<1||Number(value)>100000))message='Укажите целое число от 1 до 100 000';setError(input,message);return !message;}
document.querySelectorAll('[data-lead-form]').forEach(form=>{
  form.addEventListener('submit',event=>{event.preventDefault();const fields=[...form.querySelectorAll('input')].filter(input=>['name','phone','employees'].includes(input.name));const invalid=fields.filter(input=>!validateInput(input));if(invalid.length){invalid[0].focus();return;}if(!leadDialog.open)returnFocus=form.querySelector('[type="submit"]');if(leadDialog.open)leadDialog.close();demoDialog.showModal();});
  form.querySelectorAll('input').forEach(input=>input.addEventListener('input',()=>{if(input.getAttribute('aria-invalid')==='true')validateInput(input);}));
});
// This presentation deliberately has no submission endpoint, persistence or file reads.
const fileInput=document.querySelector('#policy-file');
const fileLabel=document.querySelector('#file-label');
const fileError=document.querySelector('#file-error');
function resetFile(){fileInput.value='';fileLabel.textContent='Прикрепить действующую программу';fileError.textContent='';}
document.querySelectorAll('[name="scenario"]').forEach(input=>input.addEventListener('change',()=>{const renewal=input.value==='renew';document.querySelector('#program-file').hidden=!renewal;document.querySelector('#scenario-description').textContent=renewal?'Сравним действующие условия с доступными предложениями.':'Подберём программу под задачи вашей компании.';if(!renewal)resetFile();}));
fileInput.addEventListener('change',()=>{const file=fileInput.files?.[0];fileError.textContent='';if(!file){resetFile();return;}if(file.size>10*1024*1024||!/(\.pdf|\.docx?|\.xlsx?)$/i.test(file.name)){resetFile();fileError.textContent='Выберите PDF, DOC, DOCX, XLS или XLSX размером до 10 МБ.';return;}fileLabel.textContent=file.name;});

const careContent=[
  ['Начать с правильного специалиста','Приёмы терапевта и профильных врачей, лечение и процедуры по назначению. Подберём клиники рядом с работой или домом и уточним порядок записи.'],
  ['Понять, что происходит','Лабораторные исследования, УЗИ и другие обследования по медицинским показаниям. Для сложной диагностики заранее проверим условия направления и согласования.'],
  ['Забота, которую не откладывают','Диагностика и лечение зубов в пределах выбранного пакета. Отдельно уточним профилактику, протезирование и другие ограничения программы.'],
  ['Когда нужна помощь стационара','Плановая или экстренная госпитализация, если она включена в программу. Проверим медицинские организации, основания для обращения, лимиты и согласования.'],
  ['Помощь приезжает к вам','Выезд врача, неотложная помощь и транспортировка по условиям полиса. Уточним территорию обслуживания, часы работы и порядок вызова.'],
  ['Врач ближе, чем кажется','Дистанционные консультации специалистов и дополнительные сервисы. Обсудим доступные специальности, количество обращений и возможности выбранной программы.']
];
const careTabs=[...document.querySelectorAll('[data-care]')];
function selectCare(index){careTabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;});document.querySelector('#care-panel').setAttribute('aria-labelledby',careTabs[index].id);document.querySelector('.care-panel-number').textContent=String(index+1).padStart(2,'0');document.querySelector('#care-panel-title').textContent=careContent[index][0];document.querySelector('#care-panel-copy').textContent=careContent[index][1];}
careTabs.forEach((tab,index)=>{tab.addEventListener('click',()=>selectCare(index));tab.addEventListener('keydown',event=>{let next=index;if(['ArrowDown','ArrowRight'].includes(event.key))next=(index+1)%careTabs.length;else if(['ArrowUp','ArrowLeft'].includes(event.key))next=(index+careTabs.length-1)%careTabs.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=careTabs.length-1;else return;event.preventDefault();selectCare(next);careTabs[next].focus();});});

const articleSection=document.querySelector('#article');
const articleMore=document.querySelector('#article-more');
const articleToggle=document.querySelector('#article-toggle');
const articleActions=document.querySelector('.article-reading-actions');
document.body.append(articleActions);
const header=document.querySelector('.site-header');
const canvas=document.querySelector('.review-canvas');
let scrollFrame=0;
function updateScrollUI(){
  scrollFrame=0;
  if(canvas){const rect=canvas.getBoundingClientRect();const scale=rect.width/canvas.offsetWidth;const toolbar=document.querySelector('.review-toolbar').getBoundingClientRect().bottom;header.style.transform=`translateY(${Math.max(0,(toolbar-rect.top)/scale)}px)`;}
  const rect=articleSection.getBoundingClientRect();const inset=(document.querySelector('.review-toolbar')?.getBoundingClientRect().bottom||0)+header.getBoundingClientRect().height;
  articleActions.hidden=articleMore.hidden||rect.top>innerHeight-100||rect.bottom<inset+80;
}
function scheduleScrollUI(){if(!scrollFrame)scrollFrame=requestAnimationFrame(updateScrollUI);}
window.addEventListener('scroll',scheduleScrollUI,{passive:true});window.addEventListener('resize',scheduleScrollUI);new ResizeObserver(scheduleScrollUI).observe(articleSection);document.querySelector('#review-scale')?.addEventListener('click',scheduleScrollUI);document.fonts.ready.then(scheduleScrollUI);
articleToggle.addEventListener('click',()=>{articleMore.hidden=false;articleToggle.hidden=true;articleToggle.setAttribute('aria-expanded','true');articleSection.classList.add('is-expanded');scheduleScrollUI();window.pageScroll.refresh();});
document.querySelector('.article-collapse').addEventListener('click',()=>{window.pageScroll.to(articleSection,{duration:.65,onComplete:()=>{articleMore.hidden=true;articleToggle.hidden=false;articleToggle.setAttribute('aria-expanded','false');articleSection.classList.remove('is-expanded');articleToggle.focus({preventScroll:true});window.pageScroll.refresh();scheduleScrollUI();}});});
document.querySelectorAll('details[name]').forEach(details=>details.addEventListener('toggle',()=>{if(details.open)document.querySelectorAll(`details[name="${details.name}"]`).forEach(other=>{if(other!==details)other.open=false;});}));
if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&'IntersectionObserver' in window){const reveal=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('enter-view');reveal.unobserve(entry.target);}},{threshold:.12});document.querySelectorAll('.value-list article,.process-track li,.trust-facts>div,.agency-list li').forEach(element=>reveal.observe(element));}
scheduleScrollUI();

function positionHash(){const id=location.hash.slice(1);const target=id&&document.getElementById(id);if(target)requestAnimationFrame(()=>window.pageScroll.to(id==='top'?0:target,{immediate:true}));}
window.addEventListener('load',()=>document.fonts.ready.then(positionHash));
window.addEventListener('hashchange',positionHash);
