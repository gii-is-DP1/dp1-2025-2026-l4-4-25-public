-- One admin user, named admin1 with passwor 4dm1n and authority admin
INSERT INTO authorities(id,authority) VALUES (1,'ADMIN');
INSERT INTO appusers(id,username,name,birthDate,joined,password,image,email,authority) VALUES (1,'admin1','Bedilia Estrada','1990-05-12','2017-01-15','$2a$10$nMmTWAhPTqXqLDJTag3prumFrAJpsYtroxf0ojesFYq0k4PmcbWUS','https://example.com/img/bedilia.png','bedilia@saboteur.es',1);

-- Ten player users, named player1 with passwor 0wn3r
INSERT INTO authorities(id,authority) VALUES (2,'PLAYER');
INSERT INTO appusers(id,username,name,birthDate,joined, password,image,email,authority) VALUES (4,'Carlosbox2k','Carlos Borrego Ortiz','2005-02-04','2017-01-15','$2a$10$DaS6KIEfF5CRTFrxIoGc7emY3BpZZ0.fVjwA3NiJ.BjpGNmocaS3e','https://example.com/img/carlos.png', 'carlos@saboteur.es', 2);
INSERT INTO appusers(id,username,name,birthDate,joined,password,image,email,authority) VALUES (5,'mantecaoHacker','Marcos Ángel Ayala Blanco','2005-03-12','2017-01-15','$2a$10$DaS6KIEfF5CRTFrxIoGc7emY3BpZZ0.fVjwA3NiJ.BjpGNmocaS3e','https://example.com/img/marcos.png', 'marcos@saboteur.es', 2); -- Probar Null en la imagen para probar que funciona el defaultProfile en los usuarios por defecto

INSERT INTO chat (id) VALUES (1);
INSERT INTO chat (id) VALUES (2);

-- Jugadores por defecto
INSERT INTO player(id, played_games, won_games, destroyed_paths, built_paths, acquired_Gold_Nuggets, is_Watcher, people_damaged, people_repaired ) VALUES (4, 0, 0, 0, 0, 0, false, 5, 3);
INSERT INTO player(id, played_games, won_games, destroyed_paths, built_paths, acquired_Gold_Nuggets, is_Watcher, people_damaged, people_repaired ) VALUES (5, 0, 0, 0, 0, 0, false, 5, 3);



INSERT INTO deck (id) VALUES (1);
INSERT INTO deck (id) VALUES (2);

INSERT INTO active_Player (candle_state, cart_state,  deck_id, gold_nugget, id, pickaxe_state, rol) values (false, false, 1,  0, 4, false, true);
INSERT INTO active_Player (candle_state, cart_state,  deck_id, gold_nugget, id, pickaxe_state, rol) values (false, false, 2,  0, 5, false, true);


INSERT INTO message (id, chat_id, content, active_player_id) values ( 1, 1, 'Welcome to the game!', 4);
INSERT INTO message (id, chat_id, content, active_player_id) values ( 2, 2, 'Welcome to the game!', 4);

INSERT INTO game(chat_id, game_status, id, is_private, max_players, link, time_seconds, creator_id) values (1, 'CREATED', 1, false, 3, 'link', 0, 4);
INSERT INTO game(chat_id, game_status, id, is_private, max_players, link, time_seconds, creator_id) values (null, 'FINISHED', 2, false, 4, 'link2', 2000, 4);


INSERT INTO board (id, base, heigth) VALUES (1, 11, 9);
INSERT INTO board (id, base, heigth) VALUES (2, 11, 9);

INSERT INTO round (id, left_cards, winner_rol, game_id, board_id, round_number) values (1 , 13, false, 1, 
null,1);
INSERT INTO round (id, left_cards, winner_rol, game_id, board_id, round_number) VALUES (2, 13, false, 1, 2, 2);

INSERT INTO squares (id, coordinatex, coordinatey, occupation, type, board_id) 
VALUES (101, 1, 4, TRUE, 0, 1);

INSERT INTO squares (id, coordinatex, coordinatey, occupation, type, board_id) 
VALUES (102, 2, 5, FALSE, 1, 1);

