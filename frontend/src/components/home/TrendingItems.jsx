import { useEffect, useState } from "react";
import Slider from "react-slick";
import instance from "../../services/axiosInstance";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
const STATIC_PREFIXES = ["/uploads"];

const FRESH_VEGETABLES_SUBCATEGORY_ID = "6974c2f9087410f5634721ad";

const settings = {
  dots: false,
  arrows: true,
  infinite: false,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
};

/* ================= IMAGE NORMALIZER (SAME AS SUBCATEGORY PAGE) ================= */

function norm(u) {
  if (!u) return "";

  const s = String(u).trim();

  if (/^https?:\/\//i.test(s)) return s;

  if (STATIC_PREFIXES.some((p) => s.startsWith(p + "/"))) {
    return `${API_BASE}${s}`;
  }

  const filename = encodeURIComponent(s.replace(/^\/+/, ""));

  if (/\.(webp|jpg|jpeg|png)$/i.test(filename)) {
    return `${API_BASE}/uploads/${filename}`;
  }

  return `${API_BASE}/uploads/${filename}.webp`;
}

function pickMainImage(p) {
  if (p.product_img_url) return p.product_img_url;

  if (Array.isArray(p.gallery_img_urls) && p.gallery_img_urls[0]) {
    return p.gallery_img_urls[0];
  }

  const firstProductImg = Array.isArray(p.product_img)
    ? p.product_img[0]
    : p.product_img;

  const firstGalleryImg = Array.isArray(p.gallery_imgs)
    ? p.gallery_imgs[0]
    : p.gallery_imgs;

  const splitFirst = (v) => {
    if (!v) return "";
    const t = String(v);
    return t.includes("|")
      ? t.split("|").map((x) => x.trim()).filter(Boolean)[0]
      : t;
  };

  const chosen = splitFirst(firstProductImg) || splitFirst(firstGalleryImg);
  if (!chosen) return "/img/placeholder.png";

  return norm(chosen);
}

/* ================= PRODUCT CARD ================= */

const ProductCard = ({ product }) => (
  <div className="flex items-center gap-4 border p-4 rounded-lg bg-white shadow-sm hover:shadow-md">
    <img
      src={pickMainImage(product)}
      alt={product.name || product.product_name}
      className="w-16 h-16 object-contain"
      onError={(e) => {
        const src = e.currentTarget.src;
        if (src.endsWith(".webp")) e.currentTarget.src = src.replace(".webp", ".jpg");
        else if (src.endsWith(".jpg")) e.currentTarget.src = src.replace(".jpg", ".png");
        else e.currentTarget.src = "/img/placeholder.png";
      }}
    />

    <div className="flex-1">
      <div className="font-semibold text-gray-800 line-clamp-1">
        {product.name || product.product_name}
      </div>
      <div className="text-sm text-gray-500">
        {product.brand || "Fresh"}
      </div>
      <div className="text-sm font-bold text-gray-800">
        ₹{product.price}
        {product.mrp && (
          <span className="text-xs line-through text-gray-400 ml-2">
            ₹{product.mrp}
          </span>
        )}
      </div>
    </div>
  </div>
);

/* ================= MAIN SLIDER ================= */

export default function ProductSlider() {
  const [products, setProducts] = useState({
    trending: [],
    rated: [],
    selling: [],
  });

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const { data } = await instance.get("/products/public", {
          params: {
            subcategoryId: FRESH_VEGETABLES_SUBCATEGORY_ID,
            limit: 30,
          },
        });

        const list = Array.isArray(data?.products) ? data.products : [];

        setProducts({
          trending: list.slice(0, 5),
          rated: list.slice(5, 10),     // fallback – rating not mandatory
          selling: list.slice(10, 15),
        });
      } catch (err) {
        console.error("Product slider load failed", err);
      }
    };

    loadProducts();
  }, []);

  return (
    <div className="container mx-auto px-4 py-10 trending">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

        {/* LEFT BANNER */}
        <div
          className="p-6 rounded-xl text-white flex flex-col justify-between"
          style={{
            backgroundImage:
              "url('/img/products/colourful-organic-ingredients-mexican-cuisine.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <h2 className="text-xl font-bold">Our Top Most Products</h2>
          <button className="bg-green-500 px-4 py-2 rounded self-end mt-4">
            Shop Now
          </button>
        </div>

        {[
          { key: "trending", title: "Trending Items" },
          { key: "rated", title: "Top Rated" },
          { key: "selling", title: "Top Selling" },
        ].map((block) => (
          <div key={block.key}>
            <h3 className="text-lg font-bold mb-3">{block.title}</h3>

            {products[block.key].length ? (
              <Slider {...settings}>
                {products[block.key].map((p) => (
                  <div key={p._id} className="p-2">
                    <ProductCard product={p} />
                  </div>
                ))}
              </Slider>
            ) : (
              <p className="text-sm text-gray-400">No products available</p>
            )}
          </div>
        ))}
      </div>

      <style>
        {`
          .trending .slick-prev {
            top: -28px !important;
            right: 40px !important;
            left: auto !important;
          }
          .trending .slick-next {
            top: -28px !important;
            right: 10px !important;
          }
        `}
      </style>
    </div>
  );
}
