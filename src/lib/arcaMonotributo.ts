export type MonotributoCategoryId =
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F"
  | "G"
  | "H"
  | "I"
  | "J"
  | "K";

export type MonotributoCategory = {
  category: MonotributoCategoryId;
  annualIncomeLimit: number;
  serviceIntegratedTax: number;
  sipaContribution: number;
  healthInsuranceContribution: number;
  serviceTotal: number;
};

export const MONOTRIBUTO_CATEGORIES_2026: MonotributoCategory[] = [
  {
    category: "A",
    annualIncomeLimit: 10277988.13,
    serviceIntegratedTax: 4780.46,
    sipaContribution: 15616.17,
    healthInsuranceContribution: 21990.11,
    serviceTotal: 42386.74,
  },
  {
    category: "B",
    annualIncomeLimit: 15058447.71,
    serviceIntegratedTax: 9082.88,
    sipaContribution: 17177.79,
    healthInsuranceContribution: 21990.11,
    serviceTotal: 48250.78,
  },
  {
    category: "C",
    annualIncomeLimit: 21113696.52,
    serviceIntegratedTax: 15616.17,
    sipaContribution: 18895.57,
    healthInsuranceContribution: 21990.11,
    serviceTotal: 56501.85,
  },
  {
    category: "D",
    annualIncomeLimit: 26212853.42,
    serviceIntegratedTax: 25495.79,
    sipaContribution: 20785.13,
    healthInsuranceContribution: 26133.18,
    serviceTotal: 72414.1,
  },
  {
    category: "E",
    annualIncomeLimit: 30833964.37,
    serviceIntegratedTax: 47804.6,
    sipaContribution: 22863.64,
    healthInsuranceContribution: 31869.73,
    serviceTotal: 102537.97,
  },
  {
    category: "F",
    annualIncomeLimit: 38642048.36,
    serviceIntegratedTax: 67245.13,
    sipaContribution: 25150,
    healthInsuranceContribution: 36650.19,
    serviceTotal: 129045.32,
  },
  {
    category: "G",
    annualIncomeLimit: 46211109.37,
    serviceIntegratedTax: 122379.76,
    sipaContribution: 35210,
    healthInsuranceContribution: 39518.47,
    serviceTotal: 197108.23,
  },
  {
    category: "H",
    annualIncomeLimit: 70113407.33,
    serviceIntegratedTax: 350567.04,
    sipaContribution: 49294,
    healthInsuranceContribution: 47485.89,
    serviceTotal: 447346.93,
  },
  {
    category: "I",
    annualIncomeLimit: 78479211.62,
    serviceIntegratedTax: 697150.35,
    sipaContribution: 69011.6,
    healthInsuranceContribution: 58640.31,
    serviceTotal: 824802.26,
  },
  {
    category: "J",
    annualIncomeLimit: 89872640.3,
    serviceIntegratedTax: 836580.42,
    sipaContribution: 96616.24,
    healthInsuranceContribution: 65810.99,
    serviceTotal: 999007.65,
  },
  {
    category: "K",
    annualIncomeLimit: 108357084.05,
    serviceIntegratedTax: 1171212.59,
    sipaContribution: 135262.74,
    healthInsuranceContribution: 75212.57,
    serviceTotal: 1381687.9,
  },
];

export const findSuggestedCategory = (
  annualIncome: number,
  categories: MonotributoCategory[],
) => categories.find((category) => annualIncome <= category.annualIncomeLimit) || null;

export const findCategory = (
  categoryId: MonotributoCategoryId,
  categories: MonotributoCategory[],
) => categories.find((category) => category.category === categoryId) || categories[0];
