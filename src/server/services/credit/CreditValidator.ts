export class CreditValidator {
  static validatePositiveAmount(amount: number) {
    if (amount <= 0) {
      throw new Error('Credit amount must be greater than zero.');
    }
  }

  static validateSufficientBalance(currentBalance: number, requiredAmount: number) {
    if (currentBalance < requiredAmount) {
      throw new Error(`Insufficient credits. Required: ${requiredAmount}, Available: ${currentBalance}`);
    }
  }

  static validateBalanceBounds(balance: number) {
    if (balance < 0) {
      throw new Error('Credit balance cannot fall below zero.');
    }
  }
}
