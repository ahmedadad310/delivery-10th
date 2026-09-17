// ============================================================
// 🚚 منصة توصيل العاشر من رمضان
// Smart Demo Data + LocalStorage System
// ============================================================

// ============================================================
// بيانات المدينة
// ============================================================

const CITY_CENTER = [30.2989, 31.7414];

const CITY_BOUNDS = [
  [30.25, 31.68], // جنوب غرب
  [30.35, 31.80]  // شمال شرق
];


// ============================================================
// حالات الطلب
// ============================================================

const ORDER_STATUSES = {
  created: {
    label: 'تم إنشاء الطلب',
    color: 'created',
    step: 0
  },

  pending: {
    label: 'بانتظار موافقة الإدارة',
    color: 'pending',
    step: 1
  },

  searching: {
    label: 'جاري البحث عن مندوب',
    color: 'searching',
    step: 2
  },

  accepted: {
    label: 'تم قبول الطلب',
    color: 'accepted',
    step: 3
  },

  to_pickup: {
    label: 'المندوب في الطريق إلى مكان الاستلام',
    color: 'to-pickup',
    step: 4
  },

  at_pickup: {
    label: 'وصل المندوب إلى مكان الاستلام',
    color: 'at-pickup',
    step: 5
  },

  picked: {
    label: 'تم استلام الشحنة',
    color: 'picked',
    step: 6
  },

  to_dropoff: {
    label: 'المندوب في الطريق إلى مكان التسليم',
    color: 'to-dropoff',
    step: 7
  },

  at_dropoff: {
    label: 'وصل المندوب إلى مكان التسليم',
    color: 'at-dropoff',
    step: 8
  },

  delivered: {
    label: 'تم تسليم الطلب',
    color: 'delivered',
    step: 9
  },

  completed: {
    label: 'تم إغلاق الطلب',
    color: 'completed',
    step: 10
  },

  cancelled: {
    label: 'تم إلغاء الطلب',
    color: 'cancelled',
    step: -1
  }
};


// ============================================================
// أنواع الشحنات
// ============================================================

const PACKAGE_TYPES = {
  documents: 'مستندات',
  food: 'طعام',
  electronics: 'إلكترونيات',
  clothes: 'ملابس',
  other: 'أخرى'
};


// ============================================================
// طرق الدفع
// ============================================================

const PAYMENT_METHODS = {
  cash: 'نقداً عند الاستلام',
  wallet: 'محفظة إلكترونية'
};


// ============================================================
// 👤 المستخدمون التجريبيون
//
// عدّل هنا براحتك.
//
// مثال:
//
// name: 'محمد علاء'
// phone: '01012345678'
// password: '123456'
//
// لا تحتاج إلى مسح LocalStorage بعد ذلك.
// ============================================================

const DEFAULT_USERS = [

  // ----------------------------------------------------------
  // Client 1
  // ----------------------------------------------------------

  {
    id: 'u1',
    name: 'أحمد محمد علي',
    phone: '01000000001',
    password: '123456',
    role: 'client',

    avatar:
      'https://ui-avatars.com/api/?name=أحمد+محمد&background=0f766e&color=fff',

    address: 'الحي الأول، العاشر من رمضان',

    createdAt: '2025-01-10'
  },


  // ----------------------------------------------------------
  // Courier 1
  // ----------------------------------------------------------

  {
    id: 'u2',
    name: 'محمود سعيد',
    phone: '01000000002',
    password: '123456',
    role: 'courier',

    avatar:
      'https://ui-avatars.com/api/?name=محمود+سعيد&background=0369a1&color=fff',

    online: false,

    rating: 4.8,

    completedOrders: 47,

    earnings: 3250,

    vehicle: 'دراجة نارية',

    lat: 30.3010,

    lng: 31.7450,

    createdAt: '2024-11-05'
  },


  // ----------------------------------------------------------
  // Courier 2
  // ----------------------------------------------------------

  {
    id: 'u3',
    name: 'سارة أحمد',
    phone: '01000000003',
    password: '123456',
    role: 'courier',

    avatar:
      'https://ui-avatars.com/api/?name=سارة+أحمد&background=0369a1&color=fff',

    online: true,

    rating: 4.9,

    completedOrders: 62,

    earnings: 4100,

    vehicle: 'سيارة',

    lat: 30.2950,

    lng: 31.7380,

    createdAt: '2024-10-20'
  },


  // ----------------------------------------------------------
  // ADMIN
  //
  // 👇 عدّل بيانات الأدمن هنا
  // ----------------------------------------------------------

  {
    id: 'admin1',

    name: 'مدير النظام',

    phone: '01118855325',

    password: 'ahmedayesh7111994',

    role: 'admin',

    avatar:
      'https://ui-avatars.com/api/?name=Admin&background=7c3aed&color=fff'
  },


  // ----------------------------------------------------------
  // Client 2
  // ----------------------------------------------------------

  {
    id: 'u4',
    name: 'فاطمة حسن',
    phone: '01000000004',
    password: '123456',
    role: 'client',

    avatar:
      'https://ui-avatars.com/api/?name=فاطمة+حسن&background=0f766e&color=fff',

    address: 'الحي الثالث، العاشر من رمضان',

    createdAt: '2025-02-15'
  }

];


