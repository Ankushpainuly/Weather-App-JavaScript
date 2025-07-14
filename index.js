const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");

const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");
const errorScreen=document.querySelector(".error");
const errorMessage=document.querySelector(".errorMsg");

let oldTab=userTab;
const API_KEY='7d73da5e49149ea3512612fb5ca1e756';
oldTab.classList.add("current-tab");
getfromSessionStorage();

function switchTab(newTab){
    errorScreen.classList.remove("active");
    if(newTab != oldTab){
        oldTab.classList.remove("current-tab");
        oldTab=newTab;
        oldTab.classList.add("current-tab");

        if(!(searchForm.classList.contains("active"))){
           //kya search form wala container is invisible, if yes then make it visible
           userInfoContainer.classList.remove("active");
           grantAccessContainer.classList.remove("active");
           searchForm.classList.add("active");
        }
        else{
            //main pehle search wale tab pr tha, ab your weather tab visible karna h 
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            //ab main your weather tab me aagya hu, toh weather bhi display karna poadega, so let's check local storage first
            //for coordinates, if we haved saved them there.
            getfromSessionStorage();
        }
    }
    
}


userTab.addEventListener('click',()=>{ 
    //pass clicked tab as input parameter
    switchTab(userTab);
});

searchTab.addEventListener('click',()=>{ 
    //pass clicked tab as input parameter
    switchTab(searchTab);
});


//check if cordinates are already present in session storage
function getfromSessionStorage(){
    const localCoordinates = sessionStorage.getItem("user-cordinates");
    if(!localCoordinates){
        //check if cordinates are already present in session storage
        grantAccessContainer.classList.add("active");
    }
    else{
        const coordinates=JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }
}


async function fetchUserWeatherInfo(coordinates){
    const {lat,lon}=coordinates;
    
    // make grantcontainer invisible
    grantAccessContainer.classList.remove("active");
    // make loding visible
    loadingScreen.classList.add("active");

    // API CALL
    try{

        const res= await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
        const data=await res.json();

        if(!data.main){//agar data me main wala obj nahi h mtlb error h data
            throw data;
        }

        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    }
    catch(error){
        loadingScreen.classList.remove("active");
        errorScreen.classList.add("active");
        errorMessage.innerText=`${error?.message}`
        
    }

}

function renderWeatherInfo(weatherInfo){
     //fistly, we have to fethc the elements 
    const cityName=document.querySelector("[data-cityName]");
    const countryIcon=document.querySelector("[data-contryIcon]");

    const desc=document.querySelector("[data-weatherDesc]");
    const weatherIcon=document.querySelector("[data-weatherIcon]");
    const temp=document.querySelector("[data-temp]");

    const windspeed=document.querySelector("[data-windSpeed]");
    const humidity=document.querySelector("[data-humidity]");
    const cloudiness=document.querySelector("[data-cloudiness]");

    //fetch values from weatherINfo object and put it UI elements

    // using optional chaning operator (?.) over (. dot )if value not present it gives undifiend insted of error

    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText= weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText=`${weatherInfo?.main?.temp} ℃`;
    windspeed.innerText=`${weatherInfo?.wind?.speed}m/s`;
    humidity.innerText=`${weatherInfo?.main?.humidity}%`;
    cloudiness.innerText=`${weatherInfo?.clouds?.all}%`;



}


function getLocation(){
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else{
        // show an allert for no geo location available
    }
}

function showPosition(position){

    const userCoordinates={
        lat:position.coords.latitude,
        lon:position.coords.longitude   
    }

    sessionStorage.setItem("user-cordinates",JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}

const grantAccessButton=document.querySelector("[data-grantAccess]");
    grantAccessButton.addEventListener('click',getLocation);


const searchInput=document.querySelector("[data-searchInput]");
    
searchForm.addEventListener("submit",(e)=>{

    e.preventDefault();
    let cityName=searchInput.value;

    if(cityName==""){
        return;
    }
    else{
        searchInput.value="";
        fetchSearchWeatherInfo(cityName);
    }

})


async function fetchSearchWeatherInfo(cityName){

    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");
    errorScreen.classList.remove("active");

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}`
          );
        const data = await response.json();

        //when enter wrong city name
        
        if(!data.main){//agar data me main wala obj nahi h mtlb error h data
            throw data;
        }

        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    }
    catch(error) {
        loadingScreen.classList.remove("active");
        errorScreen.classList.add("active");
        errorMessage.innerText=`${error?.message}`;
                
    }
}