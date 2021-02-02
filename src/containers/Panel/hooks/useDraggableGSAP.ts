import React from 'react'
import GSAP, { Expo } from 'gsap'
import GSAPDraggable from 'gsap/Draggable'
import useWindowSize from '../../../hooks/useWindowSize'
import { MAX_PANEL_HEIGHT } from '../utilities/contants'

GSAP.registerPlugin(GSAPDraggable)
const proxyHeader = document.createElement('div')

const EASING = Expo.easeOut
const DURATION = 0.3

export default function useDraggableGSAP ({ style }: PanelType.UseDraggableProp) {
  const panelElementRef = React.useRef<HTMLDivElement>(null)
  const panelHeaderElementRef = React.useRef<HTMLElement>(null)
  const currentBorderRadius = React.useRef(0)
  const initialBorderRadius = React.useRef(0)
  const isPanelOpen = React.useRef(false)
  const currentTopValue = React.useRef(0)
  const hideTopValue = React.useRef(0)
  const showTopValue = React.useRef(0)
  const calculatedGestureAreaHeight = React.useRef(0)

  const [ windowWidth, windowHeight ] = useWindowSize()

  function togglePanel () {
    let top = showTopValue.current
    let borderRadius = 0
    if (isPanelOpen.current) {
      top = hideTopValue.current
      borderRadius = initialBorderRadius.current
    }

    GSAP.to(panelElementRef.current!, { 
      top,
      borderTopLeftRadius: borderRadius,
      borderTopRightRadius: borderRadius,
      ease: EASING,
      duration: DURATION
    })

    currentBorderRadius.current = borderRadius
    currentTopValue.current = top
    if (isPanelOpen.current) 
      currentTopValue.current = hideTopValue.current

    isPanelOpen.current = !isPanelOpen.current
  }

  function resetPanelPosition () {
    GSAP.to(panelElementRef.current, {
      top: currentTopValue.current,
      borderTopLeftRadius: currentBorderRadius.current,
      borderTopRightRadius: currentBorderRadius.current,
      ease: EASING,
      duration: DURATION
    })
  }

  React.useEffect(() => {
    initialBorderRadius.current = parseFloat(getComputedStyle(panelElementRef.current!).borderTopLeftRadius) || 0
    
    if (!isPanelOpen.current)
      currentBorderRadius.current = initialBorderRadius.current
  }, [panelElementRef])

  React.useEffect(() => {
    let topLastY = 0

    GSAPDraggable.create(proxyHeader, {
      trigger: panelHeaderElementRef.current!,
      type: 'y',
      onPress: function(evt) {
        topLastY = evt.y
      },
      onDrag: function(evt) {
        const diffY = evt.y - topLastY

        GSAP.set(panelElementRef.current!, {
          top: `+=${diffY}`
        })

        topLastY = evt.y
      },
      onDragEnd: function (evt) {
        if ((!isPanelOpen.current && evt.y < calculatedGestureAreaHeight.current) || (isPanelOpen.current && evt.y > calculatedGestureAreaHeight.current)) {
          togglePanel()
        } else {
          resetPanelPosition()
        }
      }
    })
  }, [panelHeaderElementRef])

  React.useEffect(() => {
    showTopValue.current = 0
    const panelHeaderElementHeight = panelHeaderElementRef.current!.getBoundingClientRect().height
    const calculatedCloseTopValue = windowHeight - panelHeaderElementHeight

    let mainContentHeight = calculatedCloseTopValue
    calculatedGestureAreaHeight.current = windowHeight / 2

    if (windowWidth > 500) {
      showTopValue.current = windowHeight - MAX_PANEL_HEIGHT
      calculatedGestureAreaHeight.current = MAX_PANEL_HEIGHT / 2 + showTopValue.current
      mainContentHeight = MAX_PANEL_HEIGHT - panelHeaderElementHeight
    }

    hideTopValue.current = calculatedCloseTopValue
    if (!isPanelOpen.current) {
      currentTopValue.current = hideTopValue.current
      panelElementRef.current!.style.top = `${currentTopValue.current}px`
    } else {
      currentTopValue.current = showTopValue.current
    }

    panelElementRef.current!.querySelector('main')!.style.height = `${mainContentHeight}px`

    resetPanelPosition()
  }, [windowHeight, windowWidth])

  return { panelElementRef, panelHeaderElementRef }
}