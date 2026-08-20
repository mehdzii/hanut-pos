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
        id: 'prod-nassma',
        name: 'Thé Nassma',
        name_ar: 'شاي النسمة',
        price: 18.00,
        category: 'pantry',
        image_url: '/products/the nassma.png',
        stock_quantity: 40,
        times_sold_total: 10,
        times_sold_recent: 5,
        created_at: now.toISOString()
      },
      {
        id: 'prod-vermicelle-grande',
        name: 'Vermicelle de Chine (Grande)',
        name_ar: 'شعرية صينية كبيرة',
        price: 9.00,
        category: 'pantry',
        image_url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400',
        stock_quantity: 50,
        times_sold_total: 8,
        times_sold_recent: 4,
        created_at: now.toISOString()
      },
      {
        id: 'prod-vermicelle-petite',
        name: 'Vermicelle de Chine (Petite)',
        name_ar: 'شعرية صينية صغيرة',
        price: 4.50,
        category: 'pantry',
        image_url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400',
        stock_quantity: 50,
        times_sold_total: 5,
        times_sold_recent: 2,
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
