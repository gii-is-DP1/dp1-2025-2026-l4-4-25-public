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

INSERT INTO card (id, deck_id, status, image) 
VALUES (201, 1, TRUE, 'tunnel_recto_vertical.png');

INSERT INTO card (id, deck_id, status, image) 
VALUES (202, 1, TRUE, 'tunnel_recto_vertical_izquierda.png');

INSERT INTO tunnel (id, rotacion, arriba, abajo, derecha, izquierda) 
VALUES (201, FALSE, TRUE, TRUE, FALSE, FALSE);

INSERT INTO tunnel (id, rotacion, arriba, abajo, derecha, izquierda) 
VALUES (202, FALSE, TRUE, TRUE, FALSE, TRUE);


INSERT INTO achievements (id, creator_id, threshold, badge_image, metric, description, tittle)
VALUES (200, 1, 10., 'PRUEBA', 'GAMES_PLAYED', 'Gana 10 partidas.', 'Constructor Maestro');

INSERT INTO achievements (id, creator_id, threshold, badge_image, metric, description, tittle)
VALUES (201, 1, 30., 'TEST2', 'GAMES_PLAYED', 'TEST2?', 'TEST2?');

INSERT INTO achievements (id, creator_id, threshold, badge_image, metric, description, tittle)
VALUES (202, 1, 40., 'TEST3', 'GAMES_PLAYED', 'TEST3?', 'TEST3?');

INSERT INTO achievements (id, creator_id, threshold, badge_image, metric, description, tittle)
VALUES (203, 1, 60., 'TEST4', 'GAMES_PLAYED', 'TEST4?', 'TEST4?');

INSERT INTO achievements (id, creator_id, threshold, badge_image, metric, description, tittle)
VALUES (204, 1, 20.,  'TEST5', 'GAMES_PLAYED', 'TEST5?', 'TEST5?');





INSERT INTO card (id, deck_id, status, image) 
VALUES (205, 1, TRUE, 'action_repair_pickaxe.png');
INSERT INTO action (id, name_action, object_affect, effect_value) 
VALUES (205, 'REPAIR', FALSE, 'REPAIR_PICKAXE'); -- ENUMS como STRING, FALSE como booleano.

-- * INSERCIÓN ID 2 (PARA ELIMINAR) *
INSERT INTO card (id, deck_id, status, image) 
VALUES (300, 1, TRUE, 'action_destroy_cart.png');
INSERT INTO action (id, name_action, object_affect, effect_value)  
VALUES (300, 'DESTROY', FALSE, 'DESTROY_CART');


--INSERT INTO squares (id, coordinate_x, coordinate_y, occupation, type, board_id) 
--VALUES (4, 1, 4, TRUE, 'PATH', 1);



--INSERT INTO appusers(id,nombreUsuario,nombreApellido,fechaNacimento,contrasena,url,correoElectronico,authority) VALUES (6,'player3','$2a$10$DaS6KIEfF5CRTFrxIoGc7emY3BpZZ0.fVjwA3NiJ.BjpGNmocaS3e',2);
--INSERT INTO appusers(id,nombreUsuario,nombreApellido,fechaNacimento,contrasena,url,correoElectronico,authority) VALUES (7,'player4','$2a$10$DaS6KIEfF5CRTFrxIoGc7emY3BpZZ0.fVjwA3NiJ.BjpGNmocaS3e',2);
--INSERT INTO appusers(id,nombreUsuario,nombreApellido,fechaNacimento,contrasena,url,correoElectronico,authority) VALUES (8,'player5','$2a$10$DaS6KIEfF5CRTFrxIoGc7emY3BpZZ0.fVjwA3NiJ.BjpGNmocaS3e',2);
--INSERT INTO appusers(id,nombreUsuario,nombreApellido,fechaNacimento,contrasena,url,correoElectronico,authority) VALUES (9,'player6','$2a$10$DaS6KIEfF5CRTFrxIoGc7emY3BpZZ0.fVjwA3NiJ.BjpGNmocaS3e',2);
--INSERT INTO appusers(id,nombreUsuario,nombreApellido,fechaNacimento,contrasena,url,correoElectronico,authority) VALUES (10,'player7','$2a$10$DaS6KIEfF5CRTFrxIoGc7emY3BpZZ0.fVjwA3NiJ.BjpGNmocaS3e',2);
--INSERT INTO appusers(id,nombreUsuario,nombreApellido,fechaNacimento,contrasena,url,correoElectronico,authority) VALUES (11,'player8','$2a$10$DaS6KIEfF5CRTFrxIoGc7emY3BpZZ0.fVjwA3NiJ.BjpGNmocaS3e',2);
--INSERT INTO appusers(id,nombreUsuario,nombreApellido,fechaNacimento,contrasena,url,correoElectronico,authority) VALUES (12,'player9','$2a$10$DaS6KIEfF5CRTFrxIoGc7emY3BpZZ0.fVjwA3NiJ.BjpGNmocaS3e',2);
--INSERT INTO appusers(id,nombreUsuario,nombreApellido,fechaNacimento,contrasena,url,correoElectronico,authority) VALUES (13,'player10','$2a$10$DaS6KIEfF5CRTFrxIoGc7emY3BpZZ0.fVjwA3NiJ.BjpGNmocaS3e',2);
--INSERT INTO appusers(id,nombreUsuario,nombreApellido,fechaNacimento,contrasena,url,correoElectronico,authority) VALUES (3,'FQY7185','$2a$10$DaS6KIEfF5CRTFrxIoGc7emY3BpZZ0.fVjwA3NiJ.BjpGNmocaS3e',2);
--INSERT INTO appusers(id,nombreUsuario,nombreApellido,fechaNacimento,contrasena,url,correoElectronico,authority) VALUES (14,'GBK4935','$2a$10$DaS6KIEfF5CRTFrxIoGc7emY3BpZZ0.fVjwA3NiJ.BjpGNmocaS3e',2);
--INSERT INTO appusers(id,nombreUsuario,nombreApellido,fechaNacimento,contrasena,url,correoElectronico,authority) VALUES (2,'RHQ7780','$2a$10$DaS6KIEfF5CRTFrxIoGc7emY3BpZZ0.fVjwA3NiJ.BjpGNmocaS3e',2);
--INSERT INTO appusers(id,nombreUsuario,nombreApellido,fechaNacimento,contrasena,url,correoElectronico,authority) VALUES (15,'JGR9196','$2a$10$DaS6KIEfF5CRTFrxIoGc7emY3BpZZ0.fVjwA3NiJ.BjpGNmocaS3e',2);
--INSERT INTO appusers(id,nombreUsuario,nombreApellido,fechaNacimento,contrasena,url,correoElectronico,authority) VALUES (16,'WRG8176','$2a$10$DaS6KIEfF5CRTFrxIoGc7emY3BpZZ0.fVjwA3NiJ.BjpGNmocaS3e',2);
--INSERT INTO appusers(id,nombreUsuario,nombreApellido,fechaNacimento,contrasena,url,correoElectronico,authority) VALUES (17,'HKP3295','$2a$10$DaS6KIEfF5CRTFrxIoGc7emY3BpZZ0.fVjwA3NiJ.BjpGNmocaS3e',2);