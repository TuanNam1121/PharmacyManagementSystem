package com.pharmacy.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController 
public class MedicineController {

    @GetMapping("/")
    public ResponseEntity<String> getMedicineList(){
        ResponseEntity<String> result = new ResponseEntity<>(HttpStatus.ACCEPTED);
        return result.ok("Medicine");
    }
}
