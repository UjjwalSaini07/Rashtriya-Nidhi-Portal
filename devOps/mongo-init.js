db = db.getSiblingDB('rnp_db');
db.createUser({ user: 'rnp_app', pwd: 'changeme_now', roles: [{ role: 'readWrite', db: 'rnp_db' }] });
db.auditlogs.createIndex({ blockNumber: 1 }, { unique: true });
db.auditlogs.createIndex({ dataHash: 1 }, { unique: true });
db.bills.createIndex({ billNumber: 1 }, { unique: true });
db.users.createIndex({ nicId: 1 }, { unique: true });
db.entities.createIndex({ nicEntityId: 1 }, { unique: true });
print('MongoDB initialized for RNP');
