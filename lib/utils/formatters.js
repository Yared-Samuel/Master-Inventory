/**
 * Formats quantity values for display with appropriate measurement units
 * @param {number} quantity - Raw quantity value (in sub-units)
 * @param {object} product - Product object with measurement information
 * @returns {string} Formatted quantity string
 */
export function formatQuantityWithUnits(quantity, product) {
    // Handle missing data
    if (!product || quantity == null) return quantity?.toString() || '';
    
    // Check if product has sub-measurement
    const hasSubMeasurement = 
      product.sub_measurment_name && 
      product.sub_measurment_value;
    
    // If no sub-measurement, just show quantity with main unit
    if (!hasSubMeasurement) {
      return `${quantity} ${product.measurment_name || ''}`;
    }
    
    // Calculate whole units and remainder
    const subUnitsPerMainUnit = product.sub_measurment_value;
    const wholeMainUnits = Math.floor(quantity / subUnitsPerMainUnit);
    const remainderSubUnits = Math.round(quantity % subUnitsPerMainUnit);
    
    // Format based on values
    if (wholeMainUnits > 0 && remainderSubUnits > 0) {
      // Has both whole units and remainder
      return `${wholeMainUnits} ${product.measurment_name} and ${remainderSubUnits} ${product.sub_measurment_name}`;
    } else if (wholeMainUnits > 0) {
      // Has only whole units
      return `${wholeMainUnits} ${product.measurment_name}`;
    } else {
      // Has only sub-units (less than 1 main unit)
      return `${remainderSubUnits} ${product.sub_measurment_name}`;
    }
  }