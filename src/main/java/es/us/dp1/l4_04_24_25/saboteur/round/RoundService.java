package es.us.dp1.l4_04_24_25.saboteur.round;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import es.us.dp1.l4_04_24_25.saboteur.exceptions.ResourceNotFoundException;

@Service
public class RoundService {
    
    private RoundRepository roundRepository;

    @Autowired
    public RoundService(RoundRepository roundRepository) {
        this.roundRepository = roundRepository;
    }

    @Transactional
    public Round saveRound(Round round) {
        roundRepository.save(round);
        return round;
    }

    @Transactional (readOnly = true)
    public Round findRound(Integer id) {
        return roundRepository.findById(id).orElseThrow(()-> new ResourceNotFoundException("Round","id",id));
    }

    @Transactional (readOnly = true)
    public Iterable<Round> findAll(){
        return roundRepository.findAll();
    }

    @Transactional
    public Round updateRound(Round round, Integer idToUpdate){
        Round toUpdate = findRound(idToUpdate);
        BeanUtils.copyProperties(round, toUpdate,"id");
        roundRepository.save(toUpdate);
        return toUpdate;
    }

    @Transactional
    public void deleteRound(Integer id) {
        Round toDelete = findRound(id);
        roundRepository.delete(toDelete);
    }

}