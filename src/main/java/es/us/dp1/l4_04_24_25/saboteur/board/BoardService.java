package es.us.dp1.l4_04_24_25.saboteur.board;

import java.util.List;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import es.us.dp1.l4_04_24_25.saboteur.exceptions.ResourceNotFoundException;
import jakarta.validation.Valid;

@Service
public class BoardService {

    private final BoardRepository boardRepository;

    @Autowired
    public BoardService(BoardRepository boardRepository) {
        this.boardRepository = boardRepository;
    }

    @Transactional
    public Board saveBoard(@Valid Board board) {
        
        if (board.getRound() != null) {
            board.getRound().setBoard(board);
        }
        
        boardRepository.save(board);
        return board;
    }

    @Transactional(readOnly = true)
    public Board findBoard(Integer id) {
        return boardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Board", "id", id));
    }

    @Transactional(readOnly = true)
    public Iterable<Board> findAll() {
        return boardRepository.findAll();
    }

    @Transactional
    public Board updateBoard(@Valid Board board, Integer idToUpdate) {
        Board toUpdate = findBoard(idToUpdate);
        
        BeanUtils.copyProperties(board, toUpdate, "id", "busy", "round"); 
        
        boardRepository.save(toUpdate);
        return toUpdate;
    }

    @Transactional
    public void deleteBoard(Integer id) {
        Board toDelete = findBoard(id);
        boardRepository.delete(toDelete);
    }
    
    
    @Transactional(readOnly = true)
    public List<Board> findByBase(Integer base) {
        return boardRepository.findByBase(base);
    }

    @Transactional(readOnly = true)
    public List<Board> findByHeigth(Integer heigth) {
        return boardRepository.findByHeigth(heigth);
    }

    @Transactional(readOnly = true)
    public List<Board> findByBaseAndHeigth(Integer base, Integer heigth) {
        return boardRepository.findByBaseAndHeigth(base, heigth);
    }
}