INSERT INTO card (id, deck_id, status, image) 
VALUES (200, 1, TRUE, 'action_repair_pickaxe.png');

--INSERT INTO action (id, nombre_accion, objeto_afecta, valor_efecto) 
--VALUES (200, 0, FALSE, 0);

INSERT INTO achievements (id, creator_id, score, descripcion, tittle)
VALUES (200, 1, 50, 'Gana 10 partidas habiendo construido más de 20 caminos.', 'Constructor Maestro');

INSERT INTO achievements (id, creator_id, score, descripcion, tittle)
VALUES (201, 1, 30, 'TEST2', 'TEST2?');

INSERT INTO achievements (id, creator_id, score, descripcion, tittle)
VALUES (202, 1, 40, 'TEST3', 'TEST3?');

INSERT INTO achievements (id, creator_id, score, descripcion, tittle)
VALUES (203, 1, 60, 'TEST4', 'TEST4?');

INSERT INTO achievements (id, creator_id, score, descripcion, tittle)
VALUES (204, 1, 20, 'TEST5', 'TEST5?');





INSERT INTO card (id, deck_id, status, image) 
VALUES (205, 1, TRUE, 'action_repair_pickaxe.png');
INSERT INTO action (id, name_action, object_affect, effect_value) 
VALUES (205, 'REPAIR', FALSE, 'REPAIR_PICKAXE'); -- ENUMS como STRING, FALSE como booleano.

-- * INSERCIÓN ID 2 (PARA ELIMINAR) *
INSERT INTO card (id, deck_id, status, image) 
VALUES (300, 1, TRUE, 'action_destroy_cart.png');
INSERT INTO action (id, name_action, object_affect, effect_value)  
VALUES (300, 'DESTROY', FALSE, 'DESTROY_CART');

-- * ACTION CARDS *
    -- DESTROY_PICKAXE
INSERT INTO card (id, deck_id, status, image) 
VALUES (1, null, FALSE, 'a');
INSERT INTO action (id, name_action, object_affect, effect_value)  
VALUES (1, 'DESTROY', FALSE, 'DESTROY_PICKAXE');

INSERT INTO card (id, deck_id, status, image) 
VALUES (2, null, FALSE, 'a');
INSERT INTO action (id, name_action, object_affect, effect_value)  
VALUES (2, 'DESTROY', FALSE, 'DESTROY_PICKAXE');

INSERT INTO card (id, deck_id, status, image) 
VALUES (3, null, FALSE, 'a');
INSERT INTO action (id, name_action, object_affect, effect_value)  
VALUES (3, 'DESTROY', FALSE, 'DESTROY_PICKAXE');

    -- DESTROY_LAMP

INSERT INTO card (id, deck_id, status, image) 
VALUES (4, null, FALSE, 'a');
INSERT INTO action (id, name_action, object_affect, effect_value)  
VALUES (4, 'DESTROY', FALSE, 'DESTROY_LAMP');

INSERT INTO card (id, deck_id, status, image) 
VALUES (5, null, FALSE, 'a');
INSERT INTO action (id, name_action, object_affect, effect_value)  
VALUES (5, 'DESTROY', FALSE, 'DESTROY_LAMP');

INSERT INTO card (id, deck_id, status, image) 
VALUES (6, null, FALSE, 'a');
INSERT INTO action (id, name_action, object_affect, effect_value)  
VALUES (6, 'DESTROY', FALSE, 'DESTROY_LAMP');

    -- DESTROY_CART

INSERT INTO card (id, deck_id, status, image) 
VALUES (7, null, FALSE, 'a');
INSERT INTO action (id, name_action, object_affect, effect_value)  
VALUES (7, 'DESTROY', FALSE, 'DESTROY_CART');

INSERT INTO card (id, deck_id, status, image) 
VALUES (8, null, FALSE, 'a');
INSERT INTO action (id, name_action, object_affect, effect_value)  
VALUES (8, 'DESTROY', FALSE, 'DESTROY_CART');

INSERT INTO card (id, deck_id, status, image) 
VALUES (9, null, FALSE, 'a');
INSERT INTO action (id, name_action, object_affect, effect_value)  
VALUES (9, 'DESTROY', FALSE, 'DESTROY_CART');

    -- DESTROY_TUNNEL

