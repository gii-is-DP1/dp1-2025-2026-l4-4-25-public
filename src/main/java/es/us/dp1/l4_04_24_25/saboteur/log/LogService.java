package es.us.dp1.l4_04_24_25.saboteur.log;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import es.us.dp1.l4_04_24_25.saboteur.exceptions.ResourceNotFoundException;
import jakarta.validation.Valid;

@Service
public class LogService {
    
    private LogRepository logRepository;

    @Autowired
    public LogService(LogRepository logRepository) {
        this.logRepository = logRepository;
    }

    @Transactional
    public Log saveLog(Log log) throws DataAccessException{
        logRepository.save(log);
        return log;
    }

    @Transactional(readOnly = true)
    public Log findLog(Integer id) {
        return logRepository.findById(id).orElseThrow(()-> new ResourceNotFoundException("Log","id",id));
        
    }

    @Transactional(readOnly = true)
    public Iterable<Log> findAll(){
        return logRepository.findAll();
    }

    @Transactional
    public Log updateLog(@Valid Log log, Integer idToUpdate){
        Log toUpdate = findLog(idToUpdate);
        BeanUtils.copyProperties(log, toUpdate,"id");
        logRepository.save(toUpdate);
        return toUpdate;
    }

    @Transactional
    public void deleteLog(Integer id){
        Log toDelete = findLog(id);
        logRepository.delete(toDelete);
    }

}










































































