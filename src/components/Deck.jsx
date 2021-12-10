import React, {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useContext,
} from "react";
import {
  useSprings,
  animated,
  to as interpolate,
  config,
} from "@react-spring/web";
import { useDrag } from "@use-gesture/react";
import "./react-swipestack-cards.css";

// Context only available inside Deck component
const DeckContext = React.createContext({});

// CARD COMPONENT
function Card({
  img,
  buttonTextLike = "like",
  buttonTextDislike = "dislike",
  children,
}) {
  const context = useContext(DeckContext);
  if (!context) {
    throw new Error(`Card Components need to be inside of the Deck component`);
  }

  return (
    <>
      <img
        className="react-swipestack-cards__card-img"
        src={img.src}
        alt={img.alt}
      />
      {children}
      <div className="react-swipestack-cards__button-wrapper">
        <CardButton type={"dislike"}>{buttonTextDislike}</CardButton>
        <CardButton type={"like"}>{buttonTextLike}</CardButton>
      </div>
    </>
  );
}

function CardButton({ type, ariaText, children }) {
  ariaText = ariaText || type;

  const context = useContext(DeckContext);
  if (!context) {
    throw new Error(`Card Components need to be inside of the Deck component`);
  }

  return (
    <button
      aria-label={ariaText}
      className={`react-swipestack-cards__button-${type}`}
      disabled={context.cardIndex !== context.cardStack.length - 1}
      onClick={() =>
        context.animateCard({
          index: context.cardIndex,
          active: true,
          mx:
            type.toLowerCase() === "like"
              ? context.containerWidth + 200
              : -(context.containerWidth + 200),
          xDir: type.toLowerCase() === "like" ? 1 : -1,
          immediate: true,
        })
      }
    >
      {children}
    </button>
  );
}
// This is being used down there in the view
// interpolates rotation and scale into a css transform
const setTransforms = (r, s) =>
  `perspective(1500px) rotateZ(${r}deg) scale(${s})`;

