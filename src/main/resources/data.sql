-- One admin user, named admin1 with passwor 4dm1n and authority admin
INSERT INTO authorities(id,authority) VALUES (1,'ADMIN');
INSERT INTO appusers(id,username,name,birthDate,joined,password,image,email,authority) VALUES (1,'admin1','Bedilia Estrada','1990-05-12','2017-01-15','$2a$10$nMmTWAhPTqXqLDJTag3prumFrAJpsYtroxf0ojesFYq0k4PmcbWUS','https://example.com/img/bedilia.png','bedilia@saboteur.es',1);

-- Ten player users, named player1 with passwor 0wn3r
INSERT INTO authorities(id,authority) VALUES (2,'PLAYER');
INSERT INTO appusers(id,username,name,birthDate,joined, password,image,email,authority) VALUES (4,'Carlosbox2k','Carlos Borrego Ortiz','2005-02-04','2017-01-15','$2a$10$DaS6KIEfF5CRTFrxIoGc7emY3BpZZ0.fVjwA3NiJ.BjpGNmocaS3e','https://example.com/img/carlos.png', 'carlos@saboteur.es', 2);
INSERT INTO appusers(id,username,name,birthDate,joined,password,image,email,authority) VALUES (5,'mantecaoHacker','Marcos Ángel Ayala Blanco','2005-03-12','2017-01-15','$2a$10$DaS6KIEfF5CRTFrxIoGc7emY3BpZZ0.fVjwA3NiJ.BjpGNmocaS3e','https://example.com/img/marcos.png', 'marcos@saboteur.es', 2); -- Probar Null en la imagen para probar que funciona el defaultProfile en los usuarios por defecto

--Datos para probar Ranking (5 jugadores ficticios)

INSERT INTO appusers(id, username, name, birthDate, joined, password, image, email, authority) 
VALUES (11, 'MineroPro', 'Minero Profesional', '1995-05-05', '2023-01-01 10:00:00', 
        '$2a$10$DaS6KIEfF5CRTFrxIoGc7emY3BpZZ0.fVjwA3NiJ.BjpGNmocaS3e', 
        'https://api.dicebear.com/7.x/adventurer/svg?seed=Minero', 'minero@saboteur.es', 2);

INSERT INTO player(id, played_games, won_games, acquired_gold_nuggets, built_paths, destroyed_paths, is_watcher, people_damaged, people_repaired) 
VALUES (11, 50, 45, 120, 200, 10, false, 5, 5);



INSERT INTO appusers(id, username, name, birthDate, joined, password, image, email, authority) 
VALUES (12, 'SaboteadorX', 'Saboteador Experto', '1998-08-20', '2023-02-15 14:30:00', 
        '$2a$10$DaS6KIEfF5CRTFrxIoGc7emY3BpZZ0.fVjwA3NiJ.BjpGNmocaS3e', 
        'https://api.dicebear.com/7.x/adventurer/svg?seed=Sabo', 'sabo@saboteur.es', 2);

INSERT INTO player(id, played_games, won_games, acquired_gold_nuggets, built_paths, destroyed_paths, is_watcher, people_damaged, people_repaired) 
VALUES (12, 40, 20, 50, 100, 50, false, 10, 2);



INSERT INTO appusers(id, username, name, birthDate, joined, password, image, email, authority) 
VALUES (13, 'PicoRoto', 'Novato del Pico', '2000-12-12', '2024-01-01 09:00:00', 
        '$2a$10$DaS6KIEfF5CRTFrxIoGc7emY3BpZZ0.fVjwA3NiJ.BjpGNmocaS3e', 
        'https://api.dicebear.com/7.x/adventurer/svg?seed=Pico', 'pico@saboteur.es', 2);

INSERT INTO player(id, played_games, won_games, acquired_gold_nuggets, built_paths, destroyed_paths, is_watcher, people_damaged, people_repaired) 
VALUES (13, 10, 2, 5, 20, 2, false, 1, 0);


INSERT INTO appusers(id, username, name, birthDate, joined, password, image, email, authority) 
VALUES (14, 'Exploradora_99', 'Dora la Exploradora', '1999-09-09', '2024-03-10 16:20:00', 
        '$2a$10$DaS6KIEfF5CRTFrxIoGc7emY3BpZZ0.fVjwA3NiJ.BjpGNmocaS3e', 
        'https://api.dicebear.com/7.x/adventurer/svg?seed=Explora', 'explora@saboteur.es', 2);

INSERT INTO player(id, played_games, won_games, acquired_gold_nuggets, built_paths, destroyed_paths, is_watcher, people_damaged, people_repaired) 
VALUES (14, 12, 8, 15, 45, 2, false, 3, 1);


INSERT INTO appusers(id, username, name, birthDate, joined, password, image, email, authority) 
VALUES (15, 'PepitaHunter', 'Cazador de Oro', '2001-01-01', '2024-05-01 12:00:00', 
        '$2a$10$DaS6KIEfF5CRTFrxIoGc7emY3BpZZ0.fVjwA3NiJ.BjpGNmocaS3e', 
        'https://api.dicebear.com/7.x/adventurer/svg?seed=Hunter', 'hunter@saboteur.es', 2);

