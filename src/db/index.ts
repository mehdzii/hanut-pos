import Dexie, { type Table } from 'dexie';
import type { Product, Customer, Sale, CreditPayment } from '../types';

export class HanutDatabase extends Dexie {
  products!: Table<Product, string>;
  customers!: Table<Customer, string>;
  sales!: Table<Sale, string>;
  credit_payments!: Table<CreditPayment, string>;
  settings!: Table<{ key: string; value: any }, string>;

  constructor() {
    super('HanutDB');
    this.version(1).stores({
      products: 'id, name, name_ar, category, times_sold_recent, times_sold_total',
      customers: 'id, name, phone, total_owed, last_activity',
      sales: 'id, payment_method, customer_id, created_at',
      credit_payments: 'id, customer_id, created_at',
      settings: 'key'
    });
  }
}

export const db = new HanutDatabase();

// Initial database seeding helper
export async function initAndSeedDatabase() {
  const productCount = await db.products.count();
  
  if (productCount === 0) {
    const now = new Date();

    const seedProducts: Product[] = [
      {
        id: 'prod-siof-5l',
        name: 'Huile SIOF 5L',
        name_ar: 'زيت سيوف 5 لتر',
        price: 83.00,
        category: 'pantry',
        image_url: '/products/siof_5l.png',
        stock_quantity: 35,
        times_sold_total: 48,
        times_sold_recent: 15,
        created_at: now.toISOString()
      },
      {
        id: 'prod-1',
        name: 'Milk 1L (Centrale)',
        name_ar: 'حليب 1 لتر',
        price: 3.50,
        category: 'dairy',
        image_url: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&auto=format&fit=crop&q=80',
        stock_quantity: 45,
        times_sold_total: 142,
        times_sold_recent: 38,
        created_at: now.toISOString()
      },
      {
        id: 'prod-2',
        name: 'Fresh Baguette',
        name_ar: 'خبز بارزيان طازج',
        price: 1.20,
        category: 'bakery',
        image_url: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=400&auto=format&fit=crop&q=80',
        stock_quantity: 80,
        times_sold_total: 210,
        times_sold_recent: 52,
        created_at: now.toISOString()
      },
      {
        id: 'prod-3',
        name: 'Green Mint Tea 250g',
        name_ar: 'شاي أخضر بالنعناع 250غ',
        price: 12.00,
        category: 'drinks',
        image_url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400&auto=format&fit=crop&q=80',
        stock_quantity: 25,
        times_sold_total: 95,
        times_sold_recent: 24,
        created_at: now.toISOString()
      },
      {
        id: 'prod-4',
        name: 'Mineral Water 1.5L',
        name_ar: 'ماء معدني 1.5 لتر',
        price: 5.00,
        category: 'drinks',
        image_url: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=400&auto=format&fit=crop&q=80',
        stock_quantity: 60,
        times_sold_total: 180,
        times_sold_recent: 45,
        created_at: now.toISOString()
      },
      {
        id: 'prod-5',
        name: 'Extra Virgin Olive Oil 1L',
        name_ar: 'زيت زيتون بكر ممتاز 1 لتر',
        price: 75.00,
        category: 'pantry',
        image_url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&auto=format&fit=crop&q=80',
        stock_quantity: 14,
        times_sold_total: 32,
        times_sold_recent: 8,
        created_at: now.toISOString()
      },
      {
        id: 'prod-6',
        name: 'Espresso Coffee 250g',
        name_ar: 'قهوة مطحونة 250غ',
        price: 22.00,
        category: 'pantry',
        image_url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&auto=format&fit=crop&q=80',
        stock_quantity: 18,
        times_sold_total: 64,
        times_sold_recent: 16,
        created_at: now.toISOString()
      },
      {
        id: 'prod-7',
        name: 'White Sugar 1kg',
        name_ar: 'سكر أبيض 1 كجم',
        price: 10.00,
        category: 'pantry',
        image_url: 'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=400&auto=format&fit=crop&q=80',
        stock_quantity: 35,
        times_sold_total: 110,
        times_sold_recent: 29,
        created_at: now.toISOString()
      },
      {
        id: 'prod-8',
        name: 'Crunchy Potato Chips',
        name_ar: 'رقائق بطاطس مقرمشة',
        price: 6.00,
        category: 'snacks',
        image_url: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&auto=format&fit=crop&q=80',
        stock_quantity: 40,
        times_sold_total: 130,
        times_sold_recent: 34,
        created_at: now.toISOString()
      },
      {
        id: 'prod-9',
        name: 'Choco Biscuit Pack',
        name_ar: 'بسكويت الشوكولاتة',
        price: 4.50,
        category: 'snacks',
        image_url: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&auto=format&fit=crop&q=80',
        stock_quantity: 50,
        times_sold_total: 88,
        times_sold_recent: 21,
        created_at: now.toISOString()
      },
      {
        id: 'prod-10',
        name: 'Natural Fruit Yogurt',
        name_ar: 'زبادي طبيعي بالفواكه',
        price: 2.50,
        category: 'dairy',
        image_url: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&auto=format&fit=crop&q=80',
        stock_quantity: 30,
        times_sold_total: 76,
        times_sold_recent: 19,
        created_at: now.toISOString()
      },
      {
        id: 'prod-11',
        name: 'Cold Soda Can 330ml',
        name_ar: 'مشروب غازي منعش 330مل',
        price: 6.00,
        category: 'drinks',
        image_url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&auto=format&fit=crop&q=80',
        stock_quantity: 45,
        times_sold_total: 165,
        times_sold_recent: 41,
        created_at: now.toISOString()
      },
      {
        id: 'prod-12',
        name: 'Fresh Eggs (12 Pack)',
        name_ar: 'بيض طازج 12 حبة',
        price: 18.00,
        category: 'dairy',
        image_url: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=400&auto=format&fit=crop&q=80',
        stock_quantity: 22,
        times_sold_total: 92,
        times_sold_recent: 27,
        created_at: now.toISOString()
      }
    ];

    await db.products.bulkAdd(seedProducts);

    // Initial test customers
    const oldDate = new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(); // 35 days ago
    const recentDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(); // 5 days ago

    const seedCustomers: Customer[] = [
      {
        id: 'cust-1',
        name: 'أحمد بنعلي (Ahmad Benali)',
        phone: '0661234567',
        total_owed: 145.00,
        created_at: oldDate,
        last_activity: oldDate
      },
      {
        id: 'cust-2',
        name: 'فاطمة الزهراء (Fatima Zohra)',
        phone: '0662987654',
        total_owed: 85.50,
        created_at: recentDate,
        last_activity: recentDate
      },
      {
        id: 'cust-3',
        name: 'كريم منصوري (Karim Mansouri)',
        phone: '0663456789',
        total_owed: 320.00,
        created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        last_activity: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'cust-4',
        name: 'عمر الإدريسي (Omar El Idrissi)',
        phone: '0664112233',
        total_owed: 0.00,
        created_at: now.toISOString(),
        last_activity: now.toISOString()
      }
    ];

    await db.customers.bulkAdd(seedCustomers);

    // Initial sales for customer credit history demo
    const seedSales: Sale[] = [
      {
        id: 'sale-1',
        items: [
          { product_id: 'prod-5', product_name: 'Extra Virgin Olive Oil 1L', product_name_ar: 'زيت زيتون بكر ممتاز 1 لتر', price: 75.00, quantity: 2 },
          { product_id: 'prod-3', product_name: 'Green Mint Tea 250g', product_name_ar: 'شاي أخضر بالنعناع 250غ', price: 12.00, quantity: 2 },
          { product_id: 'prod-7', product_name: 'White Sugar 1kg', product_name_ar: 'سكر أبيض 1 كجم', price: 10.00, quantity: 2.5 }
        ],
        total_amount: 199.00,
        payment_method: 'credit',
        customer_id: 'cust-1',
        customer_name: 'أحمد بنعلي (Ahmad Benali)',
        created_at: oldDate
      },
      {
        id: 'sale-2',
        items: [
          { product_id: 'prod-1', product_name: 'Milk 1L', product_name_ar: 'حليب 1 لتر', price: 3.50, quantity: 3 },
          { product_id: 'prod-2', product_name: 'Fresh Baguette', product_name_ar: 'خبز بارزيان طازج', price: 1.20, quantity: 5 },
          { product_id: 'prod-4', product_name: 'Mineral Water 1.5L', product_name_ar: 'ماء معدني 1.5 لتر', price: 5.00, quantity: 4 }
        ],
        total_amount: 36.50,
        payment_method: 'credit',
        customer_id: 'cust-2',
        customer_name: 'فاطمة الزهراء (Fatima Zohra)',
        created_at: recentDate
      },
      {
        id: 'sale-3',
        items: [
          { product_id: 'prod-6', product_name: 'Espresso Coffee', product_name_ar: 'قهوة مطحونة', price: 22.00, quantity: 2 },
          { product_id: 'prod-10', product_name: 'Natural Fruit Yogurt', product_name_ar: 'زبادي طبيعي بالفواكه', price: 2.50, quantity: 2 }
        ],
        total_amount: 49.00,
        payment_method: 'credit',
        customer_id: 'cust-2',
        customer_name: 'فاطمة الزهراء (Fatima Zohra)',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    await db.sales.bulkAdd(seedSales);

    // Initial partial payment demo for Customer 1
    const seedPayments: CreditPayment[] = [
      {
        id: 'pay-1',
        customer_id: 'cust-1',
        amount: 54.00,
        created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'دفعة جزئية (Partial Payment)'
      }
    ];

    await db.credit_payments.bulkAdd(seedPayments);

    // Initial settings (Default PIN '1234', Language 'ar', Currency 'MAD', Owner Phone)
    await db.settings.bulkAdd([
      { key: 'pin_code', value: '1234' },
      { key: 'language', value: 'ar' },
      { key: 'currency', value: 'MAD' },
      { key: 'shop_name', value: 'حَانُوت البركة (Hanut Al-Baraka)' },
      { key: 'owner_phone', value: '212717393850' }
    ]);
  } else {
    await db.settings.put({ key: 'owner_phone', value: '212717393850' });
    // Always update SIOF product with official image and 83 DH price
    const existingSiof = await db.products.get('prod-siof-5l');
    if (!existingSiof) {
      await db.products.add({
        id: 'prod-siof-5l',
        name: 'Huile SIOF 5L',
        name_ar: 'زيت سيوف 5 لتر',
        price: 83.00,
        category: 'pantry',
        image_url: '/products/siof_5l.png',
        stock_quantity: 35,
        times_sold_total: 48,
        times_sold_recent: 15,
        created_at: new Date().toISOString()
      });
    } else {
      await db.products.update('prod-siof-5l', {
        price: 83.00,
        image_url: '/products/siof_5l.png'
      });
    }
  }
}
