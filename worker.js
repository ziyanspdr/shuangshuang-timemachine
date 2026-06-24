// == Cloudflare Worker - 双双的小窝 AI ==
// 一个文件搞定：登录页面、聊天页面、密码验证、AI聊天代理

// ═══ 配置区 ═══
const PASSWORD = 'sstw2024';
const API_KEY = 'sk-e77af443f5b14f4d88c8cd5451c4cb57';
// ══════════════

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-auth-token'
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: cors });
    }

    // API: 登录验证
    if (path === '/api/login' && request.method === 'POST') {
      const body = await request.json();
      if (body.password === PASSWORD) {
        return new Response(JSON.stringify({ success: true, token: 'ok' }), {
          headers: { ...cors, 'Content-Type': 'application/json' }
        });
      }
      return new Response(JSON.stringify({ success: false }), {
        headers: { ...cors, 'Content-Type': 'application/json' }
      });
    }

    // API: AI 聊天
    if (path === '/api/chat' && request.method === 'POST') {
      const token = request.headers.get('x-auth-token');
      if (token !== 'ok') {
        return new Response(JSON.stringify({ error: '未授权' }), {
          status: 401, headers: { ...cors, 'Content-Type': 'application/json' }
        });
      }

      try {
        const body = await request.json();
        const resp = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: body.messages || [],
            max_tokens: 2000,
            temperature: 0.8
          })
        });
        const data = await resp.json();
        return new Response(JSON.stringify(data), {
          headers: { ...cors, 'Content-Type': 'application/json' }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 500, headers: { ...cors, 'Content-Type': 'application/json' }
        });
      }
    }

    // 根路径 → 登录页
    if (path === '/' || path === '/index.html') {
      return new Response(getLoginPage(), {
        headers: { 'Content-Type': 'text/html;charset=utf-8' }
      });
    }

    // /chat.html → 聊天页
    if (path === '/chat.html') {
      return new Response(getChatPage(), {
        headers: { 'Content-Type': 'text/html;charset=utf-8' }
      });
    }

    return new Response('Not found', { status: 404 });
  }
};

