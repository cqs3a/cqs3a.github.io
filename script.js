//send the $ajax requests
$(document).ready(function(){
    alert("A search for cat or dog will bring the appropriate information. If you aren't receiving all the taxon information try refining your search (crocodile to nile crocodile or from panda to giant/red panda)")
    queryCrunch.init();
})

//the glue that holds everything together
const queryCrunch = {};


//stores the google search API key
//second key if default limit is reached
//AIzaSyCz-BgJzhqbpj2KXvdKHvJimnuUcy-cpEg
queryCrunch.googleKey = 'AIzaSyByCwNV10Sw6665PNCY8kfT2HnrPIy1qog'

//function that gets detailed species information (class, order, family,)
queryCrunch.getSpecies = async (query) => {
    const queryResults = await $.ajax({
        url: `https://api.gbif.org/v1/species/search?q=${query}&limit=1`,
        method: 'GET',
        dataType: 'json',
    });
    queryCrunch.updateAnimal(queryResults);
}

//image search fucntion request 
queryCrunch.getImage = async (query) => {
    const queryResults = await $.ajax({
        url: `https://www.googleapis.com/customsearch/v1?key=${queryCrunch.googleKey}&cx=005464953580367337071:hktzsrcxhgk&q=${"wikipedia", query}`,
        method: 'GET',
        dataType: 'json',

    })
    //picking the image url from the google results
    speciesImage = queryResults.items[0].pagemap.cse_image[0].src;
    console.log(queryResults)
    //append the image to the DOM
    $('.image').append(`
        <img src="${speciesImage}">
    `);
}

//1 get the summary of the animal from it's coresponding wikipedia page
queryCrunch.getDescription = async (query) => {
    const queryResults = await $.ajax({
        url:`https://en.wikipedia.org/w/api.php?action=query&prop=extracts&format=json&exintro=&titles=${query}`,
        method: 'GET',
        dataType: 'jsonp',
    })

    //coverts the object and its contents into a tree of arrays
    const convertedArray = Object.entries(queryResults.query.pages);
    //take the HTML of the title
    const descriptor = convertedArray[0][1].extract;
    $('.textArea').append(`<div class="applyBorder">${descriptor}</div>`);
    //queryCrunch.textFix();
    queryCrunch.getName(descriptor); 
}

//get the genus and species strings for the getSpecies() function
queryCrunch.getName = (array) => {
    //patern to help locate the genus and species from the article
    pattern = "<i>(.*?)</i>"; 
    //store the genus and species of the animal
    resultingArray = array.match(pattern);
    resultingText = resultingArray[1];
    seperatedText = resultingText.split(" ");
    getSpeciesQuery = seperatedText[0] + " " + seperatedText[1];
    queryCrunch.animal.genus = seperatedText[0];
    temp = seperatedText[1];
    queryCrunch.animal.species = temp.replace(/\b\w/g, l => l.toUpperCase());
    queryCrunch.getSpecies(getSpeciesQuery);
    queryCrunch.getImage(getSpeciesQuery);
}

//write the taxonomy information to the DOM
queryCrunch.displayTaxonomy = () => {
    $('.species').append(`${queryCrunch.animal.species}`);
    $('.genus').append(`${queryCrunch.animal.genus}`);
    $('.family').append(`${queryCrunch.animal.family}`);
    $('.order').append(`${queryCrunch.animal.order}`);
    $('.class').append(`${queryCrunch.animal.class}`);
}

//storing animal information
queryCrunch.animal = {
    species: '',
    genus: '',
    family: '',
    order: '',
    class: '',
    //try and get the alt for the images as well if possible
}

//test frame for html test button lives here
queryCrunch.test = (result) => {
    console.log(result);
}

//displays relevant things on the DOM/Console
queryCrunch.updateAnimal = (piped) => {
    queryCrunch.animal.family = piped.results[0].family;
    queryCrunch.animal.class = piped.results[0].family;
    queryCrunch.animal.order = piped.results[0].order;
    queryCrunch.displayTaxonomy();
}

queryCrunch.clearFields = () => {
    description = document.querySelector(".textArea");
    description.innerHTML = '';

    clas = document.querySelector(".class");
    clas.innerHTML = '';

    order = document.querySelector(".order");
    order.innerHTML = '';

    family = document.querySelector(".family");
    family.innerHTML = '';

    genus = document.querySelector(".genus");
    genus.innerHTML = '';

    species = document.querySelector(".species");
    species.innerHTML = '';

    image = document.querySelector('.image');
    image.innerHTML = '';
}

//removes unnecessary text and class artifacts from the wikipedia text
// queryCrunch.textFix = () => {

//     //fixing the \n text within the parent text elements
//     $('.textArea').contents().filter(function(){
//         // === 3 for removing text 
//         return this.nodeType === 3;
//     }).remove();

//     //removes the classes of (x) i times 
//     for (i = 0; i < 4; i++) {
//         const rawDescription = document.querySelector(".textArea[class*='mw-empty-elt']")
//         rawDescription.parentNode.removeChild(rawDescription);
//     }
//     return
// }

queryCrunch.init = () => {
    $('form').on('submit', function(event) {
        event.preventDefault();
        queryCrunch.clearFields();
        sQuery = document.getElementById('searchQuery').value;
        queryCrunch.getDescription(sQuery);
    })
}