// ============================================================
// 📦 الطلبات التجريبية
// ============================================================

const DEFAULT_ORDERS = [

  // ----------------------------------------------------------
  // Order 10254
  // ----------------------------------------------------------

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

    receiver: {
      name: 'خالد عبدالله',
      phone: '01111111111'
    },

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

    createdAt:
      new Date().toISOString(),

    timeline: [
      {
        status: 'created',
        time: new Date().toISOString()
      },

      {
        status: 'pending',
        time: new Date().toISOString()
      }
    ],

    adminNote: null,

    cancelReason: null,

    rating: null,

    comment: null
  },


  // ----------------------------------------------------------
  // Order 10253
  // ----------------------------------------------------------

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

    receiver: {
      name: 'منى إبراهيم',
      phone: '01222222222'
    },

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

    createdAt:
      new Date(Date.now() - 3600000).toISOString(),

    timeline: [

      {
        status: 'created',
        time:
          new Date(
            Date.now() - 3600000
          ).toISOString()
      },

      {
        status: 'pending',
        time:
          new Date(
            Date.now() - 3500000
          ).toISOString()
      },

      {
        status: 'searching',
        time:
          new Date(
            Date.now() - 3400000
          ).toISOString()
      },

      {
        status: 'accepted',
        time:
          new Date(
            Date.now() - 3000000
          ).toISOString()
      },

      {
        status: 'to_pickup',
        time:
          new Date(
            Date.now() - 2500000
          ).toISOString()
      },

      {
        status: 'at_pickup',
        time:
          new Date(
            Date.now() - 2000000
          ).toISOString()
      },

      {
        status: 'picked',
        time:
          new Date(
            Date.now() - 1800000
          ).toISOString()
      },

      {
        status: 'to_dropoff',
        time:
          new Date(
            Date.now() - 1000000
          ).toISOString()
      }

    ],

    adminNote: null,

    cancelReason: null,

    rating: null,

    comment: null
  },


  // ----------------------------------------------------------
  // Order 10250
  // ----------------------------------------------------------

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

    receiver: {
      name: 'يوسف محمود',
      phone: '01333333333'
    },

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

    createdAt:
      new Date(
        Date.now() - 86400000
      ).toISOString(),

    timeline: [

      {
        status: 'created',
        time:
          new Date(
            Date.now() - 86400000
          ).toISOString()
      },

      {
        status: 'completed',
        time:
          new Date(
            Date.now() - 85000000
          ).toISOString()
      }

    ],

    adminNote: null,

    cancelReason: null,

    rating: 5,

    comment: 'خدمة ممتازة وسريعة'
  }

];


// ============================================================
// 🔔 الإشعارات التجريبية
// ============================================================

const DEFAULT_NOTIFICATIONS = [

  {
    id: 'n1',

    userId: 'u1',

    title: 'تم إنشاء الطلب',

    body:
      'تم إنشاء طلبك رقم #10254 بنجاح وهو بانتظار موافقة الإدارة',

    type: 'order',

    read: false,

    createdAt:
      new Date().toISOString()
  },


  {
    id: 'n2',

    userId: 'u1',

    title: 'تحديث حالة الطلب',

    body:
      'طلبك #10253 في الطريق إلى مكان التسليم',

    type: 'status',

    read: false,

    createdAt:
      new Date(
        Date.now() - 1000000
      ).toISOString()
  }

];


// ============================================================
// 💾 SMART LOCAL STORAGE
// ============================================================
//
// الفكرة:
//
// أول مرة:
// DEFAULT → LocalStorage
//
// بعد ذلك:
//
// DEFAULT القديم
//      ↓
// مقارنة
//      ↓
// DEFAULT الجديد
//      ↓
// تحديث تلقائي
//
// بدون DATA_VERSION
// وبدون مسح البيانات يدويًا.
// ============================================================

