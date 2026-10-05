"use strict";

const API_URL =
    "https://freedictionaryapi.com/api/v1/entries/en/";

const searchForm =
    document.getElementById("searchForm");

const wordInput =
    document.getElementById("wordInput");

const searchButton =
    document.getElementById("searchButton");

const statusMessage =
    document.getElementById("statusMessage");

const resultSection =
    document.getElementById("resultSection");

const welcomeSection =
    document.getElementById("welcomeSection");

const wordTitle =
    document.getElementById("wordTitle");

const phonetic =
    document.getElementById("phonetic");

const meaningsContainer =
    document.getElementById("meanings");

const audioButton =
    document.getElementById("audioButton");

let pronunciationAudio = null;


function setLoading(isLoading) {
    searchButton.disabled = isLoading;

    searchButton.textContent =
        isLoading
            ? "Searching..."
            : "Search";
}


function showError(message) {
    statusMessage.textContent = message;

    statusMessage.style.color = "#c0392b";
}


function showSuccess(message) {
    statusMessage.textContent = message;

    statusMessage.style.color = "#2e7d32";
}


function clearStatus() {
    statusMessage.textContent = "";

    statusMessage.style.color = "#c0392b";
}


function collectPronunciation(data) {

    const pronunciations = [];

    if (
        data &&
        Array.isArray(data.entries)
    ) {

        data.entries.forEach(function (entry) {

            if (
                Array.isArray(
                    entry.pronunciations
                )
            ) {

                entry.pronunciations.forEach(
                    function (item) {

                        if (item.text) {
                            pronunciations.push(
                                item.text
                            );
                        }
                    }
                );
            }


            if (
                Array.isArray(
                    entry.phonetics
                )
            ) {

                entry.phonetics.forEach(
                    function (item) {

                        if (item.text) {
                            pronunciations.push(
                                item.text
                            );
                        }

                        if (item.ipa) {
                            pronunciations.push(
                                item.ipa
                            );
                        }
                    }
                );
            }

        });
    }


    if (
        Array.isArray(data)
    ) {

        data.forEach(function (entry) {

            if (
                Array.isArray(
                    entry.phonetics
                )
            ) {

                entry.phonetics.forEach(
                    function (item) {

                        if (item.text) {
                            pronunciations.push(
                                item.text
                            );
                        }

                        if (item.ipa) {
                            pronunciations.push(
                                item.ipa
                            );
                        }
                    }
                );
            }

        });
    }


    return [
        ...new Set(pronunciations)
    ];
}


function collectAudioUrl(data) {

    if (
        data &&
        Array.isArray(data.entries)
    ) {

        for (
            const entry
            of data.entries
        ) {

            if (
                Array.isArray(
                    entry.pronunciations
                )
            ) {

                const audioItem =
                    entry.pronunciations.find(
                        function (item) {
                            return item.audio;
                        }
                    );

                if (
                    audioItem &&
                    audioItem.audio
                ) {
                    return audioItem.audio;
                }
            }


            if (
                Array.isArray(
                    entry.phonetics
                )
            ) {

                const audioItem =
                    entry.phonetics.find(
                        function (item) {
                            return item.audio;
                        }
                    );

                if (
                    audioItem &&
                    audioItem.audio
                ) {
                    return audioItem.audio;
                }
            }
        }
    }


    if (
        Array.isArray(data)
    ) {

        for (
            const entry
            of data
        ) {

            if (
                Array.isArray(
                    entry.phonetics
                )
            ) {

                const audioItem =
                    entry.phonetics.find(
                        function (item) {
                            return item.audio;
                        }
                    );

                if (
                    audioItem &&
                    audioItem.audio
                ) {
                    return audioItem.audio;
                }
            }
        }
    }


    return "";
}


function collectSenses(
    senses,
    output = []
) {

    if (!Array.isArray(senses)) {
        return output;
    }


    senses.forEach(
        function (sense) {

            if (
                sense &&
                typeof sense.definition ===
                    "string" &&
                sense.definition.trim() !== ""
            ) {

                output.push({
                    definition:
                        sense.definition.trim(),

                    examples:
                        Array.isArray(
                            sense.examples
                        )
                            ? sense.examples
                            : []
                });
            }


            if (
                Array.isArray(
                    sense.subsenses
                )
            ) {

                collectSenses(
                    sense.subsenses,
                    output
                );
            }
        }
    );


    return output;
}


function getDefinitionsForEntry(
    entry
) {

    const definitions = [];


    if (
        Array.isArray(entry.senses)
    ) {

        collectSenses(
            entry.senses,
            definitions
        );
    }


    if (
        Array.isArray(entry.meanings)
    ) {

        entry.meanings.forEach(
            function (meaning) {

                if (
                    Array.isArray(
                        meaning.definitions
                    )
                ) {

                    meaning.definitions.forEach(
                        function (item) {

                            if (
                                item &&
                                item.definition
                            ) {

                                definitions.push({
                                    definition:
                                        item.definition,

                                    examples:
                                        item.example
                                            ? [
                                                item.example
                                            ]
                                            : []
                                });
                            }
                        }
                    );
                }


                if (
                    meaning.definition
                ) {

                    definitions.push({
                        definition:
                            meaning.definition,

                        examples:
                            Array.isArray(
                                meaning.examples
                            )
                                ? meaning.examples
                                : []
                    });
                }
            }
        );
    }


    return definitions;
}