INSERT INTO card (id, deck_id, status, image) 
VALUES (10, null, FALSE, 'a');
INSERT INTO action (id, name_action, object_affect, effect_value)  
VALUES (10, 'DESTROY', TRUE, 'DESTROY_TUNNEL');

INSERT INTO card (id, deck_id, status, image) 
VALUES (11, null, FALSE, 'a');
INSERT INTO action (id, name_action, object_affect, effect_value)  
VALUES (11, 'DESTROY', TRUE, 'DESTROY_TUNNEL');

INSERT INTO card (id, deck_id, status, image) 
VALUES (12, null, FALSE, 'a');
INSERT INTO action (id, name_action, object_affect, effect_value)  
VALUES (12, 'DESTROY', TRUE, 'DESTROY_TUNNEL');

    -- REPAIR_PICKAXE

INSERT INTO card (id, deck_id, status, image) 
VALUES (13, null, FALSE, 'a');
INSERT INTO action (id, name_action, object_affect, effect_value)  
VALUES (13, 'REPAIR', FALSE, 'REPAIR_PICKAXE');

INSERT INTO card (id, deck_id, status, image) 
VALUES (14, null, FALSE, 'a');
INSERT INTO action (id, name_action, object_affect, effect_value)  
VALUES (14, 'REPAIR', FALSE, 'REPAIR_PICKAXE');

INSERT INTO card (id, deck_id, status, image) 
VALUES (15, null, FALSE, 'a');
INSERT INTO action (id, name_action, object_affect, effect_value)  
VALUES (15, 'REPAIR', FALSE, 'REPAIR_PICKAXE');

    -- REPAIR_LAMP

INSERT INTO card (id, deck_id, status, image) 
VALUES (16, null, FALSE, 'a');
INSERT INTO action (id, name_action, object_affect, effect_value)  
VALUES (16, 'REPAIR', FALSE, 'REPAIR_LAMP');

INSERT INTO card (id, deck_id, status, image) 
VALUES (17, null, FALSE, 'a');
INSERT INTO action (id, name_action, object_affect, effect_value)  
VALUES (17, 'REPAIR', FALSE, 'REPAIR_LAMP');

INSERT INTO card (id, deck_id, status, image) 
VALUES (18, null, FALSE, 'a');
INSERT INTO action (id, name_action, object_affect, effect_value)  
VALUES (18, 'REPAIR', FALSE, 'REPAIR_LAMP');

    -- REPAIR_CART

INSERT INTO card (id, deck_id, status, image) 
VALUES (19, null, FALSE, 'a');
INSERT INTO action (id, name_action, object_affect, effect_value)  
VALUES (19, 'REPAIR', FALSE, 'REPAIR_CART');

INSERT INTO card (id, deck_id, status, image) 
VALUES (20, null, FALSE, 'a');
INSERT INTO action (id, name_action, object_affect, effect_value)  
VALUES (20, 'REPAIR', FALSE, 'REPAIR_CART');

INSERT INTO card (id, deck_id, status, image) 
VALUES (21, null, FALSE, 'a');
INSERT INTO action (id, name_action, object_affect, effect_value)  
VALUES (21, 'REPAIR', FALSE, 'REPAIR_CART');

    -- REPAIR_PICKAXE_LAMP

INSERT INTO card (id, deck_id, status, image)
VALUES (22, null, FALSE, 'a');
INSERT INTO action (id, name_action, object_affect, effect_value)  
VALUES (22, 'REPAIR', FALSE, 'REPAIR_PICKAXE_LAMP');

    -- REPAIR_PICKAXE_CART

INSERT INTO card (id, deck_id, status, image)
VALUES (23, null, FALSE, 'a');
INSERT INTO action (id, name_action, object_affect, effect_value)  
VALUES (23, 'REPAIR', FALSE, 'REPAIR_PICKAXE_CART');

    -- REPAIR_LAMP_CART

INSERT INTO card (id, deck_id, status, image)
VALUES (24, null, FALSE, 'a');
INSERT INTO action (id, name_action, object_affect, effect_value)  
VALUES (24, 'REPAIR', FALSE, 'REPAIR_CART_LAMP');

    -- REVEAL

