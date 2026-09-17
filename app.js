// منصة توصيل العاشر من رمضان - التطبيق الرئيسي
Storage.init();

let currentUser = null;
let pickupMap = null, dropoffMap = null, trackMap = null, adminMap = null;
let pickupMarker = null, dropoffMarker = null;
let mapsInitialized = { pickup: false, dropoff: false, track: false, admin: false };

// ========== تهيئة ==========
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    document.getElementById('splash').classList.add('hide');
    document.getElementById('app').classList.remove('hidden');
    const saved = sessionStorage.getItem('delivery_session');
    if (saved) {
      currentUser = JSON.parse(saved);
      showScreenForRole(currentUser.role);
    }
  }, 1800);

  setupAuth();
  setupNavigation();
  setupClient();
  setupCourier();
  setupAdmin();
  setupModal();
});

// ========== المصادقة ==========
function setupAuth() {
  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.tab + '-form').classList.add('active');
    });
  });

  document.getElementById('login-form').addEventListener('submit', e => {
    e.preventDefault();
    const phone = document.getElementById('login-phone').value.trim();
    const password = document.getElementById('login-password').value;
    const role = document.getElementById('login-role').value;
    const users = Storage.get('users', []);
    const user = users.find(u => u.phone === phone && u.password === password && u.role === role);
    if (user) {
      if (user.blocked) {
        showToast('تم إيقاف هذا الحساب. تواصل مع الإدارة', 'error');
        return;
      }
      currentUser = user;
      sessionStorage.setItem('delivery_session', JSON.stringify(user));
      showToast('مرحباً ' + user.name, 'success');
      showScreenForRole(user.role);
    } else {
      showToast('بيانات الدخول غير صحيحة', 'error');
    }
  });

  document.getElementById('register-form').addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('reg-name').value.trim();
    const phone = document.getElementById('reg-phone').value.trim();
    const password = document.getElementById('reg-password').value;
    const role = document.getElementById('reg-role').value;
    const users = Storage.get('users', []);
    if (users.find(u => u.phone === phone)) {
      showToast('رقم الهاتف مسجل مسبقاً', 'error');
      return;
    }
    const newUser = {
      id: 'u' + Date.now(),
      name, phone, password, role,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${role === 'client' ? '0f766e' : '0369a1'}&color=fff`,
      address: 'العاشر من رمضان',
      createdAt: new Date().toISOString().slice(0, 10),
      online: false,
      rating: 5.0,
      completedOrders: 0,
      earnings: 0,
      lat: CITY_CENTER[0] + (Math.random() - 0.5) * 0.02,
      lng: CITY_CENTER[1] + (Math.random() - 0.5) * 0.02
    };
    users.push(newUser);
    Storage.set('users', users);
    currentUser = newUser;
    sessionStorage.setItem('delivery_session', JSON.stringify(newUser));
    showToast('تم إنشاء الحساب بنجاح', 'success');
    showScreenForRole(role);
  });
}

function showScreenForRole(role) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  if (role === 'client') {
    document.getElementById('client-screen').classList.add('active');
    refreshClientHome();
  } else if (role === 'courier') {
    document.getElementById('courier-screen').classList.add('active');
    refreshCourierHome();
  } else if (role === 'admin') {
    document.getElementById('admin-screen').classList.add('active');
    refreshAdminDashboard();
  }
}

function logout() {
  currentUser = null;
  sessionStorage.removeItem('delivery_session');
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('auth-screen').classList.add('active');
  showToast('تم تسجيل الخروج', 'info');
}

// ========== التنقل ==========
function setupNavigation() {
  // Bottom nav client
  document.querySelectorAll('#client-nav .nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = btn.dataset.page;
      showClientPage(page);
      document.querySelectorAll('#client-nav .nav-item').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Bottom nav courier
  document.querySelectorAll('#courier-nav .nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = btn.dataset.page;
      showCourierPage(page);
      document.querySelectorAll('#courier-nav .nav-item').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Admin sidebar
  document.querySelectorAll('.side-item[data-page]').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = btn.dataset.page;
      showAdminPage(page);
      document.querySelectorAll('.side-item').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  document.getElementById('admin-logout')?.addEventListener('click', logout);
  document.getElementById('sidebar-toggle')?.addEventListener('click', () => {
    document.getElementById('admin-sidebar').classList.toggle('open');
  });

  // Back buttons
  document.querySelectorAll('.back-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = btn.dataset.page;
      if (page.startsWith('client-')) showClientPage(page);
      else if (page.startsWith('courier-')) showCourierPage(page);
      else if (page.startsWith('admin-')) showAdminPage(page);
    });
  });

  // Links
  document.querySelectorAll('[data-page]').forEach(el => {
    if (el.tagName === 'A') {
      el.addEventListener('click', e => {
        e.preventDefault();
        const page = el.dataset.page;
        if (page.startsWith('client-')) showClientPage(page);
      });
    }
  });
}

function showClientPage(pageId) {
  document.querySelectorAll('#client-main .page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById(pageId);
  if (page) page.classList.add('active');

  if (pageId === 'client-home') refreshClientHome();
  if (pageId === 'client-orders') refreshClientOrders();
  if (pageId === 'client-create') initCreateOrderMaps();
  if (pageId === 'client-profile') renderClientProfile();
  if (pageId === 'client-notifications') renderClientNotifications();

  // Update bottom nav
  document.querySelectorAll('#client-nav .nav-item').forEach(b => {
    b.classList.toggle('active', b.dataset.page === pageId);
  });
}

function showCourierPage(pageId) {
  document.querySelectorAll('#courier-main .page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById(pageId);
  if (page) page.classList.add('active');
  if (pageId === 'courier-home') refreshCourierHome();
  if (pageId === 'courier-orders') refreshCourierOrders();
  if (pageId === 'courier-profile') renderCourierProfile();
}

function showAdminPage(pageId) {
  document.querySelectorAll('.admin-content .page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById(pageId);
  if (page) page.classList.add('active');
  const titles = {
    'admin-dashboard': 'الإحصائيات',
    'admin-orders': 'الطلبات',
    'admin-clients': 'العملاء',
    'admin-couriers': 'المندوبين',
    'admin-map': 'الخريطة الحية',
    'admin-order-details': 'تفاصيل الطلب'
  };
  document.getElementById('admin-page-title').textContent = titles[pageId] || '';
  if (pageId === 'admin-dashboard') refreshAdminDashboard();
  if (pageId === 'admin-orders') refreshAdminOrders();
  if (pageId === 'admin-clients') refreshAdminClients();
  if (pageId === 'admin-couriers') refreshAdminCouriers();
  if (pageId === 'admin-map') initAdminMap();
  document.getElementById('admin-sidebar')?.classList.remove('open');
}

// ========== العميل ==========
function setupClient() {
  document.getElementById('btn-create-order')?.addEventListener('click', () => showClientPage('client-create'));
  document.getElementById('client-notif-btn')?.addEventListener('click', () => showClientPage('client-notifications'));

  document.getElementById('btn-calc-order')?.addEventListener('click', calcOrderSummary);
  document.getElementById('create-order-form')?.addEventListener('submit', submitOrder);

  // Tabs for orders
  document.querySelectorAll('#client-orders .tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('#client-orders .tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      refreshClientOrders(tab.dataset.filter);
    });
  });
}

function refreshClientHome() {
  if (!currentUser) return;
  document.getElementById('client-name').textContent = currentUser.name;
  document.getElementById('client-avatar').src = currentUser.avatar;

  const orders = Storage.get('orders', []).filter(o => o.clientId === currentUser.id);
  const completed = orders.filter(o => o.status === 'completed' || o.status === 'delivered').length;
  const active = orders.filter(o => !['completed', 'delivered', 'cancelled'].includes(o.status)).length;
  const cancelled = orders.filter(o => o.status === 'cancelled').length;

  document.getElementById('client-completed').textContent = completed;
  document.getElementById('client-active').textContent = active;
  document.getElementById('client-cancelled').textContent = cancelled;

  // Current order
  const current = orders.find(o => !['completed', 'delivered', 'cancelled'].includes(o.status));
  const currentEl = document.getElementById('client-current-order');
  if (current) {
    currentEl.className = 'order-card';
    currentEl.innerHTML = renderOrderCard(current);
    currentEl.onclick = () => openOrderDetails(current.id, 'client');
  } else {
    currentEl.className = 'order-card empty-state';
    currentEl.innerHTML = '<i class="fas fa-box-open"></i><p>لا يوجد طلب جاري حالياً</p>';
    currentEl.onclick = null;
  }

  // Recent
  const recent = orders.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3);
  const recentEl = document.getElementById('client-recent-orders');
  if (recent.length === 0) {
    recentEl.innerHTML = '<div class="order-card empty-state"><p>لا توجد طلبات سابقة</p></div>';
  } else {
    recentEl.innerHTML = recent.map(o => `<div class="order-card" onclick="openOrderDetails('${o.id}','client')">${renderOrderCard(o)}</div>`).join('');
  }

  // Notif count
  const notifs = Storage.get('notifications', []).filter(n => n.userId === currentUser.id && !n.read);
  document.getElementById('client-notif-count').textContent = notifs.length;
}

function renderOrderCard(order) {
  const status = ORDER_STATUSES[order.status] || { label: order.status, color: '' };
  const courier = order.courierId ? Storage.get('users', []).find(u => u.id === order.courierId) : null;
  return `
    <div class="order-header">
      <span class="order-id">#${order.id}</span>
      <span class="status-badge status-${status.color}">${status.label}</span>
    </div>
    <div class="order-info">
      <div><i class="fas fa-map-marker-alt"></i> من: ${order.pickup.address.substring(0, 40)}...</div>
      <div><i class="fas fa-map-pin"></i> إلى: ${order.dropoff.address.substring(0, 40)}...</div>
      <div><i class="fas fa-money-bill"></i> ${order.cost} ج.م · ${formatDate(order.createdAt)}</div>
      ${courier ? `<div><i class="fas fa-motorcycle"></i> المندوب: ${courier.name}</div>` : ''}
    </div>
  `;
}

function initCreateOrderMaps() {
  // تأخير أكبر لأن الصفحة كانت مخفية
  setTimeout(() => {
    const pickupEl = document.getElementById('pickup-map');
    const dropoffEl = document.getElementById('dropoff-map');
    if (!pickupEl || !dropoffEl) return;

    // خريطة الاستلام
    if (!mapsInitialized.pickup) {
      pickupMap = L.map(pickupEl, { zoomControl: true }).setView(CITY_CENTER, 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 18
      }).addTo(pickupMap);
      pickupMarker = L.marker(CITY_CENTER, { draggable: true }).addTo(pickupMap);
      pickupMarker.on('dragend', e => {
        const pos = e.target.getLatLng();
        document.getElementById('pickup-lat').value = pos.lat.toFixed(6);
        document.getElementById('pickup-lng').value = pos.lng.toFixed(6);
        document.getElementById('pickup-address').value = `موقع على الخريطة (${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)})`;
      });
      pickupMap.on('click', e => {
        pickupMarker.setLatLng(e.latlng);
        document.getElementById('pickup-lat').value = e.latlng.lat.toFixed(6);
        document.getElementById('pickup-lng').value = e.latlng.lng.toFixed(6);
        document.getElementById('pickup-address').value = `موقع على الخريطة (${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)})`;
      });
      document.getElementById('pickup-lat').value = CITY_CENTER[0];
      document.getElementById('pickup-lng').value = CITY_CENTER[1];
      if (!document.getElementById('pickup-address').value) {
        document.getElementById('pickup-address').value = 'الحي الأول، العاشر من رمضان';
      }
      mapsInitialized.pickup = true;
    }
    // دائماً أعد حساب الحجم
    setTimeout(() => { if (pickupMap) pickupMap.invalidateSize(true); }, 150);
    setTimeout(() => { if (pickupMap) pickupMap.invalidateSize(true); }, 400);

    // خريطة التسليم
    if (!mapsInitialized.dropoff) {
      const dropCenter = [CITY_CENTER[0] - 0.012, CITY_CENTER[1] - 0.008];
      dropoffMap = L.map(dropoffEl, { zoomControl: true }).setView(dropCenter, 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 18
      }).addTo(dropoffMap);
      dropoffMarker = L.marker(dropCenter, { draggable: true }).addTo(dropoffMap);
      dropoffMarker.on('dragend', e => {
        const pos = e.target.getLatLng();
        document.getElementById('dropoff-lat').value = pos.lat.toFixed(6);
        document.getElementById('dropoff-lng').value = pos.lng.toFixed(6);
        document.getElementById('dropoff-address').value = `موقع على الخريطة (${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)})`;
      });
      dropoffMap.on('click', e => {
        dropoffMarker.setLatLng(e.latlng);
        document.getElementById('dropoff-lat').value = e.latlng.lat.toFixed(6);
        document.getElementById('dropoff-lng').value = e.latlng.lng.toFixed(6);
        document.getElementById('dropoff-address').value = `موقع على الخريطة (${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)})`;
      });
      document.getElementById('dropoff-lat').value = dropCenter[0];
      document.getElementById('dropoff-lng').value = dropCenter[1];
      if (!document.getElementById('dropoff-address').value) {
        document.getElementById('dropoff-address').value = 'الحي الخامس، العاشر من رمضان';
      }
      mapsInitialized.dropoff = true;
    }
    setTimeout(() => { if (dropoffMap) dropoffMap.invalidateSize(true); }, 150);
    setTimeout(() => { if (dropoffMap) dropoffMap.invalidateSize(true); }, 400);
  }, 250);
}

function calcOrderSummary() {
  const plat = parseFloat(document.getElementById('pickup-lat').value);
  const plng = parseFloat(document.getElementById('pickup-lng').value);
  const dlat = parseFloat(document.getElementById('dropoff-lat').value);
  const dlng = parseFloat(document.getElementById('dropoff-lng').value);
  const weight = parseFloat(document.getElementById('package-weight').value) || 1;
  const payment = document.querySelector('input[name="payment"]:checked').value;

  if (!plat || !dlat) {
    showToast('حدد مواقع الاستلام والتسليم', 'error');
    return;
  }

  const dist = haversineDistance(plat, plng, dlat, dlng);
  const cost = calculateCost(dist, weight);

  document.getElementById('sum-distance').textContent = dist.toFixed(1) + ' كم';
  document.getElementById('sum-cost').textContent = cost + ' ج.م';
  document.getElementById('sum-payment').textContent = PAYMENT_METHODS[payment];
  document.getElementById('order-summary').style.display = 'block';
  document.getElementById('btn-confirm-order').disabled = false;

  // Store for submit
  window._orderCalc = { dist, cost };
}

function submitOrder(e) {
  e.preventDefault();
  if (!window._orderCalc) {
    showToast('احسب التكلفة أولاً', 'error');
    return;
  }

  const order = {
    id: generateOrderId(),
    clientId: currentUser.id,
    courierId: null,
    status: 'pending',
    pickup: {
      address: document.getElementById('pickup-address').value,
      lat: parseFloat(document.getElementById('pickup-lat').value),
      lng: parseFloat(document.getElementById('pickup-lng').value)
    },
    dropoff: {
      address: document.getElementById('dropoff-address').value,
      lat: parseFloat(document.getElementById('dropoff-lat').value),
      lng: parseFloat(document.getElementById('dropoff-lng').value)
    },
    receiver: {
      name: document.getElementById('receiver-name').value,
      phone: document.getElementById('receiver-phone').value
    },
    package: {
      type: document.getElementById('package-type').value,
      desc: document.getElementById('package-desc').value,
      weight: parseFloat(document.getElementById('package-weight').value) || 1,
      size: document.getElementById('package-size').value
    },
    notes: document.getElementById('order-notes').value,
    payment: document.querySelector('input[name="payment"]:checked').value,
    distance: window._orderCalc.dist,
    cost: window._orderCalc.cost,
    createdAt: new Date().toISOString(),
    timeline: [
      { status: 'created', time: new Date().toISOString() },
      { status: 'pending', time: new Date().toISOString() }
    ],
    adminNote: null,
    cancelReason: null,
    rating: null,
    comment: null
  };

  const orders = Storage.get('orders', []);
  orders.unshift(order);
  Storage.set('orders', orders);

  // Notification
  addNotification(currentUser.id, 'تم إنشاء الطلب', `تم إنشاء طلبك رقم #${order.id} وهو بانتظار موافقة الإدارة`, 'order');

  showToast('تم إنشاء الطلب #' + order.id + ' بنجاح', 'success');
  document.getElementById('create-order-form').reset();
  document.getElementById('order-summary').style.display = 'none';
  document.getElementById('btn-confirm-order').disabled = true;
  window._orderCalc = null;

  openOrderDetails(order.id, 'client');
}

