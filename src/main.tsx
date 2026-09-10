import '@fontsource-variable/inter'
import '@mantine/core/styles.css'

import { MantineProvider } from '@mantine/core'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import ReactDOM from 'react-dom/client'
import { theme } from '#/lib'
import { ReloadPrompt } from '#/components/ReloadPrompt'
import { routeTree } from './routeTree.gen'

const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  scrollRestoration: true,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById('app')!

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <MantineProvider theme={theme}>
      <RouterProvider router={router} />
      <ReloadPrompt />
    </MantineProvider>,
  )
}
