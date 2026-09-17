// بيانات تجريبية لمنصة توصيل العاشر من رمضان
// مركز المدينة تقريباً
const CITY_CENTER = [30.2989, 31.7414];
const CITY_BOUNDS = [
  [30.25, 31.68], // جنوب غرب
  [30.35, 31.80]  // شمال شرق
];

const ORDER_STATUSES = {
  created: { label: 'تم إنشاء الطلب', color: 'created', step: 0 },
  pending: { label: 'بانتظار موافقة الإدارة', color: 'pending', step: 1 },
  searching: { label: 'جاري البحث عن مندوب', color: 'searching', step: 2 },
  accepted: { label: 'تم قبول الطلب', color: 'accepted', step: 3 },
  to_pickup: { label: 'المندوب في الطريق إلى مكان الاستلام', color: 'to-pickup', step: 4 },
  at_pickup: { label: 'وصل المندوب إلى مكان الاستلام', color: 'at-pickup', step: 5 },
  picked: { label: 'تم استلام الشحنة', color: 'picked', step: 6 },
  to_dropoff: { label: 'المندوب في الطريق إلى مكان التسليم', color: 'to-dropoff', step: 7 },
  at_dropoff: { label: 'وصل المندوب إلى مكان التسليم', color: 'at-dropoff', step: 8 },
  delivered: { label: 'تم تسليم الطلب', color: 'delivered', step: 9 },
  completed: { label: 'تم إغلاق الطلب', color: 'completed', step: 10 },
  cancelled: { label: 'تم إلغاء الطلب', color: 'cancelled', step: -1 }
};

const PACKAGE_TYPES = {
  documents: 'مستندات',
  food: 'طعام',
  electronics: 'إلكترونيات',
  clothes: 'ملابس',
  other: 'أخرى'
};

const PAYMENT_METHODS = {
  cash: 'نقداً عند الاستلام',
  wallet: 'محفظة إلكترونية'
};

// مستخدمون تجريبيون
const DEFAULT_USERS = [
  {
    id: 'u1',
    name: 'أحمد محمد علي',
    phone: '01000000001',
    password: '123456',
    role: 'client',
    avatar: 'https://ui-avatars.com/api/?name=أحمد+محمد&background=0f766e&color=fff',
    address: 'الحي الأول، العاشر من رمضان',
    createdAt: '2025-01-10'
  },
  {
    id: 'u2',
    name: 'محمود سعيد',
    phone: '01000000002',
    password: '123456',
    role: 'courier',
    avatar: 'https://ui-avatars.com/api/?name=محمود+سعيد&background=0369a1&color=fff',
    online: false,
    rating: 4.8,
    completedOrders: 47,
    earnings: 3250,
    vehicle: 'دراجة نارية',
    lat: 30.3010,
    lng: 31.7450,
    createdAt: '2024-11-05'
  },
  {
    id: 'u3',
    name: 'سارة أحمد',
    phone: '01000000003',
    password: '123456',
    role: 'courier',
    avatar: 'https://ui-avatars.com/api/?name=سارة+أحمد&background=0369a1&color=fff',
    online: true,
    rating: 4.9,
    completedOrders: 62,
    earnings: 4100,
    vehicle: 'سيارة',
    lat: 30.2950,
    lng: 31.7380,
    createdAt: '2024-10-20'
  },
  {
    id: 'admin1',
    name: 'مدير النظام',
    phone: '01000000000',
    password: 'admin123',
    role: 'admin',
    avatar: 'https://ui-avatars.com/api/?name=Admin&background=7c3aed&color=fff'
  },
  {
    id: 'u4',
    name: 'فاطمة حسن',
    phone: '01000000004',
    password: '123456',
    role: 'client',
    avatar: 'https://ui-avatars.com/api/?name=فاطمة+حسن&background=0f766e&color=fff',
    address: 'الحي الثالث، العاشر من رمضان',
    createdAt: '2025-02-15'
  }
];

