package com.example.SpringbootApp;


import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface pictureRepository extends MongoRepository<picture, String> {
    void  deleteById(String id);
}
