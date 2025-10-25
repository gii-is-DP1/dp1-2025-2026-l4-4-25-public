package es.us.dp1.l4_04_24_25.saboteur.board;

import java.util.List;

import org.springframework.data.repository.CrudRepository;

public interface BoardRepository extends CrudRepository<Board, Integer> {

    List<Board> findByBase(Integer base);

    List<Board> findByHeigth(Integer heigth);

    List<Board> findByBaseAndHeigth(Integer base, Integer heigth);

    public void saveAndFlush(Board board);
}