// طلبات تجريبية
const DEFAULT_ORDERS = [
  {
    id: '10254',
    clientId: 'u1',
    courierId: null,
    status: 'pending',
    pickup: {
      address: 'الحي الأول - شارع النصر، العاشر من رمضان',
      lat: 30.3020,
      lng: 31.7420
    },
    dropoff: {
      address: 'الحي الخامس - مجمع البنوك، العاشر من رمضان',
      lat: 30.2920,
      lng: 31.7350
    },
    receiver: { name: 'خالد عبدالله', phone: '01111111111' },
    package: {
      type: 'documents',
      desc: 'أوراق رسمية',
      weight: 0.5,
      size: 'small'
    },
    notes: 'يرجى التعامل بحذر',
    payment: 'cash',
    distance: 3.2,
    cost: 35,
    createdAt: new Date().toISOString(),
    timeline: [
      { status: 'created', time: new Date().toISOString() },
      { status: 'pending', time: new Date().toISOString() }
    ],
    adminNote: null,
    cancelReason: null,
    rating: null,
    comment: null
  },
  {
    id: '10253',
    clientId: 'u1',
    courierId: 'u2',
    status: 'to_dropoff',
    pickup: {
      address: 'الحي الثاني - مول العثيم، العاشر من رمضان',
      lat: 30.3050,
      lng: 31.7480
    },
    dropoff: {
      address: 'الحي الرابع - شارع الجيش، العاشر من رمضان',
      lat: 30.2880,
      lng: 31.7300
    },
    receiver: { name: 'منى إبراهيم', phone: '01222222222' },
    package: {
      type: 'electronics',
      desc: 'هاتف محمول',
      weight: 0.3,
      size: 'small'
    },
    notes: '',
    payment: 'cash',
    distance: 4.1,
    cost: 45,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    timeline: [
      { status: 'created', time: new Date(Date.now() - 3600000).toISOString() },
      { status: 'pending', time: new Date(Date.now() - 3500000).toISOString() },
      { status: 'searching', time: new Date(Date.now() - 3400000).toISOString() },
      { status: 'accepted', time: new Date(Date.now() - 3000000).toISOString() },
      { status: 'to_pickup', time: new Date(Date.now() - 2500000).toISOString() },
      { status: 'at_pickup', time: new Date(Date.now() - 2000000).toISOString() },
      { status: 'picked', time: new Date(Date.now() - 1800000).toISOString() },
      { status: 'to_dropoff', time: new Date(Date.now() - 1000000).toISOString() }
    ],
    adminNote: null,
    cancelReason: null,
    rating: null,
    comment: null
  },
  {
    id: '10250',
    clientId: 'u1',
    courierId: 'u3',
    status: 'completed',
    pickup: {
      address: 'الحي الأول - مسجد الرحمن، العاشر من رمضان',
      lat: 30.3000,
      lng: 31.7400
    },
    dropoff: {
      address: 'الحي السادس - منطقة المصانع، العاشر من رمضان',
      lat: 30.2800,
      lng: 31.7200
    },
    receiver: { name: 'يوسف محمود', phone: '01333333333' },
    package: {
      type: 'food',
      desc: 'وجبة غداء',
      weight: 1.5,
      size: 'medium'
    },
    notes: 'توصيل سريع من فضلك',
    payment: 'cash',
    distance: 5.5,
    cost: 55,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    timeline: [
      { status: 'created', time: new Date(Date.now() - 86400000).toISOString() },
      { status: 'completed', time: new Date(Date.now() - 85000000).toISOString() }
    ],
    adminNote: null,
    cancelReason: null,
    rating: 5,
    comment: 'خدمة ممتازة وسريعة'
  }
];

const DEFAULT_NOTIFICATIONS = [
  {
    id: 'n1',
    userId: 'u1',
    title: 'تم إنشاء الطلب',
    body: 'تم إنشاء طلبك رقم #10254 بنجاح وهو بانتظار موافقة الإدارة',
    type: 'order',
    read: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'n2',
    userId: 'u1',
    title: 'تحديث حالة الطلب',
    body: 'طلبك #10253 في الطريق إلى مكان التسليم',
    type: 'status',
    read: false,
    createdAt: new Date(Date.now() - 1000000).toISOString()
  }
];

// تخزين محلي
const Storage = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem('delivery_' + key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    localStorage.setItem('delivery_' + key, JSON.stringify(value));
  },
  init() {
    if (!localStorage.getItem('delivery_users')) {
      this.set('users', DEFAULT_USERS);
    }
    if (!localStorage.getItem('delivery_orders')) {
      this.set('orders', DEFAULT_ORDERS);
    }
    if (!localStorage.getItem('delivery_notifications')) {
      this.set('notifications', DEFAULT_NOTIFICATIONS);
    }
    if (!localStorage.getItem('delivery_orderCounter')) {
      this.set('orderCounter', 10255);
    }
  }
};

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function calculateCost(distanceKm, weight = 1) {
  const base = 20;
  const perKm = 8;
  const weightFee = weight > 2 ? (weight - 2) * 5 : 0;
  return Math.round(base + distanceKm * perKm + weightFee);
}

function formatDate(iso) {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function generateOrderId() {
  let counter = Storage.get('orderCounter', 10255);
  const id = String(counter);
  Storage.set('orderCounter', counter + 1);
  return id;
}
