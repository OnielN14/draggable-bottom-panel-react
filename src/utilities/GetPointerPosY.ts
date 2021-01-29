import React from 'react'

export default function getPointerPosY (e: React.TouchEvent | React.MouseEvent | MouseEvent | TouchEvent) {
  const isTouchEvent = 'nativeEvent' in e && e.nativeEvent instanceof TouchEvent || e instanceof TouchEvent
  return isTouchEvent ? (e as unknown as TouchEvent).touches[0].clientY : (e as unknown as MouseEvent).clientY
}
