package com.nrityasana.api;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(PracticeController.class)
class PracticeControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @Test
    void returnsPracticeCatalog() throws Exception {
        mockMvc.perform(get("/api/practices"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].title").value("Surya Namaskar"))
            .andExpect(jsonPath("$.length()").value(4));
    }
}
