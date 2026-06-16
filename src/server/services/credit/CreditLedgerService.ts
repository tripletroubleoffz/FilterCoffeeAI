import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { CreditValidator } from './CreditValidator';
import { CreditTransactionService } from './CreditTransactionService';

export class CreditLedgerService {
  /**
   * Retrieves the current balance of a user.
   */
  static async getBalance(userId: string): Promise<number> {
    const ledger = await db.creditLedger.findUnique({
      where: { userId },
    });
    return ledger ? ledger.currentBalance : 0;
  }

  /**
   * Reserves credits for an action (e.g. upfront before calling AI).
   * Decrements currentBalance immediately to prevent double spending.
   */
  static async reserveCredits(
    userId: string,
    amount: number,
    referenceId?: string,
    description?: string
  ) {
    CreditValidator.validatePositiveAmount(amount);

    return db.$transaction(async (tx) => {
      const ledger = await this.getOrCreateLedgerWithLock(tx, userId);
      CreditValidator.validateSufficientBalance(ledger.currentBalance, amount);

      const balanceBefore = ledger.currentBalance;
      const balanceAfter = balanceBefore - amount;

      const updatedLedger = await tx.creditLedger.update({
        where: { id: ledger.id },
        data: {
          currentBalance: balanceAfter,
        },
      });

      await CreditTransactionService.logTransaction(tx, {
        ledgerId: ledger.id,
        amount,
        balanceBefore,
        balanceAfter,
        type: 'RESERVE',
        referenceId,
        description: description || 'Credits reserved for AI execution.',
      });

      return updatedLedger;
    });
  }

  /**
   * Deducts credits directly from the user's balance.
   */
  static async deductCredits(
    userId: string,
    amount: number,
    referenceId?: string,
    description?: string
  ) {
    CreditValidator.validatePositiveAmount(amount);

    return db.$transaction(async (tx) => {
      const ledger = await this.getOrCreateLedgerWithLock(tx, userId);
      CreditValidator.validateSufficientBalance(ledger.currentBalance, amount);

      const balanceBefore = ledger.currentBalance;
      const balanceAfter = balanceBefore - amount;

      const updatedLedger = await tx.creditLedger.update({
        where: { id: ledger.id },
        data: {
          currentBalance: balanceAfter,
          usedCredits: ledger.usedCredits + amount,
        },
      });

      await CreditTransactionService.logTransaction(tx, {
        ledgerId: ledger.id,
        amount,
        balanceBefore,
        balanceAfter,
        type: 'DEDUCT',
        referenceId,
        description: description || 'Credits deducted.',
      });

      return updatedLedger;
    });
  }

  /**
   * Refunds reserved or deducted credits back to the user's balance.
   */
  static async refundCredits(
    userId: string,
    amount: number,
    referenceId?: string,
    description?: string
  ) {
    CreditValidator.validatePositiveAmount(amount);

    return db.$transaction(async (tx) => {
      const ledger = await this.getOrCreateLedgerWithLock(tx, userId);

      const balanceBefore = ledger.currentBalance;
      const balanceAfter = balanceBefore + amount;

      const updatedLedger = await tx.creditLedger.update({
        where: { id: ledger.id },
        data: {
          currentBalance: balanceAfter,
          usedCredits: Math.max(0, ledger.usedCredits - amount),
        },
      });

      await CreditTransactionService.logTransaction(tx, {
        ledgerId: ledger.id,
        amount,
        balanceBefore,
        balanceAfter,
        type: 'REFUND',
        referenceId,
        description: description || 'Credits refunded.',
      });

      return updatedLedger;
    });
  }

  /**
   * Grants credits to the user (promotional or purchased).
   */
  static async grantCredits(
    userId: string,
    amount: number,
    type: 'GRANT' | 'PURCHASE' | 'SUBSCRIPTION' | 'BONUS',
    referenceId?: string,
    description?: string
  ) {
    CreditValidator.validatePositiveAmount(amount);

    return db.$transaction(async (tx) => {
      const ledger = await this.getOrCreateLedgerWithLock(tx, userId);

      const balanceBefore = ledger.currentBalance;
      const balanceAfter = balanceBefore + amount;

      const updatedData: Prisma.CreditLedgerUpdateInput = {
        currentBalance: balanceAfter,
      };

      if (type === 'PURCHASE') {
        updatedData.purchasedCredits = ledger.purchasedCredits + amount;
      } else if (type === 'BONUS' || type === 'GRANT') {
        updatedData.bonusCredits = ledger.bonusCredits + amount;
      }

      const updatedLedger = await tx.creditLedger.update({
        where: { id: ledger.id },
        data: updatedData,
      });

      await CreditTransactionService.logTransaction(tx, {
        ledgerId: ledger.id,
        amount,
        balanceBefore,
        balanceAfter,
        type,
        referenceId,
        description: description || `Granted ${amount} credits.`,
      });

      return updatedLedger;
    });
  }

  /**
   * Helper to fetch or create the credit ledger for a user and acquire a row-level write lock.
   */
  private static async getOrCreateLedgerWithLock(tx: Prisma.TransactionClient, userId: string) {
    let ledger = await tx.creditLedger.findUnique({
      where: { userId },
    });

    if (!ledger) {
      ledger = await tx.creditLedger.create({
        data: {
          userId,
          currentBalance: 0,
          usedCredits: 0,
          purchasedCredits: 0,
          bonusCredits: 0,
        },
      });
    }

    // Perform SELECT ... FOR UPDATE raw query to lock this row for the remainder of the transaction.
    const lockedLedgers = await tx.$queryRaw<any[]>`
      SELECT * FROM "CreditLedger" WHERE "userId" = ${userId} FOR UPDATE
    `;

    return lockedLedgers[0] || ledger;
  }
}
