exports.calculateInclusive = (price, rate) => {
  const base = (price * 100) / (100 + rate);
  const tax = price - base;
  return {
    base: Number(base.toFixed(2)),
    tax: Number(tax.toFixed(2))
  };
};

exports.splitTax = (tax, vendorState, customerState) => {
  if (vendorState === customerState) {
    return {
      cgst: Number((tax / 2).toFixed(2)),
      sgst: Number((tax / 2).toFixed(2)),
      igst: 0,
      supplyType: "intra"
    };
  } else {
    return {
      cgst: 0,
      sgst: 0,
      igst: Number(tax.toFixed(2)),
      supplyType: "inter"
    };
  }
};