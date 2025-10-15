-- One admin user, named admin1 with passwor 4dm1n and authority admin
INSERT INTO authorities(id,authority) VALUES (1,'ADMIN');
INSERT INTO appusers(id,username,name,birthDate,joined,password,image,email,authority) VALUES (1,'admin1','Bedilia Estrada','1990-05-12','2017-01-15','$2a$10$nMmTWAhPTqXqLDJTag3prumFrAJpsYtroxf0ojesFYq0k4PmcbWUS','https://example.com/img/bedilia.png','bedilia@saboteur.es',1);

-- Ten player users, named player1 with passwor 0wn3r
INSERT INTO authorities(id,authority) VALUES (2,'PLAYER');
INSERT INTO appusers(id,username,name,birthDate,joined, password,image,email,authority) VALUES (4,'Carlosbox2k','Carlos Borrego Ortiz','2005-02-04','2017-01-15','$2a$10$DaS6KIEfF5CRTFrxIoGc7emY3BpZZ0.fVjwA3NiJ.BjpGNmocaS3e','https://example.com/img/carlos.png', 'carlos@saboteur.es', 2);
INSERT INTO appusers(id,username,name,birthDate,joined,password,image,email,authority) VALUES (5,'mantecaoHacker','Marcos Ángel Ayala Blanco','2005-03-12','2017-01-15','$2a$10$DaS6KIEfF5CRTFrxIoGc7emY3BpZZ0.fVjwA3NiJ.BjpGNmocaS3e','https://example.com/img/marcos.png', 'marcos@saboteur.es', 2);

INSERT INTO game(chat_id, game_status, id, is_private, max_players, link, time_seconds) values (null, 'CREATED', 1, false, 3, 'link', 0);
-- AÑADE A MI CLASE PLAYER ALGUN DATO DE PRUEBA, A PODER SER USANDO LOS USUARIOS DE ARRIBA USANDO LAS PROPIEDADES DE MI CLASE PLAYER
INSERT INTO player(id, played_games, won_games, destroyed_paths, built_paths, acquired_Gold_Nuggets, is_Watcher) VALUES (4, 0, 0, 0, 0, 0, false);

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