function getLoginPage() {
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no">
<title>🔑 小窝 AI</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,'Segoe UI','PingFang SC','Microsoft YaHei',sans-serif;background:linear-gradient(145deg,#f5ebe0,#ece0d4);min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}
.card{background:#fff;border-radius:24px;padding:40px 32px;width:100%;max-width:380px;box-shadow:0 8px 40px rgba(0,0,0,0.06);text-align:center}
.icon{font-size:4rem;margin-bottom:12px}
h1{font-size:1.3rem;color:#4a3a3a;font-weight:600;margin-bottom:4px}
.sub{color:#baaaaa;font-size:.85rem;margin-bottom:28px}
.w{background:#f5f0ec;border-radius:14px;padding:4px 16px;margin-bottom:16px}
.w input{width:100%;border:none;background:transparent;padding:14px 0;font-size:1rem;outline:none;color:#3a3a3a}
.w input::placeholder{color:#baaaaa}
.btn{width:100%;padding:14px;background:linear-gradient(135deg,#f5a97f,#e8877a);border:none;border-radius:14px;color:#fff;font-size:1rem;font-weight:bold;cursor:pointer;letter-spacing:2px}
.btn:active{transform:scale(.97)}
.err{color:#e8877a;font-size:.85rem;margin-top:12px;display:none}
</style></head><body>
<div class="card">
<div class="icon">🏠</div>
<h1>双双的小窝 AI</h1>
<div class="sub">输入密码开始聊天 ✨</div>
<div class="w"><input type="password" id="p" placeholder="密码"></div>
<button class="btn" onclick="login()">进入聊天</button>
<div class="err" id="e">密码错误～</div>
</div>
<script>
async function login(){
  const r=await fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:document.getElementById('p').value})});
  const d=await r.json();
  if(d.success){localStorage.setItem('sstw_token','ok');window.location.href='/chat.html'}
  else{document.getElementById('e').style.display='block';document.getElementById('p').value=''}
}
document.getElementById('p').addEventListener('keydown',e=>{if(e.key==='Enter')login()});
</script></body></html>`;
}

function getChatPage() {
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no">
<title>💬 小窝 AI</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,'Segoe UI','PingFang SC','Microsoft YaHei',sans-serif;background:linear-gradient(145deg,#f5ebe0,#ece0d4);min-height:100vh;display:flex;flex-direction:column}
.h{background:linear-gradient(135deg,#e8c4b8,#dbb4a8);padding:14px 20px;display:flex;align-items:center;gap:12px;position:sticky;top:0;z-index:10}
.h .av{width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#f5a97f,#e8877a);display:flex;align-items:center;justify-content:center;font-size:1.2rem;flex-shrink:0}
.h .n{font-weight:600;color:#4a3a3a;font-size:1rem;flex:1}
.h .s{color:#8a7a7a;font-size:.75rem}
.h .l{background:none;border:none;font-size:.8rem;cursor:pointer;color:#8a6a6a}
.c{flex:1;overflow-y:auto;padding:16px 14px;display:flex;flex-direction:column;gap:12px}
.msg{display:flex;gap:10px;max-width:85%;animation:in .3s}
@keyframes in{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.msg.b{align-self:flex-start}
.msg.u{align-self:flex-end;flex-direction:row-reverse}
.msg .av{width:36px;height:36px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:1rem}
.msg.b .av{background:linear-gradient(135deg,#f5a97f,#e8877a)}
.msg.u .av{background:linear-gradient(135deg,#8ab5d0,#6a95b0)}
.msg .bb{padding:10px 14px;border-radius:14px;font-size:.92rem;line-height:1.55;word-break:break-word}
.msg.b .bb{background:#fff;color:#3a3a3a;border-top-left-radius:4px}
.msg.u .bb{background:linear-gradient(135deg,#e8c4b8,#ddb4a8);color:#3a2a2a;border-top-right-radius:4px}
.msg .t{font-size:.6rem;color:#baaaaa;padding:2px 4px 0}
.ty{display:none;align-self:flex-start;gap:10px;padding:4px 0}
.ty.s{display:flex}
.ty .av{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#f5a97f,#e8877a);display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0}
.ty .d{background:#fff;border-radius:14px;padding:12px 18px;display:flex;gap:5px;align-items:center}
.ty .d span{width:8px;height:8px;border-radius:50%;background:#d0c0c0;animation:db 1.4s infinite}
.ty .d span:nth-child(2){animation-delay:.2s}
.ty .d span:nth-child(3){animation-delay:.4s}
@keyframes db{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-8px)}}
.in{background:#fff;border-top:1px solid rgba(0,0,0,0.04);padding:10px 14px;display:flex;gap:10px;align-items:flex-end}
.in .w{flex:1;background:#f5f0ec;border-radius:20px;padding:2px 16px;display:flex;align-items:flex-end}
.in textarea{width:100%;border:none;background:transparent;font-size:.92rem;font-family:inherit;outline:none;resize:none;padding:8px 0;max-height:100px;color:#3a3a3a;line-height:1.4}
.in textarea::placeholder{color:#baaaaa}
.in .sd{width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#f5a97f,#e8877a);border:none;color:#fff;font-size:1.1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.in .sd:active{transform:scale(.9)}
.in .sd:disabled{opacity:.4}
</style></head><body>
<div class="h">
<div class="av">🤖</div><div class="n">小窝 AI <span class="s" id="st">在线</span></div>
<button class="l" onclick="localStorage.removeItem('sstw_token');window.location.href='/'">退出</button>
</div>
<div class="c" id="c"></div>
<div class="ty" id="ty"><div class="av">🤖</div><div class="d"><span></span><span></span><span></span></div></div>
<div class="in">
<div class="w"><textarea id="in" rows="1" placeholder="输入消息..." maxlength="2000"></textarea></div>
<button class="sd" id="sd">➤</button>
</div>
<script>
if(localStorage.getItem('sstw_token')!=='ok'){window.location.href='/';throw''}
const C=document.getElementById('c'),I=document.getElementById('in'),SD=document.getElementById('sd'),TY=document.getElementById('ty'),ST=document.getElementById('st');
let send=false,msgs=[];
try{const s=localStorage.getItem('sstw_ch');if(s){const d=JSON.parse(s);msgs=d.filter(m=>m.role==='user'||m.role==='assistant');
C.innerHTML='';msgs.forEach(m=>{add(m.content,m.role==='user'?'u':'b',false)});if(!msgs.length)init()}}catch(e){}
if(!msgs.length)init();
function init(){C.innerHTML='<div class="msg b"><div class="av">🤖</div><div class="bb">嘿嘿，你来啦～<br>今天想聊什么呀？💕<div class="t">'+tm()+'</div></div></div>'}
function tm(){const d=new Date();return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')}
function add(t,role,s){const d=document.createElement('div');d.className='msg '+role;
d.innerHTML='<div class="av">'+(role==='b'?'🤖':'🧑')+'</div><div class="bb">'+fmt(t)+'<div class="t">'+tm()+'</div></div>';
C.appendChild(d);if(s&&role==='u'){msgs.push({role:'user',content:t});save()}sc()}
function sc(){setTimeout(()=>C.scrollTop=C.scrollHeight,30)}
function fmt(t){let s=t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
s=s.replace(/\`\`\`(\w*)\\n([\\s\\S]*?)\`\`\`/g,'<pre><code>$2</code></pre>');
s=s.replace(/\`([^\`]+)\`/g,'<code>$1</code>');s=s.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>');return s.replace(/\\n/g,'<br>')}
function save(){try{localStorage.setItem('sstw_ch',JSON.stringify(msgs))}catch(e){}}
I.addEventListener('input',function(){this.style.height='auto';this.style.height=Math.min(this.scrollHeight,100)+'px'});
I.addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();go()}});
SD.addEventListener('click',go);
async function go(){const t=I.value.trim();if(!t||send)return;
I.value='';I.style.height='auto';send=true;SD.disabled=true;add(t,'u',true);
TY.classList.add('s');ST.textContent='正在输入...';sc();
const am=[{role:'system',content:'你是「小窝AI」，双双的智能小伙伴。回答温柔可爱，用emoji，口语化。不要说你是DeepSeek或任何公司名。'}];
msgs.slice(-20).forEach(m=>am.push({role:m.role,content:m.content}));
try{const r=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json','x-auth-token':'ok'},body:JSON.stringify({messages:am})});
TY.classList.remove('s');ST.textContent='在线';
if(!r.ok)throw new Error(await r.text());const d=await r.json();const rep=d.choices[0].message.content;
add(rep,'b',true);msgs.push({role:'assistant',content:rep});save()
}catch(e){TY.classList.remove('s');ST.textContent='在线';add('😅 出错了：'+e.message.substring(0,80),'b',true)}
send=false;SD.disabled=false;I.focus()}
</script></body></html>`;
}
