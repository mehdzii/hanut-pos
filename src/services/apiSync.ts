import { db } from '../db';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://hanut-server.vercel.app/api';

export async function syncLocalDBToMongoDB(): Promise<boolean> {
  try {
    const products = await db.products.toArray();
    const customers = await db.customers.toArray();
    const sales = await db.sales.toArray();
    const credit_payments = await db.credit_payments.toArray();

    const response = await fetch(`${API_BASE_URL}/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        products,
        customers,
        sales,
        credit_payments
      })
    });

    const data = await response.json();
    return data.success;
  } catch (err) {
    // Silent offline fallback
    return false;
  }
}

export async function syncCloudToLocalDB(): Promise<boolean> {
  try {
    const resCusts = await fetch(`${API_BASE_URL}/customers`);
    const resProds = await fetch(`${API_BASE_URL}/products`);
    const resSales = await fetch(`${API_BASE_URL}/sales`);

    if (!resCusts.ok || !resProds.ok || !resSales.ok) return false;

    const cloudCusts = await resCusts.json();
    const cloudProds = await resProds.json();
    const cloudSales = await resSales.json();

    if (cloudCusts && Array.isArray(cloudCusts) && cloudCusts.length > 0) {
      for (const c of cloudCusts) {
        const { _id, __v, createdAt, updatedAt, ...cust } = c;
        if (cust.id) {
          await db.customers.put(cust);
        }
      }
    }

    if (cloudProds && Array.isArray(cloudProds) && cloudProds.length > 0) {
      for (const p of cloudProds) {
        const { _id, __v, createdAt, updatedAt, ...prod } = p;
        if (prod.id) {
          await db.products.put(prod);
        }
      }
    }

    if (cloudSales && Array.isArray(cloudSales) && cloudSales.length > 0) {
      for (const s of cloudSales) {
        const { _id, __v, createdAt, updatedAt, ...sale } = s;
        if (sale.id) {
          await db.sales.put(sale);
        }
      }
    }

    return true;
  } catch (err) {
    return false;
  }
}
