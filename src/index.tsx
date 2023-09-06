import { render } from 'preact'
import logo from './assets/preact.svg'
import { Resource } from './components/resource'
import './style.css'

function App () {
  return (
    <>
      <a href="https://preactjs.com" rel="noreferrer" target="_blank">
        <img alt="Preact logo" height="160" src={logo} width="160" />
      </a>
      <h1>Get Started building Vite-powered Preact Apps </h1>
      <section>
        <Resource
          description="If you're new to Preact, try the interactive tutorial to learn important concepts"
          href="https://preactjs.com/tutorial"
          title="Learn Preact"
        />
        <Resource
          description="If you're coming from React, you may want to check out our docs to see where Preact differs"
          href="https://preactjs.com/guide/v10/differences-to-react"
          title="Differences to React"
        />
        <Resource
          description="To learn more about Vite and how you can customize it to fit your needs, take a look at their excellent documentation"
          href="https://vitejs.dev"
          title="Wow"
        />
      </section>
    </>
  )
}

// eslint-disable-next-line ssr-friendly/no-dom-globals-in-module-scope
const mountingElement = document.querySelector<HTMLElement>('#app')
if (!mountingElement) throw new Error('Could not find #app')
render(<App />, mountingElement)
