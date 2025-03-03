import { createBrowserRouter, createRoutesFromElements, RouterProvider } from "react-router-dom"
import routes from "./lib/routes"

function App() {
  const router = createBrowserRouter(routes)

  return (
    <RouterProvider router={router}/>
  )
}

export default App
