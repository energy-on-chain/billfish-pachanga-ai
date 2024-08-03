import { Outlet } from 'react-router-dom';

import RootNavigation from '../components/RootNavigation';

function RootLayout(props) {

  return(
    <>
      <RootNavigation {...props}/>
      <Outlet/>
    </>
  );
};

export default RootLayout;

