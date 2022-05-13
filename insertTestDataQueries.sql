INSERT INTO pets.pet
SELECT g.id, g.id, 0, 0, 'Updated', CURRENT_TIMESTAMP, 'PetStore.Pet.Api'
FROM generate_series(1, 10000) AS g (id) ;


INSERT INTO orders.order
SELECT g.id, g.id, 0, '2022-03-06T02:17:43.314Z', 0, true, current_timestamp, 'PetStore.Store.Api'
FROM generate_series(1, 10000) AS g (id) ;


INSERT INTO users.user
SELECT g.id, g.id, 'test', 'string', 'string', 'string', 'string', 'string', 0, current_timestamp, 'PetStore.User.Api'
FROM generate_series(1, 10000) AS g (id) ;