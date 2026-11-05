const products = [
  {id:'everyday-tote',name:'The Everyday Tote',category:'wear',label:'Wear',description:'Heavy cotton · Rust',price:38,art:'art-bag',background:'#e7d8c8',badge:'Studio favorite'},
  {id:'studio-tee',name:'Studio Tee',category:'wear',label:'Wear',description:'Organic cotton · Natural',price:42,art:'art-tee',background:'#e5e2d8',badge:'Small batch'},
  {id:'form-vase',name:'Form No. 02',category:'home',label:'Home',description:'Hand-finished stoneware',price:64,art:'art-vessel',background:'#e6ddd0',badge:''},
  {id:'slow-candle',name:'Slow Morning Candle',category:'home',label:'Home',description:'Soy wax · Cedar & fig',price:28,art:'art-candle',background:'#e8e2d3',badge:''},
  {id:'small-print',name:'Sunday Study Print',category:'objects',label:'Objects',description:'Archival print · 8 × 10 in',price:32,art:'art-print',background:'#d9ddd0',badge:'Limited run'},
  {id:'field-cap',name:'Field Cap',category:'wear',label:'Wear',description:'Cotton twill · Olive',price:36,art:'art-cap',background:'#e4dfd1',badge:''}
];
const money = amount => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(amount);
const grid=document.querySelector('#product-grid');
const cartDrawer=document.querySelector('.cart-drawer');
const backdrop=document.querySelector('.drawer-backdrop');
const cartItems=document.querySelector('.cart-items');
const toast=document.querySelector('.toast');
let cart=loadCart();
let toastTimer;

function loadCart(){try{return JSON.parse(localStorage.getItem('falman-cart'))||[]}catch{return []}}
function saveCart(){try{localStorage.setItem('falman-cart',JSON.stringify(cart))}catch{}}
function productArt(product,extra=''){return `<span class="art-object ${product.art} ${extra}" aria-hidden="true"></span>`}
function renderProducts(filter='all'){
  const shown=filter==='all'?products:products.filter(item=>item.category===filter);
  grid.innerHTML=shown.map(item=>`<article class="product-card"><div class="product-art" style="--art-bg:${item.background}">${item.badge?`<span class="product-badge">${item.badge}</span>`:''}${productArt(item)}<button class="quick-add" type="button" data-add="${item.id}" aria-label="Add ${item.name} to bag">Add to bag — ${money(item.price)} ＋</button></div><div class="product-info"><div><h3>${item.name}</h3><p>${item.description}</p></div><span class="product-price">${money(item.price)}</span></div></article>`).join('');
  document.querySelector('.product-total').textContent=`${String(shown.length).padStart(2,'0')} ${shown.length===1?'piece':'pieces'}`;
}
function updateCart(){
  const totalQty=cart.reduce((sum,line)=>sum+line.qty,0);
  const subtotal=cart.reduce((sum,line)=>sum+line.qty*products.find(p=>p.id===line.id).price,0);
  document.querySelectorAll('.cart-count').forEach(el=>el.textContent=totalQty);
  cartItems.innerHTML=cart.map(line=>{const p=products.find(item=>item.id===line.id);return `<div class="cart-line"><div class="cart-thumb" style="--art-bg:${p.background}">${productArt(p)}</div><div><div class="cart-product-name">${p.name}</div><div class="cart-product-meta">${p.description}</div><div class="quantity-control"><button type="button" data-qty="-1" data-id="${p.id}" aria-label="Remove one ${p.name}">−</button><span>${line.qty}</span><button type="button" data-qty="1" data-id="${p.id}" aria-label="Add one ${p.name}">＋</button><button type="button" class="remove-item" data-remove="${p.id}">Remove</button></div></div><span class="line-price">${money(p.price*line.qty)}</span></div>`}).join('');
  document.querySelector('.cart-subtotal').textContent=money(subtotal);
  const remaining=Math.max(0,100-subtotal);
  document.querySelector('.shipping-message').textContent=remaining===0?'You’ve unlocked complimentary shipping!':`You’re ${money(remaining)} away from complimentary shipping.`;
  document.querySelector('.shipping-track span').style.width=`${Math.min(100,subtotal)}%`;
  document.querySelector('.empty-cart').style.display=cart.length?'none':'flex';
  document.querySelector('.cart-summary').style.display=cart.length?'block':'none';
  const order=cart.map(line=>{const p=products.find(item=>item.id===line.id);return `${line.qty} × ${p.name} (${money(p.price*line.qty)})`}).join('%0D%0A');
  document.querySelector('.checkout-button').href=`mailto:hello@falmanstudio.com?subject=Falman%20Studio%20order&body=${encodeURIComponent(`Hello Falman Studio,\n\nI'd like to order:\n${cart.map(line=>{const p=products.find(item=>item.id===line.id);return `${line.qty} × ${p.name} (${money(p.price*line.qty)})`}).join('\n')}\n\nSubtotal: ${money(subtotal)}\n\nPlease let me know the next steps.`)}`;
  saveCart();
}
function openCart(){cartDrawer.classList.add('open');cartDrawer.setAttribute('aria-hidden','false');backdrop.hidden=false;document.body.classList.add('cart-open');document.querySelector('.close-cart').focus()}
function closeCart(){cartDrawer.classList.remove('open');cartDrawer.setAttribute('aria-hidden','true');backdrop.hidden=true;document.body.classList.remove('cart-open')}
function announce(message){toast.textContent=message;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),2200)}

document.querySelector('.filters').addEventListener('click',event=>{const button=event.target.closest('[data-filter]');if(!button)return;document.querySelectorAll('.filter-button').forEach(el=>el.classList.toggle('active',el===button));renderProducts(button.dataset.filter)});
grid.addEventListener('click',event=>{const button=event.target.closest('[data-add]');if(!button)return;const found=cart.find(line=>line.id===button.dataset.add);if(found)found.qty++;else cart.push({id:button.dataset.add,qty:1});updateCart();announce(`${products.find(item=>item.id===button.dataset.add).name} added to your bag`)});
document.querySelector('.cart-trigger').addEventListener('click',openCart);
document.querySelector('.close-cart').addEventListener('click',closeCart);
backdrop.addEventListener('click',closeCart);
document.querySelector('.close-and-shop').addEventListener('click',closeCart);
document.addEventListener('keydown',event=>{if(event.key==='Escape')closeCart()});
cartItems.addEventListener('click',event=>{const quantity=event.target.closest('[data-qty]');const remove=event.target.closest('[data-remove]');if(remove){cart=cart.filter(line=>line.id!==remove.dataset.remove)}else if(quantity){const line=cart.find(item=>item.id===quantity.dataset.id);if(line){line.qty+=Number(quantity.dataset.qty);if(line.qty<=0)cart=cart.filter(item=>item.id!==line.id)}}updateCart()});
document.querySelector('#year').textContent=new Date().getFullYear();
renderProducts();updateCart();
