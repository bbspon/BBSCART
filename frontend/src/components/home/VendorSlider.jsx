import { useEffect, useState } from "react";
import Slider from "react-slick";
import instance from "../../services/axiosInstance";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Vendor from "../../assets/user-avatar.png";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

/* ================= IMAGE NORMALIZER ================= */
const VENDOR_FALLBACK_ICON = {Vendor};

function norm(u) {
  if (!u) return "/img/placeholder.png";

  const s = String(u).trim();

  if (/^https?:\/\//i.test(s)) return s;

  if (s.startsWith("/uploads/")) return `${API_BASE}${s}`;

  const clean = s.replace(/^\/+/, "");

  if (/\.(jpg|jpeg|png|webp)$/i.test(clean)) {
    return `${API_BASE}/uploads/${encodeURIComponent(clean)}`;
  }

  return `${API_BASE}/uploads/${encodeURIComponent(clean)}.webp`;
}

function pickProductImage(p) {
  if (p.product_img_url) return norm(p.product_img_url);
  if (Array.isArray(p.gallery_img_urls) && p.gallery_img_urls[0])
    return norm(p.gallery_img_urls[0]);
  if (Array.isArray(p.product_img) && p.product_img[0])
    return norm(p.product_img[0]);
  if (Array.isArray(p.gallery_imgs) && p.gallery_imgs[0])
    return norm(p.gallery_imgs[0]);
  return "/img/placeholder.png";
}

/* ================= SLIDER SETTINGS ================= */

const settings = {
  dots: false,
  arrows: true,
  infinite: false,
  speed: 500,
  slidesToShow: 4,
  slidesToScroll: 1,
  responsive: [
    { breakpoint: 1024, settings: { slidesToShow: 2 } },
    { breakpoint: 640, settings: { slidesToShow: 1 } },
  ],
};

/* ================= VENDOR CARD ================= */

const VendorCard = ({ vendor }) => (
  <div className="bg-white rounded-xl p-4 shadow-md">
    <div className="flex items-center gap-3 mb-4">
   <img
  src={Vendor}
  alt={vendor.name}
  className="w-12 h-12 rounded-md object-contain"
  onError={(e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = VENDOR_FALLBACK_ICON;
  }}
/>

      <div>
        <h4 className="font-bold text-gray-800">{vendor.name}</h4>
        <p className="text-sm text-gray-500">{vendor.items} Items</p>
      </div>
    </div>

    <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
      <div className="flex text-yellow-500">
        {Array.from({ length: vendor.rating }).map((_, i) => (
          <span key={i}>★</span>
        ))}
        {Array.from({ length: 5 - vendor.rating }).map((_, i) => (
          <span key={i}>☆</span>
        ))}
      </div>
      <div>Sales {vendor.sales}</div>
    </div>

    <div className="grid grid-cols-2 gap-2">
      {vendor.products.map((src, i) => (
        <div key={i} className="p-2 border rounded-md">
          <img
            src={src}
            alt=""
            className="h-16 object-contain mx-auto"
            onError={(e) => (e.currentTarget.src = "/img/placeholder.png")}
          />
        </div>
      ))}
    </div>
  </div>
);

/* ================= MAIN COMPONENT ================= */

export default function VendorSlider() {
  const [vendors, setVendors] = useState([]);

  useEffect(() => {
    const loadVendors = async () => {
      try {
        const { data } = await instance.get("/products/public", {
          params: { limit: 300 },
        });

        const products = Array.isArray(data?.products) ? data.products : [];

        /* ---------- STEP 1: GROUP PRODUCTS BY VENDOR ---------- */
        const vendorMap = {};

        products.forEach((p) => {
          const vid = p.vendorId || p.sellerId || "default";

          if (!vendorMap[vid]) {
            vendorMap[vid] = {
              id: vid,
              name: p.vendorName || p.sellerName || "Vendor",
              logo: norm(p.vendorLogo || p.sellerLogo),
              rating: 4 + Math.floor(Math.random() * 2),
              sales: Math.floor(Math.random() * 500) + 300,
              items: 0,
              productImages: [],
            };
          }

          vendorMap[vid].items += 1;

          vendorMap[vid].productImages.push(pickProductImage(p));
        });

        /* ---------- STEP 2: SPLIT EACH VENDOR INTO MULTIPLE CARDS ---------- */
        const cards = [];

        Object.values(vendorMap).forEach((v) => {
          for (let i = 0; i < v.productImages.length; i += 4) {
            cards.push({
              id: `${v.id}-${i}`,
              name: v.name,
              logo: v.logo,
              rating: v.rating,
              sales: v.sales,
              items: v.items,
              products: v.productImages.slice(i, i + 4),
            });
          }
        });

        setVendors(cards.slice(0, 20)); // limit cards if needed
      } catch (err) {
        console.error("Vendor slider load failed", err);
      }
    };

    loadVendors();
  }, []);

  return (
    <>
      <div className="container mx-auto px-4 py-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Top <span className="text-[#dc2043]">Vendors</span>
          </h2>
          <button className="text-gray-500 hover:text-[#dc2043] flex items-center gap-1 text-sm">
            All Vendors <span className="text-xl">»</span>
          </button>
        </div>

        {vendors.length ? (
          <Slider {...settings}>
            {vendors.map((vendor) => (
              <div key={vendor.id} className="px-2 py-3">
                <VendorCard vendor={vendor} />
              </div>
            ))}
          </Slider>
        ) : (
          <p className="text-sm text-gray-400">No vendors available</p>
        )}
      </div>

      <style>
        {`
          .slick-prev:before,
          .slick-next:before {
            color: #dc2043;
            opacity: 1 !important;
          }
        `}
      </style>
    </>
  );
}
