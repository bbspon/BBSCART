import ThiaHeroVideo from "../home/ThiaHeroVideo";
import ThiaBestSelling from "../home/ThiaBestSelling";
import ThiaFeaturedProducts from "../home/ThiaFeaturedProducts";
import AnimationCards from "../home/AnimationCards";
import OfferSection from "../home/OfferSection";
import ThiaHeader from "../../components/layout/ThiaHeader";
import ThiaNavbar from "../../components/layout/ThiaNavbar";

const ThiaPage = () => {
    return (
        <>
            <ThiaHeader />
            <ThiaNavbar />
            <ThiaHeroVideo />
            <section className="container py-10 bg-slate-100">
                <h2 className="text-2xl  text-center mb-6 font-serif">
                    BEST SELLING JEWELLERY
                </h2>
                <ThiaBestSelling />
            </section>
            <section className="container py-10 bg-slate-100">
                <h2 className="text-2xl  text-center mb-6 font-serif">
                    Featured Collections
                </h2>
                <ThiaFeaturedProducts />
            </section>
            <div className="container">
                <AnimationCards />
                <OfferSection />
            </div>
        </>
    );
};

export default ThiaPage;