INSERT INTO player(id, played_games, won_games, acquired_gold_nuggets, built_paths, destroyed_paths, is_watcher, people_damaged, people_repaired) 
VALUES (15, 5, 2, 5, 10, 1, false, 0, 0);



INSERT INTO chat (id) VALUES (1);
INSERT INTO chat (id) VALUES (2);

-- Jugadores por defecto
INSERT INTO player(id, played_games, won_games, destroyed_paths, built_paths, acquired_Gold_Nuggets, is_Watcher, people_damaged, people_repaired ) VALUES (4, 100, 10, 0, 0, 0, false, 5, 3);
INSERT INTO player(id, played_games, won_games, destroyed_paths, built_paths, acquired_Gold_Nuggets, is_Watcher, people_damaged, people_repaired ) VALUES (5, 0, 0, 0, 0, 0, false, 5, 3);

--Requests por defecto

--INSERT INTO request(id, status, sender_id, receiver_id) VALUES (1, 'PENDING', 4, 5);

INSERT INTO deck (id) VALUES (1);
INSERT INTO deck (id) VALUES (2);

INSERT INTO active_Player (candle_state, cart_state,  deck_id, gold_nugget, id, pickaxe_state, rol) values (false, false, 1,  0, 4, false, true);
INSERT INTO active_Player (candle_state, cart_state,  deck_id, gold_nugget, id, pickaxe_state, rol) values (false, false, 2,  0, 5, false, true);


INSERT INTO message (id, chat_id, content, active_player_id) values ( 1, 1, 'Welcome to the game!', 4);
INSERT INTO message (id, chat_id, content, active_player_id) values ( 2, 2, 'Welcome to the game!', 4);

INSERT INTO game(chat_id, game_status, id, is_private, max_players, link, time_seconds, creator_id) values (1, 'CREATED', 1, false, 3, 'link', 0, 4);
INSERT INTO game(chat_id, game_status, id, is_private, max_players, link, time_seconds, creator_id) values (null, 'FINISHED', 2, false, 4, 'link2', 2000, 4);


INSERT INTO board (id, base, height, objective_cards_order) VALUES (1, 11, 9, 'gold,coal_1,coal_2');
INSERT INTO board (id, base, height, objective_cards_order) VALUES (2, 11, 9, 'coal_2,gold,coal_1');

INSERT INTO round (id, left_cards, winner_rol, game_id, board_id, round_number) values (1 , 13, false, 1, 
null,1);
INSERT INTO round (id, left_cards, winner_rol, game_id, board_id, round_number) VALUES (2, 13, false, 1, 2, 2);

INSERT INTO squares (id, coordinatex, coordinatey, occupation, type, board_id, card_id) 
VALUES (101, 1, 4, TRUE, 0, 1, NULL);

INSERT INTO squares (id, coordinatex, coordinatey, occupation, type, board_id, card_id) 
VALUES (102, 2, 5, FALSE, 1, 1, NULL);

-- SQUARES OBJETIVO (sin cartas asignadas - se asignarán dinámicamente en frontend)
INSERT INTO squares (id, coordinatex, coordinatey, occupation, type, board_id, card_id) 
VALUES (103, 9, 2, TRUE, 1, 1, NULL);

INSERT INTO squares (id, coordinatex, coordinatey, occupation, type, board_id, card_id) 
VALUES (104, 9, 4, TRUE, 1, 1, NULL);

INSERT INTO squares (id, coordinatex, coordinatey, occupation, type, board_id, card_id) 
VALUES (105, 9, 6, TRUE, 1, 1, NULL);

-- SQUARES OBJETIVO PARA EL BOARD 2
INSERT INTO squares (id, coordinatex, coordinatey, occupation, type, board_id, card_id) 
VALUES (106, 9, 2, TRUE, 1, 2, NULL);

INSERT INTO squares (id, coordinatex, coordinatey, occupation, type, board_id, card_id) 
VALUES (107, 9, 4, TRUE, 1, 2, NULL);

INSERT INTO squares (id, coordinatex, coordinatey, occupation, type, board_id, card_id) 
VALUES (108, 9, 6, TRUE, 1, 2, NULL);


INSERT INTO achievements (id, creator_id, threshold, badge_image, metric, description, tittle)
VALUES (200, 1, 10, 'PRUEBA', 'VICTORIES', 'Gana 10 partidas.', 'Constructor Maestro');

INSERT INTO achievements (id, creator_id, threshold, badge_image, metric, description, tittle)
VALUES (201, 1, 30, 'TEST2', 'GAMES_PLAYED', 'TEST2?', 'TEST2?');

INSERT INTO achievements (id, creator_id, threshold, badge_image, metric, description, tittle)
VALUES (202, 1, 40, 'TEST3', 'GAMES_PLAYED', 'TEST3?', 'TEST3?');

INSERT INTO achievements (id, creator_id, threshold, badge_image, metric, description, tittle)
VALUES (203, 1, 60, 'TEST4', 'GAMES_PLAYED', 'TEST4?', 'TEST4?');

INSERT INTO achievements (id, creator_id, threshold, badge_image, metric, description, tittle)
VALUES (204, 1, 20,  'TEST5', 'GAMES_PLAYED', 'TEST5?', 'TEST5?');


-- Logros para jugador
INSERT INTO accquired_achievements(achievement_id, player_id) VALUES (200, 4);



-- * ACTION CARDS *
    -- DESTROY_PICKAXE
