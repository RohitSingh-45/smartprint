/**
 * Human-facing labels for customer and shop UI.
 * Keep API enums out of visible copy.
 */
export function humanOrderStatus(status: string): string {
  switch (status) {
    case 'PAID':
      return 'Paid';
    case 'ACCEPTED':
      return 'Accepted';
    case 'QUEUED':
      return 'In queue';
    case 'HELD':
      return 'On hold';
    case 'READY':
    case 'READY_FOR_PRINT':
      return 'Ready to print';
    case 'PRINTING':
      return 'Printing';
    case 'COMPLETED':
      return 'Ready for pickup';
    case 'COLLECTED':
      return 'Collected';
    case 'FAILED':
      return 'Print failed';
    case 'REJECTED':
      return 'Rejected';
    case 'CANCELLED':
      return 'Cancelled';
    case 'PAYMENT_RECEIVED':
      return 'Payment received';
    case 'ORDER_ACCEPTED':
      return 'Order accepted';
    case 'IN_QUEUE':
      return 'In queue';
    case 'READY_FOR_PICKUP':
      return 'Ready for pickup';
    case 'PRINTER_FAILURE':
      return 'Printer issue';
    case 'DELAYED':
      return 'Delayed';
    case 'EXPIRED_PICKUP':
      return 'Pickup expired';
    case 'UNKNOWN':
      return 'Status unavailable';
    default:
      return status
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/^\w/, (c) => c.toUpperCase());
  }
}

export function shortId(id: string, chars = 8): string {
  if (!id) return '—';
  return id.length <= chars ? id : `${id.slice(0, chars)}…`;
}
