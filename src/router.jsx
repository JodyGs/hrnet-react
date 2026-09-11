import { createBrowserRouter } from 'react-router'
import { Layout } from './components/Layout/Layout.jsx'
import { CreateEmployee } from './pages/CreateEmployee/CreateEmployee.jsx'
import { LazyEmployeeList } from './pages/EmployeeList/LazyEmployeeList.js'
import { NotFound } from './pages/NotFound/NotFound.jsx'

/** Application routes. */
export const routes = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <CreateEmployee /> },
      { path: 'employees', element: <LazyEmployeeList /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]

export const router = createBrowserRouter(routes, {
  basename: import.meta.env.BASE_URL,
})
