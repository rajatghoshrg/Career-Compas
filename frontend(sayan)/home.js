 // -- placeholder data and small behaviours
    const resources = []; // set resource objects to show cards 
    // Example resource object: {title:'Free Resume Template', description:'Download a modern resume template', link:'#'}

    const grid = document.getElementById('resource-grid');
    function renderResources(){
      grid.innerHTML = '';
      if(!resources.length){
        // show a subtle band like screenshot below the main card
        const band = document.createElement('div');
        band.className = 'band';
        grid.appendChild(band);
        return;
      }
      resources.forEach(r=>{
        const el = document.createElement('div');
        el.className = 'resource card';
        el.innerHTML = `<div class="title">${escapeHtml(r.title)}</div><div class="meta">${escapeHtml(r.description || '')}</div>`;
        if(r.link){
          el.style.cursor = 'pointer';
          el.onclick = ()=> window.open(r.link, '_blank');
        }
        grid.appendChild(el);
      })
    }

    function escapeHtml(s){
      return String(s).replace(/[&<>\"']/g,function(c){
        return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c];
      });
    }

    renderResources();

    // CTA scroll behaviour
    document.getElementById('cta-quiz').addEventListener('click',function(e){
      // smooth scroll to quiz (example anchor). There is no quiz section here — this is a placeholder.
      e.preventDefault();
      const top = document.querySelector('main').offsetTop;
      window.scrollTo({top,behavior:'smooth'});
    });

    // Chat button tiny demo
    document.getElementById('chat-btn').addEventListener('click',()=>{
      // small toast-style chat open demo
      const existing = document.getElementById('chat-toast');
      if(existing) return existing.animate([{opacity:1},{opacity:0}],{duration:1200,iterations:1}).onfinish = ()=> existing.remove();

      const t = document.createElement('div');
      t.id = 'chat-toast';
      t.style.position = 'fixed';
      t.style.right = '102px';
      t.style.bottom = '36px';
      t.style.padding = '12px 16px';
      t.style.background = 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))';
      t.style.borderRadius = '10px';
      t.style.boxShadow = '0 8px 30px rgba(0,0,0,0.45)';
      t.style.color = 'white';
      t.style.fontWeight = 600;
      t.textContent = 'Hi! I\'m Career Compass — how can I help?';
      document.body.appendChild(t);

      setTimeout(()=>{
        t.animate([{opacity:1,transform:'translateY(0px)'},{opacity:0,transform:'translateY(8px)'}],{duration:900,iterations:1});
        setTimeout(()=>t.remove(),900);
      },2200);
    });

    // small accessibility: focus outline for keyboard users
    document.addEventListener('keydown', (e)=>{
      if(e.key === 'Tab') document.documentElement.style.scrollBehavior = 'smooth';
    });