function openOrderDetails(orderId, context) {
  const orders = Storage.get('orders', []);
  const order = orders.find(o => o.id === orderId);
  if (!order) return;

  if (context === 'client') {
    showClientPage('client-order-details');
    document.getElementById('order-id-title').textContent = '#' + order.id;
    document.getElementById('order-details-content').innerHTML = renderOrderDetails(order, 'client');
  } else if (context === 'admin') {
    showAdminPage('admin-order-details');
    document.getElementById('admin-order-details-content').innerHTML = renderOrderDetails(order, 'admin');
  }
}

function renderOrderDetails(order, context) {
  const status = ORDER_STATUSES[order.status];
  const courier = order.courierId ? Storage.get('users', []).find(u => u.id === order.courierId) : null;
  const client = Storage.get('users', []).find(u => u.id === order.clientId);

  let timelineHtml = '<div class="timeline">';
  const allSteps = ['created', 'pending', 'searching', 'accepted', 'to_pickup', 'at_pickup', 'picked', 'to_dropoff', 'at_dropoff', 'delivered', 'completed'];
  const currentStep = status?.step ?? -1;

  allSteps.forEach((st, i) => {
    const s = ORDER_STATUSES[st];
    const entry = order.timeline.find(t => t.status === st);
    let cls = '';
    if (order.status === 'cancelled') {
      cls = entry ? 'done' : '';
    } else {
      if (i < currentStep) cls = 'done';
      else if (i === currentStep) cls = 'active';
    }
    timelineHtml += `
      <div class="timeline-item ${cls}">
        <div class="timeline-dot"></div>
        <div class="timeline-content">
          <h5>${s.label}</h5>
          <small>${entry ? formatDate(entry.time) : ''}</small>
        </div>
      </div>`;
  });
  if (order.status === 'cancelled') {
    timelineHtml += `
      <div class="timeline-item active">
        <div class="timeline-dot" style="background:var(--danger)"></div>
        <div class="timeline-content">
          <h5>تم إلغاء الطلب</h5>
          <small>${order.cancelReason || ''} · ${formatDate(order.timeline.find(t => t.status === 'cancelled')?.time)}</small>
        </div>
      </div>`;
  }
  timelineHtml += '</div>';

  let actions = '';
  if (context === 'client') {
    if (!['completed', 'delivered', 'cancelled'].includes(order.status)) {
      actions += `<button class="btn btn-outline btn-block" onclick="openTrack('${order.id}')"><i class="fas fa-map-marked-alt"></i> تتبع الطلب</button>`;
      if (['pending', 'searching', 'created'].includes(order.status)) {
        actions += `<button class="btn btn-danger btn-block" style="margin-top:0.5rem" onclick="cancelOrder('${order.id}')"><i class="fas fa-times"></i> إلغاء الطلب</button>`;
      }
    }
    if ((order.status === 'completed' || order.status === 'delivered') && !order.rating) {
      actions += `<button class="btn btn-warning btn-block" style="margin-top:0.5rem" onclick="showRatingModal('${order.id}')"><i class="fas fa-star"></i> تقييم المندوب</button>`;
    }
  }

  if (context === 'admin') {
    if (order.status === 'pending') {
      actions += `
        <div class="form-group" style="margin-top:1rem">
          <label>ملاحظة للعميل (اختياري)</label>
          <textarea id="admin-note-input" rows="2" placeholder="اكتب ملاحظة..."></textarea>
        </div>
        <div style="display:flex;gap:0.5rem;margin-top:0.8rem">
          <button class="btn btn-success" style="flex:1" onclick="adminApproveOrder('${order.id}')"><i class="fas fa-check"></i> قبول الطلب</button>
          <button class="btn btn-danger" style="flex:1" onclick="adminRejectOrder('${order.id}')"><i class="fas fa-times"></i> رفض</button>
        </div>`;
    }
  }

  return `
    <div class="form-section">
      <div class="order-header">
        <span class="order-id">#${order.id}</span>
        <span class="status-badge status-${status?.color || ''}">${status?.label || order.status}</span>
      </div>
      <div class="order-info" style="margin-top:1rem">
        <div><i class="fas fa-user"></i> العميل: ${client?.name || '-'}</div>
        <div><i class="fas fa-map-marker-alt"></i> الاستلام: ${order.pickup.address}</div>
        <div><i class="fas fa-map-pin"></i> التسليم: ${order.dropoff.address}</div>
        <div><i class="fas fa-user-friends"></i> المستلم: ${order.receiver.name} - ${order.receiver.phone}</div>
        <div><i class="fas fa-box"></i> ${PACKAGE_TYPES[order.package.type]} · ${order.package.desc || ''} · ${order.package.weight} كجم</div>
        <div><i class="fas fa-road"></i> المسافة: ${order.distance.toFixed(1)} كم</div>
        <div><i class="fas fa-money-bill"></i> التكلفة: ${order.cost} ج.م · ${PAYMENT_METHODS[order.payment]}</div>
        ${order.notes ? `<div><i class="fas fa-sticky-note"></i> ملاحظات: ${order.notes}</div>` : ''}
        ${courier ? `<div><i class="fas fa-motorcycle"></i> المندوب: ${courier.name} ⭐ ${courier.rating}</div>` : ''}
        ${order.adminNote ? `<div style="color:var(--info)"><i class="fas fa-comment"></i> ملاحظة الإدارة: ${order.adminNote}</div>` : ''}
      </div>
    </div>
    <div class="form-section">
      <h4><i class="fas fa-stream"></i> مراحل الطلب</h4>
      ${timelineHtml}
    </div>
    ${actions}
  `;
}

