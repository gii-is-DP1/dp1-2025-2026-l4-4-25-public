package es.us.dp1.l4_04_24_25.saboteur.achievements;

import org.springframework.data.repository.CrudRepository;

public interface AchievementRepository extends CrudRepository<Achievement,Integer>{

    /*
    // Para obtener los logros de un jugador a partir de su id
    @Query("SELECT a FROM Achievement a JOIN a.players p WHERE p.id = :playerId")
    List<Achievement> findAchievementsByPlayerId(@Param("playerId") Integer playerId);

    // Para obtener los logros del admin
    @Query("SELECT a FROM Achievement a WHERE a.creator.id = :adminId")
    List<Achievement> findAchievementsByCreatorId(@Param("adminId") Integer adminId);

    // Obtener los logros a partir del título (búsqueda exacta)
    @Query("SELECT a FROM Achievement a WHERE a.tittle = :tittle")
    List<Achievement> findAchievementsByTittle(@Param("tittle") String tittle);

    // Contar el número de logros de un jugador
    @Query("SELECT COUNT(a) FROM Achievement a JOIN a.players p WHERE p.id = :playerId")
    Integer countAchievementsByPlayerId(@Param("playerId") Integer playerId);
    */
    

    
}