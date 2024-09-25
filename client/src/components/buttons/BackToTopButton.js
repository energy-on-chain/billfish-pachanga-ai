import React, { useEffect, useState } from 'react';
import { FaAngleDoubleUp } from 'react-icons/fa';
import { useParams } from 'react-router-dom';
import { loadConfigForYear } from '../../config/masterConfig';
import './BackToTopButton.css';

function BackToTopButton() {
  const { year } = useParams();
  const [BackToTopButtonVisible, setBackToTopButtonVisible] = useState(false);
  const [configs, setConfigs] = useState(null);

  useEffect(() => {
    const loadConfigs = async () => {
      const config = await loadConfigForYear(year);
      if (config) {
        setConfigs(config);
      }
    };
    loadConfigs();
  }, [year]);

  const scrollUp = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setBackToTopButtonVisible(true);
      } else {
        setBackToTopButtonVisible(false);
      }
    };
    
    window.addEventListener("scroll", handleScroll);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  if (!configs) {
    return null; // Don't render anything until the configs are loaded
  }

  const { CONFIG_STYLING_FOOTER_SECTION_DIVIDER_HIGHLIGHT_COLOR } = configs.stylingConfig;

  return (
    <div>
      {BackToTopButtonVisible && (
        <a onClick={scrollUp}>
          <i style={{color: CONFIG_STYLING_FOOTER_SECTION_DIVIDER_HIGHLIGHT_COLOR}}>
            <FaAngleDoubleUp size={30} />
          </i>
        </a>
      )}
    </div>
  );
}

export default BackToTopButton;

