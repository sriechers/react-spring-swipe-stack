import React, { useState } from "react";
import Deck, { Card, CardButton } from "../components/Deck";

const fakeData = [
  {
    id: 1,
    img: {
      src: window.location.href + "img/samson-thomas-t0vF_M5Kn7s-unsplash.jpg",
      alt: "Test",
    },
  },
  {
    id: 2,
    img: {
      src: window.location.href + "img/eugenivy_now-XxnBqWJyQ3c-unsplash.jpg",
      alt: "Test",
    },
  },
  {
    id: 3,
    img: {
      src: window.location.href + "img/minh-pham-OtXADkUh3-I-unsplash.jpg",
      alt: "Test",
    },
  },
  {
    id: 4,
    img: {
      src:
        window.location.href +
        "img/jennifer-latuperisa-andresen-GM7cm1IC6Ss-unsplash.jpg",
      alt: "Test",
    },
  },
];

function Loader() {
  return (
    <div className="absolute flex justify-center items-center h-screen w-full">
      <div className="loader">Loading...</div>
    </div>
  );
}

function CardGameView() {
  const [cards, setCards] = useState(fakeData);

  const fetchCards = () => {
    const t = setTimeout(() => {
      clearTimeout(t);
      setCards([...fakeData]);
    }, 1000);
  };

  const onLike = (card) => {
    console.log("LIKE", card);
  };

  const onDislike = (card) => {
    console.log("DISLIKE", card);
  };

  return (
    <div className="h-screen w-screen">
      <Deck
        cards={cards}
        fadeEffect={true}
        rotationFactor={2.3}
        transformStartValues={{
          y: 0,
          scale: 1.5,
        }}
        transformEndValues={{}}
        LoaderComponent={Loader}
        onLike={(card) => onLike(card)}
        onDislike={(card) => onDislike(card)}
        onEmpty={fetchCards}
        onChange={({ cardStack, currentCard }) =>
          console.log("cardStack, currentCard", cardStack, currentCard)
        }
        // onAnimation={({ x, rotation, scale }) => console.log(`Animating card { x: ${x}, rotation: ${rotation}, scale: ${scale}  } `)}
      >
        {cards.map((card) => (
          <Card
            key={card.id}
            img={card.img}
            buttonTextLike={"👍"}
            buttonTextDislike={"👎"}
          />
          // <React.Fragment key={card.id}>
          //   <h1>test {card.id}</h1>
          //   <img className="react-swipestack-cards__card-img" src={card.img.src} alt={card.img.alt}/>
          //   <CardButton type={'dislike'}>dislike</CardButton>
          //   <CardButton type={'like'}>like</CardButton>
          // </React.Fragment>
        ))}
      </Deck>
    </div>
  );
}

export default CardGameView;
