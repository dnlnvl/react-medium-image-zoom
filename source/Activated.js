import React, { useCallback, useEffect, useRef, useState } from 'react'
import { bool, func, node, object, string } from 'prop-types'
import cn from './Activated.css'

const getScale = ({ height, width, zoomMargin }) => {
  const scaleX = window.innerWidth / (width + zoomMargin)
  const scaleY = window.innerHeight / (height + zoomMargin)
  const scale = Math.min(scaleX, scaleY)
  return scale

  // @TODO: COME BACK TO THIS; THIS ONLY APPLIES IF IT'S AN IMAGE...
  //const ratio =
  //  naturalWidth > naturalHeight ? naturalWidth / width : naturalHeight / height

  //return scale > 1 ? ratio : scale * ratio
}

const Activated = ({
  children,
  closeText,
  id,
  onDeactivate,
  onLoad,
  forwardedRef: { current: original } = {}
}) => {
  const btnRef = useRef(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isUnloading, setIsUnloading] = useState(false)

  // =============================
  // = ON CLICK, BEGIN UNLOADING =
  // =============================
  const handleClick = useCallback(e => {
    e.preventDefault()
    setIsUnloading(true)
  }, [])

  // =================================
  // = SET LOADED ON MOUNT AND FOCUS =
  // =================================
  useEffect(() => {
    setIsLoaded(true)
    onLoad()

    if (btnRef.current) {
      btnRef.current.focus()
    }
  }, [onLoad])

  // ========================================
  // = TELL PARENT THAT WE'RE ALL DONE HERE =
  // ========================================
  useEffect(() => {
    // @TODO: sync with transition duration?
    const unloadTimeout = isUnloading ? setTimeout(onDeactivate, 300) : null

    return () => {
      clearTimeout(unloadTimeout)
    }
  }, [isUnloading, onDeactivate])

  // ==================================
  // = GET ORIGINAL ITEM'S DIMENSIONS =
  // ==================================
  const { height, left, top, width } = original.getBoundingClientRect()

  // ========================================================
  // = @TODO: refactor style value setting to pure function =
  // ========================================================
  let style = { height, left, top, width }

  if (isLoaded) {
    // Get the the coords for center of the viewport
    const viewportX = window.innerWidth / 2
    const viewportY = window.innerHeight / 2

    // Get the coords for center of the original image
    const childCenterX = left + width / 2
    const childCenterY = top + height / 2

    // Get offset amounts for image coords to be centered on screen
    const translateX = viewportX - childCenterX
    const translateY = viewportY - childCenterY

    // @TODO: accept zoomMargin
    const scale = getScale({ height, width, zoomMargin: 0 })

    const originalTransform = original.style.transform

    const transform = [
      ...(originalTransform ? [originalTransform] : []),
      `translate3d(${translateX}px, ${translateY}px, 0)`,
      `scale(${scale})`
    ].join(' ')

    style = { height, left, top, transform, width }

    if (isUnloading) {
      style = { height, left, top, transform: originalTransform, width }
    }
  }
  // ===================
  // = END STYLE STUFF =
  // ===================

  const className = isLoaded && !isUnloading ? cn.btnLoaded : cn.btn

  return (
    <button
      aria-label={closeText}
      className={className}
      onClick={handleClick}
      ref={btnRef}
    >
      <div
        aria-modal
        className={cn.modal}
        id={id}
        role="dialog"
        tabIndex="-1"
        style={style}
      >
        {children}
      </div>
    </button>
  )
}

Activated.propTypes = {
  children: node.isRequired,
  closeText: string.isRequired,
  id: string.isRequired,
  isActive: bool.isRequired,
  onDeactivate: func.isRequired,
  onLoad: func.isRequired,
  forwardedRef: object
}

export default Activated
