package com.example.SpringbootApp;


import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "pictures")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class picture {
    @Id
    private String id;
    private String list_number;
    private String cars;
    private String humans;
    private String stop_signs;
    private String source;

    
}
