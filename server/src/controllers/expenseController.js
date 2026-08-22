import * as expenseService from "../services/expenseService.js";

export async function createExpense(req, res, next) {
  try {
    const expense = await expenseService.createExpense(
      req.user.id,
      req.params.id,
      req.body,
    );
    return res.status(201).json({ expense });
  } catch (err) {
    return next(err);
  }
}

export async function listExpenses(req, res, next) {
  try {
    const expenses = await expenseService.listExpenses(req.user.id, req.params.id);
    return res.json({ expenses });
  } catch (err) {
    return next(err);
  }
}

export async function getBudgetSummary(req, res, next) {
  try {
    const summary = await expenseService.getBudgetSummary(req.user.id, req.params.id);
    return res.json(summary);
  } catch (err) {
    return next(err);
  }
}

export async function updateExpense(req, res, next) {
  try {
    const expense = await expenseService.updateExpense(
      req.user.id,
      req.params.expenseId,
      req.body,
    );
    return res.json({ expense });
  } catch (err) {
    return next(err);
  }
}

export async function deleteExpense(req, res, next) {
  try {
    const result = await expenseService.deleteExpense(req.user.id, req.params.expenseId);
    return res.json(result);
  } catch (err) {
    return next(err);
  }
}
