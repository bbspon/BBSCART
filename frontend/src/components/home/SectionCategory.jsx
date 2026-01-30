import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import { motion } from "framer-motion";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Link } from "react-router-dom";
import instance from "../../services/axiosInstance";
import AfterShaveMoisturizerImg from "../../assets/Categories/After-Shave-Moisturizer.jpg";
import BabyBathSkinImg from "../../assets/Categories/Baby-Bath-Skin.jpg";
import BabyBottleCleaningBrushesImg from "../../assets/Categories/Baby-Bottle-Cleaning-Brushes.jpg";
import BabyCareImg from "../../assets/Categories/Baby-Care.jpg";
import BakingProductsImg from "../../assets/Categories/Baking-Products.jpg";
import BasmathiRiceImg from "../../assets/Categories/Basmathi-Rice.jpg";
import BathClothImg from "../../assets/Categories/Bath-Cloth.jpg";
import BathProductsImg from "../../assets/Categories/Bath-Products.jpg";
import BathSoapImg from "../../assets/Categories/Bath-Soap.webp";
import BathroomCleaningImg from "../../assets/Categories/Bathroom-Cleaning.jpg";
import BeveragesImg from "../../assets/Categories/Beverages.jpg";
import BeautyPersonalCareImg from "../../assets/Categories/Beauty-PersonalCare.jpg";
import BiscuitsCakesImg from "../../assets/Categories/Biscuits-Cakes.jpg";
import BiscuitsConfectioneryImg from "../../assets/Categories/Biscuits-Confectionery.jpg";
import BrandedFoodsImg from "../../assets/Categories/Branded-Foods.jpg";
import BreadSpreadsImg from "../../assets/Categories/Bread-Spreads.jpg";
import BreakfastCerealsImg from "../../assets/Categories/Breakfast Cereals.jpg";
import ChickenImg from "../../assets/Categories/Chicken.jpg";
import ChipsSticksImg from "../../assets/Categories/Chips-Sticks.jpg";
import CookingPasteImg from "../../assets/Categories/Cooking-Paste.jpg";
import FishImg from "../../assets/Categories/Fish.webp";
import HyperMarketImg from "../../assets/Categories/HyperMarket.jpg";
import InstantNoodlesImg from "../../assets/Categories/Instant-Noodles.jpg";
import JamHoneyImg from "../../assets/Categories/Jam-Honey.jpg";
import KetchupImg from "../../assets/Categories/Ketchup.jpg";
import MayonnaiseImg from "../../assets/Categories/Mayonnaise.jpg";
import NamkeenMixturesImg from "../../assets/Categories/Namkeen-Mixtures.jpg";
import PackagedFoodImg from "../../assets/Categories/packaged-food.png";
import SaucesImg from "../../assets/Categories/Sauces.jpg";
import ToysImg from "../../assets/Categories/Toys.jpg";
import BeautyAccessoriesImg from "../../assets/Categories/Beauty-Accessories.jpg";
import BrownRiceImg from "../../assets/Categories/Brown-Rice.jpg";
import CoconutOilImg from "../../assets/Categories/Cocount-Oil-2.jpg";
import CreamsWhitenersImg from "../../assets/Categories/Creams-Whiteners.jpg";
import CurdYogurtImg from "../../assets/Categories/Curd-Yogurt.png";
import DairyImg from "../../assets/Categories/Dairy.jpg";
import DriedFruitsImg from "../../assets/Categories/Dried-Fruits.jpg";
import FlourImg from "../../assets/Categories/Flour.jpg";
import FreshVegetablesImg from "../../assets/Categories/Fresh-Vegetables.jpg";
import GheeImg from "../../assets/Categories/Ghee.jpg";
import GingellyOilImg from "../../assets/Categories/Gingelly-Oil.jpg";
import GroceriesImg from "../../assets/Categories/Groceries.jpg";
import PetCareImg from "../../assets/Categories/PetCare.jpg";
import StationeryImg from "../../assets/Categories/Stationery.jpg";

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "";
const PLACEHOLDER_IMAGE = "/img/placeholder.png";