INSERT INTO card (id, deck_id, status, image) 
VALUES (1, null, FALSE, '/images/card-images/action-cards/broken_pickaxe.png');
INSERT INTO action (id, name_action, object_affect, effect_value)  
VALUES (1, 'DESTROY', FALSE, 'DESTROY_PICKAXE');

INSERT INTO card (id, deck_id, status, image) 
VALUES (2, null, FALSE, '/images/card-images/action-cards/broken_pickaxe.png');
INSERT INTO action (id, name_action, object_affect, effect_value)  
VALUES (2, 'DESTROY', FALSE, 'DESTROY_PICKAXE');

INSERT INTO card (id, deck_id, status, image) 
VALUES (3, null, FALSE, '/images/card-images/action-cards/broken_pickaxe.png');
INSERT INTO action (id, name_action, object_affect, effect_value)  
VALUES (3, 'DESTROY', FALSE, 'DESTROY_PICKAXE');

    -- DESTROY_LAMP

INSERT INTO card (id, deck_id, status, image) 
VALUES (4, null, FALSE, '/images/card-images/action-cards/broken_candle.png');
INSERT INTO action (id, name_action, object_affect, effect_value)  
VALUES (4, 'DESTROY', FALSE, 'DESTROY_LAMP');

INSERT INTO card (id, deck_id, status, image) 
VALUES (5, null, FALSE, '/images/card-images/action-cards/broken_candle.png');
INSERT INTO action (id, name_action, object_affect, effect_value)  
VALUES (5, 'DESTROY', FALSE, 'DESTROY_LAMP');

INSERT INTO card (id, deck_id, status, image) 
VALUES (6, null, FALSE, '/images/card-images/action-cards/broken_candle.png');
INSERT INTO action (id, name_action, object_affect, effect_value)  
VALUES (6, 'DESTROY', FALSE, 'DESTROY_LAMP');

    -- DESTROY_CART

INSERT INTO card (id, deck_id, status, image) 
VALUES (7, null, FALSE, '/images/card-images/action-cards/broken_wagon.png');
INSERT INTO action (id, name_action, object_affect, effect_value)  
VALUES (7, 'DESTROY', FALSE, 'DESTROY_CART');

INSERT INTO card (id, deck_id, status, image) 
VALUES (8, null, FALSE, '/images/card-images/action-cards/broken_wagon.png');
INSERT INTO action (id, name_action, object_affect, effect_value)  
VALUES (8, 'DESTROY', FALSE, 'DESTROY_CART');

INSERT INTO card (id, deck_id, status, image) 
VALUES (9, null, FALSE, '/images/card-images/action-cards/broken_wagon.png');
INSERT INTO action (id, name_action, object_affect, effect_value)  
VALUES (9, 'DESTROY', FALSE, 'DESTROY_CART');

    -- DESTROY_TUNNEL

INSERT INTO card (id, deck_id, status, image) 
VALUES (10, null, FALSE, '/images/card-images/action-cards/collapse_card.png');
INSERT INTO action (id, name_action, object_affect, effect_value)  
VALUES (10, 'DESTROY', TRUE, 'DESTROY_TUNNEL');

INSERT INTO card (id, deck_id, status, image) 
VALUES (11, null, FALSE, '/images/card-images/action-cards/collapse_card.png');
INSERT INTO action (id, name_action, object_affect, effect_value)  
VALUES (11, 'DESTROY', TRUE, 'DESTROY_TUNNEL');

INSERT INTO card (id, deck_id, status, image) 
VALUES (12, null, FALSE, '/images/card-images/action-cards/collapse_card.png');
INSERT INTO action (id, name_action, object_affect, effect_value)  
VALUES (12, 'DESTROY', TRUE, 'DESTROY_TUNNEL');

    -- REPAIR_PICKAXE

INSERT INTO card (id, deck_id, status, image) 
VALUES (13, null, FALSE, '/images/card-images/action-cards/pickaxe.png');
INSERT INTO action (id, name_action, object_affect, effect_value)  
VALUES (13, 'REPAIR', FALSE, 'REPAIR_PICKAXE');

INSERT INTO card (id, deck_id, status, image) 
VALUES (14, null, FALSE, '/images/card-images/action-cards/pickaxe.png');
INSERT INTO action (id, name_action, object_affect, effect_value)  
VALUES (14, 'REPAIR', FALSE, 'REPAIR_PICKAXE');

INSERT INTO card (id, deck_id, status, image) 
VALUES (15, null, FALSE, '/images/card-images/action-cards/pickaxe.png');
INSERT INTO action (id, name_action, object_affect, effect_value)  
VALUES (15, 'REPAIR', FALSE, 'REPAIR_PICKAXE');

    -- REPAIR_LAMP

INSERT INTO card (id, deck_id, status, image) 
VALUES (16, null, FALSE, '/images/card-images/action-cards/candle.png');
INSERT INTO action (id, name_action, object_affect, effect_value)  
VALUES (16, 'REPAIR', FALSE, 'REPAIR_LAMP');

INSERT INTO card (id, deck_id, status, image) 
VALUES (17, null, FALSE, '/images/card-images/action-cards/candle.png');
INSERT INTO action (id, name_action, object_affect, effect_value)  
VALUES (17, 'REPAIR', FALSE, 'REPAIR_LAMP');