function getEntries(data) {

    if (
        data &&
        Array.isArray(data.entries)
    ) {
        return data.entries;
    }


    if (
        Array.isArray(data)
    ) {
        return data;
    }


    return [];
}


function displayResults(data) {

    const entries =
        getEntries(data);


    if (entries.length === 0) {

        throw new Error(
            "No definition was found for this word."
        );
    }


    const searchedWord =
        wordInput.value.trim();


    wordTitle.textContent =
        data.word ||
        entries[0].word ||
        searchedWord;


    const pronunciations =
        collectPronunciation(data);


    if (
        pronunciations.length > 0
    ) {

        phonetic.textContent =
            pronunciations.join(" • ");

        phonetic.style.display =
            "block";

    } else {

        phonetic.textContent = "";

        phonetic.style.display =
            "none";
    }


    const audioUrl =
        collectAudioUrl(data);


    if (audioUrl) {

        pronunciationAudio =
            new Audio(audioUrl);

        audioButton.hidden = false;

    } else {

        pronunciationAudio = null;

        audioButton.hidden = true;
    }


    meaningsContainer.innerHTML = "";


    let totalDefinitions = 0;


    entries.forEach(
        function (entry) {

            const definitions =
                getDefinitionsForEntry(
                    entry
                );


            if (
                definitions.length === 0
            ) {
                return;
            }


            totalDefinitions +=
                definitions.length;


            const meaningBlock =
                document.createElement(
                    "article"
                );

            meaningBlock.className =
                "meaning-block";


            const partOfSpeech =
                document.createElement(
                    "span"
                );

            partOfSpeech.className =
                "part-of-speech";

            partOfSpeech.textContent =
                entry.partOfSpeech ||
                "Meaning";


            const definitionList =
                document.createElement(
                    "ol"
                );

            definitionList.className =
                "definition-list";


            definitions.forEach(
                function (item) {

                    const listItem =
                        document.createElement(
                            "li"
                        );

                    listItem.className =
                        "definition-item";


                    const definitionText =
                        document.createElement(
                            "div"
                        );

                    definitionText.textContent =
                        item.definition;


                    listItem.appendChild(
                        definitionText
                    );


                    if (
                        Array.isArray(
                            item.examples
                        ) &&
                        item.examples.length > 0
                    ) {

                        const example =
                            document.createElement(
                                "p"
                            );

                        example.className =
                            "example";

                        example.textContent =
                            `"${item.examples[0]}"`;


                        listItem.appendChild(
                            example
                        );
                    }


                    definitionList.appendChild(
                        listItem
                    );
                }
            );


            meaningBlock.appendChild(
                partOfSpeech
            );

            meaningBlock.appendChild(
                definitionList
            );

            meaningsContainer.appendChild(
                meaningBlock
            );
        }
    );


    if (totalDefinitions === 0) {

        throw new Error(
            "The word was found, but no definitions were available."
        );
    }


    welcomeSection.hidden = true;

    resultSection.hidden = false;

    clearStatus();
}


async function searchWord(
    word
) {

    const cleanWord =
        word.trim();


    if (cleanWord === "") {

        showError(
            "Please enter a word."
        );

        wordInput.focus();

        return;
    }


    clearStatus();

    setLoading(true);

    resultSection.hidden = true;


    try {

        const response =
            await fetch(
                `${API_URL}${encodeURIComponent(
                    cleanWord
                )}`
            );


        if (!response.ok) {

            if (
                response.status === 404
            ) {

                throw new Error(
                    "Word not found. Please check the spelling and try again."
                );
            }


            if (
                response.status === 429
            ) {

                throw new Error(
                    "Too many requests. Please try again later."
                );
            }


            throw new Error(
                `Dictionary service returned ${response.status}.`
            );
        }


        const data =
            await response.json();


        displayResults(data);


    } catch (error) {

        console.error(
            "Dictionary API error:",
            error
        );


        resultSection.hidden =
            true;

        welcomeSection.hidden =
            false;


        showError(
            error.message ||
            "Unable to fetch the definition. Please try again."
        );


    } finally {

        setLoading(false);
    }
}


function playPronunciation() {

    if (pronunciationAudio) {

        pronunciationAudio.currentTime =
            0;

        pronunciationAudio
            .play()
            .catch(
                function () {

                    showError(
                        "The pronunciation could not be played."
                    );
                }
            );

        return;
    }


    const word =
        wordTitle.textContent.trim();


    if (
        word === "" ||
        !("speechSynthesis" in window)
    ) {

        showError(
            "Pronunciation is not available."
        );

        return;
    }


    window.speechSynthesis.cancel();


    const speech =
        new SpeechSynthesisUtterance(
            word
        );


    speech.lang =
        "en-US";

    speech.rate =
        0.8;


    window.speechSynthesis.speak(
        speech
    );


    showSuccess(
        "Playing pronunciation..."
    );


    setTimeout(
        clearStatus,
        1500
    );
}


searchForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();

        searchWord(
            wordInput.value
        );
    }
);


audioButton.addEventListener(
    "click",
    playPronunciation
);