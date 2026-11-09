const DISPATCH_TYPES = {
  INCOMING: 'incoming',
  OUTGOING: 'outgoing',
  INTERNAL: 'internal'
};

const DISPATCH_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  REJECTED: 'rejected'
};

const REQUEST_STATUS = {
  PENDING: '0',
  APPROVED: '1',
  REJECTED: '2'
};

const URGENCY_LEVELS = {
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent'
};

module.exports = {
  DISPATCH_TYPES,
  DISPATCH_STATUS,
  REQUEST_STATUS,
  URGENCY_LEVELS
};
