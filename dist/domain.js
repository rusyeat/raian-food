export const BUSINESS = Object.freeze({name:'Raian Food',phone:'77759757501',deliveryFee:500,tables:6,seatsPerTable:4,map:'https://2gis.kz/firm/70000001118456702',lat:44.138201,lon:68.473363});
export const CATEGORIES = ['doner','shaurma','burger','pizza','chicken','fries'];
export const PRODUCTS = [
  {id:'doner',category:'doner',name:{kk:'Донер',ru:'Донер'},desc:{kk:'Өзіңе ұнайтын ет пен мөлшерді таңда.',ru:'Выберите мясо и размер на свой вкус.'},image:'doner',options:[
    {id:'c1',kk:'Тауық · кәдімгі',ru:'Курица · обычный',price:1300},{id:'b1',kk:'Сиыр еті · кәдімгі',ru:'Говядина · обычный',price:1590},
    {id:'c15',kk:'Тауық · бір жарым',ru:'Курица · полтора',price:1800},{id:'b15',kk:'Сиыр еті · бір жарым',ru:'Говядина · полтора',price:1990},
    {id:'c2',kk:'Тауық · қос',ru:'Курица · двойной',price:2200},{id:'b2',kk:'Сиыр еті · қос',ru:'Говядина · двойной',price:2800}]},
  {id:'shaurma',category:'shaurma',name:{kk:'Шаурма',ru:'Шаурма'},desc:{kk:'Тауық немесе сиыр еті. Кәдімгі не қос мөлшер.',ru:'С курицей или говядиной. Обычная или двойная.'},image:'shaurma',options:[
    {id:'c1',kk:'Тауық · кәдімгі',ru:'Курица · обычная',price:1200},{id:'b1',kk:'Сиыр еті · кәдімгі',ru:'Говядина · обычная',price:1480},
    {id:'c2',kk:'Тауық · қос',ru:'Курица · двойная',price:2000},{id:'b2',kk:'Сиыр еті · қос',ru:'Говядина · двойная',price:2800}]},
  {id:'hamburger',category:'burger',name:{kk:'Гамбургер',ru:'Гамбургер'},desc:{kk:'Түскі үзіліске де, достармен кездесуге де.',ru:'Для обеда, перекуса и встречи с друзьями.'},image:'burger',price:1450},
  {id:'cheeseburger',category:'burger',name:{kk:'Чизбургер',ru:'Чизбургер'},desc:{kk:'Бургерді ұнатсаң, ірімшікті нұсқасын байқап көр.',ru:'Любимый бургер в сырном исполнении.'},image:'cheeseburger',price:1550},
  {id:'bigcheese',category:'burger',name:{kk:'Бигчизбургер',ru:'Бигчизбургер'},desc:{kk:'Қарның қатты ашқанда — үлкенірек таңда.',ru:'Когда хочется чего-то побольше.'},image:'burger',price:2600},
  {id:'margherita',category:'pizza',name:{kk:'Маргарита',ru:'Маргарита'},desc:{kk:'Пицца мәзірінің классикасы.',ru:'Классика нашего меню пиццы.'},image:'margherita',price:2350},
  {id:'cheese-pizza',category:'pizza',name:{kk:'Ірімшікті пицца',ru:'Сырная пицца'},desc:{kk:'Ірімшікті жақсы көретіндерге.',ru:'Для тех, кто любит сыр.'},image:'margherita',price:2350},
  {id:'spicy',category:'pizza',name:{kk:'Ащы пицца',ru:'Острая пицца'},desc:{kk:'Ащы дәмді ұнататындарға.',ru:'Для любителей острого вкуса.'},image:'pepperoni',price:2600},
  {id:'mushroom',category:'pizza',name:{kk:'Саңырауқұлақты пицца',ru:'Пицца с грибами'},desc:{kk:'Достармен бөлісуге жақсы себеп.',ru:'Хороший повод собраться за одним столом.'},image:'pizza',price:2650},
  {id:'pepperoni',category:'pizza',name:{kk:'Пепперони',ru:'Пепперони'},desc:{kk:'Бүгін пиццаға қалай қарайсың?',ru:'Как насчёт пиццы сегодня?'},image:'pepperoni',price:2700},
  {id:'chicken-pizza',category:'pizza',name:{kk:'Тауықты пицца',ru:'Куриная пицца'},desc:{kk:'Тауық етін ұнататындарға.',ru:'Для любителей пиццы с курицей.'},image:'pizza',price:2750},
  {id:'four-seasons',category:'pizza',name:{kk:'Төрт маусым',ru:'4 сезона'},desc:{kk:'Бір пицца, жақсы компания.',ru:'Одна пицца и хорошая компания.'},image:'pizza',price:3000},
  {id:'chicken',category:'chicken',name:{kk:'Чикен',ru:'Чикен'},desc:{kk:'Өзіңе немесе достарыңа: үш мөлшерден таңда.',ru:'Для себя или компании: три размера порции.'},image:'chicken',options:[
    {id:'half',kk:'½ порция',ru:'½ порции',price:1325},{id:'one',kk:'1 порция',ru:'1 порция',price:2650},{id:'onehalf',kk:'1½ порция',ru:'1½ порции',price:3975}]},
  {id:'fries',category:'fries',name:{kk:'Картоп фри',ru:'Картофель фри'},desc:{kk:'Негізгі тапсырысыңа қосып ал.',ru:'Добавьте к любимому заказу.'},image:'fries',price:800}
];
export function findProduct(id){return PRODUCTS.find(p=>p.id===id);}
export function getOption(product,optionId){return product?.options?.find(o=>o.id===optionId) ?? (!product?.options && product ? {id:'standard',price:product.price,kk:'',ru:''} : undefined);}
export function normaliseCart(value){
 if(!Array.isArray(value))return [];
 const result=[];
 for(const item of value){const product=findProduct(item?.id);const option=getOption(product,item?.optionId);if(!product||!option||!Number.isInteger(item.qty)||item.qty<1)continue;
 const prior=result.find(r=>r.id===product.id&&r.optionId===option.id);if(prior)prior.qty=Math.min(99,prior.qty+item.qty);else result.push({id:product.id,optionId:option.id,qty:Math.min(99,item.qty)});}
 return result;
}
export function totals(cart,mode){const subtotal=normaliseCart(cart).reduce((sum,item)=>sum+getOption(findProduct(item.id),item.optionId).price*item.qty,0);const delivery=subtotal>0&&mode==='delivery'?BUSINESS.deliveryFee:0;return {subtotal,delivery,total:subtotal+delivery};}
export function validPhone(value){return /^(7|8)\d{10}$/.test(value.replace(/\D/g,''));}
export function buildOrder(cart,mode,details,language='kk',orderId=''){
 const kk=language==='kk';const clean=normaliseCart(cart);if(!clean.length)throw new Error('EMPTY_CART');if(!['delivery','pickup','dinein'].includes(mode))throw new Error('INVALID_MODE');
 if(!details.name?.trim()||!validPhone(details.phone||''))throw new Error('INVALID_CONTACT');
 if(mode==='delivery'&&!details.address?.trim())throw new Error('ADDRESS_REQUIRED');
 if(mode==='dinein'&&(!Number.isInteger(+details.table)||+details.table<1||+details.table>BUSINESS.tables||!Number.isInteger(+details.guests)||+details.guests<1||+details.guests>4||!details.date||!details.time))throw new Error('TABLE_REQUIRED');
 const amount=totals(clean,mode);const modes=kk?{delivery:'Жеткізу',pickup:'Өзім алып кетемін',dinein:'Залда тамақтану'}:{delivery:'Доставка',pickup:'Самовывоз',dinein:'В зале'};
 return [`RAIAN FOOD${orderId?' · '+orderId:''}`,modes[mode],'',...clean.map(item=>{const p=findProduct(item.id),o=getOption(p,item.optionId);return `${p.name[language]}${o[language]?' ('+o[language]+')':''} × ${item.qty} — ${o.price*item.qty} ₸`;}),'',`${kk?'Тағамдар':'Блюда'}: ${amount.subtotal} ₸`,`${kk?'Жеткізу':'Доставка'}: ${amount.delivery} ₸`,`${kk?'Барлығы':'Итого'}: ${amount.total} ₸`,'',`${kk?'Аты-жөні':'Имя и фамилия'}: ${details.name.trim()}`,`${kk?'Телефон':'Телефон'}: ${details.phone.trim()}`,
 ...(mode==='delivery'?[`${kk?'Мекенжай':'Адрес'}: ${details.address.trim()}`,details.apartment?`${kk?'Пәтер / кіреберіс / қабат':'Квартира / подъезд / этаж'}: ${details.apartment.trim()}`:'']:[]),
 ...(mode==='dinein'?[`${kk?'Қалаған үстел':'Желаемый стол'}: №${details.table} (${details.guests} ${kk?'адам':'гостей'})`,`${kk?'Күні, уақыты':'Дата, время'}: ${details.date} ${details.time}`,kk?'Үстелдің бос екенін қызметкер растауын күтемін.':'Ожидаю подтверждения свободного стола от сотрудника.']:[]),
 ...(details.comment?.trim()?[`${kk?'Ескерту':'Комментарий'}: ${details.comment.trim()}`]:[]),'',kk?'Төлем: әлі расталмаған. Kaspi QR уақытша қолжетімсіз. Тапсырысты және төлем реквизитін нақтылап беріңіз. Төлегеннен кейін чекті осы чатқа жіберемін.':'Оплата: пока не подтверждена. Kaspi QR временно недоступен. Подтвердите заказ и реквизиты. После оплаты отправлю чек в этот чат.'].filter(Boolean).join('\n');
}
export function whatsappURL(message){return `https://wa.me/${BUSINESS.phone}?text=${encodeURIComponent(message)}`;}
