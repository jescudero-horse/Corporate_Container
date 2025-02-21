/**
 * Function to obtain the information from the videos of the best practise
 */
async function fetchData() {
    try {
        //Call the endpoint to obain the information about the videos
        const response = await fetch('/library/api/getVideos');
        if (!response.ok) {
            throw new Error('Error fetching data');
        }

        //Store the information
        const data = await response.json();

        //Call the method to display the videos
        displayVideos(data);
    } catch (error) {
        console.error('Error no se han podido obtener los videos: ', error);
    }
}

/**
 * Function to display the information like in YouTube
 * @param {*} data Argument that contains the information
 */
function displayVideos(data) {
    //Create a container to display the videos
    const container = document.querySelector('#videosContainer');
    container.innerHTML = '';

    //Iterate throw the data
    data.forEach(item => {
        //Creaate a column
        const col = document.createElement('div');
        col.className = 'col-md-3 mb-3';

        //Create the card
        const card = document.createElement('div');
        card.className = 'card';

        //Create the card body
        const cardBody = document.createElement('div');
        cardBody.className = 'card-body';

        //Create the title of the best practise
        const title = document.createElement('span');
        title.className = 'input-group-text mb-2';
        title.textContent = item.title;

        //Create the videoFrame
        const videoFrame = document.createElement('video');
        videoFrame.id = 'mediaElementPlayer';
        videoFrame.controls = true;

        //Create the source of the video
        const source = document.createElement('source');
        source.src = item.path;
        source.type = 'video/mp4';

        //Add the source to the video frame
        videoFrame.appendChild(source);

        //Create the factory input
        const factory = document.createElement('span');
        factory.className = 'input-group-text mb-2 factory';
        factory.textContent = item.factory;

        //Create the ID of the best practise input
        const idBestPractise_input = document.createElement('span');
        idBestPractise_input.className = 'input-group-text mb-2 idBestPractise';
        idBestPractise_input.textContent = "ID best practise: " + item.id_best_practise;

        //Create and configure the input for the tags
        const keywordInput = document.createElement('input');
        keywordInput.setAttribute('type', 'text');
        keywordInput.setAttribute('name', 'tags');
        keywordInput.disabled = true;
        keywordInput.setAttribute('value', item.keyword)
        keywordInput.className = 'tagify';

        //Create the keywords to convert the format into a Tagify
        const keywords = item.keyword.split(';').map(keyword => ({ value: keyword.trim() }));
        keywordInput.value = JSON.stringify(keywords);

        //Add the inputs into the card body
        cardBody.appendChild(title);
        cardBody.appendChild(videoFrame);
        cardBody.appendChild(factory);
        cardBody.appendChild(idBestPractise_input);
        cardBody.appendChild(keywordInput);

        //Initialize Tagify
        setTimeout(() => {
            new Tagify(keywordInput, {
                readOnly: true,
                originalInputValueFormat: valuesArr => valuesArr.map(item => item.value).join(';')
            });
        }, 0);

        //Create the card footer
        const cardFooter = document.createElement('div');
        cardFooter.className = 'card-footer text-right';

        //Create the IPN of the author
        const ipnCard = document.createElement('span');
        ipnCard.className = 'input-group-text mb-2';
        ipnCard.textContent = item.userID;

        //Create a button to preview the best practise
        const previewButton = document.createElement('button');
        previewButton.className = 'btn btn-outline-primary';
        previewButton.innerHTML = `<i class="bi bi-eye-fill"></i>`;

        //Add the funcionality for the preview button
        previewButton.addEventListener('click', function () {
            //Create an array with the information of the best practise
            const rowData = [
                item.id_best_practise,
                item.title,
                item.factory,
                item.metier,
                item.line,
                item.techology,
                item.category,
                item.keyword,
                item.userID
            ];

            //Convert the row into a JSON format
            const rowDataJson = encodeURIComponent(JSON.stringify(rowData));

            //Open the best practise information in another tab
            window.open(`/library/previewBestPractise?data=${encodeURIComponent(rowDataJson)}`, '_blank');
        });

        //Add the IPN to the card footer
        cardFooter.appendChild(ipnCard);

        //Add the button to the card footer
        cardFooter.appendChild(previewButton);

        //Add the card body into the body
        card.appendChild(cardBody);

        //Add the card footer into the card
        card.appendChild(cardFooter);

        //Add the card into the column
        col.appendChild(card);

        //Add the column into the container
        container.appendChild(col);
    });
}

