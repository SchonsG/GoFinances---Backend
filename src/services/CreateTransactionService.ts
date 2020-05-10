import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionsRepository);

    const { total } = await transactionRepository.getBalance();

    if (total < value && type === 'outcome') {
      throw new AppError('Value above the posible');
    }

    const categoryRepository = getRepository(Category);

    let categoryTransaction = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!categoryTransaction) {
      categoryTransaction = categoryRepository.create({
        title: category,
      });

      await categoryRepository.save(categoryTransaction);
    }

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category: categoryTransaction,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
