import React from 'react'
import style from './Panel.module.scss'
import AnimeJS from 'animejs'
import useWindowSize from '../../hooks/useWindowSize'
import SAMPLE from '../../utilities/PeopleDummyData'
import CardInPanel from '../../components/CardInPanel/CardInPanel'
import getPointerPosY from '../../utilities/GetPointerPosY'

const MAX_PANEL_HEIGHT = 300

const Panel: React.FC = (props) => {
  const panelElementRef = React.useRef<HTMLDivElement>(null)
  const panelHeaderElementRef = React.useRef<HTMLElement>(null)
  const currentTopValue = React.useRef(0)
  const closeTopValue = React.useRef(0)
  const maxTopValue = React.useRef(0)
  const currentBorderRadius = React.useRef(0)
  const initialBorderRadius = React.useRef(0)
  const isPanelOpen = React.useRef(false)

  const [ windowWidth, windowHeight ] = useWindowSize()

  let mousePosY = 0
  let isDraggable = false
  let pointerOffset = 0

  let endGesture: Utility.GestureCheckpoint = {
    position: 0,
    time: 0
  }

  let startGesture: Utility.GestureCheckpoint = {
    position: 0,
    time: 0
  }

  function onMouseMove (e: TouchEvent | MouseEvent) {
    e.preventDefault()
    mousePosY = getPointerPosY(e)

    if (isDraggable) {
      endGesture = {
        position: mousePosY,
        time: Date.now()
      }
      const position = mousePosY - pointerOffset
      panelElementRef.current!.style.top = `${position}px`

      const yDistance = maxTopValue.current - closeTopValue.current
      const dragProgress = Math.abs(parseFloat(panelElementRef.current!.style.top) / yDistance)

      const borderRadius = `${dragProgress * initialBorderRadius.current}px`
      panelElementRef.current!.style.borderTopLeftRadius = borderRadius
      panelElementRef.current!.style.borderTopRightRadius = borderRadius
    }
  }

  function resetPointer () {
    isDraggable = false
    mousePosY = 0
    panelHeaderElementRef.current!.classList.remove(style.grabbing)
  }

  function togglePanel () {
    resetPointer()
    
    let top = maxTopValue.current
    let borderRadius = 0
    if (isPanelOpen.current) {
      top = closeTopValue.current
      borderRadius = initialBorderRadius.current
    }

    AnimeJS({
      targets: panelElementRef.current!,
      top: top,
      borderTopLeftRadius: borderRadius,
      borderTopRightRadius: borderRadius,
      duration: 500
    })

    currentBorderRadius.current = borderRadius

    currentTopValue.current = closeTopValue.current
    if (!isPanelOpen.current) {
      currentTopValue.current = top
    }

    isPanelOpen.current = !isPanelOpen.current
  }

  function resetPanelPosition () {
    resetPointer()
    
    AnimeJS({
      targets: panelElementRef.current!,
      top: currentTopValue.current,
      borderTopLeftRadius: currentBorderRadius.current,
      borderTopRightRadius: currentBorderRadius.current,
      duration: 500,
    })
  }

  function onMouseUp (e: TouchEvent | MouseEvent) {
    e.preventDefault()
    
    const distance = startGesture.position - endGesture.position
    const time = endGesture.time - startGesture.time
    const velocity = Math.abs(distance / time)
    
    const currentWindowHeight = windowHeight - MAX_PANEL_HEIGHT
    const calculatedEndGesture = endGesture.position - MAX_PANEL_HEIGHT

    if (velocity > 1.4 || (!isPanelOpen.current && calculatedEndGesture < currentWindowHeight / 2) || (isPanelOpen.current && calculatedEndGesture > currentWindowHeight / 2)) {
      togglePanel()
    } else {
      resetPanelPosition()
    }

    document.removeEventListener('mouseup', onMouseUp)
    document.removeEventListener('touchend', onMouseUp)
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('touchmove', onMouseMove)
  }

  function onMouseDown (e: React.TouchEvent | React.MouseEvent) {
    if (!isDraggable) {
      const pointerPosition = getPointerPosY(e)

      startGesture = {
        position: pointerPosition,
        time: Date.now()
      }

      pointerOffset = pointerPosition - panelElementRef.current!.offsetTop
      isDraggable = true
      panelHeaderElementRef.current!.classList.add(style.grabbing)

      document.addEventListener('mousemove', onMouseMove, { passive: false })
      document.addEventListener('touchmove', onMouseMove, { passive: false })
      document.addEventListener('mouseup', onMouseUp, { passive: false })
      document.addEventListener('touchend', onMouseUp, { passive: false })
      return
    }

    isDraggable = false
    return
  }

  React.useEffect(() => {
    initialBorderRadius.current = parseFloat(getComputedStyle(panelElementRef.current!).borderTopLeftRadius) || 0
    
    if (!isPanelOpen.current)
      currentBorderRadius.current = initialBorderRadius.current

  }, [panelElementRef])

  React.useEffect(() => {
    maxTopValue.current = 0
    if (windowWidth > 500) {
      maxTopValue.current = windowHeight - MAX_PANEL_HEIGHT
    }

    closeTopValue.current = windowHeight - panelHeaderElementRef.current!.getBoundingClientRect().height
    if (!isPanelOpen.current) {
      currentTopValue.current = closeTopValue.current
      panelElementRef.current!.style.top = `${currentTopValue.current}px`
    } else {
      currentTopValue.current = maxTopValue.current
    }

    resetPanelPosition()
  }, [windowHeight, windowWidth])

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