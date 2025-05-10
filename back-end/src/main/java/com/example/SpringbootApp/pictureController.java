package com.example.SpringbootApp;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;


@RestController
@RequestMapping({"/api/storedPictures", "/api/storedPictures/"})
@CrossOrigin(origins = "*") // React with Java spring boot connection
public class pictureController {

    @Autowired
    private pictureSevice pictureSevice;

    @GetMapping
    public ResponseEntity<List<picture>> getAllPictures() {
        return new ResponseEntity<List<picture>>(pictureSevice.allPictures(), HttpStatus.OK);

    }

    @GetMapping("/{id}")
    public ResponseEntity<Optional<picture>> getSinglePicture(@PathVariable String id){

        return new ResponseEntity<Optional<picture>>(pictureSevice.singlePicture(id), HttpStatus.OK);
    }

    @PostMapping
    public void savePicture(@RequestBody picture picture) {
        pictureSevice.savePicture(picture.getId(), picture.getList_number(), picture.getCars(),picture.getHumans(),picture.getStop_signs(), picture.getSource());
        
    }

    @DeleteMapping
    public void deletePicture(@RequestBody picture picture){
        pictureSevice.deletePicture(picture.getId());
    }

}


// old code
//@Autowired
//private pictureSevice pictureSevice;
//@GetMapping
//public ResponseEntity<String> getAllPictures() {
//    return new ResponseEntity<String>("All pictures haha", HttpStatus.OK);
//}