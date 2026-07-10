import { promises as fs } from 'fs';
import path from 'path';
import type { PaidOrder, PaymentIntent } from '../../types/order';

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
    await fs.writeFile(this.orderPath(order.id), JSON.stringify(order, null, 2), 'utf8');
    return order;
  }

  async getOrder(id: string): Promise<PaidOrder | null> {
    try {
      const raw = await fs.readFile(this.orderPath(id), 'utf8');
      return JSON.parse(raw) as PaidOrder;
    } catch {
      return null;
    }
  }

  async findOrderByDraftId(draftId: string): Promise<PaidOrder | null> {
    await this.ensureReady();
    const files = await fs.readdir(this.rootDir);
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      try {
        const raw = await fs.readFile(path.join(this.rootDir, file), 'utf8');
        const order = JSON.parse(raw) as PaidOrder;
        if (order.draftId === draftId) return order;
      } catch {
        // skip corrupt
      }
    }
    return null;
  }

  async findOrderByRazorpayPaymentId(paymentId: string): Promise<PaidOrder | null> {
    await this.ensureReady();
    const files = await fs.readdir(this.rootDir);
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      try {
        const raw = await fs.readFile(path.join(this.rootDir, file), 'utf8');
        const order = JSON.parse(raw) as PaidOrder;
        if (order.razorpayPaymentId === paymentId) return order;
      } catch {
        // skip
      }
    }
    return null;
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
