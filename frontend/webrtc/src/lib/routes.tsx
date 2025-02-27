import { RouteObject } from 'react-router-dom';

import Receiver from '../pages/receiver';
import Sender from '../pages/sender';

const routes: RouteObject[] = [
  {
    path: '/sender',
    element: <Sender/>,
  },
  {
    path: '/receiver',
    element: <Receiver/>,
  },
  // {
  //   path: '*',
  //   element: <NotFoundPage />,
  // },
];

export default routes;