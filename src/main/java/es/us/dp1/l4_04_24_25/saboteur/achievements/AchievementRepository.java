package es.us.dp1.l4_04_24_25.saboteur.achievements;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

public interface AchievementRepository extends CrudRepository<Achievement, Integer> {

    @Override
    Optional<Achievement> findById(Integer id);

   
    @Query("SELECT a FROM Achievement a JOIN a.players p WHERE p.id = :playerId")
    List<Achievement> findAchievementsByPlayerId(@Param("playerId") Integer playerId);


    @Query("SELECT a FROM Achievement a WHERE a.creator.id = :adminId")
    List<Achievement> findAchievementsByCreatorId(@Param("adminId") Integer adminId);

    List<Achievement> findByTittle(String tittle);
    
    
    @Query("SELECT COUNT(a) FROM Achievement a JOIN a.players p WHERE p.id = :playerId")
    Integer countAchievementsByPlayerId(@Param("playerId") Integer playerId);
}