import React from 'react'
import 'normalize.css'
import "./styles.css"
import Panel from './containers/Panel/Panel'

export default function App() {
  return (
    <div className="App">
      <div style={{ textAlign: 'center' }}>
        <h1>DRAGGABLE BOTTOM PANEL</h1>
        <h4>with AnimeJS (<a href="https://animejs.com/">https://animejs.com/</a>)</h4>
        <div>
          <h3>Well.. start draggin'!!</h3>
        </div>
      </div>
      <Panel/>
    </div>
  );
}