/**
 * Function to configure the filters by factories
 */
function filterVideos() {
    //Store the actual selected factories
    const selectedFactories = Array.from(document.querySelectorAll('#factoryFilters .form-check-input:checked'))
        .map(checkbox => checkbox.value);

    //Store the video cards
    const videoCards = document.querySelectorAll('#videosContainer .card');

    //Iterate throw the video cards
    videoCards.forEach(card => {
        //Extract the factory element from the card
        const factoryElement = card.querySelector('.input-group-text.mb-2.factory');

        //Extract the factory value from the factory element
        const factory = factoryElement.textContent.trim();

        //If theres any factory on the video station
        if (selectedFactories.length === 0 || selectedFactories.includes(factory)) {
            //Show the card
            card.style.display = 'block';

            //In other case: hide the card
        } else {
            card.style.display = 'none';
        }
    });
}

//Event for the DOMConentLoaded
document.addEventListener('DOMContentLoaded', function () {
    //Make the fetch to obtenin the user ID (IPN)
    fetch('/library/api/user-id', {
        method: "GET"
    })
        .then(response => response.json())
        .then(data => {
            //If the user has an IPN show the navigation panel - admin mode
            if (data.userId) {
                //Store the IPN into the hidden input
                document.getElementById('ipn').value = data.userId;

                document.getElementById('navigation').style.display = 'none';
                document.getElementById('navigation_admin').style.display = 'block';

                //In other case... show the navigation panel - normal mode
            } else {
                document.getElementById('navigation').style.display = 'block';
                document.getElementById('navigation_admin').style.display = 'none';
            }
        })
        .catch(error => console.error('Error fetching user ID:', error));

    //Call the method to obtain the information from the tables
    fetchData();

    //Configure the factory filter
    document.querySelectorAll('#factoryFilters .form-check-input').forEach(checkbox => {
        checkbox.addEventListener('change', filterVideos);
    });

    //Identify the tag input from the filters
    const tagInput = document.querySelector('#tags-input');

    //Instance the Tagify input
    const tagify = new Tagify(tagInput, {
        whitelist: [],
        enforceWhitelist: false,
        dropdown: {
            enabled: 0,
        }
    });

    /**
     * Function to configure the filter by the Tagify tags
     */
    function filterVideosByTags() {
        //Store all the tags that user store in the input
        const tags = tagify.value.map(tag => tag.value.toLowerCase());

        //Store all the cards videos
        const videoCards = document.querySelectorAll('#videosContainer .card');

        //Iterate throw the cards videos
        videoCards.forEach(card => {
            //Store all the value from the tags for each card
            const keywordInput = card.querySelector('input.tagify');

            //If theres any match
            if (keywordInput) {
                //Create a variable to store the values in a JSON format
                let cardTags = [];

                /**Store the value into a JSON format */
                try {
                    cardTags = JSON.parse(keywordInput.value).map(tag => tag.value.toLowerCase());
                } catch (e) {
                    cardTags = keywordInput.value.split(';').map(tag => tag.trim().toLowerCase());
                }

                //Verify if there any tag from the card that match with tags of the user
                const matches = tags.length === 0 || tags.some(tag => cardTags.includes(tag));

                //Show or hide the card if there any match
                card.style.display = matches ? 'block' : 'none';

                //In other case...
            } else {
                //Hide the card
                card.style.display = 'none';
            }
        });
    }

    //Event listener for the tag input
    tagify.on('change', filterVideosByTags);
});