INSERT INTO card (id, deck_id, status, image)
VALUES (25, null, FALSE, 'a');
INSERT INTO action (id, name_action, object_affect, effect_value)  
VALUES (25, 'REVEAL', FALSE, 'REVEAL');

INSERT INTO card (id, deck_id, status, image)
VALUES (26, null, FALSE, 'a');
INSERT INTO action (id, name_action, object_affect, effect_value)  
VALUES (26, 'REVEAL', FALSE, 'REVEAL');

INSERT INTO card (id, deck_id, status, image)
VALUES (27, null, FALSE, 'a');
INSERT INTO action (id, name_action, object_affect, effect_value)  
VALUES (27, 'REVEAL', FALSE, 'REVEAL');

INSERT INTO card (id, deck_id, status, image)
VALUES (28, null, FALSE, 'a');
INSERT INTO action (id, name_action, object_affect, effect_value)  
VALUES (28, 'REVEAL', FALSE, 'REVEAL');

INSERT INTO card (id, deck_id, status, image)
VALUES (29, null, FALSE, 'a');
INSERT INTO action (id, name_action, object_affect, effect_value)  
VALUES (29, 'REVEAL', FALSE, 'REVEAL');

INSERT INTO card (id, deck_id, status, image)
VALUES (30, null, FALSE, 'a');
INSERT INTO action (id, name_action, object_affect, effect_value)  
VALUES (30, 'REVEAL', FALSE, 'REVEAL');

-- *TUNNEL CARDS*
    -- IZQUIERDA DERECHA

