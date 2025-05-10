package com.example.SpringbootApp;

import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class pictureSevice {

    @Autowired
    private pictureRepository Repo;

    public void savePicture(String im_id,String list_number,String cars, String humans, String stop_signs, String path) {
        picture pic = new picture(im_id,list_number,cars,humans,stop_signs,path);
        Repo.save(pic);
    }

    public List<picture> allPictures() {
        return Repo.findAll();
    }

    public Optional<picture> singlePicture(String id) {
        return Repo.findById(id);
    }

    public void deletePicture(String id) {
        Repo.deleteById(id);
    }

}
