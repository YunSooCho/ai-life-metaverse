import { useEffect, useRef } from 'react'
import { socket } from '../socket'

export function useSocketEvent(event, handler, dependencies = []) {
  const handlerRef = useRef(handler)
  handlerRef.current = handler

  useEffect(() => {
    const wrappedHandler = (...args) => handlerRef.current(...args)
    
    socket.on(event, wrappedHandler)
    
    return () => {
      socket.off(event, wrappedHandler)
    }
  }, [event, ...dependencies])
}