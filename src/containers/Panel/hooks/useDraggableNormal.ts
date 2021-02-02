import React from 'react'
import useWindowSize from '../../../hooks/useWindowSize'
import getPointerPosY from '../../../utilities/GetPointerPosY'
import AnimeJS from 'animejs'
import { MAX_PANEL_HEIGHT } from '../utilities/contants'

const EASING = 'easeOutQuad'
const DURATION = 300

export default function useDraggableNormal ({ style }: PanelType.UseDraggableProp) {
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
  let calculatedGestureAreaHeight = 0

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
      easing: EASING,
      duration: DURATION
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
      easing: EASING,
      duration: DURATION
    })
  }

  function onMouseUp (e: TouchEvent | MouseEvent) {
    e.preventDefault()
    
    const distance = startGesture.position - endGesture.position
    const time = endGesture.time - startGesture.time
    const velocity = Math.abs(distance / time)

    if (velocity > 1.4 || (!isPanelOpen.current && endGesture.position < calculatedGestureAreaHeight) || (isPanelOpen.current && endGesture.position > calculatedGestureAreaHeight)) {
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
    const panelHeaderElementHeight = panelHeaderElementRef.current!.getBoundingClientRect().height
    const calculatedCloseTopValue = windowHeight - panelHeaderElementHeight

    calculatedGestureAreaHeight = windowHeight / 2

    let mainContentHeight = calculatedCloseTopValue
    if (windowWidth > 500) {
      maxTopValue.current = windowHeight - MAX_PANEL_HEIGHT
      mainContentHeight = MAX_PANEL_HEIGHT - panelHeaderElementHeight
      calculatedGestureAreaHeight = MAX_PANEL_HEIGHT / 2 + maxTopValue.current
    }

    closeTopValue.current = calculatedCloseTopValue
    if (!isPanelOpen.current) {
      currentTopValue.current = closeTopValue.current
      panelElementRef.current!.style.top = `${currentTopValue.current}px`
    } else {
      currentTopValue.current = maxTopValue.current
    }

    panelElementRef.current!.querySelector('main')!.style.height = `${mainContentHeight}px`

    resetPanelPosition()
  }, [windowHeight, windowWidth])


  return { panelElementRef, panelHeaderElementRef, onMouseDown }
}