export const INDIAN_STATES = {
  AP:'Andhra Pradesh', AR:'Arunachal Pradesh', AS:'Assam', BR:'Bihar',
  CG:'Chhattisgarh', GA:'Goa', GJ:'Gujarat', HR:'Haryana',
  HP:'Himachal Pradesh', JK:'Jammu & Kashmir', JH:'Jharkhand',
  KA:'Karnataka', KL:'Kerala', MP:'Madhya Pradesh', MH:'Maharashtra',
  MN:'Manipur', ML:'Meghalaya', MZ:'Mizoram', NL:'Nagaland',
  OD:'Odisha', PB:'Punjab', RJ:'Rajasthan', SK:'Sikkim',
  TN:'Tamil Nadu', TS:'Telangana', TR:'Tripura', UK:'Uttarakhand',
  UP:'Uttar Pradesh', WB:'West Bengal', DL:'Delhi', LA:'Ladakh',
};

export const BILL_STATUSES = [
  'SUBMITTED','LEVEL1_REVIEW','LEVEL2_REVIEW',
  'AWAITING_STATE_SIGN','AWAITING_CENTRAL_SIGN',
  'SANCTIONED','DISBURSING','DISBURSED','REJECTED','FLAGGED',
];

export const STATUS_CONFIG = {
  DRAFT:                 { label: 'Draft',             cls: 'bg-gray-100 text-gray-600' },
  SUBMITTED:             { label: 'Submitted',         cls: 'bg-blue-100 text-blue-700' },
  LEVEL1_REVIEW:         { label: 'L1 Review',         cls: 'bg-yellow-100 text-yellow-700' },
  LEVEL2_REVIEW:         { label: 'L2 Review',         cls: 'bg-yellow-100 text-yellow-700' },
  AWAITING_STATE_SIGN:   { label: '⏳ State Sign',      cls: 'bg-orange-100 text-orange-700' },
  AWAITING_CENTRAL_SIGN: { label: '⏳ Central Sign',    cls: 'bg-orange-100 text-orange-700' },
  SANCTIONED:            { label: '✓ Sanctioned',      cls: 'bg-green-100 text-green-700' },
  DISBURSING:            { label: '↻ Disbursing',      cls: 'bg-teal-100 text-teal-700' },
  DISBURSED:             { label: '✓ Disbursed',       cls: 'bg-green-100 text-green-800' },
  REJECTED:              { label: '✕ Rejected',        cls: 'bg-red-100 text-red-700' },
  FLAGGED:               { label: '⚠ AI Flagged',     cls: 'bg-red-100 text-red-700' },
};
