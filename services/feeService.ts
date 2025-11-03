
/**
 * Calculates the delivery fee based on distance and vehicle type.
 * @param distance in kilometers.
 * @param vehicle 'moto' or 'bicicleta'.
 * @returns the calculated delivery fee.
 */
export const calculateDeliveryFee = (distance: number, vehicle: 'moto' | 'bicicleta'): number => {
    const baseRate = vehicle === 'moto' ? 3.00 : 2.00;
    let calculatedFee = baseRate;

    if (distance > 5) {
        // First 3km after the initial 2km at 0.50
        const midDistanceRate = 3 * 0.50;
        // Remaining distance at 0.75
        const farDistanceRate = (distance - 5) * 0.75;
        calculatedFee += midDistanceRate + farDistanceRate;
    } else if (distance > 2) {
        calculatedFee += (distance - 2) * 0.50;
    }
    
    // Apply min and max limits
    const finalFee = Math.max(1.50, Math.min(6.00, calculatedFee));
    
    return finalFee;
};

/**
 * Calculates the app's service fee.
 * @param orderSubtotal The total value of items + total delivery fee.
 * @returns The calculated service fee (5%).
 */
export const calculateServiceFee = (orderSubtotal: number): number => {
    const SERVICE_FEE_PERCENTAGE = 0.05; // 5%
    return orderSubtotal * SERVICE_FEE_PERCENTAGE;
};