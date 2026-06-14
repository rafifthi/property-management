import type { Invoice, UtilityProduct } from "@/lib/types";

export interface PaymentProvider {
  createPaymentLink(invoice: Invoice): Promise<{ providerRef: string; paymentUrl: string }>;
}

export interface NotificationProvider {
  sendWhatsApp(input: {
    to: string;
    template: string;
    variables: Record<string, string>;
  }): Promise<{ providerRef: string; status: "logged" | "sent" }>;
}

export interface BillerProvider {
  quote(input: { product: UtilityProduct; baseAmount: number }): Promise<{
    baseAmount: number;
    platformFee: number;
    sellAmount: number;
  }>;
  fulfill(input: { product: UtilityProduct; customerRef: string }): Promise<{
    providerRef: string;
    token?: string;
    receipt: string;
  }>;
}

export class StubPaymentProvider implements PaymentProvider {
  async createPaymentLink(invoice: Invoice) {
    return {
      providerRef: `STUB-PAY-${invoice.id.toUpperCase()}`,
      paymentUrl: `https://pay.stub.local/${invoice.id}`
    };
  }
}

export class StubNotificationProvider implements NotificationProvider {
  async sendWhatsApp(input: {
    to: string;
    template: string;
    variables: Record<string, string>;
  }): Promise<{ providerRef: string; status: "logged" }> {
    return {
      providerRef: `STUB-WA-${input.template}-${input.to.replace(/\D/g, "").slice(-6)}`,
      status: "logged"
    };
  }
}

export class StubBillerProvider implements BillerProvider {
  async quote(input: { product: UtilityProduct; baseAmount: number }) {
    const flatFee = 2500;
    const percentFee = Math.round(input.baseAmount * 0.015);
    const platformFee = Math.max(flatFee, percentFee);

    return {
      baseAmount: input.baseAmount,
      platformFee,
      sellAmount: input.baseAmount + platformFee
    };
  }

  async fulfill(input: { product: UtilityProduct; customerRef: string }) {
    const token =
      input.product === "pln_token"
        ? "3719-2048-8891-6620"
        : undefined;

    return {
      providerRef: `STUB-BILLER-${input.product.toUpperCase()}-${input.customerRef.slice(-4)}`,
      token,
      receipt: `Stub receipt for ${input.product} ${input.customerRef}`
    };
  }
}
