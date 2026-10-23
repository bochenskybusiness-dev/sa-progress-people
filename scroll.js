(() => {
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const root=document.documentElement;
  let scroller=null;
  function lock(){const opened=Boolean(document.querySelector('dialog[open]'));root.classList.toggle('has-open-dialog',opened);if(opened)scroller?.stop();else scroller?.start();}
  function configure(){scroller?.destroy();scroller=null;if(!reduced.matches&&window.Lenis)scroller=new Lenis({autoRaf:true,lerp:.16,wheelMultiplier:1,smoothWheel:true,syncTouch:false,prevent:node=>node.tagName==='DIALOG'});root.dataset.scrollMode=scroller?'smooth':'native';lock();}
  function refresh(){scroller?.resize();}
  function to(target,{immediate=false,duration=.7,onComplete}={}){const element=typeof target==='string'?document.querySelector(target):target;const inset=(document.querySelector('.site-header')?.getBoundingClientRect().height||0)+(document.querySelector('.review-toolbar')?.getBoundingClientRect().height||0)+22;const anchor=element instanceof Element&&element.tagName==='SECTION'?(element.querySelector('.section-topline,.section-label,.article-label,.section-kicker')||element):element;const top=anchor instanceof Element?anchor.getBoundingClientRect().top+scrollY-inset:Number(anchor);refresh();if(scroller)scroller.scrollTo(top,{immediate,duration,easing:t=>1-Math.pow(1-t,3),onComplete});else{window.scrollTo({top,behavior:immediate||reduced.matches?'instant':'smooth'});if(onComplete)setTimeout(onComplete,immediate||reduced.matches?0:duration*1000);}}
  window.pageScroll={to,refresh};
  document.querySelectorAll('dialog').forEach(dialog=>{dialog.setAttribute('data-lenis-prevent','');new MutationObserver(lock).observe(dialog,{attributes:true,attributeFilter:['open']});});
  reduced.addEventListener('change',configure);window.addEventListener('load',refresh);document.fonts.ready.then(refresh);configure();
})();
