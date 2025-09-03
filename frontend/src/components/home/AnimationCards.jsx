import React, { useEffect, useRef } from "react";

const images = [
  "/img/ad/Thiaworld1.jpg",
   "/img/ad/E-Delivery1.jpg",

  "/img/ad/grocery1.jpg",
  "/img/ad/Healthcare1.jpg",

  "/img/ad/E-Delivery2.jpg",

  "/img/ad/Healthcare2.jpg",

  "/img/ad/grocery2.jpg",

 
  "/img/ad/Thiaworld2.jpg",
  "/img/ad/E-Delivery1.jpg",

];

const AnimationCards = () => {
  const stackRef = useRef(null);
  const intervalRef = useRef(null);

  const moveCard = () => {
    const stack = stackRef.current;
    if (!stack) return;
    const cards = stack.querySelectorAll(".card");
    const lastCard = cards[cards.length - 1];

    if (lastCard) {
      lastCard.classList.add("swap");

      setTimeout(() => {
        lastCard.classList.remove("swap");
        stack.insertBefore(lastCard, cards[0]);
      }, 1200);
    }
  };

  useEffect(() => {
    intervalRef.current = setInterval(moveCard, 4000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const handleClick = (e) => {
    const stack = stackRef.current;
    const card = e.target.closest(".card");
    if (!stack || !card) return;
    const cards = stack.querySelectorAll(".card");
    const lastCard = cards[cards.length - 1];

    if (card === lastCard) {
      card.classList.add("swap");

      setTimeout(() => {
        card.classList.remove("swap");
        stack.insertBefore(card, cards[0]);
      }, 1200);
    }
  };

  return (
    <>
      <div className="grid lg:grid-cols-2 gap-6 px-12 py-8 min-h-screen cardSlide align-items-center">
        <div className="flex flex-col justify-center">
          <h2 className="text-[36px] font-bold text-yellow-600 mb-6">
            Introducing the Thia Secure Plan
          </h2>

          <p className="font-Poppins text-[14px] text-secondary mb-5">
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry. Lorem Ipsum has been the industry's standard dummy text
            ever since the 1500s, when an unknown printer took a galley of type
            and scrambled it to make a type specimen book. It has survived not
            only five centuries, but also the leap into electronic typesetting,
            remaining essentially unchanged. It was popularised in the 1960s
            with the release of Letraset sheets containing Lorem Ipsum passages,
            and more recently with desktop publishing software like Aldus
            PageMaker including versions of Lorem Ipsum.
          </p>

          <div className="flex flex-col justify-center">
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start">
                <i className="ri-checkbox-circle-fill text-yellow-600 text-[16px] mr-2"></i>
                <p>
                  Pay only <strong>40% upfront</strong> and reserve your jewelry
                </p>
              </li>
              <li className="flex items-start">
                <i className="ri-checkbox-circle-fill text-yellow-600 text-[16px] mr-2"></i>
                <p>We pledge the product in your name at your preferred bank</p>
              </li>
              <li className="flex items-start">
                <i className="ri-checkbox-circle-fill text-yellow-600 text-[16px] mr-2"></i>
                <p>
                  Pay the remaining{" "}
                  <strong>60% in 12 months via Golldex</strong> — no interest
                </p>
              </li>
              <li className="flex items-start">
                <i className="ri-checkbox-circle-fill text-yellow-600 text-[16px] mr-2"></i>
                <p>
                  <strong>We pay the interest</strong> to the bank on your
                  behalf
                </p>
              </li>
              <li className="flex items-start">
                <i className="ri-checkbox-circle-fill text-yellow-600 text-[16px] mr-2"></i>
                <p>
                  Product delivered to your doorstep with{" "}
                  <strong>BIS Certificate</strong>
                </p>
              </li>
            </ul>
            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              <button
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium px-6 py-2 rounded shadow"
                fdprocessedid="eo05zum"
              >
                Apply Now
              </button>
              <button
                className="bg-white text-yellow-600 hover:text-yellow-700 border border-yellow-500 font-medium px-6 py-2 rounded shadow"
                fdprocessedid="fde6mb"
              >
                Know More
              </button>
            </div>
          </div>
        </div>

        <div className="relative  stack" ref={stackRef} onClick={handleClick}>
          {images.map((src, index) => (
            <div
              key={index}
              className="card border-2 border-blue-900 rounded-xl shadow-2xl"
              style={{ height: "520px", width: "400px" }}
            >
              <img src={src} alt="Patisserie" />
            </div>
          ))}
        </div>
      </div>
      <style>
        {`





.card {
  position: absolute;
  transform: translate(-50%, -50%);
  top: 50%;
  left: 50%;
  width: 350px;
  height: 500px;
  border-radius: 2rem;
  box-shadow: 0 5px 10px 0 rgba(0, 0, 0, 0.25),
    0 15px 20px 0 rgba(0, 0, 0, 0.125);
  transition: transform 0.6s;
  user-select: none;
}

.card img {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: inherit;
  object-fit: cover;
  pointer-events: none;
}

.card:nth-last-child(n + 5) {
  --x: calc(-50% + 90px);
  transform: translate(var(--x), -50%) scale(0.85);
  box-shadow: 0 0 1px 1px rgba(0, 0, 0, 0.01);
}

.card:nth-last-child(4) {
  --x: calc(-50% + 60px);
  transform: translate(var(--x), -50%) scale(0.9);
}

.card:nth-last-child(3) {
  --x: calc(-50% + 30px);
  transform: translate(var(--x), -50%) scale(0.95);
}

.card:nth-last-child(2) {
  --x: calc(-50%);
  transform: translate(var(--x), -50%) scale(1);
}

.card:nth-last-child(1) {
  --x: calc(-50% - 30px);
  transform: translate(var(--x), -50%) scale(1.05);
}

.card:nth-last-child(1) img {
  box-shadow: 0 1px 5px 5px rgba(255, 193, 111, 0.5);
}

.swap {
  animation: swap 1.3s ease-out forwards;
}

@keyframes swap {
  30% {
    transform: translate(calc(var(--x) - 250px), -50%) scale(0.85) rotate(-5deg)
      rotateY(65deg);
  }
  100% {
    transform: translate(calc(var(--x) - 30px), -50%) scale(0.5);
    z-index: -1;
  }
}

/* Media queries for keyframes */

@media (max-width: 1200px) {
  @keyframes swap {
    30% {
      transform: translate(calc(var(--x) - 200px), -50%) scale(0.85)
        rotate(-5deg) rotateY(65deg);
    }

    100% {
      transform: translate(calc(var(--x) - 30px), -50%) scale(0.5);
      z-index: -1;
    }
  }
}

@media (max-width: 1050px) {
  @keyframes swap {
    30% {
      transform: translate(calc(var(--x) - 150px), -50%) scale(0.85)
        rotate(-5deg) rotateY(65deg);
    }

    100% {
      transform: translate(calc(var(--x) - 30px), -50%) scale(0.5);
      z-index: -1;
    }
  }
}

/* Media queries for other classes */

@media (max-width: 1200px) {
  .card {
    width: 250px;
    height: 380px;
  }
}

@media (max-width: 1050px) {
  .card {
    width: 220px;
    height: 350px;
  }
}

@media (max-width: 990px) {
  .card {
    width: 200px;
    height: 300px;
  }
}

@media (max-width: 950px) {
  .cardSlide {
    grid-template-columns: 1fr;
    grid-template-rows: 4fr 3fr;
    grid-template-areas:
      "stacked"
      "content";
  }
  .stack {
    grid-area: stacked;
  }
}

@media (max-width: 650px) {
  .cardSlide {
    grid-template-rows: 1fr 1fr;
  }

  .card {
    width: 180px;
    height: 260px;
  }
}
`}
      </style>
    </>
  );
};

export default AnimationCards;
