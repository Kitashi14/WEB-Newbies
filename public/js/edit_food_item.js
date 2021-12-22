function createFoodDetailHtml(foodData){
    let foodInfo = `<div class="foodDetailBox" id="price">Price - ${foodData.price}</div>
        <div class="foodDetailBox" id="rating">Rating - ${foodData.rating}</div>
        <div class="foodDetailBox" id="totalOrders">Total Orders - ${foodData.numberOfTimesOrdered}</div>
        <div class="foodDetailBox" id="timeToPreapare">Time-Taken - ${foodData.timeToPreapare}</div>
        <div class="foodDetailBox" id="tags">Tags - ${foodData.tags}
    </div>`;

    const foodDetails = document.querySelector('.foodDetails');
    foodDetails.insertAdjacentHTML("afterbegin", foodInfo);

    let ingredientsAndMethod = `<div class="foodIngredientsBox">
        <span id="ingredients">Ingredients</span>: <span class="foodIngredientsStyle">
            ${foodData.ingredients}
        </span>
    </div>
    <div class="foodIngredientsBox">
        <span id="method">Method</span>: <span class="foodIngredientsStyle">
            ${foodData.preaparation}
        </span>
    </div>`

    const foodIngredients = document.querySelector('.foodIngredients');
    foodIngredients.insertAdjacentHTML("afterbegin", ingredientsAndMethod);
    
}

function getFoodDetailsFromDatabase(foodName, restaurent){
    fetch(`http://localhost:3000/api/foodDetails?foodName=${foodName}&restaurent=${restaurent}`).then(function(response){
        response.json().then(function(foodData){
            createFoodDetailHtml(foodData);
        })
    })
}


// Loading the ItemImage from LocalStorage
const imageLocation = localStorage.getItem("imageLocation");
const image = document.querySelector('#foodItemImage');
image.src = imageLocation;

// Loading foodName from LocalStorage
const foodName = localStorage.getItem("foodName");
document.querySelector('#item_name').textContent = foodName;

// Getting the restaurent's name from DOM
const restaurent = document.querySelector('#heading').firstElementChild.firstElementChild.textContent;

// Loading price, rating, timeToPreapareFood and other details from Database
getFoodDetailsFromDatabase(foodName, restaurent);

document.querySelector('small').textContent = foodName;