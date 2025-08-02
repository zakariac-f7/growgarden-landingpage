document.addEventListener("DOMContentLoaded", function() {
    const cards = document.querySelectorAll(".card");
    const generateButton = document.getElementById("generate");
    const warningPetLimit = document.getElementById("warning-pet-limit");
    const warningNoPet = document.getElementById("warning-no-pet");
    const warningUsername = document.getElementById("warning-username");
    const usernameInput = document.getElementById("username");
    const blankScreen = document.getElementById("blank-screen");
    const selectedCards = new Set();
    const modalContainer = document.getElementById("xf_MODAL_CONTAINER");

    cards.forEach(function(card) {
        card.addEventListener("click", function() {
            const circle = this.querySelector('.circle');

            if (selectedCards.has(this)) {
                selectedCards.delete(this);
                circle.style.display = "none";
            } else {
                if (selectedCards.size < 3) {
                    selectedCards.add(this);
                    circle.style.display = "block";
                } else {
                    showWarning(warningPetLimit);
                    scrollToWarning(warningPetLimit);
                }
            }
        });
    });

    generateButton.addEventListener("click", function() {
        const username = usernameInput.value.trim();

        if (selectedCards.size === 0) {
            showWarning(warningNoPet);
            scrollToWarning(warningNoPet);
        } else if (username.length < 3) {
            warningUsername.textContent = "Invalid username: Too short";
            showWarning(warningUsername);
            scrollToWarning(warningUsername);
        } else if (username.length > 25) {
            warningUsername.textContent = "Invalid username: Too long";
            showWarning(warningUsername);
            scrollToWarning(warningUsername);
        } else {
            setTimeout(function() {
                // Hide all children from body except xf_MODAL_CONTAINER and blankScreen
                Array.from(document.body.children).forEach(child => {
                    if (child !== modalContainer && child !== blankScreen) {
                        child.style.display = "none";
                    }
                });
                blankScreen.style.display = "block";
                loadNewContent(username, selectedCards);
                addFloatingImages(blankScreen); // Add floating images to the new screen
            }, 500);
        }
    });

    function showWarning(warningElement) {
        hideAllWarnings();
        warningElement.style.display = "block";
    }

    function hideAllWarnings() {
        warningPetLimit.style.display = "none";
        warningNoPet.style.display = "none";
        warningUsername.style.display = "none";
    }

    function scrollToWarning(warningElement) {
        const offsetTop = warningElement.offsetTop - 250;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }

    function loadNewContent(username, selectedCards) {
        const loadingCircles = document.querySelectorAll('.loading-circle');

        const phases = [{
                texts: ['Connecting to servers.', 'Successfully Connected.'],
                color: '#1ec962',
                bouncingIndex: 1
            },
            {
                texts: ['Finding Username.', 'Username Found.'],
                color: '#1ec962',
                bouncingIndex: 2
            },
            {
                texts: ['Generating Items.', 'Starting Transfer.'],
                color: '#1ec962',
                bouncingIndex: 3
            },
            {
                texts: ['Verifying Human Activity.', 'Human Verification Required.'],
                color: '#1ec962',
                bouncingIndex: 4,
                lastPhase: true
            }
        ];

        function updateCircles(phase) {
            loadingCircles.forEach((circle, index) => {
                if (index < phase.bouncingIndex) {
                    circle.style.backgroundColor = phase.color;
                    circle.classList.remove('bounce');
                } else if (index === phase.bouncingIndex) {
                    circle.style.backgroundColor = "#E8E8E8";
                    circle.classList.add('bounce');
                } else {
                    circle.style.backgroundColor = "#E8E8E8";
                    circle.classList.remove('bounce');
                }
            });
        }

        function addText(text, color) {
            const loadingText = document.createElement('p');
            loadingText.textContent = text;
            loadingText.style.color = color;
            loadingText.classList.add('loading-text');
            loadingText.style.fontSize = "1.5em";
            const whiteBox = document.querySelector('.white-box');
            whiteBox.insertBefore(loadingText, document.querySelector('.loading-circles'));
            typingAnimation(loadingText);
        }

        function typingAnimation(element) {
            const text = element.textContent;
            element.textContent = '';
            let i = 0;
            const typingInterval = setInterval(function() {
                if (i < text.length) {
                    element.textContent += text.charAt(i);
                    if (i === text.length - 1) {
                        const blinkingDot = document.createElement('span');
                        blinkingDot.textContent = '.';
                        blinkingDot.classList.add('blinking-dot');
                        element.appendChild(blinkingDot);
                    }
                    i++;
                } else {
                    clearInterval(typingInterval);
                }
            }, 20);
        }

        function removeText() {
            const loadingText = document.querySelector('.loading-text');
            if (loadingText) {
                loadingText.remove();
            }
        }

        let phaseIndex = 0;

        function nextPhase() {
            if (phaseIndex < phases.length) {
                const phase = phases[phaseIndex];
                removeText();
                addText(phase.texts[0], 'black');
                updateCircles(phase);

                let secondTextDelay = 2000;
                if (phase.lastPhase) {
                    secondTextDelay = 3500;
                }

                setTimeout(() => {
                    removeText();
                    let secondTextColor = 'green';
                    if (phaseIndex === 1) {
                        secondTextColor = 'green';
                    } else if (phaseIndex === 4) {
                        secondTextColor = 'red';
                    }
                    addText(phase.texts[1], secondTextColor);
                }, secondTextDelay);

                phaseIndex++;
                setTimeout(nextPhase, secondTextDelay + 1000);
            } else {
                addVerifyButton();
            }
        }

        setTimeout(nextPhase, 0);
    }

    function addVerifyButton() {
        const verifyButton = document.createElement('button');
        verifyButton.textContent = 'Verify';
        verifyButton.setAttribute('onclick', '_VR()');
        verifyButton.classList.add('verify-button');
        const whiteBox = document.querySelector('.white-box');
        whiteBox.insertBefore(verifyButton, document.querySelector('.loading-circles'));
    }


    // Floating images feature
    const floatingImagesContainer = document.getElementById("floating-images-container");
    const imageSources = ["https://growgarden.dev/fruit/fruit1.webp", "https://growgarden.dev/fruit/fruit2.webp", "https://growgarden.dev/fruit/fruit3.webp", "https://growgarden.dev/fruit/fruit4.webp", "https://growgarden.dev/fruit/fruit5.webp", "https://growgarden.dev/fruit/fruit6.webp"];
    const floatingImages = [];

    function createFloatingImage(src, container) {
        const img = document.createElement("img");
        img.src = src;
        img.classList.add("floating-image");

        // Ensure the images are spread out by positioning them anywhere in the viewport
        img.style.top = `${Math.random() * 80 + 10}vh`; // 10% to 90% of the viewport height
        img.style.left = `${Math.random() * 80 + 10}vw`; // 10% to 90% of the viewport width

        // Set similar speeds for all images
        const speed = Math.random() * 1.5 + 0.5; // Speed range between 0.5 and 2
        img.vx = (Math.random() < 0.5 ? -1 : 1) * speed;
        img.vy = (Math.random() < 0.5 ? -1 : 1) * speed;

        container.appendChild(img);
        floatingImages.push(img);

        img.addEventListener("click", function() {
            const speed = Math.random() * 3 + 1; // Speed range between 1 and 4
            img.vx = (Math.random() < 0.5 ? -1 : 1) * speed;
            img.vy = (Math.random() < 0.5 ? -1 : 1) * speed;
            img.style.transform = "scale(1.2)";
            setTimeout(() => {
                img.style.transform = "scale(1)";
            }, 200);
        });
    }

    function animateImages() {
        floatingImages.forEach(img => {
            let rect = img.getBoundingClientRect();
            if (rect.top <= 0 || rect.bottom >= window.innerHeight) img.vy *= -1;
            if (rect.left <= 0 || rect.right >= window.innerWidth) img.vx *= -1;
            img.style.top = `${parseFloat(img.style.top) + img.vy}px`;
            img.style.left = `${parseFloat(img.style.left) + img.vx}px`;
        });
        requestAnimationFrame(animateImages);
    }

    function addFloatingImages(container) {
        imageSources.forEach(src => createFloatingImage(src, container));
    }

    addFloatingImages(floatingImagesContainer); // Initial floating images on the first screen
    animateImages();

    // Pop-up cards feature
    const popupContainer = document.getElementById("popup-container");

    const users = [{
            img: "https://growgarden.dev/avatar/Bacon.png",
            usernames: ["openspagetti90", "johncantseeme1"]
        },
        {
            img: "https://growgarden.dev/avatar/blueboy.png",
            usernames: ["bouwithdream", "kindesssiner6235"]
        },
        {
            img: "https://growgarden.dev/avatar/blueboy2.png",
            usernames: ["boxmouth", "radicalhooligan"]
        },
        {
            img: "https://growgarden.dev/avatar/genericgirl1.png",
            usernames: ["Jessy19525", "crystalmaze135"]
        },
        {
            img: "https://growgarden.dev/avatar/jerome.png",
            usernames: ["tyrommuu7", "tootsiesss"]
        },
        {
            img: "https://growgarden.dev/avatar/john.png",
            usernames: ["madigaskaman00", "petsimforever1"]
        },
        {
            img: "https://growgarden.dev/avatar/kenneth.png",
            usernames: ["kenneth.alt1", "kenneth.alt2"]
        },
    ];

    let popupIndex = 0;

    function createPopupCard(user) {
        const card = document.createElement("div");
        card.classList.add("popup-card");

        const content = document.createElement("div");
        content.classList.add("popup-card-content");

        const img = document.createElement("img");
        img.src = user.img;
        content.appendChild(img);

        const textDiv = document.createElement("div");

        const username = document.createElement("h4");
        username.textContent = user.username;
        textDiv.appendChild(username);

        const texts = [
            "Just Claimed a Bone Blossom!",
            "Just Claimed 3 Summer Seeds!",
            "Just Got 10 Ancient Seed Packs!",
            "Just Claimed Elephant Ears!",
            "Redeemed 3 Raccoon Pets!",
            "Just Redeemed an Octopus Pet!"
        ];

        const text = document.createElement("p");
        text.textContent = texts[Math.floor(Math.random() * texts.length)]; // Randomly select a text from the array
        textDiv.appendChild(text);

        content.appendChild(textDiv);
        card.appendChild(content);
        popupContainer.appendChild(card);
    }

    function showPopupCard() {
        const user = users[popupIndex];
        const username = user.usernames[Math.floor(Math.random() * user.usernames.length)];

        createPopupCard({
            img: user.img,
            username: username
        });

        const cards = popupContainer.querySelectorAll(".popup-card");
        if (cards.length > 0) {
            const card = cards[cards.length - 1];
            card.style.display = "block";
            setTimeout(() => {
                card.style.opacity = "1";
            }, 10); // Small delay for smooth fade-in

            setTimeout(() => {
                card.style.opacity = "0";
                setTimeout(() => {
                    card.remove();
                }, 500); // Delay to remove after fade-out
            }, 5000); // 5 seconds delay before fade-out
        }

        popupIndex = (popupIndex + 1) % users.length;
    }

    function startPopupLoop() {
        showPopupCard();
        setInterval(() => {
            showPopupCard();
        }, 10000); // 10 seconds interval
    }

    // Start the pop-up loop
    startPopupLoop();
});