import * as React from 'react'
import { render } from 'react-dom'
import { configStore } from './store'
import { Provider } from 'react-redux'
import App from './App'

const store = configStore()

const rootElement = document.getElementById('root')
render(
  <Provider store={store}>
    <App />
  </Provider>,
  rootElement
)
