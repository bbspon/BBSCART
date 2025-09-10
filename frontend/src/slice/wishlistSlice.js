import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from '../utils/api';

const BASE_URL = "/wishlist"; // Update this with your backend URL

// ✅ Fetch wishlist items
export const fetchWishlistItems = createAsyncThunk("wishlist/fetchWishlistItems", async (_, { rejectWithValue }) => {
    try {
        const response = await api.get(`${BASE_URL}`, { withCredentials: true });
        console.log('Fetch Wishlist Items:',response.data);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || "Error fetching wishlist items");
    }
});

// ✅ Add item to wishlist
export const addToWishlist = createAsyncThunk(
  "wishlist/addToWishlist",
  async ({ productId }, { rejectWithValue }) => {
    try {
        if (!productId) throw new Error("Product ID is missing");

        const response = await api.post(
            `${BASE_URL}/add`, 
            { productId }, 
            { withCredentials: true }
        );

        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || "Error adding product to wishlist");
    }
  }
);

// ✅ Remove item from wishlist
export const removeFromWishlist = createAsyncThunk(
    "wishlist/removeFromWishlist",
    async (productId, { rejectWithValue }) => {
        try {
            await api.delete(`${BASE_URL}/remove/${productId}`, { 
                withCredentials: true 
            });
            return { productId };
        } catch (error) {
            return rejectWithValue(error.response?.data || "Error removing item from wishlist");
        }
    }
);

// ✅ Clear entire wishlist
export const clearWishlist = createAsyncThunk("wishlist/clearWishlist", async (_, { rejectWithValue }) => {
    try {
        await api.delete(`${BASE_URL}/clear`, { withCredentials: true });
        return [];
    } catch (error) {
        return rejectWithValue(error.response?.data || "Error clearing wishlist");
    }
});

// 🔥 Redux Wishlist Slice
const wishlistSlice = createSlice({
    name: "wishlist",
    initialState: {
        items: [], // ✅ Ensure it's an array
        status: "idle",
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchWishlistItems.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchWishlistItems.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.items = action.payload || []; // Ensure items is always an array
            })
            .addCase(fetchWishlistItems.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })
            .addCase(addToWishlist.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.items = action.payload;
            })
            .addCase(removeFromWishlist.fulfilled, (state, action) => {
                state.items = state.items.filter(
                    (item) => item.product._id !== action.payload.productId
                );
            })
            .addCase(clearWishlist.fulfilled, (state) => {
                state.items = [];
            });
    },
});

export default wishlistSlice.reducer;