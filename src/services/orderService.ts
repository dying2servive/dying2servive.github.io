import { CryptoUtils } from '@/utils/crypto';

export interface CreateOrderRequest {
  app_order_id: string;
  user_id: string;
  price: number;
  description: string;
  payment_type: 'h5' | 'native';
  recipient_name: string;
  phone_number: string;
  address: string;
  quantity: number;
}

export interface OrderResponse {
  order_id: string;
  app_order_id: string;
  amount: number;
  price: number;
  qrcode_url: string;
}

export interface OrderStatusResponse {
  order_id: string;
  app_order_id: string;
  status: string; // PENDING, PAID, FAILED, REFUNDED
  amount: number;
  price?: number;
  description: string;
  quantity?: number;
  paid_at?: string;
  tracking_number?: string;
}

export class OrderService {
  private static readonly CreateOrderUrl = import.meta.env.VITE_ORDER_SYSTEM_CREATE_ORDER_URL || '';
  private static readonly QueryOrderUrl = import.meta.env.VITE_ORDER_SYSTEM_CREATE_ORDER_URL || ''; // reusing the same base URL since they are on the same route group
  private static readonly APP_ID = import.meta.env.VITE_ORDER_SYSTEM_APP_ID || '';
  private static readonly APP_SECRET = import.meta.env.VITE_ORDER_SYSTEM_APP_SECRET || '';

  static async createOrder(payload: CreateOrderRequest): Promise<OrderResponse> {
    const encryptedBody = CryptoUtils.encrypt(payload, this.APP_SECRET);

    if (!this.CreateOrderUrl) {
      throw new Error('Order system create order URL is not configured');
    }

    if (!this.APP_ID) {
      throw new Error('Order system app ID is not configured');
    }

    if (!this.APP_SECRET) {
      throw new Error('Order system app secret is not configured');
    }

    const response = await fetch(`${this.CreateOrderUrl}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain', // sending raw encrypted string
        'X-App-Id': this.APP_ID
      },
      body: encryptedBody
    });

    if (!response.ok) {
      throw new Error(`Order creation failed: ${response.statusText}`);
    }

    const encryptedResponse = await response.text();
    const decryptedData = CryptoUtils.decrypt(encryptedResponse, this.APP_SECRET);
    console.log('Decrypted Response:', decryptedData);
    if (decryptedData.code !== 0) {
      throw new Error(decryptedData.message || 'Order creation failed');
    }

    return decryptedData.data;
  }

  static async queryOrder(params: { app_order_id?: string; phone_number?: string }): Promise<OrderStatusResponse[]> {
    if (!this.QueryOrderUrl || !this.APP_ID || !this.APP_SECRET) {
      throw new Error('Order system is not configured properly');
    }

    const searchParams = new URLSearchParams();
    if (params.app_order_id) searchParams.append('app_order_id', params.app_order_id);
    if (params.phone_number) searchParams.append('phone_number', params.phone_number);

    const response = await fetch(`${this.QueryOrderUrl}?${searchParams.toString()}`, {
      method: 'GET',
      headers: {
        'X-App-Id': this.APP_ID
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Order not found');
      }
      throw new Error(`Order query failed: ${response.statusText}`);
    }

    const encryptedResponse = await response.text();
    const decryptedData = CryptoUtils.decrypt(encryptedResponse, this.APP_SECRET);
    
    if (decryptedData.code !== 0) {
      throw new Error(decryptedData.message || 'Order query failed');
    }

    return decryptedData.data;
  }

  // --- Admin API ---
  private static readonly AdminQueryOrderUrl = import.meta.env.VITE_ORDER_SYSTEM_ADMIN_QUERY_ORDER_URL;
  private static readonly AdminShipOrderUrl = import.meta.env.VITE_ORDER_SYSTEM_ADMIN_SHIP_ORDER_URL;
  private static readonly AdminCancelShipOrderUrl = import.meta.env.VITE_ORDER_SYSTEM_ADMIN_CANCEL_SHIP_ORDER_URL;
  private static readonly AdminToken = 'Bearer my_super_secret_mvp_token'; // Should be from env/auth in real world

  static async adminGetOrders(params: { page?: number, limit?: number, status?: string, search?: string, start_date?: string, end_date?: string }) {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.status) searchParams.append('status', params.status);
    if (params.search) searchParams.append('search', params.search);
    if (params.start_date) searchParams.append('start_date', params.start_date);
    if (params.end_date) searchParams.append('end_date', params.end_date);

    const response = await fetch(`${this.AdminQueryOrderUrl}?${searchParams.toString()}`, {
      headers: {
        'Authorization': this.AdminToken
      }
    });
    if (!response.ok) throw new Error('Failed to fetch orders');
    return response.json();
  }

  static async adminShipOrder(orderId: string, trackingNumber: string) {
    const url = this.AdminShipOrderUrl.replace(':order_id', orderId);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.AdminToken
      },
      body: JSON.stringify({ tracking_number: trackingNumber })
    });
    if (!response.ok) throw new Error('Failed to ship order');
    return response.json();
  }

  static async adminCancelShipOrder(orderId: string) {
    const url = this.AdminCancelShipOrderUrl.replace(':order_id', orderId);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': this.AdminToken
      }
    });
    if (!response.ok) throw new Error('Failed to cancel shipping');
    return response.json();
  }
}
