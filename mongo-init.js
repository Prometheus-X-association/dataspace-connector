db = db.getSiblingDB('dataspace-connector');
db.createUser({
    user: 'connector_user',
    pwd: 'connector_password',
    roles: [{ role: 'readWrite', db: 'dataspace-connector' }]
});