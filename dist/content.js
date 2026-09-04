var ee=Object.defineProperty;var te=(w,k,S)=>k in w?ee(w,k,{enumerable:!0,configurable:!0,writable:!0,value:S}):w[k]=S;var q=(w,k,S)=>te(w,typeof k!="symbol"?k+"":k,S);(function(){"use strict";const w="dam-ai-enabled",k="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";async function S(){return new Promise(n=>{chrome.storage.local.get(["dam-ai-api-key","dam-ai-provider","dam-ai-model"],e=>{const t={};e["dam-ai-api-key"]||(t["dam-ai-api-key"]=k),e["dam-ai-provider"]||(t["dam-ai-provider"]="groq"),e["dam-ai-model"]||(t["dam-ai-model"]="openai/gpt-oss-20b"),Object.keys(t).length>0?chrome.storage.local.set(t,n):n()})})}async function K(){return new Promise(n=>{chrome.storage.local.get(w,e=>{n(e[w]??!1)})})}async function U(n){return new Promise(e=>{chrome.storage.local.set({[w]:n},e)})}async function z(){return new Promise(n=>{chrome.storage.local.get("dam-ai-api-key",e=>{n(e["dam-ai-api-key"]??"")})})}async function Q(n){return new Promise(e=>{chrome.storage.local.set({"dam-ai-api-key":n},e)})}async function R(){return new Promise(n=>{chrome.storage.local.get("dam-ai-model",e=>{n(e["dam-ai-model"]??"")})})}async function W(n){return new Promise(e=>{chrome.storage.local.set({"dam-ai-model":n},e)})}async function F(){return new Promise(n=>{chrome.storage.local.get("dam-ai-provider",e=>{n(e["dam-ai-provider"]??"groq")})})}async function _(n){return new Promise(e=>{chrome.storage.local.set({"dam-ai-provider":n},e)})}class Y{constructor(){q(this,"id","chatgpt")}isSupported(){return location.hostname==="chatgpt.com"}findComposer(){const e=['#prompt-textarea.ProseMirror[contenteditable="true"]','[contenteditable="true"]#prompt-textarea','#prompt-textarea[contenteditable="true"]',"#prompt-textarea",'form[data-type="unified-composer"] [contenteditable="true"]','[data-testid="composer"] [contenteditable="true"]','main form [contenteditable="true"]'];for(const o of e){const r=document.querySelector(o);if(r&&r.offsetParent!==null)return console.log("[DAM AI] Found composer:",o),r}const t=document.querySelectorAll('main div[contenteditable="true"]');for(const o of t)if(o instanceof HTMLElement&&o.offsetParent!==null&&o.getBoundingClientRect().height>20)return console.log("[DAM AI] Found composer via fallback"),o;return console.log("[DAM AI] No composer found"),null}findToolbar(){const e=this.findComposer();if(!e)return null;let t=e;for(let r=0;r<10&&(t=t.parentElement,!!t);r++){const i=window.getComputedStyle(t),d=parseInt(i.borderRadius||"0",10),c=t.querySelectorAll("button");if(d>=12&&c.length>=2&&t.getBoundingClientRect().height>30&&t.getBoundingClientRect().height<120)return console.log("[DAM AI] Found ChatGPT toolbar:",t.tagName,t.className.substring(0,50)),t}const o=e.closest("form");return o?(console.log("[DAM AI] Found ChatGPT toolbar via form"),o):(console.log("[DAM AI] No ChatGPT toolbar found"),null)}findSendButton(){var o;const e=['button[data-testid="send-button"]','button[aria-label="Send prompt"]','button[aria-label*="Send"]'];for(const r of e){const i=document.querySelector(r);if(i)return i}const t=(o=this.findComposer())==null?void 0:o.closest("form");if(t){const r=t.querySelectorAll("button:not([disabled])");if(r.length>0)return r[r.length-1]}return null}readPrompt(){var t;const e=this.findComposer();return e?e instanceof HTMLTextAreaElement?e.value:((t=e.innerText)==null?void 0:t.trim())??"":""}writePrompt(e){var i;const t=this.findComposer();if(!t)return;if(t instanceof HTMLTextAreaElement){const d=(i=Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,"value"))==null?void 0:i.set;d?d.call(t,e):t.value=e,t.dispatchEvent(new Event("input",{bubbles:!0})),t.dispatchEvent(new Event("change",{bubbles:!0}));return}t.focus();const o=window.getSelection(),r=document.createRange();r.selectNodeContents(t),o==null||o.removeAllRanges(),o==null||o.addRange(r),document.execCommand("insertText",!1,e)}focusComposer(){const e=this.findComposer();if(e){e.focus();const t=window.getSelection(),o=document.createRange();o.selectNodeContents(e),o.collapse(!1),t==null||t.removeAllRanges(),t==null||t.addRange(o)}}isSendButton(e){return!e||!(e instanceof HTMLElement)?!1:e.matches('button[data-testid="send-button"]')||e.closest('button[data-testid="send-button"]')!==null||e.matches('button[aria-label*="Send"]')||e.closest('button[aria-label*="Send"]')!==null}isComposer(e){return!e||!(e instanceof HTMLElement)?!1:e.matches("#prompt-textarea")||e.matches("#prompt-textarea.ProseMirror")||e.matches('[contenteditable="true"]#prompt-textarea')||e.matches('[data-testid="composer"]')||e.closest("#prompt-textarea")!==null||e.closest('[data-testid="composer"]')!==null}}class ${constructor(){q(this,"id","claude")}isSupported(){return location.hostname==="claude.ai"}findComposer(){const e=['[data-testid="chat-input"]','[data-testid="composer"]','[contenteditable="true"][role="textbox"]','.ProseMirror[contenteditable="true"]','div[contenteditable="true"].ProseMirror','div[contenteditable="true"][class*="composer"]','div[contenteditable="true"][placeholder]','form [contenteditable="true"]'];for(const o of e){const r=document.querySelector(o);if(r&&r.offsetParent!==null)return console.log("[DAM AI] Found Claude composer:",o),r}const t=document.querySelectorAll('div[contenteditable="true"]');for(const o of t)if(o instanceof HTMLElement&&o.offsetParent!==null&&o.getBoundingClientRect().height>20)return console.log("[DAM AI] Found Claude composer via fallback"),o;return console.log("[DAM AI] No Claude composer found"),null}findToolbar(){const e=this.findComposer();if(!e)return null;let t=null,o=e;for(let i=0;i<10&&(o=o.parentElement,!!o);i++){const d=o.querySelectorAll("button"),c=Array.from(d).some(u=>{var s;return((s=u.textContent)==null?void 0:s.trim())==="Chat"}),p=Array.from(d).some(u=>{var s;return((s=u.textContent)==null?void 0:s.trim())==="Cowork"});if(c||p){t=o;break}}if(t){const i=t.querySelectorAll(":scope > div");for(const d of i)if(d instanceof HTMLElement&&d.querySelector("button"))return console.log("[DAM AI] Found Claude toolbar:",d.tagName),d;return console.log("[DAM AI] Found Claude toolbar (container)"),t}const r=e.closest("form")||e.closest("fieldset");return r?(console.log("[DAM AI] Found Claude toolbar via closest form/fieldset"),r):(console.log("[DAM AI] No Claude toolbar found"),null)}findSendButton(){const e=['button[aria-label="Send Message"]','button[aria-label="Send"]','button[aria-label*="Send"]','button[aria-label*="send"]','[data-testid="send-button"]','button[aria-label*="submit"]','button[aria-label*="Submit"]','button svg[data-testid="send-icon"]',"form button:last-of-type"];for(const o of e)try{const r=document.querySelector(o);if(r&&!r.disabled)return r}catch{}const t=this.findComposer();if(t){let o=t;for(let r=0;r<8&&(o=o.parentElement,!!o);r++){const i=o.querySelectorAll("button:not([disabled])");for(const d of i)if(d.querySelector("svg")&&d.getBoundingClientRect().right>window.innerWidth/2)return d}}return null}readPrompt(){var t;const e=this.findComposer();return e?e instanceof HTMLTextAreaElement?e.value:((t=e.innerText)==null?void 0:t.trim())??"":""}writePrompt(e){var o;const t=this.findComposer();if(t){if(t instanceof HTMLTextAreaElement){const r=(o=Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,"value"))==null?void 0:o.set;r?r.call(t,e):t.value=e,t.dispatchEvent(new Event("input",{bubbles:!0})),t.dispatchEvent(new Event("change",{bubbles:!0}));return}t.focus(),document.execCommand("selectAll",!1,void 0),document.execCommand("delete",!1,void 0),document.execCommand("insertText",!1,e),t.dispatchEvent(new Event("input",{bubbles:!0})),t.dispatchEvent(new Event("change",{bubbles:!0}))}}focusComposer(){const e=this.findComposer();if(e){e.focus();const t=window.getSelection(),o=document.createRange();o.selectNodeContents(e),o.collapse(!1),t==null||t.removeAllRanges(),t==null||t.addRange(o)}}isSendButton(e){return!e||!(e instanceof HTMLElement)?!1:e.matches('button[aria-label="Send Message"]')||e.matches('button[aria-label="Send"]')||e.closest('button[aria-label="Send Message"]')!==null||e.closest('button[aria-label="Send"]')!==null||e.matches('[data-testid="send-button"]')||e.closest('[data-testid="send-button"]')!==null}isComposer(e){return!e||!(e instanceof HTMLElement)?!1:e.matches('[data-testid="chat-input"]')||e.matches('[data-testid="composer"]')||e.matches('[contenteditable="true"][role="textbox"]')||e.matches('.ProseMirror[contenteditable="true"]')||e.closest('[data-testid="chat-input"]')!==null||e.closest('[data-testid="composer"]')!==null||e.closest('.ProseMirror[contenteditable="true"]')!==null}}let A=!1,M=null,x=!1;function N(){return M||(location.hostname==="chatgpt.com"?(M=new Y,M):location.hostname==="claude.ai"?(M=new $,M):null)}function X(){if(document.getElementById("dam-ai-styles"))return;const n=document.createElement("style");n.id="dam-ai-styles",n.textContent=`
/* ── Toggle ── */
.dam-toggle {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.04);
  color: #8e8ea0;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all .15s;
  user-select: none;
  white-space: nowrap;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  line-height: 1;
  flex-shrink: 0;
  margin-left: 4px;
}
.dam-toggle:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.2); }
.dam-toggle[data-active="true"] {
  background: rgba(130,87,229,0.18);
  border-color: rgba(130,87,229,0.4);
  color: #b4a0e8;
}
.dam-toggle-dot {
  width: 5px; height: 5px; border-radius: 50%;
  background: currentColor;
  transition: background .15s;
}
.dam-toggle[data-active="true"] .dam-toggle-dot { background: #a78bfa; }
.dam-toggle-settings {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px; height: 24px;
  border-radius: 6px;
  border: 1px solid rgba(255,255,255,0.08);
  background: transparent;
  color: #6b6b80;
  font-size: 12px;
  cursor: pointer;
  transition: all .15s;
  flex-shrink: 0;
  margin-left: 2px;
}
.dam-toggle-settings:hover { background: rgba(255,255,255,0.06); color: #999; }

/* ── Backdrop ── */
.dam-backdrop {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.55);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 99998;
  animation: damFadeIn .2s ease;
}
@keyframes damFadeIn { from { opacity: 0 } to { opacity: 1 } }

/* ── Modal ── */
.dam-modal {
  position: fixed;
  top: 42%; left: 50%;
  transform: translate(-50%, -50%);
  width: 480px; max-width: calc(100vw - 32px);
  max-height: calc(100vh - 120px);
  background: #2f2f2f;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 20px;
  box-shadow: 0 24px 80px rgba(0,0,0,0.5);
  z-index: 99999;
  display: flex; flex-direction: column;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: #ececec;
  animation: damModalIn .25s cubic-bezier(.16,1,.3,1);
}
@keyframes damModalIn {
  from { opacity: 0; transform: translate(-50%,-50%) scale(0.96); }
  to { opacity: 1; transform: translate(-50%,-50%) scale(1); }
}
.dam-modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 22px 14px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  flex-shrink: 0;
}
.dam-modal-title {
  font-size: 15px; font-weight: 600; color: #ececec;
  display: flex; align-items: center; gap: 8px;
}
.dam-modal-title-icon { font-size: 16px; }
.dam-modal-close {
  width: 28px; height: 28px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 8px; border: none;
  background: transparent; color: #6b6b80;
  font-size: 18px; cursor: pointer;
  transition: all .12s;
}
.dam-modal-close:hover { background: rgba(255,255,255,0.06); color: #ccc; }

/* ── Modal Body ── */
.dam-modal-body {
  padding: 24px 22px;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

/* ── Loading ── */
.dam-loading {
  display: flex; flex-direction: column;
  align-items: center; gap: 20px;
  padding: 48px 24px;
  text-align: center;
}
.dam-spinner {
  width: 28px; height: 28px;
  border: 2.5px solid rgba(255,255,255,0.08);
  border-top-color: rgba(130,87,229,0.7);
  border-radius: 50%;
  animation: damSpin .7s linear infinite;
}
@keyframes damSpin { to { transform: rotate(360deg); } }
.dam-loading-title {
  font-size: 15px; font-weight: 500; color: #d4d4d4;
}
.dam-loading-sub {
  font-size: 13px; color: #888; line-height: 1.5;
}
.dam-loading-steps {
  display: flex; flex-direction: column; gap: 6px;
  margin-top: 4px;
}
.dam-loading-step {
  font-size: 12px; color: #666;
  display: flex; align-items: center; gap: 6px;
}
.dam-loading-step[data-done="true"] { color: #8e8ea0; }
.dam-loading-step-dot {
  width: 5px; height: 5px; border-radius: 50%;
  background: #555; flex-shrink: 0;
}
.dam-loading-step[data-done="true"] .dam-loading-step-dot { background: #a78bfa; }

/* ── Question ── */
.dam-question-text {
  font-size: 16px; font-weight: 500; line-height: 1.45;
  margin-bottom: 18px; color: #ececec;
}
.dam-option {
  display: block; width: 100%;
  padding: 11px 15px; margin-bottom: 7px;
  text-align: left;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px;
  color: #d4d4d4; font-size: 14px; font-family: inherit;
  cursor: pointer;
  transition: all .1s;
}
.dam-option:hover {
  background: rgba(255,255,255,0.07);
  border-color: rgba(255,255,255,0.15);
  color: #ececec;
}
.dam-option[data-selected="true"] {
  background: rgba(130,87,229,0.2);
  border-color: rgba(130,87,229,0.5);
  color: #fff;
}
.dam-other-input {
  width: 100%; padding: 10px 14px; margin-top: 8px;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 10px;
  background: rgba(255,255,255,0.04);
  color: #ececec; font-size: 14px; font-family: inherit;
  outline: none; box-sizing: border-box;
}
.dam-other-input:focus { border-color: rgba(130,87,229,0.5); }
.dam-other-input::placeholder { color: #555; }

/* ── Modal Footer ── */
.dam-modal-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 22px;
  border-top: 1px solid rgba(255,255,255,0.06);
  flex-shrink: 0;
}
.dam-modal-footer-left, .dam-modal-footer-right {
  display: flex; gap: 8px;
}
.dam-btn {
  padding: 7px 16px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.1);
  background: transparent;
  color: #999;
  font-size: 13px; font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all .1s;
}
.dam-btn:hover { background: rgba(255,255,255,0.05); color: #ccc; }
.dam-btn-primary {
  background: rgba(130,87,229,0.25);
  border-color: rgba(130,87,229,0.45);
  color: #c9a8ff;
}
.dam-btn-primary:hover { background: rgba(130,87,229,0.35); }
.dam-btn-skip {
  background: transparent;
  border-color: rgba(255,255,255,0.06);
  color: #666;
}
.dam-btn-skip:hover { color: #999; border-color: rgba(255,255,255,0.12); }
.dam-progress {
  font-size: 12px; color: #666; font-variant-numeric: tabular-nums;
}

/* ── Toast ── */
.dam-toast {
  position: fixed;
  bottom: 88px; left: 50%;
  transform: translateX(-50%);
  padding: 10px 22px;
  background: #3a3a3a;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  font-size: 13px; color: #d4d4d4;
  z-index: 100000;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  animation: damToastIn .25s cubic-bezier(.16,1,.3,1);
}
@keyframes damToastIn {
  from { opacity: 0; transform: translateX(-50%) translateY(8px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}

/* ── Settings Modal ── */
.dam-settings-label {
  display: block; font-size: 12px; color: #888;
  margin-bottom: 5px; margin-top: 14px;
  font-weight: 500;
}
.dam-settings-input {
  width: 100%; padding: 9px 12px;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  background: rgba(255,255,255,0.04);
  color: #ececec; font-size: 14px; font-family: inherit;
  outline: none; box-sizing: border-box;
}
.dam-settings-input:focus { border-color: rgba(130,87,229,0.5); }
.dam-settings-select {
  width: 100%; padding: 9px 12px;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  background: rgba(40,40,40,1);
  color: #ececec; font-size: 14px; font-family: inherit;
  outline: none; box-sizing: border-box;
  appearance: auto;
}
.dam-provider-row {
  display: flex; gap: 8px;
}
.dam-provider-btn {
  flex: 1; padding: 9px 12px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.03);
  color: #888; font-size: 13px; font-weight: 500;
  font-family: inherit; cursor: pointer;
  transition: all .12s; text-align: center;
}
.dam-provider-btn:hover { border-color: rgba(255,255,255,0.18); color: #bbb; }
.dam-provider-btn[data-active="true"] {
  background: rgba(130,87,229,0.18);
  border-color: rgba(130,87,229,0.45);
  color: #c9a8ff;
}
  `,document.head.appendChild(n)}function L(n,e=document){return e.querySelector(n)}function a(n,e,...t){const o=document.createElement(n);return e&&Object.entries(e).forEach(([r,i])=>o.setAttribute(r,i)),t.forEach(r=>{typeof r=="string"?o.appendChild(document.createTextNode(r)):o.appendChild(r)}),o}function T(n){document.querySelectorAll(n).forEach(e=>e.remove())}function J(){if(L(".dam-toggle"))return;const n=N();if(!n)return;const e=n.findSendButton();if(!e){console.log("[DAM AI] No send button found, cannot mount toggle");return}const t=e.parentElement;if(!t)return;const o=a("div",{style:"display:inline-flex;align-items:center;gap:3px;margin-right:6px"}),r=a("button",{class:"dam-toggle","data-active":String(A),"aria-label":"DAM AI",title:"DAM AI — improve prompts before sending"});r.innerHTML='<span class="dam-toggle-dot"></span>DAM AI',r.addEventListener("click",async()=>{A=!A,await U(A),r.setAttribute("data-active",String(A))});const i=a("button",{class:"dam-toggle-settings","aria-label":"DAM AI Settings",title:"DAM AI Settings"});i.textContent="⚙",i.addEventListener("click",G),o.appendChild(r),o.appendChild(i),t.insertBefore(o,e),console.log("[DAM AI] Toggle mounted next to send button")}async function G(){T(".dam-backdrop"),T(".dam-modal");const n=a("div",{class:"dam-backdrop"});n.addEventListener("click",f),document.body.appendChild(n);const e=a("div",{class:"dam-modal"});e.style.width="420px";const t=a("div",{class:"dam-modal-header"});t.appendChild(a("span",{class:"dam-modal-title"},"Settings"));const o=a("button",{class:"dam-modal-close"},"×");o.addEventListener("click",f),t.appendChild(o),e.appendChild(t);const r=a("div",{class:"dam-modal-body"});r.appendChild(a("label",{class:"dam-settings-label"},"Provider"));const i=a("div",{class:"dam-provider-row"});let d="groq";const c=a("button",{class:"dam-provider-btn","data-active":"true"},"Groq (Free)"),p=a("button",{class:"dam-provider-btn"},"Gemini");c.addEventListener("click",()=>{d="groq",c.setAttribute("data-active","true"),p.setAttribute("data-active","false"),g()}),p.addEventListener("click",()=>{d="gemini",p.setAttribute("data-active","true"),c.setAttribute("data-active","false"),g()}),i.appendChild(c),i.appendChild(p),r.appendChild(i),r.appendChild(a("label",{class:"dam-settings-label"},"API Key"));const u=a("input",{class:"dam-settings-input",type:"password",placeholder:"gsk_... or AIza..."});r.appendChild(u),r.appendChild(a("label",{class:"dam-settings-label"},"Model"));const s=a("select",{class:"dam-settings-select"});r.appendChild(s);const b=[{value:"openai/gpt-oss-20b",label:"GPT-OSS 20B (Fast)"},{value:"qwen/qwen3.6-27b",label:"Qwen 3.6 27B"},{value:"qwen/qwen3.8-27b",label:"Qwen 3.8 27B"},{value:"openai/gpt-oss-120b",label:"GPT-OSS 120B (Best)"}],m=[{value:"gemini-3.6-flash",label:"Gemini 3.6 Flash"},{value:"gemini-3.5-flash",label:"Gemini 3.5 Flash"}];function g(){s.innerHTML="",(d==="groq"?b:m).forEach(j=>{s.appendChild(a("option",{value:j.value},j.label))})}const[v,y,C]=await Promise.all([F(),z(),R()]);d=v,c.setAttribute("data-active",String(d==="groq")),p.setAttribute("data-active",String(d==="gemini")),u.value=y,g(),C&&s.querySelector(`option[value="${C}"]`)&&(s.value=C),e.appendChild(r);const P=a("div",{class:"dam-modal-footer"}),l=a("div",{class:"dam-modal-footer-left"}),h=a("div",{class:"dam-modal-footer-right"}),D=a("button",{class:"dam-btn"},"Cancel");D.addEventListener("click",f);const E=a("button",{class:"dam-btn dam-btn-primary"},"Save");E.addEventListener("click",async()=>{E.textContent="Saving...",await _(d),await Q(u.value.trim()),await W(s.value),E.textContent="Saved!",setTimeout(f,600)}),l.appendChild(D),h.appendChild(E),P.appendChild(l),P.appendChild(h),e.appendChild(P),document.body.appendChild(e)}function f(){T(".dam-backdrop"),T(".dam-modal")}function O(n){const e=a("div",{class:"dam-toast"},n);document.body.appendChild(e),setTimeout(()=>e.remove(),3500)}function H(n,e,t){T(".dam-backdrop"),T(".dam-modal");const o=a("div",{class:"dam-backdrop"});document.body.appendChild(o);const r=a("div",{class:"dam-modal"}),i=a("div",{class:"dam-modal-header"}),d=a("span",{class:"dam-modal-title"});d.appendChild(a("span",{class:"dam-modal-title-icon"},"✨")),d.appendChild(document.createTextNode("DAM AI")),i.appendChild(d);const c=a("button",{class:"dam-modal-close"},"×");c.addEventListener("click",()=>{f(),x=!1}),i.appendChild(c),r.appendChild(i);const p=a("div",{class:"dam-modal-body"}),u=a("div",{class:"dam-loading"});if(u.appendChild(a("div",{class:"dam-spinner"})),u.appendChild(a("div",{class:"dam-loading-title"},n)),u.appendChild(a("div",{class:"dam-loading-sub"},e)),t&&t.length>0){const s=a("div",{class:"dam-loading-steps"});t.forEach((b,m)=>{const g=a("div",{class:"dam-loading-step","data-done":String(m<0)});g.appendChild(a("span",{class:"dam-loading-step-dot"})),g.appendChild(document.createTextNode(b)),s.appendChild(g)}),u.appendChild(s)}return p.appendChild(u),r.appendChild(p),document.body.appendChild(r),r}function I(n,e){if(e.title){const t=L(".dam-loading-title",n);t&&(t.textContent=e.title)}if(e.sub){const t=L(".dam-loading-sub",n);t&&(t.textContent=e.sub)}e.stepDone!==void 0&&n.querySelectorAll(".dam-loading-step").forEach((o,r)=>{r<=e.stepDone&&o.setAttribute("data-done","true")})}function Z(n,e,t,o){return new Promise(r=>{f();const i=a("div",{class:"dam-backdrop"});i.addEventListener("click",()=>{f(),x=!1,r({questionId:n.id,question:n.question,selected:[],skipped:!0})}),document.body.appendChild(i);const d=a("div",{class:"dam-modal"}),c=a("div",{class:"dam-modal-header"}),p=a("span",{class:"dam-modal-title"});p.appendChild(a("span",{class:"dam-modal-title-icon"},"✨")),p.appendChild(document.createTextNode("DAM AI")),c.appendChild(p),c.appendChild(a("span",{class:"dam-progress"},`${e+1} of ${t}`));const u=a("button",{class:"dam-modal-close"},"×");u.addEventListener("click",()=>{f(),x=!1,r({questionId:n.id,question:n.question,selected:[],skipped:!0})}),c.appendChild(u),d.appendChild(c);const s=a("div",{class:"dam-modal-body"});s.appendChild(a("div",{class:"dam-question-text"},n.question));const b=new Set;let m=!1;function g(l){f(),x=!1,r({questionId:n.id,question:n.question,selected:Array.from(b),otherText:l??null,skipped:!1})}function v(){if(s.querySelectorAll(".dam-option, .dam-other-input").forEach(l=>l.remove()),n.type!=="text"&&n.options&&n.options.forEach(l=>{const h=b.has(l.label)||l.id==="other"&&m,D=a("button",{class:"dam-option","data-selected":String(h)},l.label);D.addEventListener("click",()=>{if(l.id==="other"){m=!0,v(),setTimeout(()=>{const E=s.querySelector(".dam-other-input");E==null||E.focus()},30);return}n.type==="single"?(b.clear(),b.add(l.label),setTimeout(()=>g(),120)):(b.has(l.label)?b.delete(l.label):b.add(l.label),v())}),s.appendChild(D)}),n.type==="text"){const l=a("input",{class:"dam-other-input",placeholder:"Type your answer…"});l.addEventListener("keydown",h=>{h.key==="Enter"&&(h.preventDefault(),g(l.value.trim()||null))}),s.appendChild(l),setTimeout(()=>l.focus(),30)}if(m&&n.type!=="text"){const l=a("input",{class:"dam-other-input",placeholder:"Type your answer…"});l.addEventListener("keydown",h=>{h.key==="Enter"&&(h.preventDefault(),g(l.value.trim()||null))}),s.appendChild(l),setTimeout(()=>l.focus(),30)}}v(),d.appendChild(s);const y=a("div",{class:"dam-modal-footer"}),C=a("div",{class:"dam-modal-footer-left"}),P=a("div",{class:"dam-modal-footer-right"});if(o){const l=a("button",{class:"dam-btn"},"Back");l.addEventListener("click",()=>{o(),r({questionId:n.id,question:n.question,selected:[],skipped:!0})}),C.appendChild(l)}if(n.skippable){const l=a("button",{class:"dam-btn dam-btn-skip"},"Skip");l.addEventListener("click",()=>{f(),x=!1,r({questionId:n.id,question:n.question,selected:[],skipped:!0})}),C.appendChild(l)}if(n.type==="multi"||n.type==="text"){const l=a("button",{class:"dam-btn dam-btn-primary"},"Submit");l.addEventListener("click",()=>{const h=s.querySelector(".dam-other-input");g(m&&(h!=null&&h.value.trim())?h.value.trim():null)}),P.appendChild(l)}y.appendChild(C),y.appendChild(P),d.appendChild(y),document.body.appendChild(d)})}async function B(n){if(x)return;x=!0;const[e,t]=await Promise.all([z(),F()]);if(!e){f();const i=a("div",{class:"dam-backdrop"});i.addEventListener("click",f),document.body.appendChild(i);const d=a("div",{class:"dam-modal"});d.style.width="380px";const c=a("div",{class:"dam-modal-header"}),p=a("span",{class:"dam-modal-title"});p.appendChild(a("span",{class:"dam-modal-title-icon"},"✨")),p.appendChild(document.createTextNode("DAM AI")),c.appendChild(p);const u=a("button",{class:"dam-modal-close"},"×");u.addEventListener("click",f),c.appendChild(u),d.appendChild(c);const s=a("div",{class:"dam-modal-body"});s.style.textAlign="center",s.style.padding="32px 24px",s.appendChild(a("div",{class:"dam-loading-title"},"No API key configured")),s.appendChild(a("div",{class:"dam-loading-sub"},`Set your ${t==="groq"?"Groq":"Gemini"} API key in Settings to use DAM AI.`)),d.appendChild(s);const b=a("div",{class:"dam-modal-footer"}),m=a("div",{class:"dam-modal-footer-left"}),g=a("div",{class:"dam-modal-footer-right"}),v=a("button",{class:"dam-btn"},"Cancel");v.addEventListener("click",f);const y=a("button",{class:"dam-btn dam-btn-primary"},"Open Settings");y.addEventListener("click",()=>{f(),G()}),m.appendChild(v),g.appendChild(y),b.appendChild(m),b.appendChild(g),d.appendChild(b),document.body.appendChild(d),x=!1;return}const o=await R(),r=H("Understanding your request","Analyzing your prompt to find what needs clarification",["Reading your prompt","Identifying ambiguities","Generating questions"]);try{await new Promise(m=>setTimeout(m,300)),I(r,{stepDone:0});const i=await chrome.runtime.sendMessage({type:"clarify",provider:t,apiKey:e,model:o,prompt:n.readPrompt().trim()});if(I(r,{stepDone:2}),i.error)throw new Error(i.error);const d=i.questions||[];if(d.length===0){I(r,{title:"No clarifications needed",sub:"Your prompt is already clear. Building the enhanced version…"}),await new Promise(g=>setTimeout(g,400));const m=await chrome.runtime.sendMessage({type:"enhance",provider:t,apiKey:e,model:o,originalPrompt:n.readPrompt().trim(),answers:[]});if(f(),m.error)throw new Error(m.error);n.writePrompt(m.enhancedPrompt),n.focusComposer(),x=!1,O("DAM AI enhanced your prompt. Review it, then send.");return}await new Promise(m=>setTimeout(m,200)),f();const c=[];let p=0;for(;p<d.length;){let m=!1;const g=await Z(d[p],p,d.length,p>0?()=>{m=!0}:void 0);m?p--:(c[p]=g,p++)}x=!0;const u=H("Building your prompt","Combining your answers into a detailed, structured prompt",["Processing your answers","Structuring the enhanced prompt","Finalizing output"]);await new Promise(m=>setTimeout(m,200)),I(u,{stepDone:0}),console.log("[DAM AI] Enhancing with answers:",c);const s=await chrome.runtime.sendMessage({type:"enhance",provider:t,apiKey:e,model:o,originalPrompt:n.readPrompt().trim(),answers:c.filter(Boolean)});if(console.log("[DAM AI] Enhance response:",s),I(u,{stepDone:2}),await new Promise(m=>setTimeout(m,300)),f(),!s||s.error)throw new Error((s==null?void 0:s.error)||"No response from enhance");const b=s.enhancedPrompt;if(!b)throw new Error("Enhanced prompt was empty");console.log("[DAM AI] Writing prompt, length:",b.length),n.writePrompt(b),n.focusComposer(),x=!1,O("DAM AI enhanced your prompt. Review it, then send.")}catch(i){f(),x=!1;const d=a("div",{class:"dam-backdrop"});d.addEventListener("click",f),document.body.appendChild(d);const c=a("div",{class:"dam-modal"});c.style.width="380px";const p=a("div",{class:"dam-modal-header"}),u=a("span",{class:"dam-modal-title"});u.appendChild(a("span",{class:"dam-modal-title-icon"},"✨")),u.appendChild(document.createTextNode("DAM AI")),p.appendChild(u);const s=a("button",{class:"dam-modal-close"},"×");s.addEventListener("click",f),p.appendChild(s),c.appendChild(p);const b=a("div",{class:"dam-modal-body"});b.style.textAlign="center",b.style.padding="32px 24px",b.appendChild(a("div",{class:"dam-loading-title"},"Something went wrong")),b.appendChild(a("div",{class:"dam-loading-sub"},i instanceof Error?i.message:"Unknown error")),c.appendChild(b);const m=a("div",{class:"dam-modal-footer"}),g=a("div",{class:"dam-modal-footer-left"}),v=a("div",{class:"dam-modal-footer-right"}),y=a("button",{class:"dam-btn"},"Use original prompt");y.addEventListener("click",f);const C=a("button",{class:"dam-btn dam-btn-primary"},"Try again");C.addEventListener("click",()=>{f(),B(n)}),g.appendChild(y),v.appendChild(C),m.appendChild(g),m.appendChild(v),c.appendChild(m),document.body.appendChild(c)}}async function V(){X(),await S();const n=N();if(!n)return;console.log("[DAM AI] Content script loaded on",location.hostname),A=await K();function e(){n&&(L(".dam-toggle")||J())}e();let t;new MutationObserver(()=>{clearTimeout(t),t=setTimeout(e,300)}).observe(document.body,{childList:!0,subtree:!0}),document.addEventListener("keydown",o=>{!A||x||o.key!=="Enter"||o.shiftKey||o.isComposing||!(n!=null&&n.isComposer(o.target))||!n.readPrompt().trim()||(o.preventDefault(),o.stopPropagation(),o.stopImmediatePropagation(),console.log("[DAM AI] Enter intercepted"),B(n))},!0),document.addEventListener("click",o=>{!A||x||!(n!=null&&n.isSendButton(o.target))||!n.readPrompt().trim()||(o.preventDefault(),o.stopPropagation(),o.stopImmediatePropagation(),console.log("[DAM AI] Send intercepted"),B(n))},!0),console.log("[DAM AI] Interception initialized")}V()})();
