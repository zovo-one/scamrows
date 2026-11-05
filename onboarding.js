(function(){
  var TOTAL=6, i=0;
  var steps=[].slice.call(document.querySelectorAll('.step'));
  var rail=document.getElementById('rail'), back=document.getElementById('back'),
      next=document.getElementById('next'), stepno=document.getElementById('stepno');
  for(var d=0;d<TOTAL;d++){var e=document.createElement('span');e.className='dot';rail.appendChild(e);}
  var dots=[].slice.call(rail.children);
  function render(){
    steps.forEach(function(s,n){s.classList.toggle('on',n===i);});
    dots.forEach(function(dt,n){dt.className='dot'+(n<i?' done':n===i?' now':'');});
    back.style.visibility = i===0?'hidden':'visible';
    stepno.textContent=(i+1)+' of '+TOTAL;
    next.textContent = i===TOTAL-1 ? 'Start exploring' : (i===4 ? 'Maybe later' : 'Next');
    next.className = 'btn '+(i===TOTAL-1?'btn--primary':'btn--primary');
    if(i===1) setTimeout(runDemo,350);
  }
  function go(n){ i=Math.max(0,Math.min(TOTAL-1,n)); render();
    try{chrome.storage&&chrome.storage.local&&chrome.storage.local.set({'scamce8c:onboardStep':i});}catch(e){} }
  next.addEventListener('click',function(){ if(i===TOTAL-1){ finish(); } else go(i+1); });
  back.addEventListener('click',function(){go(i-1);});
  document.getElementById('skip').addEventListener('click',finish);
  document.addEventListener('keydown',function(e){
    if(e.key==='ArrowRight'||e.key==='Enter'){ if(document.activeElement.tagName!=='INPUT'&&document.activeElement.tagName!=='A') next.click(); }
    if(e.key==='ArrowLeft') back.click();
  });
  function finish(){
    try{chrome.storage&&chrome.storage.local&&chrome.storage.local.set({'scamce8c:onboardingComplete':true});}catch(e){}
    try{ if(chrome.tabs&&chrome.tabs.getCurrent){chrome.tabs.getCurrent(function(t){t&&t.id!=null?chrome.tabs.remove(t.id):window.close();});} else window.close(); }catch(e){ window.close(); }
  }
  // step 2 fill demo
  var demoRan=false;
  function runDemo(){
    var boxes=document.querySelectorAll('[data-step="1"] .box[data-fill]');
    boxes.forEach(function(b){b.classList.remove('filled');b.textContent=' ';});
    demoRan=true;
    boxes.forEach(function(b,n){
      setTimeout(function(){
        var val=b.getAttribute('data-fill'); b.textContent='';
        b.classList.add('filled');
        var k=0; (function type(){ b.textContent=val.slice(0,k); if(k<=val.length){k++;setTimeout(type,22);} })();
      }, 260*n);
    });
  }
  document.getElementById('demoBtn').addEventListener('click',runDemo);
  // step 3 save (DOM changed from the template's single text input to the five
  // explorer checkboxes, so this handler is the template's save flow adapted to
  // write the real scamce8c:settings blob the content script reads)
  var FAMS=['etherscan','basescan','arbiscan','bscscan','polygonscan'];
  try{chrome.storage&&chrome.storage.local&&chrome.storage.local.get('scamce8c:settings',function(cur){
    var s=(cur&&cur['scamce8c:settings'])||null;
    if(!s||typeof s!=='object'||!s.explorers) return;
    [].slice.call(document.querySelectorAll('.explchk')).forEach(function(b){
      var f=b.getAttribute('data-family');
      if(f&&typeof s.explorers[f]==='boolean') b.checked=s.explorers[f];
    });
  });}catch(e){}
  var saveBtn=document.getElementById('saveBtn');
  saveBtn && saveBtn.addEventListener('click',function(){
    var explorers={};
    FAMS.forEach(function(f){explorers[f]=true;});
    [].slice.call(document.querySelectorAll('.explchk')).forEach(function(b){
      var f=b.getAttribute('data-family');
      if(f) explorers[f]=!!b.checked;
    });
    try{chrome.storage&&chrome.storage.local&&chrome.storage.local.get('scamce8c:settings',function(cur){
      var s=(cur&&cur['scamce8c:settings'])||{};
      var next={
        masterOn:(typeof s.masterOn==='boolean'?s.masterOn:true),
        explorers:explorers,
        heuristics:(s.heuristics&&typeof s.heuristics==='object'?s.heuristics:{blocklist:true,urlBait:true,dustZero:true,homoglyph:true}),
        dustThreshold:(typeof s.dustThreshold==='number'&&isFinite(s.dustThreshold)&&s.dustThreshold>=0?s.dustThreshold:0)
      };
      chrome.storage.local.set({'scamce8c:settings':next,'scamce8c:onboardCoverageSaved':true});
    });}catch(e){}
    document.getElementById('saved').classList.add('show');
    saveBtn.textContent='Coverage saved'; saveBtn.disabled=true; saveBtn.style.opacity=.7;
  });
  render();
})();