INSERT INTO card (id, deck_id, status, image) 
VALUES (18, null, FALSE, '/images/card-images/action-cards/candle.png');
INSERT INTO action (id, name_action, object_affect, effect_value)  
VALUES (18, 'REPAIR', FALSE, 'REPAIR_LAMP');

    -- REPAIR_CART

INSERT INTO card (id, deck_id, status, image) 
VALUES (19, null, FALSE, '/images/card-images/action-cards/wagon.png');
INSERT INTO action (id, name_action, object_affect, effect_value)  
VALUES (19, 'REPAIR', FALSE, 'REPAIR_CART');

INSERT INTO card (id, deck_id, status, image) 
VALUES (20, null, FALSE, '/images/card-images/action-cards/wagon.png');
INSERT INTO action (id, name_action, object_affect, effect_value)  
VALUES (20, 'REPAIR', FALSE, 'REPAIR_CART');

INSERT INTO card (id, deck_id, status, image) 
VALUES (21, null, FALSE, '/images/card-images/action-cards/wagon.png');
INSERT INTO action (id, name_action, object_affect, effect_value)  
VALUES (21, 'REPAIR', FALSE, 'REPAIR_CART');

    -- REPAIR_PICKAXE_LAMP

INSERT INTO card (id, deck_id, status, image)
VALUES (22, null, FALSE, '/images/card-images/action-cards/candle_pickaxe_doubleAction.png');
INSERT INTO action (id, name_action, object_affect, effect_value)  
VALUES (22, 'REPAIR', FALSE, 'REPAIR_PICKAXE_LAMP');

    -- REPAIR_PICKAXE_CART

INSERT INTO card (id, deck_id, status, image)
VALUES (23, null, FALSE, '/images/card-images/action-cards/pickaxe_wagon_doubleAction.png');
INSERT INTO action (id, name_action, object_affect, effect_value)  
VALUES (23, 'REPAIR', FALSE, 'REPAIR_PICKAXE_CART');

    -- REPAIR_LAMP_CART

INSERT INTO card (id, deck_id, status, image)
VALUES (24, null, FALSE, '/images/card-images/action-cards/wagon_candle_doubleAction.png');
INSERT INTO action (id, name_action, object_affect, effect_value)  
VALUES (24, 'REPAIR', FALSE, 'REPAIR_CART_LAMP');

    -- REVEAL

INSERT INTO card (id, deck_id, status, image)
VALUES (25, null, FALSE, '/images/card-images/action-cards/map.png');
INSERT INTO action (id, name_action, object_affect, effect_value)  
VALUES (25, 'REVEAL', FALSE, 'REVEAL');

INSERT INTO card (id, deck_id, status, image)
VALUES (26, null, FALSE, '/images/card-images/action-cards/map.png');
INSERT INTO action (id, name_action, object_affect, effect_value)  
VALUES (26, 'REVEAL', FALSE, 'REVEAL');

INSERT INTO card (id, deck_id, status, image)
VALUES (27, null, FALSE, '/images/card-images/action-cards/map.png');
INSERT INTO action (id, name_action, object_affect, effect_value)  
VALUES (27, 'REVEAL', FALSE, 'REVEAL');

INSERT INTO card (id, deck_id, status, image)
VALUES (28, null, FALSE, '/images/card-images/action-cards/map.png');
INSERT INTO action (id, name_action, object_affect, effect_value)  
VALUES (28, 'REVEAL', FALSE, 'REVEAL');

INSERT INTO card (id, deck_id, status, image)
VALUES (29, null, FALSE, '/images/card-images/action-cards/map.png');
INSERT INTO action (id, name_action, object_affect, effect_value)  
VALUES (29, 'REVEAL', FALSE, 'REVEAL');

INSERT INTO card (id, deck_id, status, image)
VALUES (30, null, FALSE, '/images/card-images/action-cards/map.png');
INSERT INTO action (id, name_action, object_affect, effect_value)  
VALUES (30, 'REVEAL', FALSE, 'REVEAL');

-- *TUNNEL CARDS*
    -- IZQUIERDA DERECHA

