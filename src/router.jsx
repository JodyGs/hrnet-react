import { createBrowserRouter } from 'react-router'
import { Layout } from './components/Layout/Layout.jsx'
import { CreateEmployee } from './pages/CreateEmployee/CreateEmployee.jsx'
import { NotFound } from './pages/NotFound/NotFound.jsx'

/** Application routes. The employee list (and its table) is loaded on demand. */
export const routes = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <CreateEmployee /> },
      {
        path: 'employees',
        lazy: async () => {
          const { EmployeeList } = await import('./pages/EmployeeList/EmployeeList.jsx')
          return { Component: EmployeeList }
        },
      },
      { path: '*', element: <NotFound /> },
    ],
  },
]

export const router = createBrowserRouter(routes, {
  basename: import.meta.env.BASE_URL,
})
