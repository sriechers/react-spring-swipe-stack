import { useState, useEffect } from 'react'
import Deck from '../components/Deck'

const fakeData = [
  {
    id: 1,
    img: {
      src: "/img/samson-thomas-t0vF_M5Kn7s-unsplash.jpg",
      alt: "Test"
    }
  },
  {
    id: 2,
    img: {
      src: "/img/eugenivy_now-XxnBqWJyQ3c-unsplash.jpg",
      alt: "Test"
    }
  },
  {
    id: 3,
    img: {
      src: "/img/minh-pham-OtXADkUh3-I-unsplash.jpg",
      alt: "Test"
    }
  },
  {
    id: 4,
    img: {
      src: "/img/jennifer-latuperisa-andresen-GM7cm1IC6Ss-unsplash.jpg",
      alt: "Test"
    }
  }
]

function Loader(){
  return (
    <div className="absolute flex justify-center items-center h-screen w-full">
      <div className="loader">Loading...</div>
    </div>
  )
}

function CardGameView() {  
  const [ cards, setCards ] = useState(fakeData)
  const [ currentCard, setCurrentCard ] = useState(null);

  const fetchCards = () => {
    const t = setTimeout(()=>{
      clearTimeout(t)
      setCards([...fakeData])
    }, 1000)
  }

  const onLike = (card) => {
    console.log("LIKE", card)
  }

  const onDislike = (card) => {
    console.log("DISLIKE", card)
  }

  // Evertime our current Card changes we run this effect
  useEffect(() => {
    currentCard && console.log("current card is: ", currentCard)
  }, [currentCard])

  return (
    <div className="relative flex fill center">
      <Deck 
        cards={cards} 
        fadeEffect={true}
        rotationFactor={2.3}
        onDoubleClick={(card) => console.log("onDoubleClick", card)}
        transformStartValues={{
          y: 0,
          scale: 1.5,
          // delay: 10000
        }}
        transformEndValues={{
          
        }}
        LoaderComponent={Loader}
        onLike={(card) => onLike(card)} 
        onDislike={(card) => onDislike(card)} 
        onEmpty={fetchCards} 
        onChange={setCurrentCard}
        // onAnimation={({ x, rotation, scale }) => console.log(`Animating card { x: ${x}, rotation: ${rotation}, scale: ${scale}  } `)}
        />
    </div>
  )
}

export default CardGameView