// Normalize category name/slug for matching asset filenames (lowercase, alphanumeric + hyphen)
const normKey = (s) =>
  (s || "")
    .toLowerCase()
    .trim()
    .replace(/\s*[&\u2013\u2014]\s*/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\s/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const CATEGORY_ASSET_MAP = {
  "after-shave-moisturizer": AfterShaveMoisturizerImg,
  aftershavemoisturizer: AfterShaveMoisturizerImg,
  "baby-bath-skin": BabyBathSkinImg,
  babybathskin: BabyBathSkinImg,
  "baby-bottle-cleaning-brushes": BabyBottleCleaningBrushesImg,
  babybottlecleaningbrushes: BabyBottleCleaningBrushesImg,
  "baby-care": BabyCareImg,
  babycare: BabyCareImg,
  "baking-products": BakingProductsImg,
  bakingproducts: BakingProductsImg,
  "basmathi-rice": BasmathiRiceImg,
  basmathirice: BasmathiRiceImg,
  basmati: BasmathiRiceImg,
  "bath-cloth": BathClothImg,
  bathcloth: BathClothImg,
  "bath-products": BathProductsImg,
  bathproducts: BathProductsImg,
  "bath-soap": BathSoapImg,
  bathsoap: BathSoapImg,
  soap: BathSoapImg,
  "bathroom-cleaning": BathroomCleaningImg,
  bathroomcleaning: BathroomCleaningImg,
  beverages: BeveragesImg,
  "beauty-personalcare": BeautyPersonalCareImg,
  "beauty-and-personal-care": BeautyPersonalCareImg,
  beautypersonalcare: BeautyPersonalCareImg,
  "beauty-accessories": BeautyAccessoriesImg,
  beautyaccessories: BeautyAccessoriesImg,
  "biscuits-cakes": BiscuitsCakesImg,
  biscuitscakes: BiscuitsCakesImg,
  "biscuits-confectionery": BiscuitsConfectioneryImg,
  biscuitsconfectionery: BiscuitsConfectioneryImg,
  confectionery: BiscuitsConfectioneryImg,
  "branded-foods": BrandedFoodsImg,
  brandedfoods: BrandedFoodsImg,
  "bread-spreads": BreadSpreadsImg,
  breadspreads: BreadSpreadsImg,
  "breakfast-cereals": BreakfastCerealsImg,
  breakfastcereals: BreakfastCerealsImg,
  cereals: BreakfastCerealsImg,
  chicken: ChickenImg,
  "chips-sticks": ChipsSticksImg,
  chipssticks: ChipsSticksImg,
  chips: ChipsSticksImg,
  "cooking-paste": CookingPasteImg,
  cookingpaste: CookingPasteImg,
  fish: FishImg,
  "hypermarket": HyperMarketImg,
  hypermarket: HyperMarketImg,
  "instant-noodles": InstantNoodlesImg,
  instantnoodles: InstantNoodlesImg,
  noodles: InstantNoodlesImg,
  "jam-honey": JamHoneyImg,
  jamhoney: JamHoneyImg,
  jam: JamHoneyImg,
  honey: JamHoneyImg,
  ketchup: KetchupImg,
  mayonnaise: MayonnaiseImg,
  "namkeen-mixtures": NamkeenMixturesImg,
  namkeenmixtures: NamkeenMixturesImg,
  namkeen: NamkeenMixturesImg,
  "packaged-food": PackagedFoodImg,
  packagedfood: PackagedFoodImg,
  sauces: SaucesImg,
  toys: ToysImg,
  "brown-rice": BrownRiceImg,
  brownrice: BrownRiceImg,
  "coconut-oil": CoconutOilImg,
  coconutoil: CoconutOilImg,
  "creams-whiteners": CreamsWhitenersImg,
  "creams-and-whiteners": CreamsWhitenersImg,
  creamswhiteners: CreamsWhitenersImg,
  "curd-yogurt": CurdYogurtImg,
  curdyogurt: CurdYogurtImg,
  "curd-and-yogurt": CurdYogurtImg,
  dairy: DairyImg,
  "dried-fruits": DriedFruitsImg,
  driedfruits: DriedFruitsImg,
  flour: FlourImg,
  "fresh-vegetables": FreshVegetablesImg,
  freshvegetables: FreshVegetablesImg,
  "fresh-fruits-vegetables": FreshVegetablesImg,
  "fresh-fruits-and-vegetables": FreshVegetablesImg,
  vegetables: FreshVegetablesImg,
  fruits: FreshVegetablesImg,
  ghee: GheeImg,
  "gingelly-oil": GingellyOilImg,
  gingellyoil: GingellyOilImg,
  groceries: GroceriesImg,
  groceriestore: GroceriesImg,
  "grocery-store": GroceriesImg,
  petcare: PetCareImg,
  "pet-care": PetCareImg,
  stationery: StationeryImg,
};

const SectionCategory = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const { data } = await instance.get("/products/catalog/categories");
        const items = data?.items || data || [];
        if (!cancelled) setCategories(Array.isArray(items) ? items : []);
      } catch (err) {
        if (!cancelled) setCategories([]);
        console.error("[SectionCategory] Failed to load categories:", err?.response?.data || err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const getCategoryImage = (cat) => {
    const nameKey = normKey(cat?.name);
    const slugKey = normKey(cat?.slug);
    const asset =
      CATEGORY_ASSET_MAP[nameKey] ||
      CATEGORY_ASSET_MAP[slugKey] ||
      CATEGORY_ASSET_MAP[nameKey?.replace(/-/g, "")] ||
      CATEGORY_ASSET_MAP[slugKey?.replace(/-/g, "")];
    if (asset) return asset;

    const url = cat?.icon || cat?.imageUrl || cat?.image;
    if (!url) return PLACEHOLDER_IMAGE;
    if (/^https?:\/\//i.test(url)) return url;
    return `${API_BASE}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const getCategoryPath = (cat) => {
    if (cat?.externalLink) return cat.externalLink;
    if (cat?.path) return cat.path;
    if (cat?.slug) return `/c/${cat.slug}`;
    return `/c/${cat._id}`;
  };

  const isExternal = (cat) => Boolean(cat?.externalLink || (cat?.path && /^https?:\/\//i.test(cat.path)));

  const settings = {
    dots: false,
    infinite: categories.length > 1,
    speed: 800,
    slidesToShow: Math.min(5, Math.max(1, categories.length)),
    slidesToScroll: 1,
    responsive: [
      { breakpoint: 1536, settings: { slidesToShow: Math.min(6, Math.max(1, categories.length)) } },
      { breakpoint: 1280, settings: { slidesToShow: Math.min(3, Math.max(1, categories.length)) } },
      { breakpoint: 1024, settings: { slidesToShow: Math.min(2, Math.max(1, categories.length)) } },
      { breakpoint: 768, settings: { slidesToShow: 1 } },
    ],
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center">
        <section className="category-carousel w-full max-w-screen-2xl px-4 md:px-6 lg:px-8 pb-8 md:pb-12">
          <h2 className="font-quicksand text-center text-xl md:text-2xl lg:text-3xl font-bold mt-5 pt-12 mb-4">
            Explore Categories
          </h2>
          <div className="flex justify-center py-12">
            <div className="animate-pulse flex gap-4 flex-wrap justify-center">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-[150px] h-[150px] bg-gray-200 rounded-xl" />
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (!categories.length) {
    return null;
  }

  return (
    <div className="flex justify-center items-center">
      <section className="category-carousel w-full max-w-screen-2xl px-4 md:px-6 lg:px-8 pb-8 md:pb-12">
        <h2 className="font-quicksand text-center text-xl md:text-2xl lg:text-3xl font-bold mt-5 pt-12 mb-4">
          Explore Categories
        </h2>
        <Slider {...settings}>
          {categories.map((category) => {
            const path = getCategoryPath(category);
            const imageSrc = getCategoryImage(category);
            const external = isExternal(category);
            const content = (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="category-box rounded-xl flex flex-col items-center justify-between text-center h-full"
              >
                <div className="w-full flex justify-center">
                  <img
                    src={imageSrc}
                    alt={category.name || "Category"}
                    className="w-[150px] h-[150px] object-contain"
                    onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_IMAGE; }}
                  />
                </div>
                <h5 className="text-base md:text-sm font-semibold mb-1">
                  {category.name}
                </h5>
              </motion.div>
            );
            return (
              <div key={category._id || category.id || category.name} className="p-2">
                {external ? (
                  <a href={path} target="_blank" rel="noopener noreferrer" className="block">
                    {content}
                  </a>
                ) : (
                  <Link to={path} className="block">
                    {content}
                  </Link>
                )}
              </div>
            );
          })}
        </Slider>
      </section>
    </div>
  );
};

export default SectionCategory;
