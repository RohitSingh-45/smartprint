import { promises as fs } from 'fs';
import path from 'path';
import type { PaidOrder, PaymentIntent } from '../../types/order';
import { normalizeOrder } from '../shop/order.normalize';

export class LocalOrderStore {
  constructor(private readonly rootDir: string) {}

  async ensureReady(): Promise<void> {
    await fs.mkdir(this.rootDir, { recursive: true });
    await fs.mkdir(path.join(this.rootDir, 'intents'), { recursive: true });
  }

  private orderPath(id: string): string {
    return path.join(this.rootDir, `${id}.json`);
  }

  private intentPath(razorpayOrderId: string): string {
    return path.join(this.rootDir, 'intents', `${razorpayOrderId}.json`);
  }

  async saveOrder(order: PaidOrder): Promise<PaidOrder> {
    await this.ensureReady();
    const normalized = normalizeOrder(order);
    await fs.writeFile(this.orderPath(normalized.id), JSON.stringify(normalized, null, 2), 'utf8');
    return normalized;
  }

  async getOrder(id: string): Promise<PaidOrder | null> {
    try {
      const raw = await fs.readFile(this.orderPath(id), 'utf8');
      return normalizeOrder(JSON.parse(raw) as PaidOrder);
    } catch {
      return null;
    }
  }

  async listOrders(): Promise<PaidOrder[]> {
    await this.ensureReady();
    const files = await fs.readdir(this.rootDir);
    const orders: PaidOrder[] = [];
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      try {
        const raw = await fs.readFile(path.join(this.rootDir, file), 'utf8');
        orders.push(normalizeOrder(JSON.parse(raw) as PaidOrder));
      } catch {
        // skip corrupt
      }
    }
    return orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async findOrderByDraftId(draftId: string): Promise<PaidOrder | null> {
    const orders = await this.listOrders();
    return orders.find((order) => order.draftId === draftId) ?? null;
  }

  async findOrderByRazorpayPaymentId(paymentId: string): Promise<PaidOrder | null> {
    const orders = await this.listOrders();
    return orders.find((order) => order.razorpayPaymentId === paymentId) ?? null;
  }

  async saveIntent(intent: PaymentIntent): Promise<PaymentIntent> {
    await this.ensureReady();
    await fs.writeFile(this.intentPath(intent.razorpayOrderId), JSON.stringify(intent, null, 2), 'utf8');
    return intent;
  }

  async getIntent(razorpayOrderId: string): Promise<PaymentIntent | null> {
    try {
      const raw = await fs.readFile(this.intentPath(razorpayOrderId), 'utf8');
      return JSON.parse(raw) as PaymentIntent;
    } catch {
      return null;
    }
  }
}