INSERT INTO card (id, deck_id, status, image)
VALUES (31, null, FALSE, '/images/card-images/tunnel-cards/izquierda_derecha.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (31, FALSE, FALSE, FALSE, TRUE, TRUE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (32, null, FALSE, '/images/card-images/tunnel-cards/izquierda_derecha.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (32, FALSE, FALSE, FALSE, TRUE, TRUE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (33, null, FALSE, '/images/card-images/tunnel-cards/izquierda_derecha.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (33, FALSE, FALSE, FALSE, TRUE, TRUE, FALSE);

    -- ARRIBA ABAJO IZQUIERDA DERECHA

INSERT INTO card (id, deck_id, status, image)
VALUES (34, null, FALSE, '/images/card-images/tunnel-cards/arriba_abajo_izquierda_derecha.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (34, FALSE, TRUE, TRUE, TRUE, TRUE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (35, null, FALSE, '/images/card-images/tunnel-cards/arriba_abajo_izquierda_derecha.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (35, FALSE, TRUE, TRUE, TRUE, TRUE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (36, null, FALSE, '/images/card-images/tunnel-cards/arriba_abajo_izquierda_derecha.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (36, FALSE, TRUE, TRUE, TRUE, TRUE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (37, null, FALSE, '/images/card-images/tunnel-cards/arriba_abajo_izquierda_derecha.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (37, FALSE, TRUE, TRUE, TRUE, TRUE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (38, null, FALSE, '/images/card-images/tunnel-cards/arriba_abajo_izquierda_derecha.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (38, FALSE, TRUE, TRUE, TRUE, TRUE, FALSE);

    -- ABAJO IZQUIERDA DERECHA

INSERT INTO card (id, deck_id, status, image)
VALUES (39, null, FALSE, '/images/card-images/tunnel-cards/arriba_izquierda_derecha_rotated.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (39, FALSE, FALSE, TRUE, TRUE, TRUE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (40, null, FALSE, '/images/card-images/tunnel-cards/arriba_izquierda_derecha_rotated.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (40, FALSE, FALSE, TRUE, TRUE, TRUE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (41, null, FALSE, '/images/card-images/tunnel-cards/arriba_izquierda_derecha_rotated.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (41, FALSE, FALSE, TRUE, TRUE, TRUE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (42, null, FALSE, '/images/card-images/tunnel-cards/arriba_izquierda_derecha_rotated.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro)
VALUES (42, FALSE, FALSE, TRUE, TRUE, TRUE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (43, null, FALSE, '/images/card-images/tunnel-cards/arriba_izquierda_derecha_rotated.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (43, FALSE, FALSE, TRUE, TRUE, TRUE, FALSE);

    -- ARRIBA IZQUIERDA

INSERT INTO card (id, deck_id, status, image)
VALUES (44, null, FALSE, '/images/card-images/tunnel-cards/arriba_izquierda.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (44, FALSE, TRUE, FALSE, TRUE, FALSE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (45, null, FALSE, '/images/card-images/tunnel-cards/arriba_izquierda.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (45, FALSE, TRUE, FALSE, TRUE, FALSE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (46, null, FALSE, '/images/card-images/tunnel-cards/arriba_izquierda.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (46, FALSE, TRUE, FALSE, TRUE, FALSE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (47, null, FALSE, '/images/card-images/tunnel-cards/arriba_izquierda.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (47, FALSE, TRUE, FALSE, TRUE, FALSE, FALSE);

    -- ARRIBA ABAJO IZQUIERDA

INSERT INTO card (id, deck_id, status, image)
VALUES (48, null, FALSE, '/images/card-images/tunnel-cards/arriba_abajo_derecha_rotated.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (48, FALSE, TRUE, TRUE, TRUE, FALSE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (49, null, FALSE, '/images/card-images/tunnel-cards/arriba_abajo_derecha_rotated.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (49, FALSE, TRUE, TRUE, TRUE, FALSE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (50, null, FALSE, '/images/card-images/tunnel-cards/arriba_abajo_derecha_rotated.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (50, FALSE, TRUE, TRUE, TRUE, FALSE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (51, null, FALSE, '/images/card-images/tunnel-cards/arriba_abajo_derecha_rotated.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (51, FALSE, TRUE, TRUE, TRUE, FALSE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (52, null, FALSE, '/images/card-images/tunnel-cards/arriba_abajo_derecha_rotated.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (52, FALSE, TRUE, TRUE, TRUE, FALSE, FALSE);

    -- IZQUIERDA ABAJO

INSERT INTO card (id, deck_id, status, image)
VALUES (53, null, FALSE, '/images/card-images/tunnel-cards/arriba_derecha_rotated.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (53, FALSE, FALSE, TRUE, TRUE, FALSE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (54, null, FALSE, '/images/card-images/tunnel-cards/arriba_derecha_rotated.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (54, FALSE, FALSE, TRUE, TRUE, FALSE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (55, null, FALSE, '/images/card-images/tunnel-cards/arriba_derecha_rotated.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (55, FALSE, FALSE, TRUE, TRUE, FALSE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (56, null, FALSE, '/images/card-images/tunnel-cards/arriba_derecha_rotated.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (56, FALSE, FALSE, TRUE, TRUE, FALSE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (57, null, FALSE, '/images/card-images/tunnel-cards/arriba_derecha_rotated.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (57, FALSE, FALSE, TRUE, TRUE, FALSE, FALSE);

    -- ARRIBA ABAJO

INSERT INTO card (id, deck_id, status, image)
VALUES (58, null, FALSE, '/images/card-images/tunnel-cards/arriba_abajo.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (58, FALSE, TRUE, TRUE, FALSE, FALSE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (59, null, FALSE, '/images/card-images/tunnel-cards/arriba_abajo.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (59, FALSE, TRUE, TRUE, FALSE, FALSE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (60, null, FALSE, '/images/card-images/tunnel-cards/arriba_abajo.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (60, FALSE, TRUE, TRUE, FALSE, FALSE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (61, null, FALSE, '/images/card-images/tunnel-cards/arriba_abajo.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (61, FALSE, TRUE, TRUE, FALSE, FALSE, FALSE);

    -- SIN SALIDA IZQUIERDA DERECHA

INSERT INTO card (id, deck_id, status, image)
VALUES (62, null, FALSE, '/images/card-images/tunnel-cards/izquierda_derecha_centro.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (62, FALSE, FALSE, FALSE, TRUE, TRUE, TRUE);

    -- SIN SALIDA ARRIBA ABAJO IZQUIERDA DERECHA

INSERT INTO card (id, deck_id, status, image)
VALUES (63, null, FALSE, '/images/card-images/tunnel-cards/arriba_abajo_izquierda_derecha_centro.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (63, FALSE, TRUE, TRUE, TRUE, TRUE, TRUE);

    -- SIN SALIDA ABAJO IZQUIERDA DERECHA

INSERT INTO card (id, deck_id, status, image)
VALUES (64, null, FALSE, '/images/card-images/tunnel-cards/abajo_izquierda_derecha_centro.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (64, FALSE, FALSE, TRUE, TRUE, TRUE, TRUE);

    -- SIN SALIDA ARRIBA IZQUIERDA

INSERT INTO card (id, deck_id, status, image)
VALUES (65, null, FALSE, '/images/card-images/tunnel-cards/arriba_izquierda_centro.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (65, FALSE, TRUE, FALSE, TRUE, FALSE, TRUE);

    -- SIN SALIDA ARRIBA ABAJO IZQUIERDA

INSERT INTO card (id, deck_id, status, image)
VALUES (66, null, FALSE, '/images/card-images/tunnel-cards/arriba_abajo_izquierda_centro.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (66, FALSE, TRUE, TRUE, TRUE, FALSE, TRUE);

    -- SIN SALIDA ABAJO IZQUIERDA

INSERT INTO card (id, deck_id, status, image)
VALUES (67, null, FALSE, '/images/card-images/tunnel-cards/abajo_izquierda_centro.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (67, FALSE, FALSE, TRUE, TRUE, FALSE, TRUE);

    -- SIN SALIDA IZQUIERDA

INSERT INTO card (id, deck_id, status, image)
VALUES (68, null, FALSE, '/images/card-images/tunnel-cards/izquierda_centro.jpeg');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (68, FALSE, FALSE, FALSE, TRUE, FALSE, TRUE);

    -- SIN SALIDA ARRIBA ABAJO

INSERT INTO card (id, deck_id, status, image)
VALUES (69, null, FALSE, '/images/card-images/tunnel-cards/arriba_abajo_centro.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (69, FALSE, TRUE, TRUE, FALSE, FALSE, TRUE);

    -- SIN SALIDA ABAJO

INSERT INTO card (id, deck_id, status, image)
VALUES (70, null, FALSE, '/images/card-images/tunnel-cards/abajo_centro.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (70, FALSE, FALSE, TRUE, FALSE, FALSE, TRUE);



    -- ROTATED: arriba_abajo_izquierda_derecha_centro (simétrica 180°)
INSERT INTO card (id, deck_id, status, image)
VALUES (71, null, FALSE, '/images/card-images/tunnel-cards/arriba_abajo_izquierda_derecha_centro_rotated.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (71, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE);

    -- ROTATED: abajo_izquierda_derecha_centro (180° → arriba_derecha_izquierda_centro)
INSERT INTO card (id, deck_id, status, image)
VALUES (72, null, FALSE, '/images/card-images/tunnel-cards/abajo_izquierda_derecha_centro_rotated.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (72, TRUE, TRUE, FALSE, TRUE, TRUE, TRUE);

    -- ROTATED: arriba_izquierda_centro (180° → abajo_derecha_centro)
INSERT INTO card (id, deck_id, status, image)
VALUES (73, null, FALSE, '/images/card-images/tunnel-cards/arriba_izquierda_centro_rotated.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (73, TRUE, FALSE, TRUE, FALSE, TRUE, TRUE);

    -- ROTATED: arriba_abajo_izquierda_centro (180° → arriba_abajo_derecha_centro)
INSERT INTO card (id, deck_id, status, image)
VALUES (74, null, FALSE, '/images/card-images/tunnel-cards/arriba_abajo_izquierda_centro_rotated.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (74, TRUE, TRUE, TRUE, FALSE, TRUE, TRUE);

    -- ROTATED: abajo_izquierda_centro (180° → arriba_derecha_centro)
INSERT INTO card (id, deck_id, status, image)
VALUES (75, null, FALSE, '/images/card-images/tunnel-cards/abajo_izquierda_centro_rotated.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (75, TRUE, TRUE, FALSE, FALSE, TRUE, TRUE);

    -- ROTATED: izquierda_derecha_centro (180° simétrica)
INSERT INTO card (id, deck_id, status, image)
VALUES (76, null, FALSE, '/images/card-images/tunnel-cards/izquierda_derecha_centro_rotated.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (76, TRUE, FALSE, FALSE, TRUE, TRUE, TRUE);

    -- ROTATED: arriba_abajo_centro (180° simétrica)
INSERT INTO card (id, deck_id, status, image)
VALUES (77, null, FALSE, '/images/card-images/tunnel-cards/arriba_abajo_centro_rotated.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (77, TRUE, TRUE, TRUE, FALSE, FALSE, TRUE);

    -- ROTATED: abajo_centro (180° → arriba_centro)
INSERT INTO card (id, deck_id, status, image)
VALUES (78, null, FALSE, '/images/card-images/tunnel-cards/abajo_centro_rotated.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (78, TRUE, TRUE, FALSE, FALSE, FALSE, TRUE);

    -- ROTATED: arriba_abajo (180° simétrica)
INSERT INTO card (id, deck_id, status, image)
VALUES (79, null, FALSE, '/images/card-images/tunnel-cards/arriba_abajo_rotated.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (79, TRUE, TRUE, TRUE, FALSE, FALSE, FALSE);

    -- ROTATED: izquierda_derecha (180° simétrica)
INSERT INTO card (id, deck_id, status, image)
VALUES (80, null, FALSE, '/images/card-images/tunnel-cards/izquierda_derecha_rotated.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (80, TRUE, FALSE, FALSE, TRUE, TRUE, FALSE);

    -- ROTATED: arriba_izquierda (180° → abajo_derecha)
INSERT INTO card (id, deck_id, status, image)
VALUES (81, null, FALSE, '/images/card-images/tunnel-cards/arriba_izquierda_rotated.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (81, TRUE, FALSE, TRUE, FALSE, TRUE, FALSE);

-- ==================== CARTAS ROTADAS ADICIONALES ====================

    -- ROTATED: izquierda_centro (180° → derecha_centro)
INSERT INTO card (id, deck_id, status, image)
VALUES (82, null, FALSE, '/images/card-images/tunnel-cards/izquierda_centro_rotated.jpeg');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (82, TRUE, FALSE, FALSE, FALSE, TRUE, TRUE);

-- *CARTAS REGULARES CON VERSIONES ROTADAS*

    -- ARRIBA IZQUIERDA DERECHA (rotated = abajo izquierda derecha)
INSERT INTO card (id, deck_id, status, image)
VALUES (83, null, FALSE, '/images/card-images/tunnel-cards/arriba_izquierda_derecha.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (83, FALSE, TRUE, FALSE, TRUE, TRUE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (84, null, FALSE, '/images/card-images/tunnel-cards/arriba_izquierda_derecha.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (84, FALSE, TRUE, FALSE, TRUE, TRUE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (85, null, FALSE, '/images/card-images/tunnel-cards/arriba_izquierda_derecha.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (85, FALSE, TRUE, FALSE, TRUE, TRUE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (86, null, FALSE, '/images/card-images/tunnel-cards/arriba_izquierda_derecha.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (86, FALSE, TRUE, FALSE, TRUE, TRUE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (87, null, FALSE, '/images/card-images/tunnel-cards/arriba_izquierda_derecha.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (87, FALSE, TRUE, FALSE, TRUE, TRUE, FALSE);

    -- ARRIBA DERECHA
INSERT INTO card (id, deck_id, status, image)
VALUES (88, null, FALSE, '/images/card-images/tunnel-cards/arriba_derecha.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (88, FALSE, TRUE, FALSE, FALSE, TRUE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (89, null, FALSE, '/images/card-images/tunnel-cards/arriba_derecha.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (89, FALSE, TRUE, FALSE, FALSE, TRUE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (90, null, FALSE, '/images/card-images/tunnel-cards/arriba_derecha.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (90, FALSE, TRUE, FALSE, FALSE, TRUE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (91, null, FALSE, '/images/card-images/tunnel-cards/arriba_derecha.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (91, FALSE, TRUE, FALSE, FALSE, TRUE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (92, null, FALSE, '/images/card-images/tunnel-cards/arriba_derecha.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (92, FALSE, TRUE, FALSE, FALSE, TRUE, FALSE);

    -- ARRIBA ABAJO DERECHA
INSERT INTO card (id, deck_id, status, image)
VALUES (93, null, FALSE, '/images/card-images/tunnel-cards/arriba_abajo_derecha.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (93, FALSE, TRUE, TRUE, FALSE, TRUE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (94, null, FALSE, '/images/card-images/tunnel-cards/arriba_abajo_derecha.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (94, FALSE, TRUE, TRUE, FALSE, TRUE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (95, null, FALSE, '/images/card-images/tunnel-cards/arriba_abajo_derecha.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (95, FALSE, TRUE, TRUE, FALSE, TRUE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (96, null, FALSE, '/images/card-images/tunnel-cards/arriba_abajo_derecha.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (96, FALSE, TRUE, TRUE, FALSE, TRUE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (97, null, FALSE, '/images/card-images/tunnel-cards/arriba_abajo_derecha.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (97, FALSE, TRUE, TRUE, FALSE, TRUE, FALSE);

    -- ABAJO DERECHA (rotación 180° de arriba_izquierda)
INSERT INTO card (id, deck_id, status, image)
VALUES (98, null, FALSE, '/images/card-images/tunnel-cards/arriba_izquierda_rotated.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (98, TRUE, FALSE, TRUE, FALSE, TRUE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (99, null, FALSE, '/images/card-images/tunnel-cards/arriba_izquierda_rotated.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (99, TRUE, FALSE, TRUE, FALSE, TRUE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (100, null, FALSE, '/images/card-images/tunnel-cards/arriba_izquierda_rotated.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (100, TRUE, FALSE, TRUE, FALSE, TRUE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (101, null, FALSE, '/images/card-images/tunnel-cards/arriba_izquierda_rotated.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (101, TRUE, FALSE, TRUE, FALSE, TRUE, FALSE);

    -- ABAJO IZQUIERDA (rotación 180° de arriba_derecha)
INSERT INTO card (id, deck_id, status, image)
VALUES (102, null, FALSE, '/images/card-images/tunnel-cards/arriba_derecha_rotated.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (102, TRUE, FALSE, TRUE, TRUE, FALSE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (103, null, FALSE, '/images/card-images/tunnel-cards/arriba_derecha_rotated.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (103, TRUE, FALSE, TRUE, TRUE, FALSE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (104, null, FALSE, '/images/card-images/tunnel-cards/arriba_derecha_rotated.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (104, TRUE, FALSE, TRUE, TRUE, FALSE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (105, null, FALSE, '/images/card-images/tunnel-cards/arriba_derecha_rotated.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (105, TRUE, FALSE, TRUE, TRUE, FALSE, FALSE);

    -- ARRIBA ABAJO IZQUIERDA (rotación 180° de arriba_abajo_derecha)
INSERT INTO card (id, deck_id, status, image)
VALUES (106, null, FALSE, '/images/card-images/tunnel-cards/arriba_abajo_derecha_rotated.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (106, TRUE, TRUE, TRUE, TRUE, FALSE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (107, null, FALSE, '/images/card-images/tunnel-cards/arriba_abajo_derecha_rotated.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (107, TRUE, TRUE, TRUE, TRUE, FALSE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (108, null, FALSE, '/images/card-images/tunnel-cards/arriba_abajo_derecha_rotated.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (108, TRUE, TRUE, TRUE, TRUE, FALSE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (109, null, FALSE, '/images/card-images/tunnel-cards/arriba_abajo_derecha_rotated.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (109, TRUE, TRUE, TRUE, TRUE, FALSE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (110, null, FALSE, '/images/card-images/tunnel-cards/arriba_abajo_derecha_rotated.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (110, TRUE, TRUE, TRUE, TRUE, FALSE, FALSE);

    -- ABAJO IZQUIERDA DERECHA (rotación 180° de arriba_izquierda_derecha)
INSERT INTO card (id, deck_id, status, image)
VALUES (111, null, FALSE, '/images/card-images/tunnel-cards/arriba_izquierda_derecha_rotated.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (111, TRUE, FALSE, TRUE, TRUE, TRUE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (112, null, FALSE, '/images/card-images/tunnel-cards/arriba_izquierda_derecha_rotated.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (112, TRUE, FALSE, TRUE, TRUE, TRUE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (113, null, FALSE, '/images/card-images/tunnel-cards/arriba_izquierda_derecha_rotated.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (113, TRUE, FALSE, TRUE, TRUE, TRUE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (114, null, FALSE, '/images/card-images/tunnel-cards/arriba_izquierda_derecha_rotated.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (114, TRUE, FALSE, TRUE, TRUE, TRUE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (115, null, FALSE, '/images/card-images/tunnel-cards/arriba_izquierda_derecha_rotated.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (115, TRUE, FALSE, TRUE, TRUE, TRUE, FALSE);

    -- ARRIBA ABAJO IZQUIERDA DERECHA ROTATED (180° simétrica)
INSERT INTO card (id, deck_id, status, image)
VALUES (116, null, FALSE, '/images/card-images/tunnel-cards/arriba_abajo_izquierda_derecha_rotated.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (116, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (117, null, FALSE, '/images/card-images/tunnel-cards/arriba_abajo_izquierda_derecha_rotated.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (117, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (118, null, FALSE, '/images/card-images/tunnel-cards/arriba_abajo_izquierda_derecha_rotated.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (118, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (119, null, FALSE, '/images/card-images/tunnel-cards/arriba_abajo_izquierda_derecha_rotated.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (119, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (120, null, FALSE, '/images/card-images/tunnel-cards/arriba_abajo_izquierda_derecha_rotated.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (120, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE);

    -- ARRIBA ABAJO ROTATED (180° simétrica)
INSERT INTO card (id, deck_id, status, image)
VALUES (121, null, FALSE, '/images/card-images/tunnel-cards/arriba_abajo_rotated.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (121, TRUE, TRUE, TRUE, FALSE, FALSE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (122, null, FALSE, '/images/card-images/tunnel-cards/arriba_abajo_rotated.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (122, TRUE, TRUE, TRUE, FALSE, FALSE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (123, null, FALSE, '/images/card-images/tunnel-cards/arriba_abajo_rotated.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (123, TRUE, TRUE, TRUE, FALSE, FALSE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (124, null, FALSE, '/images/card-images/tunnel-cards/arriba_abajo_rotated.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (124, TRUE, TRUE, TRUE, FALSE, FALSE, FALSE);

-- *OBJETIVO CARDS (ORO Y CARBÓN)*
    -- CARTAS DE CARBÓN (2 cartas - túneles curvos grises/negros)

INSERT INTO card (id, deck_id, status, image)
VALUES (125, null, FALSE, '/images/card-images/finals/carbon_1.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (125, FALSE, TRUE, FALSE, TRUE, FALSE, TRUE);

INSERT INTO card (id, deck_id, status, image)
VALUES (126, null, FALSE, '/images/card-images/finals/carbon_2.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (126, FALSE, FALSE, TRUE, TRUE, FALSE, TRUE);

    -- CARTA DE ORO (1 carta - túnel vertical con pepita dorada)

INSERT INTO card (id, deck_id, status, image)
VALUES (127, null, FALSE, '/images/card-images/finals/gold.png');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (127, FALSE, TRUE, TRUE, TRUE, TRUE, TRUE);
