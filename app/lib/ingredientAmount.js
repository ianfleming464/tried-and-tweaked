function parseSimpleFraction(value) {
  const match = value.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (!match) return null;

  const numerator = Number(match[1]);
  const denominator = Number(match[2]);
  if (!denominator) return null;

  return numerator / denominator;
}

export function parseAmountText(amountText) {
  const raw = amountText?.trim();
  if (!raw) {
    return { quantity: null, unit: null };
  }

  const mixedFraction = raw.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)\s*(.*)$/);
  if (mixedFraction) {
    const whole = Number(mixedFraction[1]);
    const numerator = Number(mixedFraction[2]);
    const denominator = Number(mixedFraction[3]);
    const unit = mixedFraction[4]?.trim() || null;
    if (denominator) {
      return {
        quantity: whole + numerator / denominator,
        unit,
      };
    }
  }

  const numberUnitMatch = raw.match(/^(\d+(?:[.,]\d+)?)\s*(.*)$/);
  if (numberUnitMatch) {
    const quantity = Number(numberUnitMatch[1].replace(',', '.'));
    if (Number.isFinite(quantity)) {
      const unit = numberUnitMatch[2]?.trim() || null;
      return { quantity, unit };
    }
  }

  const fractionUnitMatch = raw.match(/^(\d+\s*\/\s*\d+)\s*(.*)$/);
  if (fractionUnitMatch) {
    const quantity = parseSimpleFraction(fractionUnitMatch[1]);
    if (quantity !== null) {
      const unit = fractionUnitMatch[2]?.trim() || null;
      return { quantity, unit };
    }
  }

  return { quantity: null, unit: null };
}

export function toIngredientRecord(input) {
  const name = input.name?.trim() || '';
  const note = input.note?.trim() || null;
  const legacyQuantity = Number(input.quantity);
  const legacyUnit = input.unit?.trim() || null;

  let amountText = input.amountText ?? input.amount ?? null;
  amountText = amountText?.trim() || null;

  let quantity = null;
  let unit = null;

  if (amountText) {
    const parsed = parseAmountText(amountText);
    quantity = parsed.quantity;
    unit = parsed.unit;
  } else if (Number.isFinite(legacyQuantity) && legacyQuantity > 0) {
    quantity = legacyQuantity;
    unit = legacyUnit;
    amountText = `${legacyQuantity}${legacyUnit ? ` ${legacyUnit}` : ''}`;
  }

  return {
    name,
    amountText,
    quantity,
    unit,
    note,
    order: input.order,
  };
}
