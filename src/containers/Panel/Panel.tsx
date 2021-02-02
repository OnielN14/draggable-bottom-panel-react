import React from 'react'
import style from './Panel.module.scss'
import SAMPLE from '../../utilities/PeopleDummyData'
import CardInPanel from '../../components/CardInPanel/CardInPanel'
import useDraggableNormal from './hooks/useDraggableNormal'

const Panel: React.FC = (props) => {
  const { onMouseDown, panelElementRef, panelHeaderElementRef } = useDraggableNormal({ style })

  return (
    <div ref={panelElementRef} className={style.Panel}>
      <header ref={panelHeaderElementRef} onMouseDown={onMouseDown} onTouchStart={onMouseDown}>
        <div>Draggable Panel</div>
      </header>
      <main>
        {
          SAMPLE.map((person, index) => <CardInPanel {...person} key={index} className={style.CardInPanel}/>)
        }
      </main>
    </div>
  )
}

export default Panel