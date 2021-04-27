var eventBus = new Vue()
//componente secundarios
Vue.component('product-details',{
    props:{
        details:{
            type:Array,
            required: true
        }
    },
    template:`
    <ul>
        <li v-for="detail in details">{{ detail }}</li>
     </ul>`

})

Vue.component('product-review',{
    template: `
    <div class="review-container">
    <form class="review-form" @submit.prevent="onSubmit">

    
    <p>
        <label for="name"> Name:</label>
        <input id="name" v-model="name" placeholder="name">
    </p>
    <p>
        <label for="review">Review:</label>
        <textarea id="review" v-model="review" ></textarea>
    </p>
    <p> 
        <label for="rating">Rating:</label>
        <select id="rating" v-model.number="rating">
        <option>5</option>
        <option>4</option>
        <option>3</option>
        <option>2</option>
        <option>1</option>
        </select>
    </p>
    <p>Would you recommend this product?</p>
        <label>
          Yes
          <input type="radio" value="Yes" v-model="recommend"/>
        </label>
        <label>
          No
          <input  type="radio" value="No" v-model="recommend"/>
        </label>
        <input  class="button" type="submit" value="submit">
    </p>
    </form>
    </div>
    `,

    data(){
        return{
            name:null,
            review: null,
            rating: null,
            recommend: null,
            errors:[]

        }
    },
    methods:{
        onSubmit(){
           if(this.name && this.review && this.rating && this.recommend){
            let productReview={
                name: this.name,
                review: this.review,
                rating: this.rating,
                recommend:this.recommend
            }
            eventBus.$emit('review-submitted',productReview)
            this.name=null
            this.review = null
            this.rating = null
            this.recommend =null
           }else {
            if(!this.name)this.errors.push("Name required")
            if(!this.review)this.errors.push("Review required")
            if(!this.rating)this.errors.push("Rating required")
            if(!this.recommend)this.errors.push("recommenting required")
           }            
        }
    }

})
Vue.component('product-tabs', {
    props: {
      reviews: {
        type: Array,
        required: false
      }
    },
    template: `
      <div>
      
        <div>
          <span class="tabs" 
                :class="{ activeTab: selectedTab === tab }"
                v-for="(tab, index) in tabs"
                :key="index"
                @click="selectedTab = tab"
          >{{ tab }}</span>
        </div>

        <div v-show="selectedTab === 'Reviews'">
            <p v-if="!reviews.length">There are no reviews yet.</p>
            <ul v-else>
                <li v-for="review in reviews">
                  <p>{{ review.name }}</p>
                  <p>Rating:{{ review.rating }}</p>
                  <p>{{ review.review }}</p>
                </li>
            </ul>
        </div>

        <div v-show="selectedTab === 'Make a Review'">
          <product-review></product-review>
        </div>
    
      </div>
    `,
    data() {
      return {
        tabs: ['Reviews', 'Make a Review'],
        selectedTab: 'Reviews'
      }
    }
  })

//Componente principal
Vue.component('product', {
    props: {
        premium: {
            type: Boolean,
            required: true
          }
        },
      template: `
       <div class="product">
            
          <div class="product-image">
            <img :src="image" />
          </div>
    
          <div class="product-info">
              <h1>{{ product }}</h1>
              <p v-if="inStock">In Stock</p>
              <p v-else>Out of Stock</p>
              <p>Shipping: {{ shipping }}</p>
    
              <product-details :details="details"></product-details>       
    
              <div class="color-circle"
                   v-for="(variant, index) in variants" 
                   :key="variant.variantId"
                   :style="{ backgroundColor: variant.variantColor }"
                   @mouseover="updateProduct(index)"
                   >
              </div> 
    
              <button v-on:click="addToCart" 
                :disabled="!inStock"
                :class="{ disabledButton: !inStock }"
                >
              Add to cart
              </button>
              <button @click="removeFromCart"
                  
                  >Remove from cart</button>
                  
           </div> 
            <product-tabs :reviews="reviews"></product-tabs>
           
                
           <div>
                <h2>Reviews</h2>
                <p v-if="!reviews.length">There are no review yet.</p>
                <ul>
                  <li v-for="review in reviews">
                  <p>{{review.name}}</p>
                  <p>Rating:{{review.rating}}</p>
                  <p>{{review.review}}</p>
                  </li>
                </ul>
            </div>
        </div>
    `,
    data(){
        return {
            product: 'Socks',
            selectedVariant: 0,
            brand: 'Vue Mastery',
            details: ["80% cotton","20% polyster", "Gender-nautral"],
            variants: [
               {
                   variantId:2213,
                   variantColor:"green",
                   variantImage: 'vmSocks.jpg',
                   variantQuantity:10
               },
               {
                   variantId: 2214,
                   variantColor:"blue",
                   variantImage: 'vmSocksblue.jpg',
                   variantQuantity: 0
               }
           ],
            reviews:[],
           onSale: true
        }
    }
    ,
    methods:{
        addToCart(){
            this.$emit('add-to-cart', this.variants[this.selectedVariant].variantId)
        },
        updateProduct(index){
            this.selectedVariant = index
        },
        removeFromCart(){
         this.$emit('remove-to-cart', this.variants[this.selectedVariant].variantId)
        },
        
    },
    computed:{
        title(){
            return this.brand + ' '+ this.product
        },
        image(){
            return this.variants[this.selectedVariant].variantImage
            
        },
        inStock(){
            return this.variants[this.selectedVariant].variantQuantity
        },
        sale(){
            if(this.onSale){
            return this.brand + ' '+ this.product + 'are on on sale'
            }
            return this.band + ' '+this.product + 'are not on sales'
        },
        shipping() {
            if (this.premium) {
              return "Free"
            }
              return 2.99
          }
    },
    mounted(){
        eventBus.$on('review-submitted',productReview =>{
            this.reviews.push(productReview)
        })
    }


    
    
})

var app = new Vue({
    el: '#app',
    data: {
        premium: true,
        cart:[],  
    },
    methods:{
        updateCart(id){
            this.cart.push(id)
        },
        removeFromCart(id){
        for(var i = this.cart.length - 1; i >=0; i--){
            if(this.cart[i] === id){
              this.cart.splice(i, 1);
       }  
      }
     }
    }
})