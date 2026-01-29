const pickText = (field) => field?.ValueDetection?.Text || null;

export const extractExpenseSummary = (textractResponse) => {
  const summary = {};
  const doc = textractResponse?.ExpenseDocuments?.[0];
  const fields = doc?.SummaryFields || [];

  for (const field of fields) {
    const label = field?.Type?.Text || "UNKNOWN";
    const value = pickText(field);
    if (value) {
      summary[label] = value;
    }
  }

  return summary;
};
