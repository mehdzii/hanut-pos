import { db } from '../db';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
    // Offline or server not reached: silent fallback to local IndexedDB
    return false;
  }
}
