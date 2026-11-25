import {BUSINESS,CATEGORIES,PRODUCTS,findProduct,getOption,normaliseCart,totals,validPhone,buildOrder,whatsappURL} from './domain.js';
import {COPY} from './i18n.js';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}};
const save=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));}catch{}};
let lang=read('raian-language','kk');if(!COPY[lang])lang='kk';
let cart=normaliseCart(read('raian-cart',[])),mode=read('raian-mode','delivery');if(!['delivery','pickup','dinein'].includes(mode))mode='delivery';
let category='all',query='',productQty=1,openedProduct=null,toastTimeout,orderMessage='',orderId='';
let draft={name:'',phone:'',address:'',apartment:'',comment:'',date:'',time:'',guests:'2',table:'',consent:false};
const t=key=>COPY[lang][key]??key;
const money=value=>new Intl.NumberFormat('ru-RU').format(value)+' ₸';
const icons={
 pin:'<path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
 search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/>',
 phone:'<path d="m8 3 3 5-3 3c2 3 3 4 5 5l3-3 5 3-1 4c-8 3-19-8-16-16Z"/>',
 bag:'<path d="M5 7h14l2 14H3L5 7Z"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/>',
 table:'<rect x="5" y="6" width="14" height="12" rx="2"/><path d="M8 3h2m4 0h2M8 21h2m4 0h2M2 9v6m20-6v6"/>',
 scooter:'<path d="M3 15h12l3-8h3m-7 0h4l-2-4h-3M5 8h6M3 11h7"/><circle cx="6" cy="18" r="3"/><circle cx="19" cy="18" r="3"/>',
 star:'<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z"/>',
 question:'<circle cx="12" cy="12" r="9"/><path d="M9.5 8.5a2.7 2.7 0 0 1 5 1c0 2-2.5 2-2.5 4M12 17h.01"/>',
 spark:'<path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5Z"/>',
 utensils:'<path d="M5 3v6a3 3 0 0 0 6 0V3M8 3v18m11 0V3c-4 2-4 9 0 9"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
 chat:'<path d="M21 11.5a9 9 0 0 1-9 9 10 10 0 0 1-4-.9L3 21l1.4-5a9 9 0 1 1 16.6-4.5Z"/><path d="M8 8c0 5 3 7 7 8l2-2-3-2-1 1c-1-1-2-1-2-3l1-1-2-3Z"/>',
 receipt:'<path d="M6 3 8 4l2-1 2 1 2-1 2 1 2-1v18l-2-1-2 1-2-1-2 1-2-1-2 1V3Z"/><path d="M9 8h6M9 12h6M9 16h3"/>',
 info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',
 all:'<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
 doner:'<path d="m5 9 4 12h6l4-12M5 9C3 2 21 2 19 9M8 7h8M8 13h8M10 17h4"/>',
 shaurma:'<path d="m6 8 3 13h6l3-13M6 8l3-5 3 2 3-2 3 5M9 8l7 9M8 13l6 8"/>',
 burger:'<path d="M4 10a8 7 0 0 1 16 0ZM3 14h18M4 17h16l-1 4H5ZM9 6h.01M14 5h.01M16 7h.01"/>',
 pizza:'<path d="m12 3 9 17a21 21 0 0 1-18 0ZM5 17a16 16 0 0 0 14 0"/><circle cx="12" cy="10" r="1"/><circle cx="10" cy="14" r="1"/><path d="M15 14h.01"/>',
 chicken:'<path d="M14 3c6-2 10 6 5 10-2 2-4 2-6 1l-5 5c0 3-3 4-4 1-3-1-2-4 1-4l5-5c-1-3 1-7 4-8Z"/>',
 fries:'<path d="m4 10 3 11h10l3-11ZM6 10V3h3v7m3 0V2h3v8m2 0V5h3v5"/>',
 qr:'<rect x="3" y="3" width="6" height="6" rx="1"/><rect x="15" y="3" width="6" height="6" rx="1"/><rect x="3" y="15" width="6" height="6" rx="1"/><path d="M15 15h3v3h3v3h-6v-3M3 3l18 18"/>',
 check:'<path d="m5 12 4 4L19 6"/>'
};
const icon=name=>`<svg viewBox="0 0 24 24" aria-hidden="true">${icons[name]||icons.bag}</svg>`;
function hydrateIcons(root=document){root.querySelectorAll('[data-icon]').forEach(el=>el.innerHTML=icon(el.dataset.icon));}
function modeButtons(){return ['delivery','pickup','dinein'].map(value=>`<button type="button" class="mode-button ${value===mode?'active':''}" data-mode="${value}" aria-pressed="${value===mode}">${icon(value==='delivery'?'scooter':value==='pickup'?'bag':'table')}<span>${t(value)}</span></button>`).join('');}
function renderCategories(){
 const html=['all',...CATEGORIES].map(id=>`<button type="button" class="category-button ${category===id?'active':''}" data-category="${id}" aria-pressed="${category===id}">${icon(id)}<span>${t(id)}</span></button>`).join('');
 $('#category-nav').innerHTML=html;$('#mobile-categories').innerHTML=html;
}
function renderProducts(){
 const featured=['doner','cheeseburger','pepperoni','shaurma','chicken','fries'];
 const ordered=[...featured.map(findProduct),...PRODUCTS.filter(p=>!featured.includes(p.id))];
 const filtered=ordered.filter(p=>(category==='all'||category===p.category)&&(!query||Object.values(p.name).some(n=>n.toLocaleLowerCase().includes(query))||t(p.category).toLocaleLowerCase().includes(query)));
 $('#menu-title').textContent=query?t('searchResults'):category==='all'?t('allTitle'):t(category);
 $('#result-count').textContent=`${filtered.length} ${t('positions')}`;
 $('#product-grid').innerHTML=filtered.length?filtered.map(p=>`<article class="product-card" data-testid="product-${p.id}"><button class="product-photo-button" type="button" data-product="${p.id}" aria-label="${esc(p.name[lang])} — ${t('choose')}"><img class="product-photo" src="./assets/${p.image}.webp" alt="${esc(p.name[lang])}" width="720" height="576" loading="lazy">${p.options?`<span class="product-tag">${p.options.length} ${lang==='kk'?'нұсқа':'вариантов'}</span>`:''}</button><div class="product-details"><h3>${esc(p.name[lang])}</h3><p>${esc(p.desc[lang])}</p><div class="product-bottom"><span class="price">${p.options?`<small>${t('from')}</small>`:''}${money(p.options?Math.min(...p.options.map(o=>o.price)):p.price)}</span><button class="add-button" type="button" data-add="${p.id}" aria-label="${esc(p.name[lang])} — ${t('add')}">${icon('plus')}</button></div></div></article>`).join(''):`<div class="no-results"><h3>${t('nothing')}</h3><p>${t('tryAgain')}</p><button class="button secondary" type="button" data-action="reset">${t('reset')}</button></div>`;
}
function renderCartBody(isMobile=false){
 const count=cart.reduce((s,i)=>s+i.qty,0),amount=totals(cart,mode);
 return `<h2 class="cart-heading" ${isMobile?'id="mobile-cart-title"':''}>${icon('bag')}${t('yourCart')}<span class="count-pill">${count}</span></h2>${count?`<div class="cart-mode">${icon(mode==='delivery'?'scooter':mode==='dinein'?'table':'bag')}${t(mode)}<button class="cart-clear" data-action="clear" type="button">${t('clear')}</button></div><div class="cart-items">${cart.map(item=>{const p=findProduct(item.id),o=getOption(p,item.optionId);return `<div class="cart-item"><img class="cart-thumb" src="./assets/${p.image}.webp" alt="" width="40" height="40"><div><h4>${esc(p.name[lang])}</h4>${o[lang]?`<small>${esc(o[lang])}</small>`:''}<div class="cart-item-bottom"><div class="quantity"><button type="button" data-qty="-1" data-id="${p.id}" data-option="${o.id}" aria-label="${t('remove')}: ${esc(p.name[lang])}">−</button><span>${item.qty}</span><button type="button" data-qty="1" data-id="${p.id}" data-option="${o.id}" aria-label="${t('increase')}: ${esc(p.name[lang])}" ${item.qty>=99?'disabled':''}>+</button></div><strong class="cart-item-price">${money(item.qty*o.price)}</strong></div></div></div>`;}).join('')}</div><div class="cart-summary">${totalHTML(amount)}<button class="button primary" type="button" data-action="checkout">${t('checkout')}</button><p class="cart-small">${t('cartSmall')}</p></div>`:`<div class="empty-cart"><div class="empty-illustration">${icon('bag')}</div><h3>${t('emptyTitle')}</h3><p>${t('emptyDesc')}</p></div>`}<div class="cart-status">${icon('chat')}<span>${t('cartStatus')}</span></div>`;
}
function totalHTML(amount){return `<div class="summary-line"><span>${t('subtotal')}</span><span>${money(amount.subtotal)}</span></div><div class="summary-line"><span>${t('delivery')}</span><span>${money(amount.delivery)}</span></div><div class="summary-line total"><span>${t('total')}</span><span data-testid="order-total">${money(amount.total)}</span></div>`;}
function renderCart(){
 $('#cart-content').innerHTML=renderCartBody();$('#mobile-cart-content').innerHTML=renderCartBody(true);
 const count=cart.reduce((s,i)=>s+i.qty,0);$('#header-count').textContent=count;$('#mobile-cart-count').textContent=count;$('#mobile-cart-total').textContent=money(totals(cart,mode).total);
 save('raian-cart',cart);save('raian-mode',mode);
}
function toast(message){clearTimeout(toastTimeout);$('#toast').textContent=message;$('#toast').classList.add('visible');toastTimeout=setTimeout(()=>$('#toast').classList.remove('visible'),2500);}
function addToCart(id,optionId,qty=1){const p=findProduct(id),o=getOption(p,optionId);if(!p||!o)return;const existing=cart.find(item=>item.id===id&&item.optionId===o.id);if(existing)existing.qty=Math.min(99,existing.qty+qty);else cart.push({id,optionId:o.id,qty});renderCart();toast(t('added'));}
function openProduct(id){
 const p=findProduct(id);if(!p)return;openedProduct=p;productQty=1;
 $('#product-dialog-content').innerHTML=`<img class="product-modal-image" src="./assets/${p.image}.webp" alt="${esc(p.name[lang])}" width="720" height="400"><div class="modal-body"><h2 id="product-dialog-title">${esc(p.name[lang])}</h2><p>${esc(p.desc[lang])}</p>${p.options?`<fieldset class="product-options"><legend>${t('optionTitle')}</legend>${p.options.map((o,i)=>`<label class="option-choice"><input type="radio" name="product-option" value="${o.id}" ${i===0?'checked':''}><span>${esc(o[lang])}</span><strong>${money(o.price)}</strong></label>`).join('')}</fieldset>`:''}<div class="product-modal-bottom"><div class="quantity"><button type="button" data-product-qty="-1" aria-label="${t('remove')}">−</button><span id="product-quantity">1</span><button type="button" data-product-qty="1" aria-label="${t('increase')}">+</button></div><button class="button primary" id="product-confirm" type="button" data-action="confirm-product">${t('add')} · <span id="product-price">${money(p.options?p.options[0].price:p.price)}</span></button></div><p class="modal-note">${t('photoModal')}</p></div>`;
 if(!$('#product-dialog').open)$('#product-dialog').showModal();
}
function updateProductPrice(){if(!openedProduct)return;const option=getOption(openedProduct,$('input[name="product-option"]:checked')?.value);$('#product-price').textContent=money(option.price*productQty);$('#product-quantity').textContent=productQty;}
function today(){const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Qyzylorda',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());return ['year','month','day'].map(key=>parts.find(p=>p.type===key).value).join('-');}
function collectDraft(){const form=$('#order-form');if(!form)return;const values=new FormData(form);for(const key of ['name','phone','address','apartment','comment','date','time','guests']){if(values.has(key))draft[key]=String(values.get(key));}draft.consent=values.has('consent');}
function field(name,label,placeholder='',type='text',full=false,attributes=''){return `<label class="field ${full?'full':''}"><span>${t(label)}</span><input name="${name}" id="field-${name}" type="${type}" value="${esc(draft[name])}" placeholder="${esc(placeholder)}" ${attributes}></label>`;}
function renderCheckout(){
 const minimum=today();
 $('#checkout-content').innerHTML=`<div class="checkout-body"><div class="checkout-progress"><span class="current">${t('detailsStep')}</span><span class="divider"></span><span>${t('paymentStep')}</span></div><h2 id="checkout-title">${t('checkoutTitle')}</h2><p class="checkout-description">${t('checkoutDesc')}</p><div class="order-modes" role="group" aria-label="${t('choose')}">${modeButtons()}</div><form id="order-form" novalidate><div class="field-grid">${field('name','nameLabel',t('namePlaceholder'),'text',false,'autocomplete="name" maxlength="100" required')}${field('phone','phoneLabel','+7 (___) ___ __ __','tel',false,'autocomplete="tel" inputmode="tel" maxlength="24" required')}</div>${mode==='delivery'?`<div class="form-section"><div class="field-grid">${field('address','addressLabel',t('addressPlaceholder'),'text',true,'autocomplete="street-address" maxlength="250" required')}${field('apartment','apartmentLabel',t('apartmentPlaceholder'),'text',true,'maxlength="120"')}</div><p class="modal-note">${t('deliveryInfo')}</p></div>`:mode==='pickup'?`<div class="pickup-location">${icon('pin')}<div><strong>${t('pickupInfo')}</strong><p>${t('fullAddress')}</p><a href="${BUSINESS.map}" target="_blank" rel="noopener noreferrer">${t('open2gis')}</a><p>${t('pickupTime')}</p></div></div>`:`<div class="form-section"><h3>${t('tableTitle')}</h3><p class="modal-note">${t('tableDesc')}</p><div class="table-grid" role="group" aria-label="${t('tableTitle')}">${Array.from({length:BUSINESS.tables},(_,i)=>i+1).map(n=>`<button class="table-choice" type="button" data-table="${n}" aria-pressed="${+draft.table===n}" aria-label="${t('table')} ${n}, ${t('fourSeats')}"><span class="table-drawing">${n}</span><strong>${t('table')} ${n}</strong><small>${+draft.table===n?t('selected'):t('fourSeats')}</small></button>`).join('')}</div><p class="table-notice">${t('tableNotice')}</p><div class="field-grid">${field('date','dateLabel','','date',false,`min="${minimum}" required`)}${field('time','timeLabel','','time',false,'min="10:00" max="22:59" required')}<label class="field full"><span>${t('guestsLabel')}</span><select name="guests" id="field-guests">${[1,2,3,4].map(n=>`<option value="${n}" ${+draft.guests===n?'selected':''}>${n} ${t('person')}</option>`).join('')}</select></label></div></div>`}<div class="form-section"><label class="field"><span>${t('commentLabel')}</span><textarea name="comment" placeholder="${t('commentPlaceholder')}" maxlength="500">${esc(draft.comment)}</textarea></label></div><div class="checkout-totals">${totalHTML(totals(cart,mode))}</div><label class="consent"><input type="checkbox" name="consent" ${draft.consent?'checked':''} required><span>${t('consent')}</span></label><div class="form-error" id="form-error" role="alert" hidden></div><div class="checkout-bottom"><button class="text-button" type="button" data-close="checkout-dialog">${t('cancel')}</button><button class="button primary" type="submit">${t('next')}</button></div></form></div>`;
}
function checkout(){if(!cart.length)return;$('#cart-dialog').close();renderCheckout();$('#checkout-dialog').showModal();}
function showError(key,fieldName){$('#form-error').textContent=t(key);$('#form-error').hidden=false;if(fieldName)$('#order-form').elements.namedItem(fieldName)?.focus();}
function submitOrder(event){
 event.preventDefault();collectDraft();
 if(!draft.name.trim())return showError('invalidName','name');
 if(!validPhone(draft.phone))return showError('invalidPhone','phone');
 if(mode==='delivery'&&!draft.address.trim())return showError('invalidAddress','address');
 if(mode==='dinein'){
   if(!draft.table)return showError('selectTable');
   const visit=new Date(`${draft.date}T${draft.time}:00+05:00`);
   if(!draft.date||!draft.time||!/^\d{2}:\d{2}$/.test(draft.time)||draft.time<'10:00'||draft.time>='23:00'||Number.isNaN(visit.valueOf())||visit<=new Date())return showError('invalidTime','time');
 }
 if(!draft.consent)return showError('consentError','consent');
 const random=new Uint32Array(1);crypto.getRandomValues(random);orderId=`RF-${today().replaceAll('-','')}-${random[0].toString(36).slice(-5).toUpperCase()}`;
 orderMessage=buildOrder(cart,mode,draft,lang,orderId);renderPayment();
}
function renderPayment(){
 $('#checkout-content').innerHTML=`<div class="checkout-body"><div class="checkout-progress"><span>${t('detailsStep')}</span><span class="divider"></span><span class="current">${t('paymentStep')}</span></div><h2 id="checkout-title">${t('paymentTitle')}</h2><p class="checkout-description">${t('paymentIntro')}</p><div class="payment-hero"><span class="qr-unavailable" role="img" aria-label="${t('qrLabel')}">${icon('qr')}</span><h3>${t('paymentHero')}</h3><p>${t('kaspiInstruction')}</p></div><div class="payment-steps">${[1,2,3].map((n)=>`<div class="payment-step"><span>${icon(n===1?'chat':n===2?'phone':'receipt')}</span><div><strong>${t(`payment${n}Title`)}</strong><p>${t(`payment${n}`)}</p></div></div>`).join('')}</div><div class="payment-status">${t('paymentStatus')}</div><div class="checkout-totals">${totalHTML(totals(cart,mode))}</div><details class="preview-details"><summary>${t('preview')} · ${orderId}</summary><pre class="order-preview" id="order-preview">${esc(orderMessage)}</pre></details><a class="button whatsapp-button" id="whatsapp-order" href="${esc(whatsappURL(orderMessage))}" target="_blank" rel="noopener noreferrer">${icon('chat')}${t('sendWhatsapp')}</a><button class="button secondary copy-button" type="button" data-action="copy">${t('copy')}</button><p class="modal-note">${t('whatsappNote')}</p><button class="text-button" type="button" data-action="edit-order">${t('editOrder')}</button></div>`;
 $('#checkout-dialog').scrollTop=0;
}
function setMode(value){if(!['delivery','pickup','dinein'].includes(value))return;collectDraft();mode=value;$('#order-modes').innerHTML=modeButtons();renderCart();if($('#order-form'))renderCheckout();}
function renderLanguage(){
 document.documentElement.lang=lang;document.title=lang==='kk'?'Raian Food — Дәмді тағам, жақсы көңіл-күй':'Raian Food — Вкусная еда, отличное настроение';
 $$('[data-i18n]').forEach(el=>el.textContent=t(el.dataset.i18n));$$('[data-i18n-html]').forEach(el=>el.innerHTML=t(el.dataset.i18nHtml));
 $$('[data-lang]').forEach(el=>el.setAttribute('aria-pressed',el.dataset.lang===lang));
 $('#search').placeholder=t('search');$('#search').setAttribute('aria-label',t('searchLabel'));$('.header-cart').setAttribute('aria-label',t('yourCart'));$('.sidebar').setAttribute('aria-label',t('ourMenu'));$('#desktop-cart').setAttribute('aria-label',t('yourCart'));$('#order-modes').setAttribute('aria-label',t('choose'));
 renderCategories();renderProducts();renderCart();$('#order-modes').innerHTML=modeButtons();
 $('#faq-list').innerHTML=t('faq').map(([q,a])=>`<details><summary>${q}</summary><p>${a}</p></details>`).join('');
 hydrateIcons();save('raian-language',lang);
}
document.addEventListener('click',async event=>{
 const el=event.target.closest('button,a');if(!el)return;
 if(el.dataset.close){$('#'+el.dataset.close).close();return;}
 if(el.dataset.lang){collectDraft();lang=el.dataset.lang;renderLanguage();if($('#order-form'))renderCheckout();else if($('#whatsapp-order')){orderMessage=buildOrder(cart,mode,draft,lang,orderId);renderPayment();}if($('#product-dialog').open)openProduct(openedProduct.id);return;}
 if(el.dataset.category){category=el.dataset.category;query='';$('#search').value='';renderCategories();renderProducts();$('#menu').scrollIntoView({block:'start'});return;}
 if(el.dataset.mode){setMode(el.dataset.mode);return;}
 if(el.dataset.add){const p=findProduct(el.dataset.add);if(p.options)openProduct(p.id);else addToCart(p.id,'standard');return;}
 if(el.dataset.product){openProduct(el.dataset.product);return;}
 if(el.dataset.qty){const item=cart.find(i=>i.id===el.dataset.id&&i.optionId===el.dataset.option);if(item){item.qty=Math.min(99,item.qty+Number(el.dataset.qty));cart=cart.filter(i=>i.qty>0);renderCart();}return;}
 if(el.dataset.productQty){productQty=Math.max(1,Math.min(99,productQty+Number(el.dataset.productQty)));updateProductPrice();return;}
 if(el.dataset.table){collectDraft();draft.table=el.dataset.table;$$('[data-table]').forEach(btn=>{btn.setAttribute('aria-pressed',btn.dataset.table===draft.table);btn.querySelector('small').textContent=btn.dataset.table===draft.table?t('selected'):t('fourSeats');});return;}
 switch(el.dataset.action){
  case 'cart':$('#mobile-cart-content').innerHTML=renderCartBody(true);$('#cart-dialog').showModal();break;
  case 'clear':cart=[];renderCart();break;
  case 'checkout':checkout();break;
  case 'reset':category='all';query='';$('#search').value='';renderCategories();renderProducts();break;
  case 'confirm-product':addToCart(openedProduct.id,$('input[name="product-option"]:checked')?.value??'standard',productQty);$('#product-dialog').close();break;
  case 'edit-order':renderCheckout();break;
  case 'copy':try{await navigator.clipboard.writeText(orderMessage);toast(t('copied'));}catch{toast(t('copyFailed'));}break;
 }
});
$('#search').addEventListener('input',event=>{query=event.target.value.trim().toLocaleLowerCase();renderProducts();});
document.addEventListener('change',event=>{if(event.target.name==='product-option')updateProductPrice();});
document.addEventListener('submit',event=>{if(event.target.id==='order-form')submitOrder(event);});
$$('dialog').forEach(dialog=>dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();}));
$('#year').textContent=new Date().getFullYear();renderLanguage();
