// const restaurent = document.querySelector('#span-p2-one').firstElementChild.textContent;

// function addToDatabase(foodName, time, imgSrc, price, tags, method, ingredients){
//     fetch(`http://localhost:3000/foodCatalog?foodName=${foodName}&timeToPreapare=${time}&imageUrl=${imgSrc}&price=${price}&tags=${tags}
//     &preaparation=${method}&ingredients=${ingredients}&restaurent=${restaurent}`).then(function(response){
//         response.json().then(function(data){
//             console.log('The data is -----')
//             console.log(data);
//         })
//     })
// }

// function checkDataPresent(){
//     const data = JSON.parse(localStorage.getItem("foodData"));
//     let dataAvailable = 1;

//     for (const[key, value] of Object.entries(data)){
//         if (!Boolean(value)){
//             dataAvailable = 0;
//             break
//         }
//     }
//     return dataAvailable;
// }

// function storeData(event){
//     event.preventDefault();

//     const foodName = document.querySelector('#name').value;
//     const price = document.querySelector('#price').value;
//     const time = document.querySelector('#time').value;
//     const ingredients = document.querySelector('#ingredients').value;
//     const method = document.querySelector('#method').value;
//     const tags = document.querySelector('#tags').value;
//     const imgSrc = document.querySelector('#img-src').value;

//     foodData = {
//         foodName: foodName,
//         price: price,
//         time: time,
//         ingredients: ingredients,
//         method: method,
//         tags: tags,
//         imgSrc: imgSrc
//     }

//     // localStorage stores data in the form of srting thus to store objects we first convert them into JSOn string using stringify and
//     // we can later parse it
//     localStorage.setItem("foodData", JSON.stringify(foodData));
    
//     if (checkDataPresent){
//         addToDatabase(foodName, time, imgSrc, price, tags, method, ingredients);
//         localStorage.setItem("state", 1);
//         console.log("Changing Location");
//         location.href = "http://localhost:3000/food_items_manager";
//     }
//     else{
//         return console.log("Try Again");
//     }
// }

// document.querySelector('#add_button').addEventListener('click', storeData);
