import { useEffect, useRef } from "react"
import { CombatEngine } from "./combat_engine"

export function CombatWindow() {

    const canvasRef = useRef<HTMLCanvasElement>(null)
    const combatEngineRef = useRef<CombatEngine>(null)
    const canvasWidth = 1024
    const canvasHeight = 1024

    useEffect(() => {
        if (canvasRef.current !== null) {
            const ctx = canvasRef.current.getContext("2d")

            if (ctx !== null) {
                combatEngineRef.current = new CombatEngine(canvasRef.current, ctx)
                combatEngineRef.current.start()
            }
        }

        return () => {
            if (combatEngineRef.current !== null) {
                combatEngineRef.current.stop()
            }
        }
    })

    return (
        <>
          <h1>Combat</h1>
          <div style={{width: `${canvasWidth}px`, height: `${canvasHeight}px`}}>
            <canvas
              width={`${canvasWidth}px`}
              height={`${canvasHeight}px`}
              ref={canvasRef}
              onContextMenu={(event) => {event.preventDefault()}}
              onMouseDown={(event) => {
                if (combatEngineRef.current !== null)  {
                    combatEngineRef.current.onMouseDown(event)
                }
              }}
              onMouseUp={(event) => {
                if (combatEngineRef.current !== null)  {
                    combatEngineRef.current.onMouseUp(event)
                }
              }}
              onMouseMove={(event) => {
                if (combatEngineRef.current !== null)  {
                    combatEngineRef.current.onMouseMove(event)
                }
              }}
            //   onMouseLeave={(event) => {
            //     if (combatEngineRef.current !== null)  {
            //         combatEngineRef.current.mouseLeaveHandler(event)
            //     }
            //   }}
              onWheel={(event) => {
                if (combatEngineRef.current !== null) {
                  combatEngineRef.current.onScroll(event)
                }
              }}
            />
          </div>
        </>
    )
}