INSERT INTO card (id, deck_id, status, image)
VALUES (31, null, FALSE, 'a');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (31, FALSE, FALSE, FALSE, TRUE, TRUE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (32, null, FALSE, 'a');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (32, FALSE, FALSE, FALSE, TRUE, TRUE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (33, null, FALSE, 'a');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (33, FALSE, FALSE, FALSE, TRUE, TRUE, FALSE);

    -- ARRIBA ABAJO IZQUIERDA DERECHA

INSERT INTO card (id, deck_id, status, image)
VALUES (34, null, FALSE, 'a');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (34, FALSE, TRUE, TRUE, TRUE, TRUE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (35, null, FALSE, 'a');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (35, FALSE, TRUE, TRUE, TRUE, TRUE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (36, null, FALSE, 'a');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (36, FALSE, TRUE, TRUE, TRUE, TRUE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (37, null, FALSE, 'a');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (37, FALSE, TRUE, TRUE, TRUE, TRUE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (38, null, FALSE, 'a');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (38, FALSE, TRUE, TRUE, TRUE, TRUE, FALSE);

    -- ABAJO IZQUIERDA DERECHA

INSERT INTO card (id, deck_id, status, image)
VALUES (39, null, FALSE, 'a');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (39, FALSE, FALSE, TRUE, TRUE, TRUE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (40, null, FALSE, 'a');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (40, FALSE, FALSE, TRUE, TRUE, TRUE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (41, null, FALSE, 'a');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (41, FALSE, FALSE, TRUE, TRUE, TRUE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (42, null, FALSE, 'a');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro)
VALUES (42, FALSE, FALSE, TRUE, TRUE, TRUE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (43, null, FALSE, 'a');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (43, FALSE, FALSE, TRUE, TRUE, TRUE, FALSE);

    -- ARRIBA IZQUIERDA

INSERT INTO card (id, deck_id, status, image)
VALUES (44, null, FALSE, 'a');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (44, FALSE, TRUE, FALSE, TRUE, FALSE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (45, null, FALSE, 'a');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (45, FALSE, TRUE, FALSE, TRUE, FALSE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (46, null, FALSE, 'a');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (46, FALSE, TRUE, FALSE, TRUE, FALSE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (47, null, FALSE, 'a');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (47, FALSE, TRUE, FALSE, TRUE, FALSE, FALSE);

    -- ARRIBA ABAJO IZQUIERDA

INSERT INTO card (id, deck_id, status, image)
VALUES (48, null, FALSE, 'a');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (48, FALSE, TRUE, TRUE, TRUE, FALSE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (49, null, FALSE, 'a');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (49, FALSE, TRUE, TRUE, TRUE, FALSE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (50, null, FALSE, 'a');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (50, FALSE, TRUE, TRUE, TRUE, FALSE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (51, null, FALSE, 'a');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (51, FALSE, TRUE, TRUE, TRUE, FALSE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (52, null, FALSE, 'a');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (52, FALSE, TRUE, TRUE, TRUE, FALSE, FALSE);

    -- IZQUIERDA ABAJO

INSERT INTO card (id, deck_id, status, image)
VALUES (53, null, FALSE, 'a');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (53, FALSE, FALSE, TRUE, TRUE, FALSE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (54, null, FALSE, 'a');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (54, FALSE, FALSE, TRUE, TRUE, FALSE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (55, null, FALSE, 'a');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (55, FALSE, FALSE, TRUE, TRUE, FALSE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (56, null, FALSE, 'a');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (56, FALSE, FALSE, TRUE, TRUE, FALSE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (57, null, FALSE, 'a');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (57, FALSE, FALSE, TRUE, TRUE, FALSE, FALSE);

    -- ARRIBA ABAJO

INSERT INTO card (id, deck_id, status, image)
VALUES (58, null, FALSE, 'a');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (58, FALSE, TRUE, TRUE, FALSE, FALSE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (59, null, FALSE, 'a');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (59, FALSE, TRUE, TRUE, FALSE, FALSE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (60, null, FALSE, 'a');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (60, FALSE, TRUE, TRUE, FALSE, FALSE, FALSE);

INSERT INTO card (id, deck_id, status, image)
VALUES (61, null, FALSE, 'a');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (61, FALSE, TRUE, TRUE, FALSE, FALSE, FALSE);

    -- SIN SALIDA IZQUIERDA DERECHA

INSERT INTO card (id, deck_id, status, image)
VALUES (62, null, FALSE, 'a');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (62, FALSE, FALSE, FALSE, TRUE, TRUE, TRUE);

    -- SIN SALIDA ARRIBA ABAJO IZQUIERDA DERECHA

INSERT INTO card (id, deck_id, status, image)
VALUES (63, null, FALSE, 'a');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (63, FALSE, TRUE, TRUE, TRUE, TRUE, TRUE);

    -- SIN SALIDA ABAJO IZQUIERDA DERECHA

INSERT INTO card (id, deck_id, status, image)
VALUES (64, null, FALSE, 'a');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (64, FALSE, FALSE, TRUE, TRUE, TRUE, TRUE);

    -- SIN SALIDA ARRIBA IZQUIERDA

INSERT INTO card (id, deck_id, status, image)
VALUES (65, null, FALSE, 'a');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (65, FALSE, TRUE, FALSE, TRUE, FALSE, TRUE);

    -- SIN SALIDA ARRIBA ABAJO IZQUIERDA

INSERT INTO card (id, deck_id, status, image)
VALUES (66, null, FALSE, 'a');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (66, FALSE, TRUE, TRUE, TRUE, FALSE, TRUE);

    -- SIN SALIDA ABAJO IZQUIERDA

INSERT INTO card (id, deck_id, status, image)
VALUES (67, null, FALSE, 'a');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (67, FALSE, FALSE, TRUE, TRUE, FALSE, TRUE);

    -- SIN SALIDA IZQUIERDA

INSERT INTO card (id, deck_id, status, image)
VALUES (68, null, FALSE, 'a');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (68, FALSE, FALSE, FALSE, TRUE, FALSE, TRUE);

    -- SIN SALIDA ARRIBA ABAJO

INSERT INTO card (id, deck_id, status, image)
VALUES (69, null, FALSE, 'a');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (69, FALSE, TRUE, TRUE, FALSE, FALSE, TRUE);

    -- SIN SALIDA ABAJO

INSERT INTO card (id, deck_id, status, image)
VALUES (70, null, FALSE, 'a');
INSERT INTO tunnel (id, rotacion, arriba, abajo, izquierda, derecha, centro) 
VALUES (70, FALSE, FALSE, TRUE, FALSE, FALSE, TRUE);
