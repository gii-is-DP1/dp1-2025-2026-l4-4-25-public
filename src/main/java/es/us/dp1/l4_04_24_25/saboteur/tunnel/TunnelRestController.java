package es.us.dp1.l4_04_24_25.saboteur.tunnel;

import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import es.us.dp1.l4_04_24_25.saboteur.auth.payload.response.MessageResponse;
import es.us.dp1.l4_04_24_25.saboteur.util.RestPreconditions;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/tunnels") 
@SecurityRequirement(name = "bearerAuth")
public class TunnelRestController {

    private final TunnelService tunnelService;

    @Autowired
    public TunnelRestController(TunnelService tunnelService) {
        this.tunnelService = tunnelService;
    }

    @GetMapping
    public ResponseEntity<List<Tunnel>> findAll() {
        List<Tunnel> res = (List<Tunnel>) tunnelService.findAll();
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    @GetMapping(value = "{id}")
    public ResponseEntity<Tunnel> findById(@PathVariable("id") Integer id) {
        return new ResponseEntity<>(tunnelService.findTunnel(id), HttpStatus.OK);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<Tunnel> create(@RequestBody @Valid Tunnel tunnel) throws DataAccessException{
        Tunnel newTunnel = new Tunnel();
        Tunnel savedTunnel;
        BeanUtils.copyProperties(tunnel, newTunnel);
        savedTunnel = this.tunnelService.saveTunnel(newTunnel);
        return new ResponseEntity<>(savedTunnel, HttpStatus.CREATED);
    }

    @PutMapping(value = "{id}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<Tunnel> update(@PathVariable("id") Integer id, @RequestBody @Valid Tunnel tunnel) {
        RestPreconditions.checkNotNull(tunnelService.findTunnel(id), "Tunnel", "ID", id);
        return new ResponseEntity<>(tunnelService.updateTunnel(tunnel, id), HttpStatus.OK);
    }

    @DeleteMapping(value = "{id}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<MessageResponse> delete(@PathVariable("id") int id) {
        RestPreconditions.checkNotNull(tunnelService.findTunnel(id), "Tunnel", "ID", id);
        tunnelService.deleteTunnel(id);
        return new ResponseEntity<>(new MessageResponse("Tunnel deleted!"), HttpStatus.OK);
    }

    @GetMapping("byRotacion")
    public ResponseEntity<List<Tunnel>> findByRotacion(@RequestParam boolean rotacion) {
        List<Tunnel> res = tunnelService.findByRotacion(rotacion);
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    @GetMapping("byArriba")
    public ResponseEntity<List<Tunnel>> findByArriba(@RequestParam boolean arriba) {
        List<Tunnel> res = tunnelService.findByArriba(arriba);
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    @GetMapping("byAbajo")
    public ResponseEntity<List<Tunnel>> findByAbajo(@RequestParam boolean abajo) {
        List<Tunnel> res = tunnelService.findByAbajo(abajo);
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    @GetMapping("byDerecha")
    public ResponseEntity<List<Tunnel>> findByDerecha(@RequestParam boolean derecha) {
        List<Tunnel> res = tunnelService.findByDerecha(derecha);
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    @GetMapping("byIzquierda")
    public ResponseEntity<List<Tunnel>> findByIzquierda(@RequestParam boolean izquierda) {
        List<Tunnel> res = tunnelService.findByIzquierda(izquierda);
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    
    @GetMapping("byArribaAndAbajo")
    public ResponseEntity<List<Tunnel>> findByArribaAndAbajo(@RequestParam boolean arriba, @RequestParam boolean abajo) {
        List<Tunnel> res = tunnelService.findByArribaAndAbajo(arriba, abajo);
        return new ResponseEntity<>(res, HttpStatus.OK);
    }
    
    @GetMapping("byArribaAndDerecha")
    public ResponseEntity<List<Tunnel>> findByArribaAndDerecha(@RequestParam boolean arriba, @RequestParam boolean derecha) {
        List<Tunnel> res = tunnelService.findByArribaAndDerecha(arriba, derecha);
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    @GetMapping("byArribaAndIzquierda")
    public ResponseEntity<List<Tunnel>> findByArribaAndIzquierda(@RequestParam boolean arriba, @RequestParam boolean izquierda) {
        List<Tunnel> res = tunnelService.findByArribaAndIzquierda(arriba, izquierda);
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    @GetMapping("byAbajoAndDerecha")
    public ResponseEntity<List<Tunnel>> findByAbajoAndDerecha(@RequestParam boolean abajo, @RequestParam boolean derecha) {
        List<Tunnel> res = tunnelService.findByAbajoAndDerecha(abajo, derecha);
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    @GetMapping("byAbajoAndIzquierda")
    public ResponseEntity<List<Tunnel>> findByAbajoAndIzquierda(@RequestParam boolean abajo, @RequestParam boolean izquierda) {
        List<Tunnel> res = tunnelService.findByAbajoAndIzquierda(abajo, izquierda);
        return new ResponseEntity<>(res, HttpStatus.OK);
    }
    
    @GetMapping("byDerechaAndIzquierda")
    public ResponseEntity<List<Tunnel>> findByDerechaAndIzquierda(@RequestParam boolean derecha, @RequestParam boolean izquierda) {
        List<Tunnel> res = tunnelService.findByDerechaAndIzquierda(derecha, izquierda);
        return new ResponseEntity<>(res, HttpStatus.OK);
    }


    @GetMapping("byArribaAndAbajoAndDerecha")
    public ResponseEntity<List<Tunnel>> findByArribaAndAbajoAndDerecha(@RequestParam boolean arriba, @RequestParam boolean abajo, @RequestParam boolean derecha) {
        List<Tunnel> res = tunnelService.findByArribaAndAbajoAndDerecha(arriba, abajo, derecha);
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    
    @GetMapping("byArribaAndAbajoAndIzquierda")
    public ResponseEntity<List<Tunnel>> findByArribaAndAbajoAndIzquierda(@RequestParam boolean arriba, @RequestParam boolean abajo, @RequestParam boolean izquierda) {
        List<Tunnel> res = tunnelService.findByArribaAndAbajoAndIzquierda(arriba, abajo, izquierda);
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    
    @GetMapping("byArribaAndDerechaAndIzquierda")
    public ResponseEntity<List<Tunnel>> findByArribaAndDerechaAndIzquierda(@RequestParam boolean arriba, @RequestParam boolean derecha, @RequestParam boolean izquierda) {
        List<Tunnel> res = tunnelService.findByArribaAndDerechaAndIzquierda(arriba, derecha, izquierda);
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    
    @GetMapping("byAbajoAndDerechaAndIzquierda")
    public ResponseEntity<List<Tunnel>> findByAbajoAndDerechaAndIzquierda(@RequestParam boolean abajo, @RequestParam boolean derecha, @RequestParam boolean izquierda) {
        List<Tunnel> res = tunnelService.findByAbajoAndDerechaAndIzquierda(abajo, derecha, izquierda);
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    @GetMapping("byAllConnections")
    public ResponseEntity<List<Tunnel>> findByArribaAndAbajoAndDerechaAndIzquierda(
        @RequestParam boolean arriba, 
        @RequestParam boolean abajo, 
        @RequestParam boolean derecha, 
        @RequestParam boolean izquierda
    ) {
        List<Tunnel> res = tunnelService.findByArribaAndAbajoAndDerechaAndIzquierda(arriba, abajo, derecha, izquierda);
        return new ResponseEntity<>(res, HttpStatus.OK);
    }
}