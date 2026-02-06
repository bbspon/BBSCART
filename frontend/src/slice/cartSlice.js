import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from '../utils/api';
const BASE_URL = "/cart"; // Update this with your backend URL
import instance from "../services/axiosInstance"
// ✅ Fetch cart items
export const fetchCartItems = createAsyncThunk(
  "cart/fetchCartItems",
  async (_, thunkAPI) => {
    try {
      const pincode = localStorage.getItem("deliveryPincode") || "";
      const response = await instance.get(`${BASE_URL}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "x-delivery-pincode": pincode,
        },
      });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ✅ Add item to cart (handles variantId)
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ productId, variantId = null, quantity }, { rejectWithValue }) => {
    // FIX: get deliveryPincode from localStorage
    const deliveryPincode = localStorage.getItem("deliveryPincode");

    console.log("API Request:", {
      productId,
      variantId,
      quantity,
      deliveryPincode,
    });

    try {
      if (!productId) throw new Error("Product ID is missing");

      const response = await instance.post(
        `${BASE_URL}/add`,
        { productId, variantId, quantity, deliveryPincode },
        { withCredentials: true }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error adding product to cart"
      );
    }
  }
);


// ✅ Update item quantity (handles variantId)
export const updateQuantity = createAsyncThunk(
  "cart/updateQuantity",
  async ({ productId, variantId = null, quantity }, { rejectWithValue }) => {
    console.log("Updating Quantity:", { productId, variantId, quantity });
    try {
        const response = await instance.put(
          `${BASE_URL}/update`,
          { productId, variantId, quantity },
          { withCredentials: true }
        );

        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || "Error updating quantity");
    }
  }
);

// ✅ Remove item from cart (handles variantId)
export const removeFromCart = createAsyncThunk(
    "cart/removeFromCart",
    async ({ productId, variantId = null }, { rejectWithValue }) => {
        console.log("removeFromCart:", productId, variantId); // Debugging
        try {
            await instance.delete(`${BASE_URL}/remove/${productId}`, {
              data: { variantId },
              withCredentials: true,
            });
            return { productId, variantId };
        } catch (error) {
            return rejectWithValue(error.response?.data || "Error removing item from cart");
        }
    }
);

// ✅ Clear entire cart
export const clearCart = createAsyncThunk("cart/clearCart", async (_, { rejectWithValue }) => {
    try {
        await instance.delete(`${BASE_URL}/clear`, { withCredentials: true });
        return [];
    } catch (error) {
        return rejectWithValue(error.response?.data || "Error clearing cart");
    }
});

// 🔥 Redux Cart Slice
const cartSlice = createSlice({
    name: "cart",
    initialState: {
        items: [],
        status: "idle", // "idle" | "loading" | "succeeded" | "failed"
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCartItems.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchCartItems.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.items = action.payload;
            })
            .addCase(fetchCartItems.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })
            .addCase(addToCart.fulfilled, (state, action) => {
                const { product, variant, quantity } = action.payload.cartItem;
                const existingItem = state.items.find(
                    (item) => item.product._id === product && item.variant?._id === variant
                );

                if (existingItem) {
                    existingItem.quantity += quantity;
                } else {
                    state.items.push(action.payload.cartItem);
                }
            })
            .addCase(updateQuantity.fulfilled, (state, action) => {
                const { product, variant, quantity } = action.payload.cartItem;
                const item = state.items.find(
                    (item) => item.product._id === product && item.variant?._id === variant
                );

                if (item) {
                    item.quantity = quantity;
                }
            })
            .addCase(removeFromCart.fulfilled, (state, action) => {
                state.items = state.items.filter(
                    (item) => !(item.product._id === action.payload.productId && item.variant?._id === action.payload.variantId)
                );
            })
            .addCase(clearCart.fulfilled, (state) => {
                state.items = [];
            });
    },
});

export default cartSlice.reducer;