// helper function to map values
function mapToRange(number, in_min, in_max, out_min, out_max) {
  return (
    ((number - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min
  );
}
const calcOpacityChange = (x, i, containerWidth, cardStackLength) => {
  const startingValues = (i + 1) / cardStackLength;
  if (x.get === "function") {
    x = x.get();
  } else {
    // if card not moving
    return startingValues;
  }
  // distance from card stack center
  const distanceFromCenter = Math.abs((x / 100) * (i + 1));
  // when card is outside of container
  const inMax = containerWidth / 2;
  return (
    startingValues +
    parseFloat(mapToRange(distanceFromCenter, 0, inMax, 0, 1).toFixed(2)) +
    0.1
  );
};

// DECK COMPONENT
function Deck({
  children,
  cards,
  containerWidth,
  onEmpty,
  onChange,
  onLike,
  onDislike,
  onCardout,
  onAnimation,
  LoaderComponent,
  transformStartValues = {},
  transformEndValues = {},
  springConfigs = {},
  yOffset = 10,
  maxVelocity = 0.2,
  debounceTime = 100,
  rotationFactor = 1,
  fadeEffect = true,
  cardSizeOnHover = 1.02,
  rotationThreshold = 50,
  minStackLength = 1,
}) {
  const deckRef = useRef();
  const [flippedOutCards] = useState(() => new Set()); // The set flags all the cards that are flicked out
  const [currentCardIndex, setCurrentCardIndex] = useState(cards.length); // holds the Index of the current Card
  const [cardStack, setCardStack] = useState(cards); // holds all cards data
  const [_containerWidth, setContainerWidth] = useState(0);

  useLayoutEffect(() => {
    if (!deckRef.current) return;
    // if no container width is available set width to parent element width
    if (!containerWidth) {
      const { width } = deckRef.current.parentElement.getBoundingClientRect();
      setContainerWidth(width);
    }
  }, [containerWidth]);

  // FIXME DELAY
  // These two are just helpers, they curate spring data, values that are later being interpolated into css
  const from = (i) => ({
    x: transformStartValues.x ? transformStartValues.x : 0,
    y: transformStartValues.y ? transformStartValues.y : 0,
    scale: transformStartValues.scale ? transformStartValues.scale : 1.08,
    rot: transformStartValues.rotation ? transformStartValues.rotation : 0,
    opacity: transformStartValues.opacity ? transformStartValues.opacity : 1,
    delay: transformStartValues.delay ? i * transformStartValues.delay : 0,
  });

  const to = (i, cardStackLength, currentCardIndex) => ({
    x: transformEndValues.x ? transformEndValues.x : 0,
    y: ((i % cardStackLength) - currentCardIndex) * yOffset,
    scale: transformEndValues.scale ? transformEndValues.scale : 1,
    rot: transformEndValues.rotation ? transformEndValues.rotation : 0,
    opacity: transformEndValues.opacity ? transformEndValues.opacity : 1,
    delay: transformEndValues.delay ? i * transformEndValues.delay : i * 10,
  });

  // set config for different spring animations
  springConfigs = {
    cardActive: springConfigs.cardActive
      ? springConfigs.cardActive
      : config.stiff,
    cardFlyOut: springConfigs.cardFlyOut
      ? springConfigs.cardFlyOut
      : config.molasses,
    cardDefault: springConfigs.cardDefault
      ? springConfigs.cardDefault
      : config.slow,
    cardReset: springConfigs.cardReset
      ? springConfigs.cardReset
      : config.gentle,
  };

  // Create a bunch of springs using the helpers above
  const [animationProps, springsApi] = useSprings(cardStack.length, (i) => ({
    ...to(i, cardStack.length, currentCardIndex),
    from: from(i),
  }));

  // Trigger events
  const onCardOut = (index, dirX) => {
    if (dirX > 0) {
      typeof onLike === "function" && onLike(cardStack[index]);
    } else {
      typeof onDislike === "function" && onDislike(cardStack[index]);
    }
    typeof onCardout === "function" && onCardout(cardStack[index]);
  };

  // Move Cards down evertime one gets flipped out
  useEffect(() => {
    springsApi.start((i) => ({
      to: to(i, cardStack.length, currentCardIndex),
      config: springConfigs.cardReset,
    }));
  }, [springsApi, cardStack, currentCardIndex]);

  // When card prop changes update stack
  useEffect(() => {
    setCurrentCardIndex(cards.length);
    setCardStack(cards);
  }, [cards]);

  // trigger onChange event when card stack changes
  useEffect(() => {
    typeof onChange === "function" &&
      onChange({
        currentCard: cardStack[currentCardIndex - 1],
        cardStack,
      });
  }, [cardStack]);

  const animateCard = ({ index, active, mx, xDir, immediate }) => {
    let y = 0;
    let opacity = 0;
    springsApi.start((i) => {
      // Move previous Cards down
      if (index !== i) {
        y =
          Math.abs((mx / 100) * (i + 1)) +
          ((i % cardStack.length) - currentCardIndex) * yOffset;

        if (fadeEffect)
          opacity = calcOpacityChange(mx, i, _containerWidth, cardStack.length);

        // If Card is active return translated y value
        if (active)
          return {
            y,
            opacity: fadeEffect ? opacity : 1,
          };
        // If Card is NOT active return normal position in stack

        return {
          y: ((i % cardStack.length) - currentCardIndex) * yOffset,
          opacity: 1,
        };
      }

      // Only change spring-data for the current spring

      if (immediate) {
        flippedOutCards.add(index);
      }

      const isFlippedOutCard = flippedOutCards.has(index);
      const x = isFlippedOutCard
        ? (200 + _containerWidth) * xDir
        : active
        ? mx
        : 0; // When a card is a flippedOutCard it flys out left or right, otherwise goes back to zero
      const rot =
        x > rotationThreshold || x < -rotationThreshold
          ? (mx / 100) * rotationFactor + (isFlippedOutCard ? xDir * 10 : 0)
          : 0; // How much the card tilts
      const scale = active ? cardSizeOnHover : 1; // Active cards lifts up a bit

      if (isFlippedOutCard) {
        const t = setTimeout(() => {
          clearTimeout(t);
          setCurrentCardIndex(index);
          setCardStack(cards.filter((card) => cards.indexOf(card) < index));
          onCardOut(index, x);
        }, debounceTime);
      }

      if (typeof onAnimation == "function")
        onAnimation({
          x,
          rotation: rot,
          scale,
        });

      // return spring data for current card
      return {
        x,
        rot,
        scale,
        opacity: 1,
        delay: 0,
        config: active
          ? springConfigs.cardActive
          : isFlippedOutCard
          ? springConfigs.cardFlyOut
          : springConfigs.cardDefault,
      };
    });
  };

  // Create a gesture, we're interested in down-state, delta (current-pos - click-pos), direction and velocity
  const bindGesture = useDrag(
    ({
      args: [index],
      active,
      movement: [mx, my],
      direction: [xDir],
      velocity: [vx],
    }) => {
      if (index !== cardStack.length - 1) return;
      const trigger = vx > maxVelocity; // If you flick hard enough it should trigger the card to fly out

      // If button/finger's up and trigger velocity is reached, we flag the card ready to fly out
      if (!active && trigger){
        flippedOutCards.add(index)
        animateCard({ index, active: true, mx, xDir, immediate: false });
      } else {
        animateCard({ index, active, mx, xDir, immediate: false });
      } 


      // If Stack is empty
      if (!active && cardStack.length === minStackLength) {
        const t = setTimeout(() => {
          clearTimeout(t);
          flippedOutCards.clear();
          onEmpty();
        }, debounceTime);
      }
    }
  );

  return (
    <DeckContext.Provider
      value={{
        cardIndex: currentCardIndex - 1,
        currentDeckSize: cardStack.length,
        cardStack,
        containerWidth: _containerWidth,
        animateCard,
      }}
    >
      <div className="react-swipestack-cards__deck">
        {children &&
          cardStack.map((card, i) => {
            return (
              <animated.div
                key={i}
                ref={deckRef}
                className={`react-swipestack-cards ${
                  i === currentCardIndex - 1
                    ? "react-swipestack-cards__active-card-wrapper"
                    : ""
                } react-swipestack-cards__card-wrapper react-swipestack-card-${i}`}
                style={{
                  "--react-swipestack-cards-id": i + 1,
                  "--react-swipestack-cards-stack-length": cardStack.length,
                  x: animationProps[i]?.x,
                  y: animationProps[i]?.y,
                  opacity: fadeEffect ? animationProps[i]?.opacity : 1,
                }}
              >
                {/* This is the card itself, we're binding our gesture to it (and inject its index so we know which is which) */}
                <animated.div
                  {...bindGesture(i)}
                  className={`${
                    i === currentCardIndex - 1
                      ? "react-swipestack-cards__active-card"
                      : ""
                  } react-swipestack-cards__card`}
                  style={{
                    touchAction: "none",
                    transform: interpolate(
                      [animationProps[i]?.rot, animationProps[i]?.scale],
                      setTransforms
                    ),
                  }}
                >
                  {children[i]}
                </animated.div>
              </animated.div>
            );
          })}
        {LoaderComponent && cardStack.length <= 0 ? <LoaderComponent /> : null}
      </div>
    </DeckContext.Provider>
  );
}

export default Deck;
export { Card, CardButton };
