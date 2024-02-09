const cardContainer = document.getElementById("cardContainer");
const limitErr = "You have exceeded the rate limit per minute for your plan, BASIC, by the API provider";
const options = {
    method: 'GET',
    headers: {
        'X-RapidAPI-Key': '420050ebc9msh160870facdbed95p1a46d7jsn452254e59978',
        'X-RapidAPI-Host': 'airbnb13.p.rapidapi.com'
    }
};
const apiObject = JSON.parse(localStorage.getItem("searchObject"));
document.title = `Airbnb | ${apiObject.place} - Holiday Rentals & Places to Stay`


async function getAPIdata(place, checkIn, checkOut, guests) {
    const url = `https://airbnb13.p.rapidapi.com/search-location?location=${place}&checkin=${checkIn}&checkout=${checkOut}&adults=${guests[0]}&children=${guests[1]}&infants=${guests[2]}&pets=${guests[3]}&page=1&currency=INR`;
    return fetch(url, options)
}

// this function is used to render cards
function createCard(thumbNail, hotelType, ratings, reviewsCount, hotelName, noBeds, noBedrooms, prize, hotelLink) {
    let card = document.createElement("div");
    card.classList.add("my-card");

    let cardImg = document.createElement("div");
    cardImg.classList.add("my-card-img");


    let imgTag = document.createElement("img");
    imgTag.src = thumbNail;

    cardImg.appendChild(imgTag);
    card.appendChild(cardImg)

    let cardTitle = document.createElement("div");
    cardTitle.classList.add("my-card-title");

    let headline = document.createElement("h5");
    headline.innerText = hotelType;

    cardTitle.appendChild(headline);

    let ratingsDisplay = document.createElement("div");
    ratingsDisplay.classList.add("ratings-display");
    ratingsDisplay.innerHTML = `<i class="fa-solid fa-star" style="color: #000000;"></i>
    <span>
        ${ratings}(${reviewsCount})
    </span>`

    cardTitle.appendChild(ratingsDisplay);
    card.appendChild(cardTitle);

    let hotelNameTag = document.createElement("h5");
    hotelNameTag.innerText = hotelName;
    card.appendChild(hotelNameTag);

    let beds = document.createElement("p");
    beds.innerText = noBeds + " Beds" + " - " + noBedrooms + " Bedrooms";
    card.appendChild(beds);

    // let dates = document.createElement("p");
    // dates.innerText = stayDates;
    // card.appendChild(dates);

    let priceDisplay = document.createElement("div");
    priceDisplay.classList.add("prize-display");
    priceDisplay.innerText = "₹" + prize
    card.appendChild(priceDisplay);

    const cardAnchor = document.createElement("a");
    cardAnchor.href = hotelLink;
    cardAnchor.target = "_blank";
    cardAnchor.classList.add("card-anchor");

    cardAnchor.appendChild(card);
    cardContainer.appendChild(cardAnchor);
}

const destination = document.getElementById("location");
const dates = document.getElementById("dates");
const people = document.getElementById("people");
function addDataToSearchBar() {
    let inputplace = apiObject.place;
    destination.innerText = inputplace.split(',')[0];
    dates.innerText = formatDate(apiObject.checkIn, apiObject.checkOut);
    people.innerText = `${apiObject.guests[0]} guests`;
}

// this function is used to format date like 26-10-2023 => 26 Oct
function formatDate(checkIn, checkOut) {
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const inday = startDate.getDate();
    const inmonthIdx = startDate.getMonth();
    const inmonth = monthNames[inmonthIdx];

    const outday = endDate.getDate();
    const outmonthIdx = endDate.getMonth();
    const outmonth = monthNames[outmonthIdx];

    if (inmonth === outmonth) {
        return `${inday}-${outday} ${outmonth}`;
    } else {
        return `${inday} ${inmonth} - ${outday} ${outmonth}`;
    }
}

async function getLatLong(place) {
    const url = `https://address-from-to-latitude-longitude.p.rapidapi.com/geolocationapi?address=${place}`;
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': '35529e50acmshe42c2bf03c7e96dp12989cjsn06b3989d95a2',
            'X-RapidAPI-Host': 'address-from-to-latitude-longitude.p.rapidapi.com'
        }
    };

    try {
        const response = await fetch(url, options);
        const result = await response.json();
        const latlongObj = {
            lat: result.Results[0].latitude,
            long: result.Results[0].longitude
        }
        return latlongObj;
    } catch (error) {
        console.error(error);
    }
}


// ******************** Google maps logic *******************//

async function initMap() {
    try {
        //this will load the map from google servers
        const latlonginfo = await getLatLong(apiObject.place);
        const map = new google.maps.Map(document.getElementById("map"), {
            zoom: 12,
            center: { lat: latlonginfo.lat, lng: latlonginfo.long },
            streetViewControl: false,
            zoomControl: true,
            zoomControlOptions: {
                position: google.maps.ControlPosition.RIGHT_TOP
            },
            fullscreenControl: true,
            fullscreenControlOptions: {
                position: google.maps.ControlPosition.LEFT_TOP
            },
            mapTypeControl: false,
            rotateControl: false
        })
        // now the map is loaded calling the AirBNB api to get hotel details

        const response = await getAPIdata(apiObject.place, apiObject.checkIn, apiObject.checkOut, apiObject.guests)
        const data = await response.json();
        if (data.message !== limitErr) {
            console.log(data);
            for (let i = 0; i < data.results.length; i++) {
                // function call to render cards
                createCard(data.results[i].images[0], data.results[i].type, data.results[i].rating, data.results[i].reviewsCount, data.results[i].name, data.results[i].beds, data.results[i].bedrooms, data.results[i].price.rate, data.results[i].deeplink);
                // function call to add markers on he map
                // passing the hotel name, latitude and longitude to setmarker function
                // the hotel name must be a string
                setMarkers(map, data.results[i].lat, data.results[i].lng, JSON.stringify(data.results[i].name));
                // this function adds info to the search bar at the top of the page
                addDataToSearchBar();
            }
        }
    } catch (err) {
        console.log(err);
    }

}

// this function will add marker on the map
function setMarkers(map, lat, lng, title) {
    new google.maps.Marker({
        position: { lat: lat, lng: lng },
        // label: b,
        map,
        title: title,
    });
}

window.initMap = initMap;