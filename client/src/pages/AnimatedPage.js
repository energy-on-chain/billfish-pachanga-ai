import React, {useState, useEffect} from "react";
import {motion} from "framer-motion";
import RingLoader from "react-spinners/RingLoader";

import './AnimatedPage.css';

function AnimatedPage({children}) {

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500)
  }, [])

  return (
    <>
    { loading ? (
      <div className="animatedPage">
        <RingLoader
          size={30}
          color={"#3397DA"}    // FIXME
          loading={loading}
        >
        </RingLoader>
      </div>
    ) : (
        <motion.div 
          initial={{opacity: 0, y: 0}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 1, ease: "easeIn"}}
        >
          {children}
        </motion.div>
      )}
    </>
  );
}

export default AnimatedPage;

