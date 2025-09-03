import { configureStore } from "@reduxjs/toolkit";
import cartReducer  from "../slice/cartSlice";
import wishlistReducer from "../slice/wishlistSlice";
import orderReducer from "../slice/orderSlice";
import authReducer from "../slice/authSlice";

const store = configureStore({
  reducer: {
    cart: cartReducer,
    wishlist: wishlistReducer,
    order: orderReducer,
    auth: authReducer,
  },
});

export default store;