const Storage = {

  PREFIX: 'delivery_',


  // ==========================================================
  // GET
  // ==========================================================

  get(key, fallback) {

    try {

      const raw =
        localStorage.getItem(
          this.PREFIX + key
        );

      if (raw === null) {
        return fallback;
      }

      return JSON.parse(raw);

    } catch (error) {

      console.warn(
        `[Storage] Error reading ${key}:`,
        error
      );

      return fallback;
    }
  },


  // ==========================================================
  // SET
  // ==========================================================

  set(key, value) {

    try {

      localStorage.setItem(
        this.PREFIX + key,
        JSON.stringify(value)
      );

      return true;

    } catch (error) {

      console.error(
        `[Storage] Error saving ${key}:`,
        error
      );

      return false;
    }
  },


  // ==========================================================
  // REMOVE
  // ==========================================================

  remove(key) {

    try {

      localStorage.removeItem(
        this.PREFIX + key
      );

    } catch (error) {

      console.error(
        `[Storage] Error removing ${key}:`,
        error
      );
    }
  },


  // ==========================================================
  // CLONE
  // ==========================================================

  clone(value) {

    if (value === undefined) {
      return undefined;
    }

    return JSON.parse(
      JSON.stringify(value)
    );
  },


  // ==========================================================
  // EQUAL
  // ==========================================================

  equal(a, b) {

    try {

      return (
        JSON.stringify(a) ===
        JSON.stringify(b)
      );

    } catch {

      return false;
    }
  },


  // ==========================================================
  // IS OBJECT
  // ==========================================================

  isObject(value) {

    return (
      value !== null &&
      typeof value === 'object' &&
      !Array.isArray(value)
    );
  },


  // ==========================================================
  // SMART MERGE
  // ==========================================================
  //
  // لو القيمة الحالية = القيمة القديمة
  // معناها المستخدم لم يغيرها.
  //
  // إذن نطبق القيمة الجديدة.
  //
  // لو المستخدم غيّرها:
  // نحافظ على قيمة المستخدم.
  // ==========================================================

  smartMerge(
    oldDefault,
    newDefault,
    current
  ) {

    // --------------------------------------------------------
    // Objects
    // --------------------------------------------------------

    if (
      this.isObject(oldDefault) &&
      this.isObject(newDefault) &&
      this.isObject(current)
    ) {

      const result =
        this.clone(current);

      const keys = new Set([
        ...Object.keys(oldDefault),
        ...Object.keys(newDefault)
      ]);


      for (const key of keys) {

        const hasOld =
          Object.prototype.hasOwnProperty.call(
            oldDefault,
            key
          );

        const hasNew =
          Object.prototype.hasOwnProperty.call(
            newDefault,
            key
          );

        const hasCurrent =
          Object.prototype.hasOwnProperty.call(
            current,
            key
          );


        const oldValue =
          oldDefault[key];

        const newValue =
          newDefault[key];

        const currentValue =
          current[key];


        // ----------------------------------------------------
        // خاصية جديدة
        // ----------------------------------------------------

        if (!hasOld && hasNew) {

          if (!hasCurrent) {

            result[key] =
              this.clone(newValue);
          }

          continue;
        }


        // ----------------------------------------------------
        // خاصية تم حذفها من DEFAULT
        // ----------------------------------------------------

        if (hasOld && !hasNew) {

          if (
            !hasCurrent ||
            this.equal(
              currentValue,
              oldValue
            )
          ) {

            delete result[key];
          }

          continue;
        }


        // ----------------------------------------------------
        // Object داخل Object
        // ----------------------------------------------------

        if (
          this.isObject(oldValue) &&
          this.isObject(newValue) &&
          this.isObject(currentValue)
        ) {

          result[key] =
            this.smartMerge(
              oldValue,
              newValue,
              currentValue
            );

          continue;
        }


        // ----------------------------------------------------
        // القيمة لم يتم تعديلها
        // ----------------------------------------------------

        if (
          this.equal(
            currentValue,
            oldValue
          )
        ) {

          result[key] =
            this.clone(newValue);
        }
      }


      return result;
    }


    // ========================================================
    // Arrays
    // ========================================================

    if (
      Array.isArray(oldDefault) &&
      Array.isArray(newDefault) &&
      Array.isArray(current)
    ) {

      // لو الـ array عبارة عن Objects لها ID
      const isCollection =
        oldDefault.every(
          item =>
            item &&
            typeof item === 'object' &&
            item.id !== undefined
        ) ||
        newDefault.every(
          item =>
            item &&
            typeof item === 'object' &&
            item.id !== undefined
        );


      if (isCollection) {

        return this.mergeCollection(
          oldDefault,
          newDefault,
          current
        );
      }


      // Array عادية
      if (
        this.equal(
          current,
          oldDefault
        )
      ) {

        return this.clone(
          newDefault
        );
      }


      return this.clone(
        current
      );
    }


    // ========================================================
    // قيمة عادية
    // ========================================================

    if (
      this.equal(
        current,
        oldDefault
      )
    ) {

      return this.clone(
        newDefault
      );
    }


    // المستخدم عدلها
    return this.clone(
      current
    );
  },


  // ==========================================================
  // MERGE COLLECTION
  // ==========================================================

  mergeCollection(
    oldDefaults,
    newDefaults,
    current
  ) {

    const oldMap = new Map();

    oldDefaults.forEach(item => {

      if (
        item &&
        typeof item === 'object' &&
        item.id !== undefined
      ) {

        oldMap.set(
          String(item.id),
          item
        );
      }
    });


    const newMap = new Map();

    newDefaults.forEach(item => {

      if (
        item &&
        typeof item === 'object' &&
        item.id !== undefined
      ) {

        newMap.set(
          String(item.id),
          item
        );
      }
    });


    const currentMap = new Map();

    current.forEach((item, index) => {

      if (
        item &&
        typeof item === 'object' &&
        item.id !== undefined
      ) {

        currentMap.set(
          String(item.id),
          {
            item,
            index
          }
        );
      }
    });


    const result =
      this.clone(current);


    // ========================================================
    // تحديث / إضافة
    // ========================================================

    for (
      const [
        id,
        newItem
      ] of newMap
    ) {

      // ------------------------------------------------------
      // عنصر جديد تمامًا
      // ------------------------------------------------------

      if (!currentMap.has(id)) {

        result.push(
          this.clone(newItem)
        );

        continue;
      }


      const entry =
        currentMap.get(id);

      const currentItem =
        entry.item;


      const oldItem =
        oldMap.get(id);


      // ------------------------------------------------------
      // العنصر كان موجودًا في DEFAULT القديم
      // ------------------------------------------------------

      if (oldItem) {

        result[entry.index] =
          this.smartMerge(
            oldItem,
            newItem,
            currentItem
          );

      } else {

        // ----------------------------------------------------
        // عنصر تمت إضافته حديثًا للـ DEFAULT
        // ----------------------------------------------------

        result[entry.index] = {

          ...this.clone(newItem),

          ...currentItem

        };
      }
    }


    // ========================================================
    // حذف العناصر التي تم حذفها من DEFAULT
    // ========================================================
    //
    // نحذف فقط إذا لم يكن المستخدم قد عدل العنصر.
    // ========================================================

    for (
      let i = result.length - 1;
      i >= 0;
      i--
    ) {

      const item =
        result[i];


      if (
        !item ||
        typeof item !== 'object' ||
        item.id === undefined
      ) {
        continue;
      }


      const id =
        String(item.id);


      const oldItem =
        oldMap.get(id);


      const existsInNew =
        newMap.has(id);


      if (
        oldItem &&
        !existsInNew &&
        this.equal(
          item,
          oldItem
        )
      ) {

        result.splice(
          i,
          1
        );
      }
    }


    return result;
  },


  // ==========================================================
  // SYNC COLLECTION
  // ==========================================================

  syncCollection(
    key,
    defaults
  ) {

    const snapshotKey =
      `${key}_defaults_snapshot`;


    const current =
      this.get(
        key,
        null
      );


    const oldDefaults =
      this.get(
        snapshotKey,
        null
      );


    // ========================================================
    // أول تشغيل
    // ========================================================

    if (!Array.isArray(current)) {

      this.set(
        key,
        this.clone(defaults)
      );


      this.set(
        snapshotKey,
        this.clone(defaults)
      );


      console.log(
        `✅ [Storage] Created ${key}`
      );


      return this.clone(
        defaults
      );
    }


    // ========================================================
    // لا يوجد Snapshot قديم
    // ========================================================

    if (!Array.isArray(oldDefaults)) {

      this.set(
        snapshotKey,
        this.clone(defaults)
      );


      return current;
    }


    // ========================================================
    // Smart Merge
    // ========================================================

    const merged =
      this.mergeCollection(
        oldDefaults,
        defaults,
        current
      );


    // ========================================================
    // حفظ البيانات الجديدة
    // ========================================================

    this.set(
      key,
      merged
    );


    // ========================================================
    // حفظ Snapshot للـ DEFAULT الجديد
    // ========================================================

    this.set(
      snapshotKey,
      this.clone(defaults)
    );


    return merged;
  },


  // ==========================================================
  // SYNC VALUE
  // ==========================================================

  syncValue(
    key,
    defaultValue
  ) {

    const snapshotKey =
      `${key}_defaults_snapshot`;


    const current =
      this.get(
        key,
        undefined
      );


    const oldDefault =
      this.get(
        snapshotKey,
        undefined
      );


    // --------------------------------------------------------
    // أول تشغيل
    // --------------------------------------------------------

    if (current === undefined) {

      this.set(
        key,
        this.clone(defaultValue)
      );


      this.set(
        snapshotKey,
        this.clone(defaultValue)
      );


      return this.clone(
        defaultValue
      );
    }


    // --------------------------------------------------------
    // لا يوجد Snapshot
    // --------------------------------------------------------

    if (oldDefault === undefined) {

      this.set(
        snapshotKey,
        this.clone(defaultValue)
      );


      return current;
    }


    // --------------------------------------------------------
    // المستخدم لم يغير القيمة
    // --------------------------------------------------------

    if (
      this.equal(
        current,
        oldDefault
      )
    ) {

      this.set(
        key,
        this.clone(defaultValue)
      );

    }


    // --------------------------------------------------------
    // Snapshot الجديد
    // --------------------------------------------------------

    this.set(
      snapshotKey,
      this.clone(defaultValue)
    );


    return this.get(
      key,
      defaultValue
    );
  },


  // ==========================================================
  // INIT
  // ==========================================================

  init() {

    console.log(
      '🚚 Delivery 10th Smart Storage'
    );

    console.log(
      '🔄 Checking demo data updates...'
    );


    // ========================================================
    // USERS
    // ========================================================

    this.syncCollection(
      'users',
      DEFAULT_USERS
    );


    // ========================================================
    // ORDERS
    // ========================================================

    this.syncCollection(
      'orders',
      DEFAULT_ORDERS
    );


    // ========================================================
    // NOTIFICATIONS
    // ========================================================

    this.syncCollection(
      'notifications',
      DEFAULT_NOTIFICATIONS
    );


    // ========================================================
    // ORDER COUNTER
    // ========================================================
    //
    // لا يتم Reset للعداد.
    //
    // لأنه ممكن يكون المستخدم أنشأ طلبات حقيقية أثناء
    // استخدام التطبيق.
    // ========================================================

    const counterKey =
      this.PREFIX +
      'orderCounter';


    if (
      localStorage.getItem(
        counterKey
      ) === null
    ) {

      this.set(
        'orderCounter',
        10255
      );
    }


    console.log(
      '✅ Smart data synchronization completed.'
    );
  }

};