function openTrack(orderId) {
  const order = Storage.get('orders', []).find(o => o.id === orderId);
  if (!order) return;
  showClientPage('client-track');

  setTimeout(() => {
    if (trackMap) {
      trackMap.remove();
      trackMap = null;
    }
    trackMap = L.map('track-map').setView([order.pickup.lat, order.pickup.lng], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(trackMap);

    L.marker([order.pickup.lat, order.pickup.lng], {
      icon: L.divIcon({ className: '', html: '<div style="background:#0f766e;color:white;padding:4px 8px;border-radius:8px;font-size:12px;font-weight:bold">استلام</div>' })
    }).addTo(trackMap);

    L.marker([order.dropoff.lat, order.dropoff.lng], {
      icon: L.divIcon({ className: '', html: '<div style="background:#dc2626;color:white;padding:4px 8px;border-radius:8px;font-size:12px;font-weight:bold">تسليم</div>' })
    }).addTo(trackMap);

    L.polyline([
      [order.pickup.lat, order.pickup.lng],
      [order.dropoff.lat, order.dropoff.lng]
    ], { color: '#0f766e', weight: 4, dashArray: '10,10' }).addTo(trackMap);

    if (order.courierId) {
      const courier = Storage.get('users', []).find(u => u.id === order.courierId);
      if (courier) {
        // موقع وهمي للمندوب
        const midLat = (order.pickup.lat + order.dropoff.lat) / 2 + 0.002;
        const midLng = (order.pickup.lng + order.dropoff.lng) / 2;
        L.marker([midLat, midLng], {
          icon: L.divIcon({
            className: '',
            html: `<div style="background:#0369a1;color:white;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 2px 8px rgba(0,0,0,0.3)"><i class="fas fa-motorcycle"></i></div>`
          })
        }).addTo(trackMap).bindPopup(courier.name);
      }
    }

    setTimeout(() => trackMap.invalidateSize(), 200);

    const courier = order.courierId ? Storage.get('users', []).find(u => u.id === order.courierId) : null;
    const status = ORDER_STATUSES[order.status];
    document.getElementById('track-info').innerHTML = `
      <div class="form-section" style="margin-top:1rem">
        <div class="status-badge status-${status?.color}" style="margin-bottom:1rem">${status?.label}</div>
        ${courier ? `
          <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1rem">
            <img src="${courier.avatar}" class="avatar">
            <div>
              <strong>${courier.name}</strong>
              <div>⭐ ${courier.rating} · ${courier.completedOrders} طلب</div>
            </div>
          </div>
        ` : '<p>لم يتم تعيين مندوب بعد</p>'}
        <div class="order-info">
          <div><i class="fas fa-road"></i> المسافة المتبقية تقريباً: ${(order.distance * 0.6).toFixed(1)} كم</div>
          <div><i class="fas fa-clock"></i> الوقت المتوقع: ${Math.ceil(order.distance * 3)} دقيقة</div>
        </div>
      </div>
    `;
  }, 100);
}

function cancelOrder(orderId) {
  showModal('إلغاء الطلب', `
    <p>هل أنت متأكد من إلغاء الطلب؟</p>
    <div class="form-group">
      <label>سبب الإلغاء</label>
      <select id="cancel-reason">
        <option value="تغيرت الظروف">تغيرت الظروف</option>
        <option value="طلبت بالخطأ">طلبت بالخطأ</option>
        <option value="وجدت بديل">وجدت بديل</option>
        <option value="أخرى">أخرى</option>
      </select>
    </div>
  `, [
    { text: 'تأكيد الإلغاء', class: 'btn-danger', action: () => {
      const reason = document.getElementById('cancel-reason').value;
      const orders = Storage.get('orders', []);
      const order = orders.find(o => o.id === orderId);
      if (order) {
        order.status = 'cancelled';
        order.cancelReason = reason;
        order.timeline.push({ status: 'cancelled', time: new Date().toISOString() });
        Storage.set('orders', orders);
        addNotification(currentUser.id, 'تم إلغاء الطلب', `تم إلغاء طلبك #${orderId}`, 'cancel');
        showToast('تم إلغاء الطلب', 'info');
        closeModal();
        openOrderDetails(orderId, 'client');
        refreshClientHome();
      }
    }},
    { text: 'تراجع', class: 'btn-outline', action: closeModal }
  ]);
}

function showRatingModal(orderId) {
  showModal('تقييم المندوب', `
    <p>كيف كانت تجربتك مع المندوب؟</p>
    <div class="stars" id="rating-stars">
      <span class="star" data-v="1">★</span>
      <span class="star" data-v="2">★</span>
      <span class="star" data-v="3">★</span>
      <span class="star" data-v="4">★</span>
      <span class="star" data-v="5">★</span>
    </div>
    <div class="form-group" style="margin-top:1rem">
      <label>تعليق (اختياري)</label>
      <textarea id="rating-comment" rows="2"></textarea>
    </div>
  `, [
    { text: 'إرسال التقييم', class: 'btn-primary', action: () => {
      const stars = document.querySelectorAll('#rating-stars .star.active').length;
      if (stars === 0) { showToast('اختر تقييماً', 'error'); return; }
      const comment = document.getElementById('rating-comment').value;
      const orders = Storage.get('orders', []);
      const order = orders.find(o => o.id === orderId);
      if (order) {
        order.rating = stars;
        order.comment = comment;
        // Update courier rating
        const users = Storage.get('users', []);
        const courier = users.find(u => u.id === order.courierId);
        if (courier) {
          const ratedOrders = orders.filter(o => o.courierId === courier.id && o.rating);
          const avg = ratedOrders.reduce((s, o) => s + o.rating, 0) / ratedOrders.length;
          courier.rating = Math.round(avg * 10) / 10;
          Storage.set('users', users);
        }
        Storage.set('orders', orders);
        showToast('شكراً على تقييمك!', 'success');
        closeModal();
        openOrderDetails(orderId, 'client');
      }
    }},
    { text: 'لاحقاً', class: 'btn-outline', action: closeModal }
  ]);

  setTimeout(() => {
    document.querySelectorAll('#rating-stars .star').forEach(star => {
      star.addEventListener('click', () => {
        const v = parseInt(star.dataset.v);
        document.querySelectorAll('#rating-stars .star').forEach(s => {
          s.classList.toggle('active', parseInt(s.dataset.v) <= v);
        });
      });
    });
  }, 50);
}

function refreshClientOrders(filter = 'all') {
  const orders = Storage.get('orders', []).filter(o => o.clientId === currentUser.id);
  let filtered = orders;
  if (filter === 'active') filtered = orders.filter(o => !['completed', 'delivered', 'cancelled'].includes(o.status));
  if (filter === 'completed') filtered = orders.filter(o => ['completed', 'delivered'].includes(o.status));
  if (filter === 'cancelled') filtered = orders.filter(o => o.status === 'cancelled');

  const el = document.getElementById('client-orders-list');
  if (filtered.length === 0) {
    el.innerHTML = '<div class="order-card empty-state"><i class="fas fa-inbox"></i><p>لا توجد طلبات</p></div>';
  } else {
    el.innerHTML = filtered.map(o => `<div class="order-card" onclick="openOrderDetails('${o.id}','client')">${renderOrderCard(o)}</div>`).join('');
  }
}

function renderClientProfile() {
  const el = document.getElementById('client-profile-content');
  el.innerHTML = `
    <img src="${currentUser.avatar}" class="avatar">
    <h3>${currentUser.name}</h3>
    <p style="color:#64748b">عميل</p>
    <div class="profile-info">
      <div class="profile-row"><span>رقم الهاتف</span><strong>${currentUser.phone}</strong></div>
      <div class="profile-row"><span>العنوان</span><strong>${currentUser.address || 'العاشر من رمضان'}</strong></div>
      <div class="profile-row"><span>تاريخ الانضمام</span><strong>${currentUser.createdAt || '-'}</strong></div>
    </div>
    <div class="profile-actions">
      <button class="btn btn-outline btn-block" onclick="logout()"><i class="fas fa-sign-out-alt"></i> تسجيل الخروج</button>
    </div>
  `;
}

function renderClientNotifications() {
  const notifs = Storage.get('notifications', []).filter(n => n.userId === currentUser.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const el = document.getElementById('client-notif-list');
  if (notifs.length === 0) {
    el.innerHTML = '<div class="order-card empty-state"><i class="fas fa-bell-slash"></i><p>لا توجد إشعارات</p></div>';
  } else {
    el.innerHTML = notifs.map(n => `
      <div class="notif-item ${n.read ? '' : 'unread'}">
        <div class="notif-icon"><i class="fas fa-bell"></i></div>
        <div>
          <strong>${n.title}</strong>
          <p style="font-size:0.9rem;color:#64748b;margin:0.3rem 0">${n.body}</p>
          <small style="color:#94a3b8">${formatDate(n.createdAt)}</small>
        </div>
      </div>
    `).join('');
    // Mark read
    notifs.forEach(n => n.read = true);
    const all = Storage.get('notifications', []);
    Storage.set('notifications', all);
    document.getElementById('client-notif-count').textContent = '0';
  }
}

// ========== المندوب ==========
function setupCourier() {
  document.getElementById('courier-online-toggle')?.addEventListener('change', e => {
    const users = Storage.get('users', []);
    const user = users.find(u => u.id === currentUser.id);
    if (user) {
      user.online = e.target.checked;
      Storage.set('users', users);
      currentUser.online = e.target.checked;
      document.getElementById('courier-status-text').textContent = e.target.checked ? 'متصل' : 'غير متصل';
      showToast(e.target.checked ? 'أنت متصل الآن' : 'أنت غير متصل', 'info');
      refreshCourierHome();
    }
  });
}

function refreshCourierHome() {
  if (!currentUser) return;
  document.getElementById('courier-name').textContent = currentUser.name;
  document.getElementById('courier-avatar').src = currentUser.avatar;
  document.getElementById('courier-online-toggle').checked = currentUser.online || false;
  document.getElementById('courier-status-text').textContent = currentUser.online ? 'متصل' : 'غير متصل';
  document.getElementById('courier-earnings').textContent = currentUser.earnings || 0;
  document.getElementById('courier-done').textContent = currentUser.completedOrders || 0;
  document.getElementById('courier-rating').textContent = (currentUser.rating || 5).toFixed(1);

  const orders = Storage.get('orders', []);
  const current = orders.find(o => o.courierId === currentUser.id && !['completed', 'delivered', 'cancelled'].includes(o.status));
  const currentEl = document.getElementById('courier-current-order');
  if (current) {
    currentEl.className = 'order-card';
    currentEl.innerHTML = renderOrderCard(current) + `<button class="btn btn-primary btn-sm" style="margin-top:0.8rem;width:100%" onclick="openExecute('${current.id}')">تنفيذ الطلب</button>`;
    currentEl.onclick = null;
  } else {
    currentEl.className = 'order-card empty-state';
    currentEl.innerHTML = '<i class="fas fa-motorcycle"></i><p>لا يوجد طلب حالياً</p>';
  }

  // Available (only if online and no current)
  const availableEl = document.getElementById('courier-available-orders');
  if (!currentUser.online) {
    availableEl.innerHTML = '<div class="order-card empty-state"><p>فعّل حالة "متصل" لرؤية الطلبات</p></div>';
  } else if (current) {
    availableEl.innerHTML = '<div class="order-card empty-state"><p>أنهِ الطلب الحالي أولاً</p></div>';
  } else {
    const available = orders.filter(o => o.status === 'searching' && !o.courierId);
    if (available.length === 0) {
      availableEl.innerHTML = '<div class="order-card empty-state"><i class="fas fa-inbox"></i><p>لا توجد طلبات متاحة حالياً</p></div>';
    } else {
      availableEl.innerHTML = available.map(o => `
        <div class="order-card">
          ${renderOrderCard(o)}
          <div style="display:flex;gap:0.5rem;margin-top:0.8rem">
            <button class="btn btn-success btn-sm" style="flex:1" onclick="acceptOrder('${o.id}')"><i class="fas fa-check"></i> قبول</button>
            <button class="btn btn-outline btn-sm" style="flex:1" onclick="rejectOrder('${o.id}')"><i class="fas fa-times"></i> رفض</button>
          </div>
        </div>
      `).join('');
    }
  }
}

function acceptOrder(orderId) {
  const orders = Storage.get('orders', []);
  const order = orders.find(o => o.id === orderId);
  if (!order || order.courierId) {
    showToast('الطلب لم يعد متاحاً', 'error');
    refreshCourierHome();
    return;
  }
  order.courierId = currentUser.id;
  order.status = 'accepted';
  order.timeline.push({ status: 'accepted', time: new Date().toISOString() });
  Storage.set('orders', orders);

  addNotification(order.clientId, 'تم قبول الطلب', `تم قبول طلبك #${orderId} بواسطة مندوب`, 'accept');
  showToast('تم قبول الطلب بنجاح', 'success');
  refreshCourierHome();
  openExecute(orderId);
}

function rejectOrder(orderId) {
  showToast('تم رفض الطلب، سيُعرض لمندوب آخر', 'info');
  // In real system would go back to pool; here just ignore
  refreshCourierHome();
}

function openExecute(orderId) {
  const order = Storage.get('orders', []).find(o => o.id === orderId);
  if (!order) return;
  showCourierPage('courier-execute');

  const steps = [
    { status: 'to_pickup', label: 'التوجه إلى مكان الاستلام', next: 'at_pickup' },
    { status: 'at_pickup', label: 'وصلت إلى مكان الاستلام', next: 'picked' },
    { status: 'picked', label: 'تم استلام الشحنة', next: 'to_dropoff' },
    { status: 'to_dropoff', label: 'التوجه إلى مكان التسليم', next: 'at_dropoff' },
    { status: 'at_dropoff', label: 'وصلت إلى مكان التسليم', next: 'delivered' },
    { status: 'delivered', label: 'تم التسليم', next: 'completed' }
  ];

  let html = `
    <div class="form-section">
      <div class="order-header">
        <span class="order-id">#${order.id}</span>
        <span class="status-badge status-${ORDER_STATUSES[order.status]?.color}">${ORDER_STATUSES[order.status]?.label}</span>
      </div>
      <div class="order-info" style="margin-top:0.8rem">
        <div><i class="fas fa-map-marker-alt"></i> ${order.pickup.address}</div>
        <div><i class="fas fa-map-pin"></i> ${order.dropoff.address}</div>
        <div><i class="fas fa-box"></i> ${PACKAGE_TYPES[order.package.type]} · ${order.package.weight} كجم</div>
        ${order.notes ? `<div><i class="fas fa-sticky-note"></i> ${order.notes}</div>` : ''}
      </div>
    </div>
    <div class="form-section">
      <h4>مراحل التنفيذ</h4>
      <div class="execute-steps">`;

  const statusOrder = ['accepted', 'to_pickup', 'at_pickup', 'picked', 'to_dropoff', 'at_dropoff', 'delivered', 'completed'];
  const currentIdx = statusOrder.indexOf(order.status);

  steps.forEach((step, i) => {
    const stepIdx = statusOrder.indexOf(step.status);
    let cls = '';
    if (stepIdx < currentIdx) cls = 'done';
    else if (stepIdx === currentIdx + 1 || (order.status === 'accepted' && i === 0)) cls = 'active';
    else if (stepIdx <= currentIdx) cls = 'done';

    const canClick = cls === 'active';
    html += `
      <button class="step-btn ${cls}" ${canClick ? '' : 'disabled'} onclick="advanceOrder('${order.id}','${step.status}')">
        <i class="fas ${cls === 'done' ? 'fa-check-circle' : 'fa-circle'}"></i>
        ${step.label}
      </button>`;
  });

  html += '</div></div>';
  document.getElementById('courier-execute-content').innerHTML = html;
}

function advanceOrder(orderId, newStatus) {
  const orders = Storage.get('orders', []);
  const order = orders.find(o => o.id === orderId);
  if (!order) return;

  order.status = newStatus;
  order.timeline.push({ status: newStatus, time: new Date().toISOString() });

  if (newStatus === 'delivered') {
    order.status = 'completed';
    order.timeline.push({ status: 'completed', time: new Date().toISOString() });
    // Update courier stats
    const users = Storage.get('users', []);
    const courier = users.find(u => u.id === currentUser.id);
    if (courier) {
      courier.completedOrders = (courier.completedOrders || 0) + 1;
      courier.earnings = (courier.earnings || 0) + Math.round(order.cost * 0.7);
      Storage.set('users', users);
      currentUser = courier;
    }
    addNotification(order.clientId, 'تم تسليم الطلب', `تم تسليم طلبك #${orderId} بنجاح`, 'delivered');
    showToast('تم إكمال الطلب بنجاح! 🎉', 'success');
  } else {
    const labels = {
      to_pickup: 'المندوب في الطريق للاستلام',
      at_pickup: 'وصل المندوب لمكان الاستلام',
      picked: 'تم استلام الشحنة',
      to_dropoff: 'المندوب في الطريق للتسليم',
      at_dropoff: 'وصل المندوب لمكان التسليم'
    };
    addNotification(order.clientId, 'تحديث حالة الطلب', `طلبك #${orderId}: ${labels[newStatus] || newStatus}`, 'status');
    showToast('تم تحديث الحالة', 'success');
  }

  Storage.set('orders', orders);
  openExecute(orderId);
  refreshCourierHome();
}

function refreshCourierOrders() {
  const orders = Storage.get('orders', []).filter(o => o.courierId === currentUser.id);
  const el = document.getElementById('courier-orders-list');
  if (orders.length === 0) {
    el.innerHTML = '<div class="order-card empty-state"><p>لا توجد طلبات</p></div>';
  } else {
    el.innerHTML = orders.map(o => `<div class="order-card" onclick="openExecute('${o.id}')">${renderOrderCard(o)}</div>`).join('');
  }
}

function renderCourierProfile() {
  const el = document.getElementById('courier-profile-content');
  el.innerHTML = `
    <img src="${currentUser.avatar}" class="avatar">
    <h3>${currentUser.name}</h3>
    <p style="color:#64748b">مندوب توصيل · ⭐ ${currentUser.rating || 5}</p>
    <div class="profile-info">
      <div class="profile-row"><span>رقم الهاتف</span><strong>${currentUser.phone}</strong></div>
      <div class="profile-row"><span>الطلبات المنجزة</span><strong>${currentUser.completedOrders || 0}</strong></div>
      <div class="profile-row"><span>الأرباح</span><strong>${currentUser.earnings || 0} ج.م</strong></div>
      <div class="profile-row"><span>الوسيلة</span><strong>${currentUser.vehicle || 'دراجة نارية'}</strong></div>
    </div>
    <div class="profile-actions">
      <button class="btn btn-outline btn-block" onclick="logout()"><i class="fas fa-sign-out-alt"></i> تسجيل الخروج</button>
    </div>
  `;
}

// ========== المدير ==========
function setupAdmin() {
  document.getElementById('admin-order-search')?.addEventListener('input', refreshAdminOrders);
  document.getElementById('admin-order-filter')?.addEventListener('change', refreshAdminOrders);
  document.getElementById('admin-client-search')?.addEventListener('input', refreshAdminClients);
  document.getElementById('admin-courier-search')?.addEventListener('input', refreshAdminCouriers);
  document.getElementById('admin-courier-status')?.addEventListener('change', refreshAdminCouriers);
}

function refreshAdminDashboard() {
  const users = Storage.get('users', []);
  const orders = Storage.get('orders', []);
  const clients = users.filter(u => u.role === 'client');
  const couriers = users.filter(u => u.role === 'courier');

  document.getElementById('admin-total-clients').textContent = clients.length;
  document.getElementById('admin-total-couriers').textContent = couriers.length;
  document.getElementById('admin-active-orders').textContent = orders.filter(o => !['completed', 'delivered', 'cancelled'].includes(o.status)).length;
  document.getElementById('admin-completed-orders').textContent = orders.filter(o => ['completed', 'delivered'].includes(o.status)).length;
  document.getElementById('admin-cancelled-orders').textContent = orders.filter(o => o.status === 'cancelled').length;
  document.getElementById('admin-total-revenue').textContent = orders.reduce((s, o) => s + (o.cost || 0), 0);

  // Today orders
  const today = new Date().toDateString();
  const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === today);
  const tableEl = document.getElementById('admin-today-orders');
  if (todayOrders.length === 0) {
    tableEl.innerHTML = '<p style="padding:1.5rem;text-align:center;color:#94a3b8">لا توجد طلبات اليوم</p>';
  } else {
    tableEl.innerHTML = `<table>
      <thead><tr><th>الرقم</th><th>العميل</th><th>الحالة</th><th>التكلفة</th><th></th></tr></thead>
      <tbody>
        ${todayOrders.map(o => {
          const client = users.find(u => u.id === o.clientId);
          return `<tr>
            <td>#${o.id}</td>
            <td>${client?.name || '-'}</td>
            <td><span class="status-badge status-${ORDER_STATUSES[o.status]?.color}">${ORDER_STATUSES[o.status]?.label}</span></td>
            <td>${o.cost} ج.م</td>
            <td><button class="btn btn-sm btn-outline" onclick="openOrderDetails('${o.id}','admin')">عرض</button></td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>`;
  }
}

function refreshAdminOrders() {
  const search = (document.getElementById('admin-order-search')?.value || '').toLowerCase();
  const filter = document.getElementById('admin-order-filter')?.value || 'all';
  const users = Storage.get('users', []);
  let orders = Storage.get('orders', []);

  if (filter !== 'all') {
    if (filter === 'completed') orders = orders.filter(o => ['completed', 'delivered'].includes(o.status));
    else orders = orders.filter(o => o.status === filter);
  }
  if (search) {
    orders = orders.filter(o => {
      const client = users.find(u => u.id === o.clientId);
      const courier = users.find(u => u.id === o.courierId);
      return o.id.includes(search) ||
        (client?.name || '').toLowerCase().includes(search) ||
        (courier?.name || '').toLowerCase().includes(search);
    });
  }

  const el = document.getElementById('admin-orders-table');
  el.innerHTML = `<table>
    <thead><tr><th>الرقم</th><th>العميل</th><th>المندوب</th><th>الحالة</th><th>التكلفة</th><th>التاريخ</th><th></th></tr></thead>
    <tbody>
      ${orders.map(o => {
        const client = users.find(u => u.id === o.clientId);
        const courier = users.find(u => u.id === o.courierId);
        return `<tr>
          <td><strong>#${o.id}</strong></td>
          <td>${client?.name || '-'}</td>
          <td>${courier?.name || '-'}</td>
          <td><span class="status-badge status-${ORDER_STATUSES[o.status]?.color}">${ORDER_STATUSES[o.status]?.label}</span></td>
          <td>${o.cost} ج.م</td>
          <td>${formatDate(o.createdAt)}</td>
          <td><button class="btn btn-sm btn-primary" onclick="openOrderDetails('${o.id}','admin')">إدارة</button></td>
        </tr>`;
      }).join('') || '<tr><td colspan="7" style="text-align:center;padding:2rem">لا توجد طلبات</td></tr>'}
    </tbody>
  </table>`;
}

function adminApproveOrder(orderId) {
  const note = document.getElementById('admin-note-input')?.value || '';
  const orders = Storage.get('orders', []);
  const order = orders.find(o => o.id === orderId);
  if (!order) return;
  order.status = 'searching';
  order.adminNote = note || null;
  order.timeline.push({ status: 'searching', time: new Date().toISOString() });
  Storage.set('orders', orders);
  addNotification(order.clientId, 'تم قبول طلبك', `طلبك #${orderId} قيد البحث عن مندوب${note ? ' · ملاحظة: ' + note : ''}`, 'approve');
  showToast('تم قبول الطلب وإرساله للمندوبين', 'success');
  openOrderDetails(orderId, 'admin');
  refreshAdminOrders();
}

function adminRejectOrder(orderId) {
  const note = document.getElementById('admin-note-input')?.value || 'تم الرفض من الإدارة';
  const orders = Storage.get('orders', []);
  const order = orders.find(o => o.id === orderId);
  if (!order) return;
  order.status = 'cancelled';
  order.cancelReason = note;
  order.adminNote = note;
  order.timeline.push({ status: 'cancelled', time: new Date().toISOString() });
  Storage.set('orders', orders);
  addNotification(order.clientId, 'تم رفض الطلب', `طلبك #${orderId} تم رفضه · ${note}`, 'reject');
  showToast('تم رفض الطلب', 'info');
  openOrderDetails(orderId, 'admin');
  refreshAdminOrders();
}

function refreshAdminClients() {
  const search = (document.getElementById('admin-client-search')?.value || '').toLowerCase();
  const users = Storage.get('users', []).filter(u => u.role === 'client');
  const orders = Storage.get('orders', []);
  let filtered = users;
  if (search) filtered = users.filter(u => u.name.toLowerCase().includes(search) || u.phone.includes(search));

  const el = document.getElementById('admin-clients-table');
  el.innerHTML = `<table>
    <thead><tr><th>الاسم</th><th>الهاتف</th><th>الطلبات</th><th>الحالة</th><th></th></tr></thead>
    <tbody>
      ${filtered.map(u => {
        const count = orders.filter(o => o.clientId === u.id).length;
        return `<tr>
          <td><div style="display:flex;align-items:center;gap:0.5rem"><img src="${u.avatar}" class="avatar-sm">${u.name}</div></td>
          <td>${u.phone}</td>
          <td>${count}</td>
          <td>${u.blocked ? '<span class="status-badge status-cancelled">موقوف</span>' : '<span class="status-badge status-completed">نشط</span>'}</td>
          <td>
            <button class="btn btn-sm ${u.blocked ? 'btn-success' : 'btn-danger'}" onclick="toggleBlockUser('${u.id}')">
              ${u.blocked ? 'تفعيل' : 'إيقاف'}
            </button>
          </td>
        </tr>`;
      }).join('')}
    </tbody>
  </table>`;
}

function refreshAdminCouriers() {
  const search = (document.getElementById('admin-courier-search')?.value || '').toLowerCase();
  const statusFilter = document.getElementById('admin-courier-status')?.value || 'all';
  let users = Storage.get('users', []).filter(u => u.role === 'courier');
  if (search) users = users.filter(u => u.name.toLowerCase().includes(search) || u.phone.includes(search));
  if (statusFilter === 'online') users = users.filter(u => u.online);
  if (statusFilter === 'offline') users = users.filter(u => !u.online);

  const el = document.getElementById('admin-couriers-table');
  el.innerHTML = `<table>
    <thead><tr><th>الاسم</th><th>الهاتف</th><th>التقييم</th><th>المنجزة</th><th>الأرباح</th><th>الحالة</th><th></th></tr></thead>
    <tbody>
      ${users.map(u => `
        <tr>
          <td><div style="display:flex;align-items:center;gap:0.5rem"><img src="${u.avatar}" class="avatar-sm">${u.name}</div></td>
          <td>${u.phone}</td>
          <td>⭐ ${u.rating || 5}</td>
          <td>${u.completedOrders || 0}</td>
          <td>${u.earnings || 0} ج.م</td>
          <td>
            ${u.online ? '<span class="status-badge status-completed">متصل</span>' : '<span class="status-badge status-cancelled">غير متصل</span>'}
            ${u.blocked ? ' <span class="status-badge status-cancelled">موقوف</span>' : ''}
          </td>
          <td>
            <button class="btn btn-sm ${u.blocked ? 'btn-success' : 'btn-danger'}" onclick="toggleBlockUser('${u.id}')">
              ${u.blocked ? 'تفعيل' : 'إيقاف'}
            </button>
          </td>
        </tr>
      `).join('')}
    </tbody>
  </table>`;
}

function toggleBlockUser(userId) {
  const users = Storage.get('users', []);
  const user = users.find(u => u.id === userId);
  if (user) {
    user.blocked = !user.blocked;
    Storage.set('users', users);
    showToast(user.blocked ? 'تم إيقاف الحساب' : 'تم تفعيل الحساب', 'info');
    if (user.role === 'client') refreshAdminClients();
    else refreshAdminCouriers();
  }
}

function initAdminMap() {
  setTimeout(() => {
    if (adminMap) {
      adminMap.remove();
      adminMap = null;
    }
    adminMap = L.map('admin-map-container').setView(CITY_CENTER, 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(adminMap);

    const users = Storage.get('users', []);
    const orders = Storage.get('orders', []);

    // Online couriers
    users.filter(u => u.role === 'courier' && u.online && !u.blocked).forEach(c => {
      L.marker([c.lat || CITY_CENTER[0], c.lng || CITY_CENTER[1]], {
        icon: L.divIcon({
          className: '',
          html: `<div style="background:#16a34a;color:white;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.3)"><i class="fas fa-motorcycle"></i></div>`
        })
      }).addTo(adminMap).bindPopup(`<strong>${c.name}</strong><br>⭐ ${c.rating}<br>${c.online ? 'متصل' : 'غير متصل'}`);
    });

    // Active orders
    orders.filter(o => !['completed', 'delivered', 'cancelled'].includes(o.status)).forEach(o => {
      L.marker([o.pickup.lat, o.pickup.lng], {
        icon: L.divIcon({
          className: '',
          html: `<div style="background:#0f766e;color:white;padding:3px 6px;border-radius:6px;font-size:11px;font-weight:bold">#${o.id}</div>`
        })
      }).addTo(adminMap).bindPopup(`طلب #${o.id}<br>${ORDER_STATUSES[o.status]?.label}`);
    });

    setTimeout(() => adminMap.invalidateSize(), 300);
  }, 100);
}

// ========== مساعدات ==========
function addNotification(userId, title, body, type) {
  const notifs = Storage.get('notifications', []);
  notifs.unshift({
    id: 'n' + Date.now(),
    userId, title, body, type,
    read: false,
    createdAt: new Date().toISOString()
  });
  Storage.set('notifications', notifs);
}

function showToast(msg, type = 'info') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = 'toast ' + type;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 3000);
}

function setupModal() {
  document.getElementById('modal-close')?.addEventListener('click', closeModal);
  document.getElementById('modal')?.addEventListener('click', e => {
    if (e.target.id === 'modal') closeModal();
  });
}

function showModal(title, bodyHtml, buttons = []) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = bodyHtml;
  const footer = document.getElementById('modal-footer');
  footer.innerHTML = buttons.map((b, i) =>
    `<button class="btn ${b.class}" id="modal-btn-${i}">${b.text}</button>`
  ).join('');
  buttons.forEach((b, i) => {
    document.getElementById(`modal-btn-${i}`).onclick = b.action;
  });
  document.getElementById('modal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modal').classList.add('hidden');
}

// Global for inline handlers
window.openOrderDetails = openOrderDetails;
window.openTrack = openTrack;
window.cancelOrder = cancelOrder;
window.showRatingModal = showRatingModal;
window.acceptOrder = acceptOrder;
window.rejectOrder = rejectOrder;
window.openExecute = openExecute;
window.advanceOrder = advanceOrder;
window.adminApproveOrder = adminApproveOrder;
window.adminRejectOrder = adminRejectOrder;
window.toggleBlockUser = toggleBlockUser;
window.logout = logout;
