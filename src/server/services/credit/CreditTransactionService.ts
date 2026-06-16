import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export interface CreateTransactionParams {
  ledgerId: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  type: 'GRANT' | 'PURCHASE' | 'RESERVE' | 'DEDUCT' | 'REFUND' | 'SUBSCRIPTION' | 'BONUS';
  referenceId?: string;
  description?: string;
}

export class CreditTransactionService {
  static async logTransaction(txClient: Prisma.TransactionClient, params: CreateTransactionParams) {
    return txClient.creditTransaction.create({
      data: {
        ledgerId: params.ledgerId,
        amount: params.amount,
        balanceBefore: params.balanceBefore,
        balanceAfter: params.balanceAfter,
        type: params.type,
        referenceId: params.referenceId || null,
        description: params.description || null,
      },
    });
  }

  static async getTransactionHistory(userId: string) {
    return db.creditTransaction.findMany({
      where: {
        ledger: {
          userId,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