// ============================================================
// تشغيل نظام التخزين تلقائيًا
// ============================================================

Storage.init();


// ============================================================
// 📍 حساب المسافة
// ============================================================

function haversineDistance(
  lat1,
  lon1,
  lat2,
  lon2
) {

  const R = 6371;

  const dLat =
    (lat2 - lat1) *
    Math.PI / 180;

  const dLon =
    (lon2 - lon1) *
    Math.PI / 180;


  const a =
    Math.sin(dLat / 2) ** 2 +

    Math.cos(
      lat1 *
      Math.PI / 180
    ) *

    Math.cos(
      lat2 *
      Math.PI / 180
    ) *

    Math.sin(
      dLon / 2
    ) ** 2;


  return (
    R *
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    )
  );
}


// ============================================================
// 💰 حساب تكلفة التوصيل
// ============================================================

function calculateCost(
  distanceKm,
  weight = 1
) {

  const base = 20;

  const perKm = 8;

  const weightFee =
    weight > 2
      ? (weight - 2) * 5
      : 0;


  return Math.round(
    base +
    distanceKm * perKm +
    weightFee
  );
}


// ============================================================
// 📅 تنسيق التاريخ
// ============================================================

function formatDate(iso) {

  if (!iso) {
    return '-';
  }


  const d =
    new Date(iso);


  return d.toLocaleDateString(
    'ar-EG',
    {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }
  );
}


// ============================================================
// 🔢 إنشاء رقم طلب جديد
// ============================================================

function generateOrderId() {

  let counter =
    Storage.get(
      'orderCounter',
      10255
    );


  const id =
    String(counter);


  Storage.set(
    'orderCounter',
    counter + 1
  );


  return id;
}
