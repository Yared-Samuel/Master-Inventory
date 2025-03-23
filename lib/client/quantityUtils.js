/**
 * Decode quantity from encoded storage format
 * @param {number} encodedValue - Encoded value from database (e.g., 1.06)
 * @param {number} subUnitsPerMainUnit - Sub-units per main unit (e.g., 24)
 * @returns {Object} Decoded values: wholeUnits and remainderSubUnits
 */
export function decodeQuantity(encodedValue, subUnitsPerMainUnit = 1) {
  if (encodedValue === undefined || encodedValue === null) {
    return { wholeUnits: 0, remainderSubUnits: 0 };
  }
  
  // Parse the encoded value to a number if it's a string
  const numericValue = typeof encodedValue === 'string' 
    ? parseFloat(encodedValue) 
    : encodedValue;
  
  if (isNaN(numericValue)) {
    return { wholeUnits: 0, remainderSubUnits: 0 };
  }
  
  // Extract whole units
  const wholeUnits = Math.floor(numericValue);
  
  // Extract fraction part and convert to remainder units
  const fraction = numericValue - wholeUnits;
  // This is important: multiply by 100 because our encoding format stores
  // bottles as hundredths (e.g., 0.06 means 6 bottles)
  const remainderSubUnits = Math.round(fraction * 100);
  
  return {
    wholeUnits,
    remainderSubUnits
  };
}

/**
 * Format a quantity for display with main and sub units
 * @param {number} encodedValue - The encoded value (e.g., 1.06)
 * @param {string} mainUnit - The main unit name (e.g., "crate")
 * @param {string} subUnit - The sub unit name (e.g., "bottle")
 * @param {number} subUnitsPerMainUnit - Sub-units per main unit (not used in display formatting)
 * @returns {string} A formatted string (e.g., "1 crate and 6 bottles")
 */
export function formatQuantity(encodedValue, mainUnit = "", subUnit = "", subUnitsPerMainUnit = 1) {
  if (!encodedValue && encodedValue !== 0) {
    return "0" + (mainUnit ? ` ${mainUnit}` : "");
  }
  
  const { wholeUnits, remainderSubUnits } = decodeQuantity(encodedValue, subUnitsPerMainUnit);
  
  if (wholeUnits > 0 && remainderSubUnits > 0 && subUnit) {
    return `${wholeUnits} ${mainUnit} and ${remainderSubUnits} ${subUnit}`;
  } else if (wholeUnits > 0) {
    return `${wholeUnits} ${mainUnit}`;
  } else if (remainderSubUnits > 0 && subUnit) {
    return `${remainderSubUnits} ${subUnit}`;
  } else {
    return `${wholeUnits} ${mainUnit}`;
  }
}

/**
 * Format a purchase quantity (showing only in main units)
 * @param {number} subUnitValue - The quantity in sub-units
 * @param {string} mainUnit - The main unit name (e.g., "crate")
 * @param {string} subUnit - The sub unit name (e.g., "bottle")
 * @param {number} subUnitsPerMainUnit - Conversion ratio (e.g., 24 bottles per crate)
 * @returns {string} A formatted string showing only main units
 */
export function formatPurchaseQuantity(subUnitValue, mainUnit = "", subUnit = "", subUnitsPerMainUnit = 0) {
  if (!subUnitValue && subUnitValue !== 0) {
    return "Something wrong" + (mainUnit ? ` ${mainUnit}` : "");
  }
  
  // Ensure numeric value
  const numericValue = typeof subUnitValue === 'string' 
    ? parseFloat(subUnitValue) 
    : subUnitValue;
  
  if (isNaN(numericValue)) {
    return "0" + (mainUnit ? ` ${mainUnit}` : "");
  }
  
  // If no sub-unit information or conversion ratio, just display with main unit
  if (!subUnit || !subUnitsPerMainUnit || subUnitsPerMainUnit <= 1) {
    return `${numericValue} ${mainUnit}`;
  }
  
  // Calculate whole main units and remainder sub-units
  const wholeMainUnits = Math.floor(numericValue / subUnitsPerMainUnit);
  const remainderSubUnits = Math.round(numericValue % subUnitsPerMainUnit);
  
  // Format based on what we have
  if (wholeMainUnits > 0 && remainderSubUnits > 0) {
    return `${wholeMainUnits} ${mainUnit} and ${remainderSubUnits} ${subUnit}`;
  } else if (wholeMainUnits > 0) {
    return `${wholeMainUnits} ${mainUnit}`;
  } else {
    return `${remainderSubUnits} ${subUnit}`;
  }
}

/**
 * Debug function to help understand what's happening with encoded values
 */
export function debugQuantity(value) {
  if (value === undefined || value === null) {
    return "undefined/null value";
  }
  
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numericValue)) {
    return `Invalid number: ${value}`;
  }
  
  const wholeUnits = Math.floor(numericValue);
  const fraction = numericValue - wholeUnits;
  const remainderSubUnits = Math.round(fraction * 100);
  
  return {
    original: value,
    asNumber: numericValue,
    wholeUnits,
    fraction,
    remainderSubUnits,
    display: `${wholeUnits} + ${remainderSubUnits}/100`
  };
}

/**
 * Formats a quantity value stored in sub-units for display
 * @param {number} subUnitValue - The quantity in sub-units
 * @param {string} mainUnit - The main unit name (e.g., "Crates")
 * @param {string} subUnit - The sub unit name (e.g., "Bottles")
 * @param {number} subUnitsPerMainUnit - Conversion ratio (e.g., 24 bottles per crate)
 * @returns {string} - Formatted display string
 */
export function formatQuantityForDisplay(subUnitValue, mainUnit, subUnit, subUnitsPerMainUnit) {
  // Handle invalid input
  if (!subUnitValue || isNaN(subUnitValue)) {
    return "0" + (mainUnit ? ` ${mainUnit}` : "");
  }
  
  // Ensure numeric value
  const numericValue = typeof subUnitValue === 'string' 
    ? parseFloat(subUnitValue) 
    : subUnitValue;
  
  // If no sub-unit information, just display the value with main unit
  if (!subUnit || !subUnitsPerMainUnit || subUnitsPerMainUnit <= 1) {
    return `${numericValue} ${mainUnit || ''}`;
  }
  
  // Calculate whole main units and remainder sub-units
  const wholeMainUnits = Math.floor(numericValue / subUnitsPerMainUnit);
  const remainderSubUnits = numericValue % subUnitsPerMainUnit;
  
  // Format based on what we have
  if (wholeMainUnits > 0 && remainderSubUnits > 0) {
    return `${wholeMainUnits} ${mainUnit} and ${remainderSubUnits} ${subUnit}`;
  } else if (wholeMainUnits > 0) {
    return `${wholeMainUnits} ${mainUnit}`;
  } else {
    return `${remainderSubUnits} ${subUnit}`;
  }
} 