package com.nrityasana.api;

import java.util.List;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class PracticeController {
    private final List<Practice> practices = List.of(
        new Practice("Surya Namaskar", "Yoga", "Flow", 18, "Build warmth, breath, and focus.", "sunny"),
        new Practice("Ankle & Aramandi", "Dance", "Technique", 12, "Wake up the feet and find your line.", "footprints"),
        new Practice("Moonlit Cooldown", "Yoga", "Restore", 10, "A soft landing for your evening.", "moon"),
        new Practice("Abhinaya Basics", "Dance", "Expression", 24, "Let the eyes lead the story.", "sparkles")
    );

    @GetMapping("/practices")
    public List<Practice> practices() {
        return practices;
    }

    public record Practice(String title, String discipline, String category, int minutes, String description, String icon) {}
}
